"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface UserProfile {
  nickname: string;
  profile_image_url: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userProfile: UserProfile | null;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// SSR 안전: mounted 상태 확인용
function useIsMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isMounted = useIsMounted();
  
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // 프로필 정보 로드
  const loadUserProfile = useCallback(async (currentUser: User): Promise<UserProfile> => {
    try {
      console.log("[Auth] Loading profile for:", currentUser.email);
      
      // DB에서 역할 조회
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role, nickname, profile_image_url")
        .eq("id", currentUser.id)
        .single();

      const metadata = currentUser.user_metadata;
      
      // 기본값 설정
      let newRole = "user";
      let newNickname = metadata?.nickname || currentUser.email?.split("@")[0] || "사용자";
      let newImage = metadata?.profile_image_url || metadata?.avatar_url || "/globe.svg";

      if (!userError && userData) {
        const typedData = userData as { role?: string; nickname?: string; profile_image_url?: string };
        newRole = typedData.role || "user";
        if (typedData.nickname) newNickname = typedData.nickname;
        if (typedData.profile_image_url) newImage = typedData.profile_image_url;
      } else if (userError) {
        console.warn("[Auth] DB 조회 실패 (기본값 사용):", userError.message);
      }
      
      const newProfile: UserProfile = {
        nickname: newNickname,
        profile_image_url: newImage,
        role: newRole,
      };

      console.log("[Auth] Profile loaded:", { 
        email: currentUser.email, 
        role: newRole, 
        isAdmin: newRole === 'admin' 
      });

      return newProfile;

    } catch (error) {
      console.error("[Auth] 프로필 로드 치명적 오류:", error);
      return {
        nickname: currentUser.email?.split("@")[0] || "사용자",
        profile_image_url: "/globe.svg",
        role: "user",
      };
    }
  }, []);

  // 상태 업데이트 함수 (동기화 보장)
  const updateAuthState = useCallback((
    newSession: Session | null, 
    newUser: User | null, 
    newProfile: UserProfile | null
  ) => {
    setSession(newSession);
    setUser(newUser);
    setUserProfile(newProfile);
    setIsAdmin(newProfile?.role === 'admin');
    setLoading(false);
  }, []);

  // 로그아웃 함수
  const signOut = useCallback(async () => {
    try {
      // 즉시 상태 초기화
      updateAuthState(null, null, null);
      
      // localStorage 정리 (클라이언트에서만)
      if (typeof window !== 'undefined') {
        localStorage.removeItem("isLoggedIn");
      }
      
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("로그아웃 오류:", error);
      router.push("/");
    }
  }, [router, updateAuthState]);

  // 세션 새로고침
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session: newSession }, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("세션 새로고침 실패:", error);
        if (error.message.includes("refresh_token_not_found") || error.message.includes("invalid")) {
          await signOut();
        }
        return;
      }
      if (newSession) {
        const profile = await loadUserProfile(newSession.user);
        updateAuthState(newSession, newSession.user, profile);
      }
    } catch (error) {
      console.error("세션 새로고침 오류:", error);
    }
  }, [signOut, loadUserProfile, updateAuthState]);

  // 외부에서 호출 가능한 프로필 새로고침 함수
  const refreshUserProfile = useCallback(async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const profile = await loadUserProfile(currentUser);
        setUserProfile(profile);
        setIsAdmin(profile.role === 'admin');
      }
    } catch (e) {
      console.error("프로필 새로고침 실패:", e);
    }
  }, [loadUserProfile]);

  // 초기화 및 인증 상태 변경 구독
  useEffect(() => {
    let isActive = true;

    const initializeAuth = async () => {
      // 클라이언트에서만 실행 (SSR 안전)
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      try {
        console.log("[Auth] 초기화 시작");
        
        // 타임아웃 설정 (5초)
        const timeoutId = setTimeout(() => {
          if (isActive) {
            console.warn("[Auth] 초기화 타임아웃 - loading 강제 해제");
            setLoading(false);
          }
        }, 5000);

        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        clearTimeout(timeoutId);
        
        if (!isActive) return;

        if (error) {
          console.error("[Auth] 세션 확인 오류:", error);
          updateAuthState(null, null, null);
          return;
        }

        if (currentSession) {
          console.log("[Auth] 세션 존재함:", currentSession.user.email);
          const profile = await loadUserProfile(currentSession.user);
          
          if (!isActive) return;
          
          updateAuthState(currentSession, currentSession.user, profile);
          
          // localStorage 업데이트 (클라이언트에서만)
          if (typeof window !== 'undefined') {
            localStorage.setItem("isLoggedIn", "true");
          }
        } else {
          console.log("[Auth] 세션 없음");
          updateAuthState(null, null, null);
        }

      } catch (error) {
        console.error("[Auth] 초기화 예외:", error);
        if (isActive) {
          updateAuthState(null, null, null);
        }
      }
    };

    // 초기화 실행
    initializeAuth();

    // onAuthStateChange 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        if (!isActive) return;

        console.log(`[Auth] 상태 변경: ${event}`, newSession?.user?.email);

        switch (event) {
          case "SIGNED_IN":
          case "TOKEN_REFRESHED":
            if (newSession) {
              const profile = await loadUserProfile(newSession.user);
              if (isActive) {
                updateAuthState(newSession, newSession.user, profile);
                if (typeof window !== 'undefined') {
                  localStorage.setItem("isLoggedIn", "true");
                }
              }
            }
            break;

          case "SIGNED_OUT":
            console.log("[Auth] 로그아웃됨");
            if (isActive) {
              updateAuthState(null, null, null);
              if (typeof window !== 'undefined') {
                localStorage.removeItem("isLoggedIn");
              }
            }
            break;

          case "USER_UPDATED":
            if (newSession?.user && isActive) {
              const profile = await loadUserProfile(newSession.user);
              setUser(newSession.user);
              setUserProfile(profile);
              setIsAdmin(profile.role === 'admin');
            }
            break;
            
          case "INITIAL_SESSION":
            // 이미 initializeAuth에서 처리됨
            break;
        }
      }
    );

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 의존성 - 마운트 시 한 번만 실행

  const value: AuthContextType = {
    user,
    session,
    loading: !isMounted || loading, // 마운트되지 않았으면 로딩 상태 유지
    isAuthenticated: !!user && !!session,
    isAdmin,
    userProfile,
    signOut,
    refreshSession,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

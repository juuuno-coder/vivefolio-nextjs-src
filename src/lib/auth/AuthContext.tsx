"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userProfile: {
    nickname: string;
    profile_image_url: string;
    role?: string;
  } | null;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<AuthContextType["userProfile"]>(null);

  // 로그아웃 함수
  const signOut = useCallback(async () => {
    try {
      setUser(null);
      setSession(null);
      setUserProfile(null);
      localStorage.removeItem("isLoggedIn");
      
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("로그아웃 오류:", error);
      router.push("/");
    }
  }, [router]);

  // 세션 새로고침
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session: newSession }, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("세션 새로고침 실패:", error);
        if (error.message.includes("expired") || error.message.includes("invalid")) {
          await signOut();
        }
        return;
      }
      if (newSession) {
        setSession(newSession);
        setUser(newSession.user);
      }
    } catch (error) {
      console.error("세션 새로고침 오류:", error);
    }
  }, [signOut]);

  // 프로필 정보 로드
  const loadUserProfile = useCallback(async (currentUser: User) => {
    try {
      const metadata = currentUser.user_metadata;
      
      const profile = {
        nickname: metadata?.nickname || currentUser.email?.split("@")[0] || "사용자",
        profile_image_url: metadata?.profile_image_url || metadata?.avatar_url || "/globe.svg",
        role: "user" as string,
      };

      console.log("[Auth] Loading profile for:", currentUser.email);
      
      // DB에서 역할 조회
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role, nickname, profile_image_url")
        .eq("id", currentUser.id)
        .single();

      if (userError) {
        console.warn("[Auth] DB 조회 실패:", userError.message);
      } else if (userData) {
        const typedData = userData as { role?: string; nickname?: string; profile_image_url?: string };
        profile.role = typedData.role || "user";
        if (typedData.nickname) profile.nickname = typedData.nickname;
        if (typedData.profile_image_url) profile.profile_image_url = typedData.profile_image_url;
      }
      
      console.log("[Auth] Profile loaded:", { 
        email: currentUser.email, 
        role: profile.role, 
        isAdmin: profile.role === 'admin' 
      });

      setUserProfile(profile);
    } catch (error) {
      console.error("[Auth] 프로필 로드 오류:", error);
      // 에러가 나도 기본 프로필 설정
      setUserProfile({
        nickname: currentUser.email?.split("@")[0] || "사용자",
        profile_image_url: "/globe.svg",
        role: "user",
      });
    }
  }, []);

  // 외부에서 호출 가능한 프로필 새로고침 함수
  const refreshUserProfile = useCallback(async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        await loadUserProfile(currentUser);
      }
    } catch (e) {
      console.error("프로필 새로고침 실패:", e);
    }
  }, [loadUserProfile]);

  // 초기 세션 확인 및 인증 상태 변경 구독
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log("[Auth] 초기화 시작...");
        
        // 5초 타임아웃
        const initTimeout = setTimeout(() => {
          if (isMounted && loading) {
            console.warn("[Auth] 초기화 타임아웃");
            setLoading(false);
          }
        }, 5000);

        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        clearTimeout(initTimeout);

        if (error) {
          console.error("[Auth] 세션 확인 오류:", error);
          if (isMounted) setLoading(false);
          return;
        }

        if (currentSession && isMounted) {
          console.log("[Auth] 기존 세션 발견:", currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);
          await loadUserProfile(currentSession.user);
          localStorage.setItem("isLoggedIn", "true");
        }

        if (isMounted) setLoading(false);
      } catch (error) {
        console.error("[Auth] 초기화 오류:", error);
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    // 인증 상태 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        if (!isMounted) return;

        console.log("[Auth] 상태 변경:", event, newSession?.user?.email);

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
          if (newSession) {
            setSession(newSession);
            setUser(newSession.user);
            await loadUserProfile(newSession.user);
            localStorage.setItem("isLoggedIn", "true");
          }
        } else if (event === "SIGNED_OUT") {
          setSession(null);
          setUser(null);
          setUserProfile(null);
          localStorage.removeItem("isLoggedIn");
        } else if (event === "USER_UPDATED" && newSession?.user) {
          setUser(newSession.user);
          await loadUserProfile(newSession.user);
        }

        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAuthenticated: !!user && !!session,
    isAdmin: userProfile?.role === 'admin',
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

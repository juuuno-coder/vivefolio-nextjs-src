"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// 세션 타임아웃 설정 (30분 = 1800000ms)
const SESSION_TIMEOUT = 30 * 60 * 1000;
// 세션 체크 간격 (1분)
const SESSION_CHECK_INTERVAL = 60 * 1000;

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
  
  // 마지막 활동 시간 추적
  const lastActivityRef = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 활동 감지 업데이트
  const updateLastActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // 로그아웃 함수
  const signOut = useCallback(async () => {
    try {
      // UI 상태 즉시 초기화
      setUser(null);
      setSession(null);
      setUserProfile(null);

      // 로컬 스토리지 정리
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userProfile");
      localStorage.removeItem("userId");
      localStorage.removeItem("lastActivity");

      // 타이머 정리
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }

      // Supabase 로그아웃
      await supabase.auth.signOut();

      // 메인 페이지로 이동
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
      // 오류가 발생해도 클라이언트 상태는 초기화
      router.push("/");
    }
  }, [router]);

  // 자동 로그아웃 체크
  const checkInactivity = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    
    if (timeSinceLastActivity >= SESSION_TIMEOUT && user) {
      console.log("세션 타임아웃: 비활동으로 인한 자동 로그아웃");
      signOut();
    }
  }, [user, signOut]);

  // 세션 새로고침
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session: newSession }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("세션 새로고침 실패:", error);
        // 세션이 만료된 경우 로그아웃
        if (error.message.includes("expired") || error.message.includes("invalid")) {
          await signOut();
        }
        return;
      }

      if (newSession) {
        setSession(newSession);
        setUser(newSession.user);
        updateLastActivity();
      }
    } catch (error) {
      console.error("세션 새로고침 오류:", error);
    }
  }, [signOut, updateLastActivity]);

  // 프로필 정보 로드
  const loadUserProfile = useCallback(async (currentUser: User) => {
    try {
      const metadata = currentUser.user_metadata;
      
      // 기본 프로필 설정
      const profile = {
        nickname: metadata?.nickname || currentUser.email?.split("@")[0] || "사용자",
        profile_image_url: metadata?.profile_image_url || "/globe.svg",
        role: "user" as string,
      };

      // users 테이블에서 역할 확인
      const { data: userData } = await supabase
        .from("users")
        .select("role, nickname, profile_image_url")
        .eq("id", currentUser.id)
        .single() as { data: { role?: string; nickname?: string; profile_image_url?: string } | null };

      if (userData) {
        profile.role = userData.role || "user";
        if (userData.nickname) profile.nickname = userData.nickname;
        if (userData.profile_image_url) profile.profile_image_url = userData.profile_image_url;
      }

      setUserProfile(profile);
    } catch (error) {
      console.error("프로필 로드 오류:", error);
    }
  }, []);

  // 외부에서 호출 가능한 프로필 새로고침 함수
  const refreshUserProfile = useCallback(async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        // 이미 가지고 있는 user 상태를 바로 업데이트하지 않고 loadUserProfile에만 전달
        // setUser(currentUser); // 무한 루프 방지를 위해 일단 제외하거나 신중하게 사용
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
        // 타임아웃 설정 - 5초 후에도 세션 확인이 안되면 강제로 로딩 해제
        const initTimeout = setTimeout(() => {
          if (isMounted && loading) {
            console.warn("세션 초기화 타임아웃 - 로딩 상태 해제");
            setLoading(false);
          }
        }, 5000);

        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        clearTimeout(initTimeout);

        if (error) {
          console.error("세션 확인 오류:", error);
          if (isMounted) {
            setLoading(false);
          }
          return;
        }

        if (currentSession && isMounted) {
          setSession(currentSession);
          setUser(currentSession.user);
          await loadUserProfile(currentSession.user);
          
          // 마지막 로그인 시간 확인
          const lastSignIn = new Date(currentSession.user.last_sign_in_at || 0).getTime();
          const now = Date.now();
          const isRecentlySignedIn = now - lastSignIn < 5 * 60 * 1000; // 5분 이내 로그인

          // 마지막 활동 시간 복원 또는 현재 시간으로 설정
          const savedActivity = localStorage.getItem("lastActivity");
          
          if (isRecentlySignedIn) {
             // 최근에 로그인했다면 활동 시간 리셋 (리다이렉트 이슈 해결)
             lastActivityRef.current = now;
             localStorage.setItem("lastActivity", now.toString());
          } else if (savedActivity) {
            const savedTime = parseInt(savedActivity, 10);
            const timeSince = now - savedTime;
            
            // 저장된 활동 시간이 타임아웃을 초과했으면 로그아웃
            if (timeSince >= SESSION_TIMEOUT) {
              console.log("저장된 세션 타임아웃 초과 - 로그아웃");
              await signOut();
              if (isMounted) setLoading(false);
              return;
            }
            lastActivityRef.current = savedTime;
          } else {
            // 저장된 활동 시간이 없으면 현재 시간으로 설정
            lastActivityRef.current = now;
            localStorage.setItem("lastActivity", now.toString());
          }
        }

        if (isMounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error("인증 초기화 오류:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // 인증 상태 변경 구독
    // supabase.auth가 없을 수 있으므로 안전하게 처리
    const { data } = supabase.auth?.onAuthStateChange?.(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        if (!isMounted) return;

        console.log("Auth 상태 변경:", event);

        switch (event) {
          case "SIGNED_IN":
            if (newSession) {
              setSession(newSession);
              setUser(newSession.user);
              await loadUserProfile(newSession.user);
              updateLastActivity();
              localStorage.setItem("lastActivity", Date.now().toString()); // Persist activity time
              localStorage.setItem("isLoggedIn", "true");
            }
            break;

          case "SIGNED_OUT":
            setSession(null);
            setUser(null);
            setUserProfile(null);
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("userProfile");
            localStorage.removeItem("userId");
            localStorage.removeItem("lastActivity");
            break;

          case "TOKEN_REFRESHED":
            if (newSession) {
              setSession(newSession);
              setUser(newSession.user);
            }
            break;

          case "USER_UPDATED":
            if (newSession?.user) {
              setUser(newSession.user);
              await loadUserProfile(newSession.user);
            }
            break;
        }

        setLoading(false);
      }
    ) || { data: { subscription: null } };

    return () => {
      isMounted = false;
      if (data?.subscription) {
        data.subscription.unsubscribe();
      }
    };
  }, [loadUserProfile, signOut, updateLastActivity]);

  // 활동 감지 이벤트 리스너 with throttling
  useEffect(() => {
    if (!user) return;

    const activityEvents = ["mousedown", "keydown", "scroll", "touchstart"];
    let throttleTimeout: NodeJS.Timeout | null = null;
    
    const handleActivity = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          updateLastActivity();
          localStorage.setItem("lastActivity", Date.now().toString());
          throttleTimeout = null;
        }, 5000); // 5초마다 업데이트
      }
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // 비활동 체크 인터벌 설정
    checkIntervalRef.current = setInterval(checkInactivity, SESSION_CHECK_INTERVAL);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
    };
  }, [user, updateLastActivity, checkInactivity]);

  // 페이지 visibility 변경 감지 (탭 전환 시)
  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        // 탭이 다시 활성화되면 세션 체크
        const timeSinceLastActivity = Date.now() - lastActivityRef.current;
        
        if (timeSinceLastActivity >= SESSION_TIMEOUT) {
          console.log("탭 복귀 시 세션 타임아웃 감지 - 로그아웃");
          await signOut();
        } else {
          // 세션 유효성 확인 및 새로고침
          await refreshSession();
          updateLastActivity();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, signOut, refreshSession, updateLastActivity]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAuthenticated: !!user && !!session,
    isAdmin: userProfile?.role === 'admin', // 관리자 여부 추가
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

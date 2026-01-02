"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
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
  userProfile: UserProfile | null;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const initializedRef = useRef(false);
  const router = useRouter();

  // ====== DB에서 프로필 로드 (1초 타임아웃 적용) ======
  const loadProfileFromDB = useCallback(async (currentUser: User): Promise<UserProfile> => {
    const defaultProfile: UserProfile = {
      nickname: currentUser.user_metadata?.nickname || currentUser.email?.split("@")[0] || "User",
      profile_image_url: currentUser.user_metadata?.avatar_url || "/globe.svg",
      role: "user",
    };

    try {
      const dbPromise = supabase
        .from("users")
        .select("nickname, profile_image_url, role")
        .eq("id", currentUser.id)
        .single();

      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("DB_TIMEOUT")), 1000));

      const { data, error } = (await Promise.race([dbPromise, timeoutPromise])) as any;

      if (!error && data) {
        console.log("[Auth] Profile loaded from DB:", data.nickname);
        return data as UserProfile;
      }
      
      console.warn("[Auth] Using fallback profile");
      return defaultProfile;
    } catch (e) {
      console.warn("[Auth] Profile fetch timeout/error, using fallback");
      return defaultProfile;
    }
  }, []);

  // ====== 상태 업데이트 통합 관리 ======
  const updateState = useCallback(async (s: Session | null, u: User | null) => {
    setSession(s);
    setUser(u);
    if (u) {
      const profile = await loadProfileFromDB(u);
      setUserProfile(profile);
    } else {
      setUserProfile(null);
    }
    setLoading(false);
  }, [loadProfileFromDB]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const init = async () => {
      try {
        console.log("[Auth] Initializing...");
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession?.user) {
          console.log("[Auth] Session found:", currentSession.user.email);
          await updateState(currentSession, currentSession.user);
        } else {
          console.log("[Auth] No session");
          await updateState(null, null);
        }
      } catch (e) {
        console.error("[Auth] Init error:", e);
        await updateState(null, null);
      }
    };

    init();

    // 상태 변경 감시
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log(`[Auth] Event: ${event}`);
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
        if (currentSession?.user) {
          await updateState(currentSession, currentSession.user);
        }
      } else if (event === "SIGNED_OUT") {
        await updateState(null, null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [updateState]);

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    // 로컬 스토리지 강제 청소 (캐시 방지)
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
    router.push("/");
    router.refresh();
  };

  const value = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    userProfile,
    isAdmin: userProfile?.role === "admin",
    signOut,
    refreshUserProfile: async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) {
        const p = await loadProfileFromDB(u);
        setUserProfile(p);
      }
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

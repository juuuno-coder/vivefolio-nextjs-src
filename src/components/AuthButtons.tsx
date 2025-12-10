"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function AuthButtons() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 1. 초기 세션 확인
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();

    // 2. 인증 상태 변화 감지 (로그인/로그아웃 시 실시간 실행됨)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("인증 상태 변경:", _event, session?.user?.email);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("userId");
    router.push("/");
    router.refresh(); // 강제 새로고침으로 상태 확실히 초기화
  };

  if (user) {
    return (
      <>
        <Button asChild variant="ghost" className="text-black hover:bg-gray-100">
          <Link href="/mypage">
            <span>마이페이지</span>
          </Link>
        </Button>
        <Button variant="outline" onClick={handleLogout}>
          <span>로그아웃</span>
        </Button>
      </>
    );
  }

  return (
    <>
      <Button asChild variant="ghost" className="text-black hover:bg-gray-100">
        <Link href="/login">
          <span>로그인</span>
        </Link>
      </Button>
      <Button asChild className="bg-[#4ACAD4] hover:bg-[#41a3aa] text-white">
        <Link href="/signup">
          <span>회원가입</span>
        </Link>
      </Button>
    </>
  );
}

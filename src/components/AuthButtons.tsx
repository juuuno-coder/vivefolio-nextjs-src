"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AuthButtons() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userId');
    window.location.href = '/';
  };

  if (isLoggedIn) {
    return (
      <>
        <Button asChild variant="link">
          <Link href="/mypage/profile">
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
      <Button asChild variant="link">
        <Link href="/login">
          <span>로그인</span>
        </Link>
      </Button>
      <Button asChild>
        <Link href="/signup">
          <span>회원가입</span>
        </Link>
      </Button>
    </>
  );
}

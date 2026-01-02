"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { User as UserIcon, Upload, LogOut, Shield } from 'lucide-react';
import { useAuth } from "@/lib/auth/AuthContext";

export function AuthButtons() {
  const router = useRouter();
  const { user, userProfile, loading, signOut, isAuthenticated, isAdmin } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-[120px]" />; // SSR 엇박자 방지

  // ====== 1. 로딩 상태 (DB에서 프로필을 긁어오는 중) ======
  if (loading) {
    return (
      <div className="flex items-center gap-3 min-w-[120px] justify-end">
        <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
      </div>
    );
  }

  // ====== 2. 로그인 완료 상태 (DB 데이터 기반) ======
  if (isAuthenticated && user) {
    const displayName = userProfile?.nickname || user.user_metadata?.nickname || user.email?.split('@')[0];
    const displayImage = userProfile?.profile_image_url || user.user_metadata?.avatar_url || "/globe.svg";

    return (
      <div className="flex items-center gap-3 min-w-fit">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="w-9 h-9 cursor-pointer border-2 border-white shadow-sm hover:ring-2 hover:ring-green-500/20 transition-all">
              <AvatarImage src={displayImage} alt={displayName} className="object-cover" />
              <AvatarFallback className="bg-gray-50 text-gray-400">
                <UserIcon className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl p-2 shadow-xl border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="px-3 py-2.5">
              <p className="text-sm font-black text-gray-900 truncate">{displayName}</p>
              <p className="text-[11px] text-gray-400 truncate mt-0.5">{user.email}</p>
            </div>
            <DropdownMenuSeparator className="bg-gray-50" />
            <DropdownMenuItem onClick={() => router.push('/project/upload')} className="cursor-pointer rounded-xl py-2.5 hover:bg-gray-50">
              <Upload className="mr-3 h-4.5 w-4.5 text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">프로젝트 등록</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/mypage')} className="cursor-pointer rounded-xl py-2.5 hover:bg-gray-50">
              <UserIcon className="mr-3 h-4.5 w-4.5 text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">마이페이지</span>
            </DropdownMenuItem>
            
            {isAdmin && (
              <>
                <DropdownMenuSeparator className="bg-gray-50" />
                <DropdownMenuItem onClick={() => router.push('/admin')} className="cursor-pointer rounded-xl py-2.5 bg-indigo-50/30 hover:bg-indigo-50 text-indigo-600">
                  <Shield className="mr-3 h-4.5 w-4.5" />
                  <span className="text-sm font-bold">관리자 센터</span>
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator className="bg-gray-50" />
            <DropdownMenuItem onClick={signOut} className="cursor-pointer rounded-xl py-2.5 text-red-500 hover:bg-red-50 hover:text-red-600">
              <LogOut className="mr-3 h-4.5 w-4.5 opacity-70" />
              <span className="text-sm font-bold">로그아웃</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // ====== 3. 비로그인 상태 ======
  return (
    <div className="flex items-center gap-2 min-w-[150px] justify-end">
      <Button asChild variant="ghost" className="text-gray-600 hover:bg-gray-100 rounded-full px-5 text-sm font-bold">
        <Link href="/login">로그인</Link>
      </Button>
      <Button asChild className="bg-green-600 hover:bg-green-700 text-white rounded-full px-5 text-sm font-bold shadow-md shadow-green-100 border-none transition-all hover:scale-105 active:scale-95">
        <Link href="/signup">회원가입</Link>
      </Button>
    </div>
  );
}

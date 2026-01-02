"use client";

import React from "react";
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

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
      </div>
    );
  }

  // 로그인된 상태
  if (isAuthenticated && user) {
    const displayName = userProfile?.nickname || user.email?.split('@')[0] || "User";
    const displayImage = userProfile?.profile_image_url || "/globe.svg";

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="w-9 h-9 cursor-pointer border-2 border-gray-200 hover:border-green-500 transition-all">
            <AvatarImage src={displayImage} alt={displayName} className="object-cover" />
            <AvatarFallback className="bg-gray-100">
              <UserIcon className="w-4 h-4 text-gray-400" />
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 mt-2">
          <div className="px-3 py-2">
            <p className="text-sm font-bold text-gray-900">{displayName}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/project/upload')} className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            프로젝트 등록
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/mypage')} className="cursor-pointer">
            <UserIcon className="mr-2 h-4 w-4" />
            마이페이지
          </DropdownMenuItem>
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/admin')} className="cursor-pointer text-indigo-600">
                <Shield className="mr-2 h-4 w-4" />
                관리자 센터
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            로그아웃
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // 비로그인 상태 - 무조건 보여줌
  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" className="text-gray-700 hover:bg-gray-100 rounded-full px-4">
        <Link href="/login">로그인</Link>
      </Button>
      <Button asChild className="bg-green-600 hover:bg-green-700 text-white rounded-full px-5 shadow-sm">
        <Link href="/signup">회원가입</Link>
      </Button>
    </div>
  );
}

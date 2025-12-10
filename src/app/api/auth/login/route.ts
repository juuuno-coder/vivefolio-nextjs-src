// src/app/api/auth/login/route.ts
// 로그인 API

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('로그인 시도:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 사용자 조회 (Service Role로 RLS 우회)
    const { data: user, error } = await supabaseAdmin
      .from('User')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    console.log('사용자 조회 결과:', user ? '찾음' : '없음', error);

    if (error || !user) {
      console.log('사용자 조회 실패:', error);
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('비밀번호 검증:', isPasswordValid);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 비밀번호 제외하고 반환
    const { password: _, ...userWithoutPassword } = user;

    console.log('로그인 성공:', userWithoutPassword.user_id);

    return NextResponse.json({
      message: '로그인 성공',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('서버 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

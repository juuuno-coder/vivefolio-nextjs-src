// src/app/api/auth/signup/route.ts
// 회원가입 API

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, nickname } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호는 필수입니다.' },
        { status: 400 }
      );
    }

    // 이메일 중복 확인
    const { data: existingUser } = await supabase
      .from('User')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 409 }
      );
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const { data, error } = await supabase
      .from('User')
      .insert([
        {
          email,
          password: hashedPassword,
          nickname: nickname || email.split('@')[0],
        },
      ])
      .select('user_id, email, nickname, profile_image_url, created_at, role')
      .single();

    if (error) {
      console.error('회원가입 실패:', error);
      return NextResponse.json(
        { error: '회원가입에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: '회원가입이 완료되었습니다.',
        user: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('서버 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

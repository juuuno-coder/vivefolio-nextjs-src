// src/app/api/users/[id]/route.ts
// 사용자 프로필 조회 및 수정 API

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import bcrypt from 'bcryptjs';

// 사용자 프로필 조회
// 사용자 프로필 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users') // User -> users
      .select('id, email, nickname, bio, profile_image_url, role, created_at')
      .eq('id', id) // user_id -> id
      // .eq('is_active', true) // users 테이블에 is_active가 없으면 제거, 있으면 유지. 스키마 확인 필요. 일단 제거 ( Auth user의 status를 따라가는게 보통이나, public.users에는 없을 수 있음)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('서버 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 사용자 프로필 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { nickname, bio, profile_image_url } = body;

    // Supabase Auth를 사용하므로 비밀번호 변경 로직은 Auth API(클라이언트 측)에서 처리해야 함.
    // 여기서는 프로필 정보(public.users)만 수정합니다.

    // 업데이트할 데이터 준비
    const updateData: any = {};
    if (nickname) updateData.nickname = nickname;
    if (bio !== undefined) updateData.bio = bio;
    if (profile_image_url) updateData.profile_image_url = profile_image_url;

    // 프로필 업데이트
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, email, nickname, bio, profile_image_url, role, created_at')
      .single();

    if (error) {
      console.error('프로필 수정 실패:', error);
      return NextResponse.json(
        { error: '프로필 수정에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '프로필이 수정되었습니다.',
      user: data,
    });
  } catch (error) {
    console.error('서버 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

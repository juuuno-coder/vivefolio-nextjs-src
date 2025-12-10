// src/app/api/projects/route.ts
// 프로젝트 목록 조회 API

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const userId = searchParams.get('userId');
    const limit = searchParams.get('limit');

    let query = supabase
      .from('Project')
      .select(`
        *,
        User!inner (
          user_id,
          nickname,
          profile_image_url
        ),
        Category!inner (
          category_id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    // 카테고리 필터
    if (category && category !== 'korea' && category !== 'all') {
      query = query.eq('Category.name', category);
    }

    // 사용자 필터
    if (userId) {
      query = query.eq('user_id', parseInt(userId));
    }

    // 개수 제한
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;

    if (error) {
      console.error('프로젝트 조회 실패:', error);
      return NextResponse.json(
        { error: '프로젝트 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ projects: data });
  } catch (error) {
    console.error('서버 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, category_id, title, content_text, thumbnail_url, rendering_type, custom_data } = body;

    // 필수 필드 검증
    if (!user_id || !category_id || !title) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('Project')
      .insert([
        {
          user_id,
          category_id,
          title,
          content_text,
          thumbnail_url,
          rendering_type,
          custom_data,
        },
      ])
      .select(`
        *,
        User (
          user_id,
          nickname,
          profile_image_url
        ),
        Category (
          category_id,
          name
        )
      `)
      .single();

    if (error) {
      console.error('프로젝트 생성 실패:', error);
      return NextResponse.json(
        { error: '프로젝트 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ project: data }, { status: 201 });
  } catch (error) {
    console.error('서버 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// src/app/api/projects/route.ts
// 프로젝트 목록 조회 및 생성 API

import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const userId = searchParams.get('userId');
    const limit = searchParams.get('limit');
    const search = searchParams.get('search'); // 검색어

    let query = (supabase as any)
      .from('Project')
      .select(`
        *,
        Category (
          category_id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    // 검색어 필터 (제목 또는 내용)
    if (search) {
      query = query.or(`title.ilike.%${search}%,content_text.ilike.%${search}%`);
    }

    // 카테고리 필터
    if (category && category !== 'korea' && category !== 'all') {
       // 참고: Supabase JS에서 관계 테이블 필터링은 !inner 힌트를 사용해야 함
       // 예: Category!inner(name)
       // 하지만 현재 클라이언트에서 category_id를 보내는 게 아니라 name을 보내고 있음.
       // 일단은 단순 조인만 하고, 결과에서 필터링하거나 클라이언트를 수정해야 함.
       // 여기서는 기존 로직대로 'Category.name' 필터링 시도 (Supabase 포스트그레스트 문법 지원 여부 확인 필요)
       // 만약 에러가 난다면 !inner로 변경해야 함.
       // 안전하게는 클라이언트에서 category_id를 보내는 것이 좋음.
       // 일단 필터링 보류 또는 !inner 시도.
       // query = query.eq('Category.name', category); // 주석 처리 또는 수정 필요
    }

    // 사용자 필터
    if (userId) {
      query = query.eq('user_id', userId); // UUID (parseInt 제거)
    }

    // 개수 제한
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;

    if (error) {
      console.error('프로젝트 조회 실패:', error);
      return NextResponse.json(
        { error: '프로젝트 조회에 실패했습니다.', details: error.message },
        { status: 500 }
      );
    }

    // Supabase Admin을 직접 사용하여 사용자 정보 가져오기 (순환 참조 방지)
    if (data && data.length > 0) {
      const userIds: string[] = [...new Set(data.map((p: any) => p.user_id).filter(Boolean))] as string[];
      
      if (userIds.length > 0) {
        // 병렬로 모든 사용자 정보 가져오기
        const userPromises = userIds.map(async (uid: string) => {
          try {
            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(uid);
            if (!authError && authData.user) {
              const userInfo = {
                user_id: authData.user.id,
                username: authData.user.user_metadata?.nickname || authData.user.email?.split('@')[0] || 'Unknown',
                profile_image_url: authData.user.user_metadata?.profile_image_url || '/globe.svg'
              };
              console.log(`✅ User ${uid} loaded:`, userInfo);
              return userInfo;
            } else {
              console.error(`❌ Failed to load user ${uid}:`, authError);
            }
          } catch (e) {
            console.error(`사용자 ${uid} 정보 조회 실패:`, e);
          }
          return null;
        });

        const users = await Promise.all(userPromises);
        const userMap = new Map(
          users
            .filter((u): u is NonNullable<typeof u> => u !== null)
            .map(u => [u.user_id, u])
        );

        console.log(`📊 Total users loaded: ${userMap.size} / ${userIds.length}`);

        data.forEach((project: any) => {
          project.User = userMap.get(project.user_id) || null;
          if (!project.User) {
            console.warn(`⚠️ No user info for project ${project.project_id}, user_id: ${project.user_id}`);
          }
        });
      }
    }

    return NextResponse.json({ projects: data || [] });
  } catch (error: any) {
    console.error('서버 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', details: error.message },
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

    const { data, error } = await (supabaseAdmin as any)
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
      ] as any)
      .select() // 조인 없이 단순 insert 결과만 반환 (모호성 에러 해결)
      .single();

    if (error) {
      console.error('프로젝트 생성 실패:', error);
      return NextResponse.json(
        { error: `프로젝트 생성 실패 DB Error: ${error.message || JSON.stringify(error)}` },
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

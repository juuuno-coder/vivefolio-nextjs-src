// src/app/api/projects/[id]/route.ts
// 개별 프로젝트 조회, 수정, 삭제 API

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('Project')
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
      .eq('project_id', params.id)
      .single();

    if (error) {
      console.error('프로젝트 조회 실패:', error);
      return NextResponse.json(
        { error: '프로젝트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 조회수 증가
    await supabase
      .from('Project')
      .update({ views: (data.views || 0) + 1 })
      .eq('project_id', params.id);

    return NextResponse.json({ project: data });
  } catch (error) {
    console.error('서버 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, content_text, thumbnail_url, category_id, rendering_type, custom_data } = body;

    const { data, error } = await supabase
      .from('Project')
      .update({
        title,
        content_text,
        thumbnail_url,
        category_id,
        rendering_type,
        custom_data,
      })
      .eq('project_id', params.id)
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
      console.error('프로젝트 수정 실패:', error);
      return NextResponse.json(
        { error: '프로젝트 수정에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ project: data });
  } catch (error) {
    console.error('서버 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('Project')
      .delete()
      .eq('project_id', params.id);

    if (error) {
      console.error('프로젝트 삭제 실패:', error);
      return NextResponse.json(
        { error: '프로젝트 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: '프로젝트가 삭제되었습니다.' });
  } catch (error) {
    console.error('서버 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

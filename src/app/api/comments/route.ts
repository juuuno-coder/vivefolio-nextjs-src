// src/app/api/comments/route.ts
// 댓글 조회 및 작성 API

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId가 필요합니다.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('Comment')
      .select(`
        *,
        User (
          user_id,
          nickname,
          profile_image_url
        )
      `)
      .eq('project_id', projectId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('댓글 조회 실패:', error);
      return NextResponse.json(
        { error: '댓글 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ comments: data });
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
    const { user_id, project_id, content, parent_comment_id } = body;

    if (!user_id || !project_id || !content) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('Comment')
      .insert([
        {
          user_id,
          project_id,
          content,
          parent_comment_id: parent_comment_id || null,
        },
      ])
      .select(`
        *,
        User (
          user_id,
          nickname,
          profile_image_url
        )
      `)
      .single();

    if (error) {
      console.error('댓글 작성 실패:', error);
      return NextResponse.json(
        { error: '댓글 작성에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ comment: data }, { status: 201 });
  } catch (error) {
    console.error('서버 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json(
        { error: 'commentId가 필요합니다.' },
        { status: 400 }
      );
    }

    // 소프트 삭제 (is_deleted = true)
    const { error } = await supabase
      .from('Comment')
      .update({ is_deleted: true })
      .eq('comment_id', commentId);

    if (error) {
      console.error('댓글 삭제 실패:', error);
      return NextResponse.json(
        { error: '댓글 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: '댓글이 삭제되었습니다.' });
  } catch (error) {
    console.error('서버 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

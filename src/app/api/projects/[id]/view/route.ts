import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;

  try {
    // 조회수 증가
    const { error } = await supabaseAdmin
      .rpc('increment_views', { project_id: parseInt(projectId) });

    if (error) {
      console.error('조회수 증가 실패:', error);
      return NextResponse.json(
        { error: '조회수 증가에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('서버 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

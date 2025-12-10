// lib/supabase/examples.ts
// Supabase 사용 예제 코드

import { supabase } from './client';

/**
 * 프로젝트 목록 조회 예제
 */
export async function getProjects() {
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
    .order('created_at', { ascending: false });

  if (error) {
    console.error('프로젝트 조회 실패:', error);
    return [];
  }

  return data;
}

/**
 * 프로젝트 생성 예제
 */
export async function createProject(projectData: {
  user_id: number;
  category_id: number;
  title: string;
  content_text?: string;
  thumbnail_url?: string;
}) {
  const { data, error } = await supabase
    .from('Project')
    .insert([projectData])
    .select()
    .single();

  if (error) {
    console.error('프로젝트 생성 실패:', error);
    throw error;
  }

  return data;
}

/**
 * 좋아요 추가/제거 예제
 */
export async function toggleLike(userId: number, projectId: number) {
  // 먼저 좋아요가 있는지 확인
  const { data: existingLike } = await supabase
    .from('Like')
    .select()
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .single();

  if (existingLike) {
    // 좋아요 제거
    const { error } = await supabase
      .from('Like')
      .delete()
      .eq('user_id', userId)
      .eq('project_id', projectId);

    if (error) throw error;
    return { liked: false };
  } else {
    // 좋아요 추가
    const { error } = await supabase
      .from('Like')
      .insert([{ user_id: userId, project_id: projectId }]);

    if (error) throw error;
    return { liked: true };
  }
}

/**
 * 댓글 작성 예제
 */
export async function createComment(commentData: {
  user_id: number;
  project_id: number;
  content: string;
  parent_comment_id?: number;
}) {
  const { data, error } = await supabase
    .from('Comment')
    .insert([commentData])
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
    throw error;
  }

  return data;
}

/**
 * 프로젝트 조회수 증가 예제
 */
export async function incrementProjectViews(projectId: number) {
  const { error } = await supabase.rpc('increment_views', {
    project_id: projectId,
  });

  if (error) {
    console.error('조회수 증가 실패:', error);
  }
}

/**
 * 사용자 프로필 조회 예제
 */
export async function getUserProfile(userId: number) {
  const { data, error } = await supabase
    .from('User')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('사용자 조회 실패:', error);
    return null;
  }

  return data;
}

/**
 * 카테고리별 프로젝트 조회 예제
 */
export async function getProjectsByCategory(categoryId: number) {
  const { data, error } = await supabase
    .from('Project')
    .select(`
      *,
      User (
        user_id,
        nickname,
        profile_image_url
      )
    `)
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('카테고리별 프로젝트 조회 실패:', error);
    return [];
  }

  return data;
}

/**
 * 검색 예제
 */
export async function searchProjects(query: string) {
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
    .or(`title.ilike.%${query}%,content_text.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('검색 실패:', error);
    return [];
  }

  return data;
}

/**
 * 위시리스트 추가/제거 예제
 */
export async function toggleWishlist(userId: number, projectId: number) {
  const { data: existingWishlist } = await supabase
    .from('Wishlist')
    .select()
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .single();

  if (existingWishlist) {
    // 위시리스트 제거
    const { error } = await supabase
      .from('Wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('project_id', projectId);

    if (error) throw error;
    return { wishlisted: false };
  } else {
    // 위시리스트 추가
    const { error } = await supabase
      .from('Wishlist')
      .insert([{ user_id: userId, project_id: projectId }]);

    if (error) throw error;
    return { wishlisted: true };
  }
}

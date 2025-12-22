// src/hooks/useAdmin.ts
// 관리자 권한 확인 훅

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

interface AdminState {
  isAdmin: boolean;
  isLoading: boolean;
  userId: string | null;
  userRole: string | null;
}

export function useAdmin(): AdminState {
  const [state, setState] = useState<AdminState>({
    isAdmin: false,
    isLoading: true,
    userId: null,
    userRole: null,
  });

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const checkAdmin = async () => {
      try {
        // 타임아웃 설정 (5초)
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Timeout')), 5000);
        });

        const checkPromise = (async () => {
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          
          // 인증 에러 또는 사용자 없음
          if (authError || !user) {
            if (mounted) {
              setState({
                isAdmin: false,
                isLoading: false,
                userId: null,
                userRole: null,
              });
            }
            return;
          }

          // users 테이블에서 role 확인
          const { data: userData, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single() as { data: { role: string } | null, error: any };

          if (!mounted) return;

          if (error || !userData) {
            console.error('사용자 정보 조회 실패:', error);
            setState({
              isAdmin: false,
              isLoading: false,
              userId: user.id,
              userRole: 'user',
            });
            return;
          }

          setState({
            isAdmin: userData.role === 'admin',
            isLoading: false,
            userId: user.id,
            userRole: userData.role || 'user',
          });
        })();

        await Promise.race([checkPromise, timeoutPromise]);
        clearTimeout(timeoutId);
      } catch (error) {
        console.error('관리자 권한 확인 실패:', error);
        if (mounted) {
          setState({
            isAdmin: false,
            isLoading: false,
            userId: null,
            userRole: null,
          });
        }
      }
    };

    checkAdmin();

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      // 세션이 만료되거나 로그아웃되면 즉시 상태 업데이트
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || !session) {
        if (mounted) {
          setState({
            isAdmin: false,
            isLoading: false,
            userId: null,
            userRole: null,
          });
        }
      } else if (event === 'SIGNED_IN') {
        checkAdmin();
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  return state;
}

export default useAdmin;

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 디버그: 환경 변수 확인 (배포 환경 디버깅용)
if (typeof window !== 'undefined') {
  console.log('Supabase Env Log:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 8) + '...' : 'missing',
  });
}

let supabase: any;

if (supabaseUrl && supabaseAnonKey) {
  // 지연 로딩 없이 즉시 클라이언트 생성 (동기식 체이닝 지원)
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
} else {
  console.warn('Missing Supabase Environment Variables');
  // 안전한 더미 프록시 (체이닝 지원)
  const createSafeMock = (): any => new Proxy(() => {}, {
    get: (_, prop) => {
      // Promise처럼 보이기 위한 then 처리 (await 대응)
      if (prop === 'then') {
        return (resolve: Function) => resolve({ data: null, error: { message: 'Missing env vars' } });
      }
      return createSafeMock(); // 체이닝 계속 지원
    },
    apply: () => createSafeMock(), // 함수 호출 지원
  });
  supabase = createSafeMock();
}

export { supabase };
export { supabaseAdmin } from './admin';

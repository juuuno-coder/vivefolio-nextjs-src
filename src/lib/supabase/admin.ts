import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Missing Supabase admin environment variables');
}

// 환경 변수가 없으면 빈 문자열로 초기화하되, 실제 호출 시 에러가 발생할 수 있음
// 하지만 앱 전체 크래시는 방지
export const supabaseAdmin = createClient(
  supabaseUrl || '', 
  supabaseServiceKey || '', 
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

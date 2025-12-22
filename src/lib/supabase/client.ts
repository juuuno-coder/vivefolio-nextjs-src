// lib/supabase/client.ts
// Supabase 클라이언트 초기화

import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 환경 변수 검증 (클라이언트에서는 경고만 출력)
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.error(
    'Missing Supabase env variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.'
  );
}

// 서버에서도 에러를 던지지 않고 로그만 출력 (배포 시 앱 크래시 방지)
if (typeof window === 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.error(
    'Missing Supabase env variables on server: Check Vercel project settings.'
  );
}

// 지연 초기화를 위한 내부 Promise
let _clientPromise: Promise<any> | null = null;
const initClient = async () => {
  if (_clientPromise) return _clientPromise;
  
  // 환경 변수가 없으면 null 반환
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Cannot initialize Supabase: missing environment variables');
    return null;
  }
  
  _clientPromise = import('@supabase/supabase-js').then((m) =>
    m.createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  );
  return _clientPromise;
};

// 다단계 속성 접근(예: supabase.auth.getUser()) 및 함수 호출을 지원하는 프록시 생성
// 디버그: 환경 변수 로드 상태 확인 (배포 환경 디버깅용)
if (typeof window !== 'undefined') {
  console.log('Supabase Env Log:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 8) + '...' : 'missing',
  });
}

// 안전한 더미 프록시 생성 함수 (재귀적)
const createSafeMock = (): any => {
  return new Proxy(() => {}, {
    get: (_, prop) => {
      // Promise처럼 보이기 위한 then 처리
      if (prop === 'then') {
        const mockResult = { 
          data: null, 
          error: { message: 'Supabase client not initialized (missing env vars)' } 
        };
        return (resolve: Function) => resolve(mockResult);
      }
      return createSafeMock(); // 체이닝 계속 지원
    },
    apply: () => {
      return createSafeMock(); // 함수 호출 결과도 모의 객체
    },
  });
};

// 다단계 속성 접근 및 함수 호출을 지원하는 프록시
const makeLazyProxy = (path: Array<string | number> = []): any => {
  const proxyTarget = () => {}; 
  return new Proxy(proxyTarget, {
    get(_, prop: string) {
      // .then 호출 시 (await 사용 시) 실제 클라이언트를 기다림
      if (prop === 'then' && path.length === 0) {
         // supabase 객체 자체를 await하는 경우는 드물지만 처리
         return initClient().then.bind(initClient());
      }
      return makeLazyProxy([...path, prop]);
    },
    apply(_, thisArg, args) {
      return initClient().then((client) => {
        // 클라이언트가 없으면(환경변수 누락) 안전한 더미 객체 반환
        // 예: supabase.from(...) -> Mock -> .select() -> Mock -> await -> {data: null}
        if (!client) {
          console.warn('Supabase client missing, returning safe mock for:', path.join('.'));
          const mock = createSafeMock();
          // 만약 현재 호출이 최종 호출(예: getUser)이라면 결과값 형태를 맞춰줄 필요가 있음
          // 하지만 Supabase는 대부분 { data, error }를 반환하므로 Mock의 then이 처리함.
          return mock;
        }
        
        let target: any = client;
        for (const p of path) {
          target = target[p as any];
          if (target == null) break;
        }
        
        if (typeof target === 'function') {
          return target.apply(client, args);
        }
        return target;
      });
    },
  });
};

// 기존 코드와의 호환을 위해 `supabase`를 프록시로 내보냄 — 실제 `@supabase/supabase-js` 모듈은
// 위 initClient()가 호출될 때까지 로드되지 않습니다.
export const supabase: any = makeLazyProxy();

// 서버 전용 admin 클라이언트는 별도 모듈에서 재수출합니다.
export { supabaseAdmin } from './admin';

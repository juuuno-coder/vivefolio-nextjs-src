"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [debug, setDebug] = useState<string>("시작...");

  useEffect(() => {
    let isMounted = true;
    console.log("[Callback] Mounting callback page...");

    // 타임아웃 20초 (충분히 대기)
    const timeout = setTimeout(() => {
      if (isMounted && status === "loading") {
        console.warn("[Callback] Authentication timeout reached");
        setStatus("error");
        setErrorMessage("인증 시간이 초과되었습니다. 다시 시도해주세요.");
        setTimeout(() => router.push("/login"), 3000);
      }
    }, 20000);

    // URL 파라미터 확인
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");
    const errorDescription = urlParams.get("error_description");

    if (error) {
      setStatus("error");
      setErrorMessage(errorDescription || error || "인증 오류");
      setTimeout(() => router.push("/login"), 3000);
      return;
    }

    // 세션 처리 성공 핸들러
    const handleSuccess = async (session: any, source: string) => {
      if (!isMounted || !session) return;
      console.log(`[Callback] Session confirmed via ${source}:`, session.user.email);
      
      setStatus("success");
      localStorage.setItem("isLoggedIn", "true");
      // loginTimestamp는 AuthContext에서 관리하므로 여기서 굳이 중복으로 안 해도 되지만,
      // 즉시성을 위해 남겨두되, 타임아웃 계산은 하지 않음
      
      // 즉시 이동 (지연 없음)
      if (isMounted) {
        console.log("[Callback] Redirecting to home immediately...");
        router.replace("/");
      }
    };

    // 1. Code Exchange (PKCE) 수동 시도
    // detectSessionInUrl: true 설정이 있어도, 명시적으로 처리하는 것이 안전함
    if (code) {
      console.log("[Callback] Auth code detected, exchanging...");
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          console.error("[Callback] Code exchange failed:", error);
          // 실패해도 일단 getSession 시도는 계속 진행
        } else if (data.session) {
          handleSuccess(data.session, "exchangeCodeForSession");
          return; // 성공했으면 아래 로직 중단 안함 (이중 체크 무방)
        }
      });
    }

    // 2. getSession 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleSuccess(session, "getSession");
      } else {
        setDebug("세션 정보 수신 중...");
      }
    });

    // 3. Auth State Change 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[Callback] Auth event: ${event}`);
      if (session) {
        handleSuccess(session, `onAuthStateChange(${event})`);
      }
    });

    // 4. (제거됨) 강제 탈출 로직 삭제: 이벤트 기반으로만 동작
    // const forcedRedirect = setTimeout(...) 

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      // clearTimeout(forcedRedirect); // 삭제
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-2xl shadow-lg max-w-md w-full mx-4">
        {status === "loading" && (
          <>
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-green-500 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-gray-800">인증을 완료하는 중입니다...</p>
              <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요</p>
              <p className="text-xs text-gray-400 mt-4">{debug}</p>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-gray-800">로그인 성공!</p>
              <p className="text-sm text-gray-500 mt-2">메인 페이지로 이동합니다...</p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-gray-800">인증 오류</p>
              <p className="text-sm text-red-500 mt-2">{errorMessage}</p>
              <p className="text-sm text-gray-500 mt-2">로그인 페이지로 이동합니다...</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const processedRef = useRef(false);

  useEffect(() => {
    // 이미 처리했으면 스킵
    if (processedRef.current) return;
    
    let isMounted = true;
    processedRef.current = true; // Mark as processing
    
    // 타임아웃 30초
    const timeout = setTimeout(() => {
      if (isMounted && status === "loading") {
        console.error("Auth callback timeout");
        setStatus("error");
        setErrorMessage("인증 시간이 초과되었습니다.");
        setTimeout(() => isMounted && router.push("/login"), 3000);
      }
    }, 30000);

    const handleAuth = async () => {
      // 1. 초기 세션 확인 (Supabase가 이미 처리했을 가능성)
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      
      if (initialSession) {
        console.log("Session already active.", initialSession.user.email);
        setStatus("success");
        setTimeout(() => isMounted && router.replace("/"), 100);
        return;
      }

      // 2. URL 파라미터 파싱
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");
      const error = searchParams.get("error");
      const errorDesc = searchParams.get("error_description");

      if (error) {
        throw new Error(errorDesc || error);
      }

      if (code) {
        console.log("PKCE Code found. Exchanging...");
        try {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
             console.warn("Exchange failed:", exchangeError.message);
             // 실패했다면, 혹시 그 사이(비동기 틱)에 세션이 생겼는지 재확인 (Race Condition)
             const { data: { session: retrySession } } = await supabase.auth.getSession();
             if (retrySession) {
                console.log("Session found despite exchange failure (Race Condition Safe)");
                setStatus("success");
                setTimeout(() => isMounted && router.replace("/"), 100);
                return;
             }
             throw exchangeError;
          }
          
          if (data.session) {
             console.log("Exchange successful.");
             setStatus("success");
             setTimeout(() => isMounted && router.replace("/"), 100);
             return;
          }
        } catch (err: any) {
           // AuthApiError: Auth session missing! 같은 에러 대응
           console.error("Exchange Exception:", err);
           // 마지막으로 한번 더 확인
           const { data: { session: finalSession } } = await supabase.auth.getSession();
           if (finalSession) {
              setStatus("success");
              setTimeout(() => isMounted && router.replace("/"), 100);
              return;
           }
           setStatus("error");
           setErrorMessage(err.message || "인증 교환 실패");
           setTimeout(() => isMounted && router.push("/login"), 3000);
        }
      } else {
        // 코드가 없다면 혹시 해시(#)에 토큰이 있는지 확인 (Implicit Flow - 드물게 사용됨)
         const hashParams = new URLSearchParams(window.location.hash.substring(1));
         const accessToken = hashParams.get("access_token");
         const refreshToken = hashParams.get("refresh_token");
         
         if (accessToken && refreshToken) {
            console.log("Implicit tokens found.");
            const { data, error: hashError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (!hashError && data.session) {
               setStatus("success");
               setTimeout(() => isMounted && router.replace("/"), 100);
               return;
            }
         }

         // 아무것도 없으면 로그인 페이지로
         console.warn("No code or session found.");
         setStatus("error");
         setErrorMessage("인증 정보를 찾을 수 없습니다.");
         setTimeout(() => isMounted && router.push("/login"), 2000);
      }
    };

    handleAuth();

    // Cleanup
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Mount hook

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-2xl shadow-lg max-w-md w-full mx-4">
        {status === "loading" && (
          <>
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#4ACAD4] rounded-full animate-spin border-t-transparent"></div>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-gray-800">인증을 완료하는 중입니다...</p>
              <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요</p>
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

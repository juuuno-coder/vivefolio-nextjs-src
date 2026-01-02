"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 이미 로그인되어 있으면 메인으로
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/");
    });
  }, [router]);

  // 구글 로그인 핸들러
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      // 구글 로그인은 여기서 끝이 아니라 Supabase가 리다이렉트 시킴
    } catch (error: any) {
      console.error("Google login error:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  // 이메일 로그인 핸들러
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // 로그인 성공! (나머지는 AuthContext가 알아서 함)
      console.log("[Login] Success");
      router.refresh();
      router.push("/");
      
    } catch (error: any) {
      console.error("[Login] Error:", error);
      setError("이메일 또는 비밀번호를 확인해주세요.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            반가워요! 👋
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            계정이 없으신가요?{" "}
            <Link href="/signup" className="font-medium text-green-600 hover:text-green-500 hover:underline">
              3초만에 회원가입하기
            </Link>
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* 소셜 로그인 */}
        <div className="mt-8">
          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            variant="outline"
            className="w-full h-12 flex items-center justify-center gap-3 border-gray-300 hover:bg-gray-50 rounded-full transition-all hover:shadow-md"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            ) : (
              <FontAwesomeIcon icon={faGoogle} className="w-5 h-5 text-red-500" />
            )}
            <span className="text-gray-700 font-medium">Google로 계속하기</span>
          </Button>
        </div>

        <div className="relative mt-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-500">또는 이메일로 시작하기</span>
          </div>
        </div>

        {/* 이메일 로그인 폼 */}
        <form className="mt-6 space-y-5" onSubmit={handleEmailLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="h-11 rounded-lg"
              disabled={loading}
            />
          </div>

          <div>
             <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" classNa="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <Link href="/forgot-password" className="text-xs font-medium text-green-600 hover:text-green-500">
                비밀번호를 잊으셨나요?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 rounded-lg"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full text-base font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? "로그인 중..." : "이메일로 로그인"}
          </Button>
        </form>
      </div>
    </div>
  );
}

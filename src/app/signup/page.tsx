
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function SignupPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                        회원가입
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        이미 계정이 있으신가요?{" "}
                        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            로그인
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" action="#" method="POST">
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email" className="sr-only">
                                이메일
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="rounded-t-md"
                                placeholder="이메일"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                비밀번호
                            </label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="rounded-none"
                                placeholder="비밀번호"
                            />
                        </div>
                        <div>
                            <label htmlFor="password-confirm" className="sr-only">
                                비밀번호 확인
                            </label>
                            <Input
                                id="password-confirm"
                                name="password-confirm"
                                type="password"
                                required
                                className="rounded-b-md"
                                placeholder="비밀번호 확인"
                            />
                        </div>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                        >
                            가입하기
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

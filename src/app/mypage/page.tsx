"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ImageDialog } from "@/components/ImageDialog";

// 임시 데이터
const DUMMY_PROJECTS = [
    {
        id: "p1",
        urls: {
            regular: "/window.svg",
            full: "/window.svg",
        },
        user: {
            username: "user_me",
            profile_image: {
                large: "/globe.svg",
                small: "/globe.svg",
            },
        },
        likes: 120,
        description: "내 프로젝트 1",
        alt_description: "설명",
        created_at: "2023-01-01",
        width: 800,
        height: 600,
    },
    {
        id: "p2",
        urls: {
            regular: "/file.svg",
            full: "/file.svg",
        },
        user: {
            username: "user_me",
            profile_image: {
                large: "/globe.svg",
                small: "/globe.svg",
            },
        },
        likes: 85,
        description: "내 프로젝트 2",
        alt_description: "설명",
        created_at: "2023-01-05",
        width: 800,
        height: 600,
    },
];

export default function MyPage() {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* 프로필 헤더 섹션 */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-12">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                            <AvatarImage src="/globe.svg" alt="Profile" />
                            <AvatarFallback>ME</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">내 프로필 (User Name)</h1>
                                <p className="text-gray-500">UI/UX Designer & Developer</p>
                            </div>

                            {/* 팔로워/팔로잉 정보 - TC007 요구사항 */}
                            <div className="flex items-center justify-center md:justify-start gap-6 text-sm">
                                <div className="flex flex-col items-center md:items-start cursor-pointer hover:underline">
                                    <span className="font-bold text-lg text-gray-900">1,234</span>
                                    <span className="text-gray-500">팔로워</span>
                                </div>
                                <div className="flex flex-col items-center md:items-start cursor-pointer hover:underline">
                                    <span className="font-bold text-lg text-gray-900">567</span>
                                    <span className="text-gray-500">팔로잉</span>
                                </div>
                                <div className="flex flex-col items-center md:items-start">
                                    <span className="font-bold text-lg text-gray-900">12</span>
                                    <span className="text-gray-500">프로젝트</span>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button variant="outline" className="mr-2">프로필 편집</Button>
                                <Button>프로젝트 업로드</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 프로젝트 그리드 섹션 */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-xl font-bold border-b-2 border-black pb-1">내 작업물</h2>
                    <h2 className="text-xl font-bold text-gray-400 pb-1 cursor-pointer hover:text-gray-600">좋아요한 작업</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {DUMMY_PROJECTS.map((project) => (
                        <ImageDialog key={project.id} props={project} />
                    ))}
                </div>
            </div>
        </div>
    );
}

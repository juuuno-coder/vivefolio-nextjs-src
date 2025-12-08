// src/app/page.tsx

"use client"; // 🚨 StickyMenu의 카테고리 상태 관리를 위해 "use client"가 필수입니다.

import { useState } from "react"; // 🚨 상태 관리를 위해 useState 임포트
import { Button } from "@/components/ui/button";
import { MainBanner } from "@/components/MainBanner";
import { ImageDialog } from "@/components/ImageDialog"; // ImageCard 대신 Dialog 사용
import { StickyMenu } from "@/components/StickyMenu"; // 🚨 StickyMenu 임포트

// 🚨 임시 ImageCard Props 타입 정의 (StickyMenu와의 연결을 위해 value를 추가)
interface ImageDialogProps {
  id: string;
  urls: { full: string; regular: string };
  user: { username: string; profile_image: { small: string; large: string } };
  likes: number;
  description: string | null;
  alt_description: string | null;
  created_at: string;
  width: number;
  height: number;
  // 🚨 임시로 카테고리 필터링을 위한 'category' 속성을 추가합니다.
  category: string;
}

// 🚨 임시 더미 데이터 생성 (카테고리 데이터 추가)
const DUMMY_IMAGES: ImageDialogProps[] = [
  // StickyMenu의 '전체' (korea)에 해당하는 데이터
  {
    id: "1",
    urls: {
      regular: "/window.svg",
      full: "/window.svg",
    },
    user: {
      username: "creator1",
      profile_image: {
        large: "/globe.svg",
        small: "/globe.svg",
      },
    },
    likes: 1234,
    description: "전체 카테고리 이미지 1",
    alt_description: "설명",
    created_at: "2023-01-01",
    width: 1000,
    height: 1000,
    category: "korea",
  },
  // StickyMenu의 'AI' (ai)에 해당하는 데이터
  {
    id: "2",
    urls: {
      regular: "/file.svg",
      full: "/file.svg",
    },
    user: {
      username: "creator2",
      profile_image: {
        large: "/globe.svg",
        small: "/globe.svg",
      },
    },
    likes: 987,
    description: "AI 카테고리 이미지 1",
    alt_description: "설명",
    created_at: "2023-01-02",
    width: 1000,
    height: 1000,
    category: "ai",
  },
  {
    id: "3",
    urls: {
      regular: "/next.svg",
      full: "/next.svg",
    },
    user: {
      username: "creator3",
      profile_image: {
        large: "/globe.svg",
        small: "/globe.svg",
      },
    },
    likes: 456,
    description: "전체 카테고리 이미지 2",
    alt_description: "설명",
    created_at: "2023-01-03",
    width: 1000,
    height: 1000,
    category: "korea",
  },

  // 나머지 데이터는 'video' 카테고리에 할당
  ...Array(9)
    .fill(0)
    .map((_, i) => ({
      id: String(i + 4),
      urls: {
        regular: "/window.svg",
        full: "/window.svg",
      },
      user: {
        username: `creator${i + 4}`,
        profile_image: {
          large: "/globe.svg",
          small: "/globe.svg",
        },
      },
      likes: (i + 1) * 100,
      description: `영상/모션그래픽 이미지 ${i + 1}`,
      alt_description: `설명 ${i + 1}`,
      created_at: `2023-01-0${i + 4}`,
      width: 1000,
      height: 1000,
      category: "video",
    })),
];

export default function Home() {
  // 🚨 StickyMenu의 초기값인 'korea'를 기본값으로 설정합니다.
  const [currentCategory, setCurrentCategory] = useState<string>("korea");

  // 🚨 StickyMenu에서 호출할 카테고리 변경 핸들러 함수
  const handleSetCategory = (categoryValue: string) => {
    setCurrentCategory(categoryValue);
    console.log("카테고리 변경:", categoryValue);
  };

  // 🚨 현재 선택된 카테고리에 따라 이미지를 필터링합니다.
  const filteredImages = DUMMY_IMAGES.filter(
    (image) => currentCategory === "korea" || image.category === currentCategory
  );

  return (
    <div className="w-full">
      {/* 1. 상단 홍보 배너 */}
      <div className="w-full h-15 flex items-center justify-center bg-[#4EABFF] text-xl font-semibold">
        <p className="text-white">
          레퍼런스로 시작하는 스몰 브랜드 브랜딩 워크숍
        </p>
      </div>

      <main className="w-full flex flex-col items-center py-6">
        {/* 2. 메인 홍보 갤러리 */}
        <MainBanner loading={false} gallery={[1, 2, 3, 4, 5, 6]} />

        {/* 🚨 3. Sticky Menu 연결 */}
        <StickyMenu
          props={currentCategory} // 현재 선택된 카테고리 값 전달
          onSetCategory={handleSetCategory} // 카테고리 변경 함수 전달
        />

        {/* 4. 이미지 리스트 (필터링된 이미지 렌더링) */}
        <section className="w-full grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-6 mt-6 px-6 xl:px-20">
          {filteredImages.map((image, index) => (
            <ImageDialog key={index} props={image} />
          ))}
        </section>

        {/* 5. 회원가입 및 로그인 유도 영역 */}
        <div className="h-[114px] flex flex-col items-center gap-6 my-20">
          {/* ... (JSX 유지) ... */}
          <div className="flex items-center gap-4">
            <Button
              variant={"default"}
              onClick={() => console.log("회원가입 버튼 클릭!")}
            >
              회원가입
            </Button>
            <p className="text-sm">또는</p>
            <Button
              variant={"outline"}
              onClick={() => console.log("로그인 버튼 클릭!")}
            >
              로그인
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

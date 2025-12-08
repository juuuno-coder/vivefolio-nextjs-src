// src/components/StickyMenu.tsx

"use client"; // 🚨 onClick 핸들러 및 스크롤 고정(`sticky`) 기능 사용으로 클라이언트 컴포넌트 지정

import { Separator } from "@/components/ui/separator"; // 🚨 Alias 경로 수정
import {
  LucideIcon,
  ArrowUpDown,
  Brush,
  Camera,
  ChevronRight,
  CirclePlay,
  Gem,
  IdCard,
  Layers,
  MousePointerClick,
  Package,
  Palette,
  Panda,
  PenTool,
  Sparkles,
  Type,
} from "lucide-react";

// 🚨 1. 카테고리 항목의 TypeScript 인터페이스 정의
interface Category {
  icon: LucideIcon; // Lucide React 아이콘은 LucideIcon 타입입니다.
  label: string;
  isActive: boolean;
  value: string;
}

// 🚨 2. StickyMenu 컴포넌트의 Props 인터페이스 정의
interface StickyMenuProps {
  // onSetCategory 함수는 category.value (string)를 인수로 받습니다.
  onSetCategory: (value: string) => void;
  // props는 현재 활성화된 카테고리의 value (string)를 받습니다.
  props: string;
}

// 🚨 3. 카테고리 데이터 정의 (const categories를 함수 외부에 두어 재렌더링 방지)
const categories: Category[] = [
  { icon: Layers, label: "전체", isActive: true, value: "korea" },
  {
    icon: CirclePlay,
    label: "영상/모션그래픽",
    isActive: false,
    value: "video",
  },
  {
    icon: Palette,
    label: "그래픽 디자인",
    isActive: false,
    value: "graphic-design",
  },
  { icon: IdCard, label: "브랜딩/편집", isActive: false, value: "brand" },
  { icon: MousePointerClick, label: "UI/UX", isActive: false, value: "ui" },
  {
    icon: PenTool,
    label: "일러스트레이션",
    isActive: false,
    value: "illustration",
  },
  { icon: Camera, label: "디지털 아트", isActive: false, value: "digital-art" },
  { icon: Sparkles, label: "AI", isActive: false, value: "ai" },
  { icon: Panda, label: "캐릭터 디자인", isActive: false, value: "cartoon" },
  {
    icon: Package,
    label: "제품/패키지 디자인",
    isActive: false,
    value: "product-design",
  },
  { icon: Camera, label: "포토그래피", isActive: false, value: "photography" },
  { icon: Type, label: "타이포그래피", isActive: false, value: "typography" },
  { icon: Gem, label: "공예", isActive: false, value: "craft" },
  { icon: Brush, label: "파인아트", isActive: false, value: "art" },
];

// 🚨 4. 컴포넌트 이름 변경 및 타입 적용
export function StickyMenu({ props, onSetCategory }: StickyMenuProps) {
  return (
    // 🚨 top-14는 Header의 높이에 따라 결정됩니다. (layout.tsx에서 pt-14와 일치)
    <section className="sticky top-14 z-10 w-full flex items-center justify-start px-20 py-2 gap-8 mt-20 bg-white">
      {/* 1. 정렬 메뉴 (데스크탑에서만 보임) */}
      <div className="hidden min-w-fit lg:flex flex-col gap-2">
        {/* 아이콘 */}
        <ArrowUpDown className="text-neutral-700" />
        {/* 아이콘 라벨 */}
        <p className="text-sm">정렬</p>
      </div>

      {/* 구분선 */}
      {/* h-10! 대신 h-10으로 수정하거나, 높이 유틸리티 클래스가 정의되어 있어야 합니다. */}
      <Separator orientation="vertical" className="hidden lg:block h-10" />

      {/* 2. 카테고리 목록 (가로 스크롤) */}
      <div className="flex items-center gap-10 overflow-x-auto no-scrollbar">
        {categories.map((category, index) => {
          // 🚨 동적 아이콘 렌더링을 위해 변수에 할당합니다.
          const IconComponent = category.icon;

          return (
            <div
              key={index}
              className="min-w-fit flex flex-col items-center gap-2 cursor-pointer" // 🚨 cursor-pointer 추가
              onClick={() => onSetCategory(category.value)} // 🚨 클릭 핸들러
            >
              <IconComponent
                className={`${props === category.value
                    ? "text-[#4ACAD4]" // 활성화된 카테고리 색상
                    : "text-neutral-700 hover:text-gray-900 transition-colors"
                  }`}
              />
              <p
                className={`${props === category.value
                    ? "text-[#4ACAD4]"
                    : "text-neutral-700"
                  } text-sm whitespace-nowrap`}
              >
                {category.label}
              </p>
            </div>
          );
        })}

        {/* 3. 우측 고정 영역 (그라데이션 및 특별 콘텐츠) */}
        <div className="absolute right-0 top-0 h-full flex items-center gap-2 bg-white pl-8">
          {/* 그라데이션 오버레이 */}
          {/* 🚨 bg-linear-to-l 클래스가 정의되어 있지 않다면 Tailwind CSS 설정이 필요합니다. */}
          <div className="h-full bg-gradient-to-l from-white to-white/0 w-20 absolute left-0"></div>

          <div className="flex items-center gap-5 z-20 pr-4 shrink-0">
            {/* 구분선 */}
            <Separator orientation="vertical" className="h-10" />

            <div className="flex flex-col items-center gap-0 p-4">
              {/* 이미지 경로 수정 필요: public 폴더를 기준으로 변경해야 합니다. */}
              <img
                src="/img-gyeonngi-do.png"
                alt="경기도 AI 콘텐츠"
                className="w-10"
              />
              <p className="text-sm whitespace-nowrap">경기도 AI 콘텐츠</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StickyMenu;

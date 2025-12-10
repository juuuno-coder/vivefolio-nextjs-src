// src/components/TopHeader.tsx

"use client";

export function TopHeader() {
  return (
    <div className="sticky top-0 z-50 w-full h-[44px] flex items-center bg-gradient-to-r from-[#4ACAD4] to-[#05BCC6]">
      <div className="max-w-7xl mx-auto px-6 py-2">
        <p className="text-sm md:text-base font-semibold text-white">
          크리에이티브 작품 발견하기 - 전 세계 창작자들의 포트폴리오를 탐색하세요
        </p>
      </div>
    </div>
  );
}

export default TopHeader;

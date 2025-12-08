// src/components/Header.tsx

// 🚨 클라이언트 상호작용(Sheet, Drawer, onClick, useState 등)이 있으므로 필수!
"use client";

import { ChevronDown, Menu, Search } from "lucide-react";
// shadcn/ui 컴포넌트는 프로젝트 구조에 따라 경로를 조정해야 합니다.
// App Router에서는 일반적으로 @/components/ui/XXX 형태로 사용합니다.
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Drawer,
  DrawerContent,
  DrawerTrigger,
  Input,
  Separator,
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/index"; // 또는 각각의 컴포넌트 파일을 명시적으로 임포트
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // 이 라이브러리가 설치되어 있어야 합니다.
// Next.js에서는 react-router-dom의 NavLink 대신 next/link를 사용합니다.
import Link from "next/link";
// FOOTER_CONTETNS 경로는 프로젝트 루트 기준에 맞게 조정해야 합니다.
// (임시로 상위 경로를 가정했지만, 프로젝트 구조에 맞게 수정해주세요)
// import { FOOTER_CONTETNS } from "@/constants";

// 임시 FOOTER_CONTETNS 정의 (실제 파일 경로는 팀원들과 상의하여 수정)
const FOOTER_CONTETNS = [
  { icon: "faInstagram", label: "Instagram" },
  { icon: "faFacebook", label: "Facebook" },
  // ... 실제 데이터에 맞게 추가
];

const menu = [
  { label: "발견", newest: false, dropdown: false, underline: true, path: "/" },
  {
    label: "채용",
    newest: true,
    dropdown: false,
    underline: false,
    path: "/recruit",
  },
  {
    label: "워크숍/커뮤니티",
    newest: false,
    dropdown: true,
    underline: false,
    path: "#",
  }, // path 임시 수정
  {
    label: "포폴 피드백",
    newest: true,
    dropdown: false,
    underline: false,
    path: "/submission",
  }, // path 임시 수정
  {
    label: "에이전시",
    newest: false,
    dropdown: false,
    underline: false,
    path: "/recruit",
  },
];

// AppHeader 이름을 Next.js에서 권장하는 PascalCase인 Header로 변경
// onSetCategory 함수는 아직 데이터 로직을 연결하지 않았으므로, 임시로 console.log 처리합니다.
export function Header({
  onSetCategory = (value: string) => console.log("검색 요청:", value),
}: {
  onSetCategory?: (value: string) => void;
}) {
  // 로고 이미지 경로는 public 폴더 기준으로 변경하거나 Next/Image 사용을 고려해야 합니다.
  const LOGO_PATH = "/logo.svg";
  const ASSETS_PATH = "/logo.svg"; // assets 경로는 public 폴더로 이동하는 것이 좋습니다.

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLInputElement;
      onSetCategory(target.value.replace(/\s+/g, ""));
    }
  };

  const handleMobileSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // onSetSearchValue 대신 onSetCategory를 사용하도록 통일 (기존 로직 추측)
    onSetCategory(event.target.value);
  };

  return (
    <>
      {/* 모바일 헤더 */}
      <header className="sticky top-0 z-10 w-full flex flex-col items-center justify-between pt-3 px-4 border-b bg-white xl:hidden">
        <div className="w-full h-full flex items-center justify-between">
          <div className="w-full flex items-center gap-4">
            <Sheet>
              <SheetTrigger>
                <Menu />
              </SheetTrigger>
              {/* 모바일 메뉴 (SheetContent) 코드는 기존과 동일하게 유지 */}
              <SheetContent
                side="left"
                className="flex flex-col px-8 pb-8 gap-8 overflow-y-scroll"
              >
                {/* ... (SheetContent 내부 코드는 길이상 생략, 원본 코드를 그대로 사용) ... */}
                {/* 🚨 기존 NavLink 대신 Link 사용 */}
                <div className="flex flex-col gap-6">
                  {menu.map((item, index) => (
                    <Link
                      href={item.path}
                      key={index}
                      className={`h-full flex items-center gap-1 font-medium`}
                    >
                      <p
                        className={`text-[15px] ${item.underline && "mt-0.5"}`}
                      >
                        {item.label}
                      </p>
                      {item.dropdown && <ChevronDown size={16} />}
                      {item.newest && (
                        <p className="text-xs text-[#05BCC6] font-medium">
                          NEW
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
                {/* ... (SheetContent 나머지 코드) ... */}
                <div className="flex flex-col gap-6 mt-16">
                  <img src={LOGO_PATH} alt="Vibefolio Logo" className="w-24" />
                  <div className="flex flex-col">
                    <p className="text-sm">
                      회원가입 또는 로그인을 통해 AI 창작자의
                    </p>
                    <p className="text-sm">
                      크리에이티브를 발견하고 수집해보세요.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {/* Link 컴포넌트로 변경 시 Button을 Link 안에 넣거나 asChild 사용 */}
                    <Button
                      asChild
                      className="bg-[#4ACAD4] hover:bg-[#41a3aa]"
                    >
                      <Link href="/signup">
                        <span>회원가입</span>
                      </Link>
                    </Button>
                    <Button asChild variant={"outline"}>
                      <Link href="/login">
                        <span>로그인</span>
                      </Link>
                    </Button>
                  </div>
                </div>
                <Separator />
                {/* ... (SheetContent 중간 메뉴 및 Footer 정보 생략) ... */}
                <Separator />
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                      {FOOTER_CONTETNS.map((item, index) => (
                        <div className="flex items-center gap-4" key={index}>
                          {/* FontAwesomeIcon 사용 시 라이브러리 설정 필요 */}
                          {/* <FontAwesomeIcon icon={item.icon} /> */}
                          <p className="text-sm">{item.label}</p>
                        </div>
                      ))}
                    </div>
                    {/* ... (사업자 정보 생략) ... */}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            {/* 로고 */}
            {/* 🚨 Link로 감싸서 홈으로 이동하도록 수정 */}
            <Link href="/">
              <img src={ASSETS_PATH} alt="@LOGO" className="w-30" />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {/* 로그인 버튼도 Link로 감싸서 /login 페이지로 이동하도록 수정 */}
            <Button asChild variant={"outline"}>
              <Link href="/login">
                <span>로그인</span>
              </Link>
            </Button>
            {/* 검색 (Drawer) 코드는 기존과 동일하게 유지 */}
            <Drawer>
              <DrawerTrigger>
                <Search size={20} />
              </DrawerTrigger>
              <DrawerContent className="h-full flex flex-col gap-6 px-6">
                <div className="flex items-center border px-3 rounded-full bg-neutral-50">
                  <Search size={18} className="text-neutral-400" />
                  <Input
                    placeholder="230,000개 이상의 크리에이티브 검색"
                    onChange={handleMobileSearchChange}
                    className="w-full placeholder:text-neutral-400 outline-0 border-none focus-visible:ring-0"
                  />
                </div>
                {/* ... (DrawerContent 나머지 코드 생략) ... */}
              </DrawerContent>
            </Drawer>
          </div>
        </div>
        <nav className="w-full h-14 flex items-center gap-4">
          {menu.map((item, index) => (
            <Link
              href={item.path}
              key={index}
              className={`h-full flex items-center gap-1 font-medium ${item.underline && "h-[calc(100%-2px)] border-b-2 border-black"
                }`}
            >
              <p className={`text-[15px] ${item.underline && "mt-0.5"}`}>
                {item.label}
              </p>
              {item.dropdown && <ChevronDown size={16} />}
              {item.newest && (
                <p className="text-xs text-[#05BCC6] font-medium">NEW</p>
              )}
            </Link>
          ))}
        </nav>
      </header>

      {/* 데스크탑 헤더 */}
      <header className="sticky top-0 z-10 w-full h-14 hidden xl:flex items-center justify-between px-8 border-b bg-white">
        <div className="h-full flex items-center gap-10">
          {/* 로고 */}
          <Link href="/">
            <img src={ASSETS_PATH} alt="@LOGO" className="w-30" />
          </Link>
          <nav className="h-full flex items-center gap-4">
            {menu.map((item, index) => (
              <Link // 🚨 NavLink -> Link로 변경
                href={item.path}
                key={index}
                className={`h-full flex items-center gap-1 font-medium ${item.underline && "h-[calc(100%-2px)] border-b-2 border-black"
                  }`}
              >
                <p className={`text-[15px] ${item.underline && "mt-0.5"}`}>
                  {item.label}
                </p>
                {item.dropdown && <ChevronDown size={16} />}
                {item.newest && (
                  <p className="text-xs text-[#05BCC6] font-medium">NEW</p>
                )}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border px-3 rounded-full bg-neutral-50">
            <Search size={18} className="text-neutral-400" />
            <Input
              placeholder="230,000개 이상의 크리에이티브 검색"
              // 🚨 onKeyDown 이벤트 핸들러 적용
              onKeyDown={handleSearchKeyDown}
              className="w-60 placeholder:text-neutral-400 outline-0 border-none focus-visible:ring-0"
            />
          </div>
          {/* 로그인 */}
          <Button asChild variant="link">
            <Link href="/login">
              <span>로그인</span>
            </Link>
          </Button>
          {/* 회원가입 */}
          <Button asChild>
            <Link href="/signup">
              <span>회원가입</span>
            </Link>
          </Button>
        </div>
      </header>
    </>
  );
}

// src/app/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from 'next/dynamic';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"; // skeleton for cards
import { MainBanner } from "@/components/MainBanner";
import { ImageCard } from "@/components/ImageCard";
import { StickyMenu } from "@/components/StickyMenu";
import { getCategoryName } from "@/lib/categoryMap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWandSparkles, faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// 모달은 초기에 필요 없으므로 Dynamic Import로 지연 로딩
const ProjectDetailModalV2 = dynamic(() => 
  import("@/components/ProjectDetailModalV2").then(mod => mod.ProjectDetailModalV2), 
  { ssr: false }
);
import { useAuth } from "@/lib/auth/AuthContext";
import { PopupModal } from "@/components/PopupModal";

interface ImageDialogProps {
  id: string;
  title?: string;
  urls: { full: string; regular: string };
  user: { username: string; profile_image: { small: string; large: string } };
  likes: number;
  views?: number;
  description: string | null;
  alt_description: string | null;
  created_at: string;
  width: number;
  height: number;
  category: string;
  field?: string; // 분야 정보 추가
  userId?: string;
}

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | string[]>("all");
  const [sortBy, setSortBy] = useState("latest");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [projects, setProjects] = useState<ImageDialogProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [interestModalOpen, setInterestModalOpen] = useState(false); // 관심사 모달 상태
  const [selectedProject, setSelectedProject] = useState<ImageDialogProps | null>(null);
  const [userInterests, setUserInterests] = useState<{ genres: string[]; fields: string[] } | null>(null);
  const [usePersonalized, setUsePersonalized] = useState(false);

  // Auth 상태 변경 시 관심 카테고리 정보만 로드 (자동 적용 X)
  useEffect(() => {
    if (user) {
      const interests = user.user_metadata?.interests;
      if (interests) {
        setUserInterests(interests);
      }
    } else {
      setUserInterests(null);
    }
  }, [user]);

  // 정렬 함수
  const sortProjects = useCallback((list: ImageDialogProps[], type: string) => {
    const sorted = [...list];
    switch (type) {
      case "latest":
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case "popular":
      case "views":
        return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
      case "likes":
        return sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      default:
        return sorted;
    }
  }, []);

  // 프로젝트 로드 (API에서 User 정보 포함하여 반환)
  const loadProjects = useCallback(
    async (pageNum = 1, reset = false) => {
      if (loading && !reset) return;
      if (reset) setLoading(true);
      try {
        const limit = 20;
        const res = await fetch(`/api/projects?page=${pageNum}&limit=${limit}`);
        const data = await res.json();

        if (res.ok && data.projects) {
          const enriched = data.projects.map((proj: any) => {
            // API에서 User 정보를 함께 받아오므로 getUserInfo 호출 불필요
            const userInfo = proj.User || { username: 'Unknown', profile_image_url: '/globe.svg' };
            
            return {
              id: proj.project_id.toString(),
              title: proj.title,
              urls: { 
                full: proj.thumbnail_url || "/placeholder.jpg", 
                regular: proj.thumbnail_url || "/placeholder.jpg" 
              },
              user: { 
                username: userInfo.username, 
                profile_image: { 
                  small: userInfo.profile_image_url, 
                  large: userInfo.profile_image_url 
                } 
              },
              likes: proj.likes_count || proj.likes || 0,
              views: proj.views_count || proj.views || 0,
              description: proj.content_text,
              alt_description: proj.title,
              created_at: proj.created_at,
              width: 400,
              height: 300,
              category: proj.Category?.name || "korea",
              field: proj.field || "IT", // 임시: 분야 정보가 없으면 IT로 설정 (추후 DB 연동 필요)
              userId: proj.user_id,
            } as ImageDialogProps;
          });
          
          reset ? setProjects(enriched) : setProjects(prev => [...prev, ...enriched]);
          
          // 더 이상 불러올 데이터가 없으면 hasMore를 false로 설정
          if (data.projects.length < limit) {
            setHasMore(false);
          }
        } else {
          setHasMore(false);
        }
      } catch (e) {
        console.error("프로젝트 로딩 실패:", e);
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  // 최초 로드
  useEffect(() => {
    loadProjects(1, true);
  }, []);

  // 카테고리 필터링
  const categoryNames = Array.isArray(selectedCategory) 
    ? selectedCategory.map(c => getCategoryName(c))
    : [getCategoryName(selectedCategory)];
  
  // 필터링 로직 강화 (카테고리 + 분야 + 관심사)
  const filtered = projects.filter(p => {
    // 1. 관심사 탭 ("interests") 선택 시 로직
    if (selectedCategory === "interests") {
      if (!userInterests) return false; // 데이터 로딩 전이거나 없으면 안 보여줌
      
      const myGenres = userInterests.genres || [];
      const myFields = userInterests.fields || [];

      // 장르 매칭: 내 장르에 포함되거나, 설정한 장르가 없으면 통과
      // p.category는 한글명("포토"), myGenres는 영어코드("photo")일 확률 높음 -> 변환 필요
      const genreMatch = myGenres.length === 0 || myGenres.some(g => getCategoryName(g) === p.category);
      
      // 분야 매칭: 내 분야에 포함되거나, 설정한 분야가 없으면 통과
      const fieldMatch = myFields.length === 0 || (p.field && myFields.includes(p.field));
      
      return genreMatch && fieldMatch;
    }

    // 2. 일반 카테고리 필터
    const catName = p.category;
    const matchCategory = selectedCategory === "all" || categoryNames.includes(catName);
    
    // 3. 분야 필터
    const matchField = selectedFields.length === 0 || (p.field && selectedFields.includes(p.field.toLowerCase()));
    
    return matchCategory && matchField;
  });

  // 관심사 탭 선택 시 유효성 검사
  useEffect(() => {
    if (selectedCategory === "interests") {
      if (!isAuthenticated) {
        // 로그인이 안 된 경우 (임시: confirm 사용 -> 추후 로그인 모달로 대체 가능)
        if (confirm("로그인이 필요한 기능입니다. 로그인 페이지로 이동하시겠습니까?")) {
          router.push("/login");
        }
        setSelectedCategory("all");
      } else if (!userInterests || (userInterests.genres?.length === 0 && userInterests.fields?.length === 0)) {
        // 관심사가 없는 경우 -> 모달 오픈
        setInterestModalOpen(true);
      }
    }
  }, [selectedCategory, isAuthenticated, userInterests, router]);
  
  const sortedProjects = sortProjects(filtered, sortBy);

  const handleProjectClick = (proj: ImageDialogProps) => {
    setSelectedProject(proj);
    setModalOpen(true);
  };

  const handleUploadClick = () => {
    if (!isAuthenticated) { 
      alert('프로젝트 등록을 위해 로그인이 필요합니다.'); 
      router.push('/login'); 
    } else { 
      router.push('/project/upload'); 
    }
  };



  return (
    <div className="min-h-screen bg-white">
      <main className="w-full">
        {/* 메인 배너 */}
        <section className="w-full pt-4">
          <MainBanner />
        </section>

        {/* 팝업 모달 */}
        <PopupModal />

        {/* 개인화 필터 알림 */}
        {/* 개인화 필터 제안 (아직 적용 안함) */}
        {/* 개인화 필터 배너 제거됨 (카테고리 탭으로 통합) */}

        {/* 카테고리 메뉴 */}
        <StickyMenu
          props={selectedCategory}
          onSetCategory={setSelectedCategory}
          onSetSort={setSortBy}
          onSetField={setSelectedFields}
          currentSort={sortBy}
          currentFields={selectedFields}
        />

        {/* 프로젝트 그리드 */}
        <section className="w-full px-4 md:px-20 py-12">
          <div className="masonry-grid">
            {loading ? (
              // 스켈레톤 카드 6개 표시
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-2">
                  <Skeleton className="h-[300px] w-full rounded" />
                </div>
              ))
            ) : (
              sortedProjects.map(project => (
                <ImageCard key={project.id} props={project} onClick={() => handleProjectClick(project)} />
              ))
            )}
          </div>

          {/* 프로젝트가 없을 때 */}
          {!loading && sortedProjects.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg mb-4">프로젝트가 없습니다.</p>
              <Button onClick={handleUploadClick} className="btn-primary">첫 프로젝트 등록하기</Button>
            </div>
          )}

          {/* 더 보기 버튼 */}
          {!loading && sortedProjects.length > 0 && hasMore && (
            <div className="text-center py-8">
              <Button 
                onClick={() => {
                  setLoadingMore(true);
                  loadProjects(page + 1, false).finally(() => {
                    setPage(prev => prev + 1);
                    setLoadingMore(false);
                  });
                }}
                disabled={loadingMore}
                variant="outline"
                className="px-8 py-3 text-base"
              >
                {loadingMore ? (
                  <><span className="animate-spin mr-2">⏳</span> 로딩 중...</>
                ) : (
                  '더 보기'
                )}
              </Button>
            </div>
          )}
        </section>

        {/* 상세 모달 */}
        <ProjectDetailModalV2 open={modalOpen} onOpenChange={setModalOpen} project={selectedProject} />

        {/* 관심사 설정 안내 모달 */}
        <Dialog open={interestModalOpen} onOpenChange={(open) => {
          setInterestModalOpen(open);
          if (!open && selectedCategory === "interests") {
             setSelectedCategory("all");
          }
        }}>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl text-gray-900">
                <span className="text-2xl">🌱</span>
                <span>관심사 설정이 필요해요!</span>
              </DialogTitle>
              <DialogDescription className="pt-2 text-base text-gray-600">
                아직 설정된 관심사가 없어서 맞춤 프로젝트를 보여드릴 수 없어요.<br />
                나만의 관심사를 설정하고 취향 저격 프로젝트를 만나보세요!
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-row gap-2 sm:justify-end mt-4">
              <Button variant="secondary" onClick={() => setInterestModalOpen(false)} className="flex-1 sm:flex-none">
                나중에 하기
              </Button>
              <Button className="btn-primary flex-1 sm:flex-none text-white" onClick={() => router.push("/mypage")}>
                설정하러 가기
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

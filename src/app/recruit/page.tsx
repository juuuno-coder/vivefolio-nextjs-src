
export default function RecruitPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">채용 / 마켓플레이스</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Placeholder items */}
                {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="font-semibold text-lg mb-2">프리랜서 디자이너 모집 {i}</h3>
                        <p className="text-gray-500 text-sm mb-4">프로젝트 기반 UI/UX 디자이너를 찾습니다.</p>
                        <div className="flex justify-between items-center text-sm">
                            <span className="bg-gray-100 px-2 py-1 rounded">Design</span>
                            <span className="text-blue-600">지원하기</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

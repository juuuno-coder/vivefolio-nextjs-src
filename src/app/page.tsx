import { supabase } from "@/lib/supabase";

// 데이터 캐싱 방지 (항상 최신 데이터 로드)
export const dynamic = "force-dynamic";

export default async function Home() {
  // Supabase 테이블에서 모든 데이터 가져오기
  const { data: posts, error } = await supabase
    .from("guide_posts")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return <div className="p-10 text-red-500">에러 발생: {error.message}</div>;
  }

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center py-20 px-4">
      <h1 className="text-3xl font-bold mb-10 text-gray-800">
        Supabase 데이터 연동 목록
      </h1>

      <div className="grid gap-5 w-full max-w-2xl">
        {posts?.map((post) => (
          <div
            key={post.id}
            className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-gray-900">{post.title}</h2>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">
                {post.tag}
              </span>
            </div>
            <p className="text-gray-600 leading-relaxed">{post.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

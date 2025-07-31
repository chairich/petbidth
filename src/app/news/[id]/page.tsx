
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function NewsDetail() {
  const supabase = createClientComponentClient();
  const { id } = useParams();
  const router = useRouter();
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from('store_news')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        console.error('Error fetching news:', error.message);
      } else {
        setNews(data);
      }
      setLoading(false);
    };

    const fetchRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile) setUserRole(profile.role);
      }
    };

    fetchNews();
    fetchRole();
  }, [id]);

  if (loading) {
    return <div className="text-center py-10 text-white">กำลังโหลดข่าว...</div>;
  }

  if (!news) {
    return <div className="text-center py-10 text-red-500">ไม่พบข่าว</div>;
  }

  return (
    <div className="container max-w-3xl mx-auto py-10 px-4 text-white">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-yellow-300">{news.title}</h1>

      <div className="text-xs md:text-sm text-gray-400 mb-6">
        แก้ไขล่าสุด: {new Date(news.updated_at || news.created_at).toLocaleString('th-TH')}
      </div>

      {news.images && Array.isArray(news.images) && news.images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {news.images.map((url: string, idx: number) => (
            <div key={idx} className="relative">
              <img
                src={url}
                alt={`img-${idx}`}
                className="rounded shadow-md w-full h-auto object-cover"
              />
              {idx === news.cover_image_index && (
                <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  หน้าปก
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <article
        className="prose prose-invert max-w-none mb-10 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: news.content }}
      />

      <div className="flex flex-wrap gap-4 justify-end">
        {userRole === 'admin' && (
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-5 py-2 rounded shadow"
            onClick={() => router.push(`/news/form/${news.id}`)}
          >
            ✏️ แก้ไขข่าว
          </button>
        )}
        <button
          className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded"
          onClick={() => router.push('/news')}
        >
          ⬅️ กลับ
        </button>
      </div>
    </div>
  );
}

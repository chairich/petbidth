
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function NewsIndex() {
  const supabase = createClientComponentClient();
  const [newsList, setNewsList] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from('store_news')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setNewsList(data);
      }
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
  }, []);

  return (
    <div className="container max-w-6xl mx-auto px-4 py-10 text-white">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">📰 ข่าวสารทั้งหมด</h1>

      {newsList.length === 0 ? (
        <div className="text-center text-gray-400">ยังไม่มีข่าว</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {newsList.map((item) => (
            <div key={item.id} className="bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col">
              {item.images?.length > 0 && (
                <img
                  src={item.images[item.cover_image_index || 0]}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4 flex flex-col flex-1">
                <h2 className="text-lg font-bold mb-2 line-clamp-2">{item.title}</h2>
                <div
                  className="text-sm text-gray-300 mb-4 prose prose-sm prose-invert max-w-none line-clamp-4 overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                />
                <div className="mt-auto flex gap-2">
                  <Link
                    href={`/news/${item.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded w-full text-center"
                  >
                    ดูรายละเอียด
                  </Link>
                  {userRole === 'admin' && (
                    <Link
                      href={`/news/form/${item.id}`}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black text-sm px-4 py-2 rounded"
                    >
                      ✏️ แก้ไข
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

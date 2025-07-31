
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function NewsManage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [newsList, setNewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsList = async () => {
      const { data, error } = await supabase
        .from('store_news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading news list:', error.message);
      } else {
        setNewsList(data || []);
      }
      setLoading(false);
    };
    fetchNewsList();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข่าวนี้?");
    if (!confirmDelete) return;

    const { error } = await supabase.from('store_news').delete().eq('id', id);
    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } else {
      setNewsList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="container max-w-5xl mx-auto py-10 px-4 text-white">
      <h1 className="text-3xl font-bold mb-6">จัดการข่าวทั้งหมด</h1>

      {loading ? (
        <p className="text-center">กำลังโหลด...</p>
      ) : (
        <div className="space-y-4">
          {newsList.map((news) => (
            <div key={news.id} className="bg-[#111827] p-4 rounded border border-gray-700 shadow-sm">
              <h2 className="text-xl font-semibold">{news.title}</h2>
              <p className="text-sm text-gray-400 mb-3">
                แก้ไขล่าสุด: {new Date(news.updated_at || news.created_at).toLocaleString('th-TH')}
              </p>
              <div className="flex gap-2">
                <button
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-4 py-1 rounded"
                  onClick={() => router.push(`/news/form/${news.id}`)}
                >
                  แก้ไข
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
                  onClick={() => handleDelete(news.id)}
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

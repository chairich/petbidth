'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function AdminBlogsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('seo_articles')
      .select('id, title, slug, coverimage, excerpt')
      .order('created_at', { ascending: false });

    if (!error && data) {
      console.log('✅ โหลดบทความ:', data);
      setPosts(data);
    } else {
      console.error('❌ ERROR โหลดบทความ:', error);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = confirm('คุณแน่ใจว่าต้องการลบบทความนี้?');
    if (!ok) return;
    await supabase.from('seo_articles').delete().eq('id', id);
    fetchPosts();
  };

  return (
    <div className="bg-[#f9fafb] min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">จัดการบทความ</h1>
<div className="flex justify-end mb-4">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={async () => {
            const confirmGen = confirm('ต้องการให้ AI เขียนบทความ SEO ใหม่?');
            if (!confirmGen) return;
            const res = await fetch('/api/generate-blog', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
              alert(`✅ สร้างบทความ "${data.title}" แล้ว`);
              fetchPosts();
            } else {
              alert(`❌ เกิดข้อผิดพลาด: ${data.error || 'ไม่สามารถสร้างบทความได้'}`);
            }
          }}
        >
          🤖 ให้ AI สร้างบทความ
        </button>
      </div>
      <div className="flex justify-end mb-6">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => router.push('/admin/blogs/new')}
        >
          ➕ เพิ่มบทความใหม่
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col"
          >
            <Image
              src={post.coverimage}
              alt={post.title}
              width={600}
              height={300}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 flex flex-col flex-grow">
              <h2 className="text-lg font-semibold mb-2 line-clamp-2">{post.title}</h2>
              <p className="text-sm text-gray-600 line-clamp-3 flex-grow">{post.excerpt}</p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => router.push(`/admin/blogs/edit/${post.id}`)}
                  className="text-sm px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  ✏️ แก้ไข
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  🗑️ ลบ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

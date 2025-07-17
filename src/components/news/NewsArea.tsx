import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NewsPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: newsList } = await supabase
    .from('store_news')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center text-white">ข่าวสารจากทางร้าน</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {newsList?.map((news) => (
          <div
            key={news.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300"
          >
            {news.image_url && (
              <Image
                src={news.image_url}
                alt={news.title}
                width={600}
                height={400}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">{news.title}</h2>
              <p className="text-sm text-gray-500 mb-2">
                🗓 {new Date(news.created_at).toLocaleDateString("th-TH", {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              <Link href={`/news/${news.id}`} className="text-blue-600 hover:underline text-sm">
                อ่านเพิ่มเติม →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
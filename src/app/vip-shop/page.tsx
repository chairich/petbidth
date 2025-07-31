
'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import Link from 'next/link';

export default function VipShopPage() {
  const supabase = createClientComponentClient();
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('ดึงข้อมูลร้านค้าล้มเหลว:', error.message);
      } else {
        setShops(data || []);
      }

      setLoading(false);
    };

    fetchShops();
  }, []);

  if (loading) return <p className="text-center py-10">กำลังโหลดร้านค้า...</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">ร้านค้าทั้งหมด</h1>

      {shops.length === 0 && (
        <p className="text-center text-gray-500">ยังไม่มีร้านค้าที่เปิดใช้งาน</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {shops.map((shop) => (
          <Link
            href={`/vip-shop/${shop.id}`}
            key={shop.id}
            className="block border rounded-lg shadow hover:shadow-lg transition"
          >
            {shop.images && shop.images.length > 0 && (
              <Image
                src={shop.images[shop.cover_image_index || 0]}
                alt={shop.shop_name}
                width={400}
                height={300}
                className="rounded-t-lg object-cover w-full h-48"
              />
            )}
            <div className="p-4">
              <h2 className="text-lg font-semibold">{shop.shop_name}</h2>
              <p className="text-sm text-gray-600 line-clamp-2">{shop.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

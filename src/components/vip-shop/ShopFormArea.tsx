'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';

export default function ShopDetailPage() {
  const { id } = useParams();
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShop = async () => {
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from('banners')
        .select('*, user:users!user_id(*)') // join กับ users ผ่าน user_id
        .eq('id', id)
        .single();

      if (error) console.error(error);
      else setShop(data);

      setLoading(false);
    };

    if (id) fetchShop();
  }, [id]);

  if (loading) return <p className="text-center py-10">กำลังโหลดข้อมูลร้านค้า...</p>;
  if (!shop) return <p className="text-center py-10">ไม่พบข้อมูลร้านค้านี้</p>;

  const user = shop.user;
  const images = shop.images || [];
  const coverIndex = shop.cover_image_index || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{shop.shop_name}</h1>

      {/* เจ้าของร้าน */}
      <div className="flex items-center gap-4 mb-6">
        <Image
          src={user?.avatar_url || '/noavatar.png'}
          width={60}
          height={60}
          alt="avatar"
          className="rounded-full object-cover"
        />
        <div>
          <p className="text-lg font-semibold">{user?.username || 'ไม่ทราบชื่อเจ้าของร้าน'}</p>
          <p className="text-sm text-gray-500">{user?.email || '-'}</p>
        </div>
      </div>

      {/* รูปปก */}
      {images.length > 0 && (
        <Image
          src={images[coverIndex]}
          width={800}
          height={400}
          alt="cover"
          className="rounded-xl mb-6 w-full object-cover"
        />
      )}

      {/* แกลเลอรีรูปภาพ */}
      {images.length > 1 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
          {images.map((img: string, index: number) => (
            <Image
              key={index}
              src={img}
              width={200}
              height={200}
              alt={`img-${index}`}
              className="rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      {/* คำอธิบายร้าน */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">รายละเอียดร้านค้า</h2>
        <p className="text-gray-700 whitespace-pre-line">{shop.description || 'ไม่มีคำอธิบายร้าน'}</p>
      </div>

      {/* รายละเอียดเพิ่มเติม */}
      {shop.store_details && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">ข้อมูลเพิ่มเติม</h2>
          <p className="text-gray-700 whitespace-pre-line">{shop.store_details}</p>
        </div>
      )}

      {/* ช่องทางติดต่อ */}
      <div className="bg-gray-100 rounded-xl p-4 space-y-2">
        <h2 className="text-lg font-semibold">ช่องทางติดต่อ</h2>
        <p>📞 โทรศัพท์: {shop.phone || '-'}</p>
        <p>💬 Line ID: {shop.line_id || '-'}</p>
        <p>📘 Facebook: {shop.facebook || '-'}</p>
      </div>

      {/* สถานะร้าน */}
      <p className="text-sm text-gray-500 mt-4">
        สถานะ: {shop.is_active ? 'เปิดอยู่' : 'ปิดชั่วคราว'} ({shop.status || 'ไม่ระบุสถานะ'})
      </p>
    </div>
  );
}

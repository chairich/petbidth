'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';



export default function ShopDetailPage() {
  const { id } = useParams();
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const fetchShop = async () => {
      if (!id) return;
      const supabase = createClientComponentClient();
      const { data, error } = await supabase.from('banners').select('*').eq('id', id).single();
      if (error) {
        setError('ไม่พบข้อมูลร้านค้า');
      } else {
        setShop(data);
      }
      setLoading(false);
    };
    fetchShop();
  }, [id]);

  if (loading) return <div className="text-center p-10 text-white">กำลังโหลด...</div>;
  if (error || !shop) return <div className="text-center p-10 text-red-500">{error || 'เกิดข้อผิดพลาด'}</div>;

  const images = shop.images || [];

  return (
     <div className="w-full flex justify-center">
  <div className="max-w-4xl mx-auto px-4 py-6 text-white">
    <h2 className="text-3xl font-bold mb-4 text-center">{shop.shop_name}</h2>

    {images.length > 0 && (
      <>
        {/* ภาพหลัก */}
        <div className="flex justify-center mb-4">
          <Image
            src={images[selectedIndex]}
            width={600}
            height={400}
            alt="ภาพหลัก"
            className="rounded-xl object-cover"
          />
        </div>

        {/* Thumbnail images */}
        <div className="flex justify-center gap-2 flex-wrap mb-6">
          {images.map((url: string, index: number) => (
            <Image
              key={index}
              src={url}
              width={100}
              height={75}
              alt={`thumb-${index}`}
              className={`rounded cursor-pointer border transition-transform duration-150 hover:scale-105 ${
                index === selectedIndex ? 'border-yellow-400 border-2' : 'border-gray-300'
              }`}
              onClick={() => setSelectedIndex(index)}
            />
          ))}
        </div>
      </>
    )}

    {/* รายละเอียด */}
    <div className="bg-slate-800 p-4 rounded-md space-y-2">
      {shop.description && (
        <div>
          <h3 className="text-lg font-semibold">รายละเอียดร้าน:</h3>
          <p>{shop.description}</p>
        </div>
      )}
      {shop.store_details && (
        <div>
          <h3 className="text-lg font-semibold">ข้อมูลติดต่อเพิ่มเติม:</h3>
          <p>{shop.store_details}</p>
        </div>
      )}
      {(shop.phone || shop.facebook || shop.line_id) && (
        <div>
          <h3 className="text-lg font-semibold">ช่องทางติดต่อ:</h3>
          <ul className="list-disc list-inside">
            {shop.phone && <li>📞 เบอร์โทร: {shop.phone}</li>}
            {shop.facebook && <li>📘 Facebook: {shop.facebook}</li>}
            {shop.line_id && <li>📱 LINE ID: {shop.line_id}</li>}
          </ul>
        </div>
      )}
    </div>
  </div></div>
);

}
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import EditForm from './EditForm'; // ตรวจสอบ path ให้ถูกต้องถ้าอยู่คนละโฟลเดอร์
import HeaderOne from '@/layouts/headers/HeaderOne';
import FooterOne from '@/layouts/footers/FooterOne';

export default function EditShopPage() {
  const { id } = useParams();
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShop = async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('ไม่พบข้อมูลร้านค้า:', error?.message);
        setShop(null);
      } else {
        setShop(data);
      }
      setLoading(false);
    };

    if (id) {
      fetchShop();
    }
  }, [id]);

  if (loading) return <p className="text-center mt-10">⏳ กำลังโหลดข้อมูลร้านค้า...</p>;

  if (!shop) return <p className="text-center mt-10 text-red-500">❌ ไม่พบข้อมูลร้านค้า</p>;

  return (
    <>
      <HeaderOne />
      <EditForm data={shop} />
      <FooterOne />
    </>
  );
}

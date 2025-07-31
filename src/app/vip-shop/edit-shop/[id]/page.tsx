'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSession } from '@supabase/auth-helpers-react';
import EditForm from '@/components/vip-shop/EditForm';

export default function EditShopPage() {
  const supabase = createClientComponentClient();
  const session = useSession();
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShop = async () => {
      if (!session?.user?.id) {
        console.log('❌ ยังไม่มี session:', session);
        return;
      }

      console.log('✅ session.user.id:', session.user.id);

      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('created_by', session.user.id) // ใช้ 'created_by' ตามที่ตารางจริงใช้
        .maybeSingle(); // ป้องกัน error ถ้าไม่เจอ row

      if (error) {
        console.error('❌ Fetch error:', error.message);
        setLoading(false);
        return;
      }

      console.log('✅ ได้ข้อมูลร้าน:', data);
      setShop(data);
      setLoading(false);
    };

    fetchShop();
  }, [session]);

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;
  if (!shop) return <div>ไม่พบข้อมูลร้านค้าของคุณ</div>;

  return <EditForm data={shop} />;
}

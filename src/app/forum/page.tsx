
'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';
import Breadcrumb from '@/components/common/Breadcrumb';
import ThreadCard from '@/components/forum/ThreadCard';
import HeaderOne from '@/layouts/headers/HeaderOne';
import FooterOne from '@/layouts/footers/FooterOne';
import Divider from '@/components/common/Divider';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

export default function ForumPage() {
  const supabase = createClientComponentClient();
  const user = useUser();
  const [threads, setThreads] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('threads')
        .select('*')
        .order('created_at', { ascending: false });
      setThreads(data || []);

      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      if (!userId) return;

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (userData?.role === 'admin') {
        setIsAdmin(true);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <HeaderOne />
      <Breadcrumb title= "ชุมชนแบ่งปัน" subtitle="กระทู้ข่าวสาร" />
      <Divider />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">กระทู้ทั้งหมด</h2>
          {isAdmin && (
            <Link href="/forum/new">
              <button className="btn btn-primary">+ ตั้งกระทู้</button>
            </Link>
          )}
        </div>

        {threads.length === 0 ? (
          <p className="text-gray-500">ไม่พบกระทู้</p>
        ) : (
          <Swiper
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 1 },
              1024: { slidesPerView: 2 },
              1440: { slidesPerView: 2 },
            }}
            navigation
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            loop
            modules={[Navigation, Autoplay]}
          >
            {threads.map((thread) => (
              <SwiperSlide key={thread.id} className="max-w-md">
                <ThreadCard thread={thread} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
      <Divider />
      <FooterOne />
    </>
  );
}

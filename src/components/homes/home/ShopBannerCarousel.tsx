'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

export default function ShopBannerCarousel() {
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    const fetchBanners = async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('id, images, shop_name, line_id, facebook, phone, status');

      if (error) {
        console.error('Error loading banners:', error.message);
      } else {
        setBanners(data || []);
      }
    };

    fetchBanners();
  }, []);

  return (
    <div className="container mx-auto px-4 py-10 text-white">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-start">ผู้สนับสนุนร้านค้า</h2>
      </div>

      {banners.length === 0 ? (
        <p className="text-gray-400">ไม่มีแบนเนอร์ที่ใช้งานอยู่</p>
      ) : (
        <Swiper
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 4 },
          }}
          navigation
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          loop={true}
          modules={[Navigation, Autoplay]}
        >
          {banners.map((banner) => (
            <SwiperSlide key={banner.id}>
              <div className="bg-[#0f172a] text-white rounded-xl shadow-lg overflow-hidden">
                <img
                  src={banner.images?.[0] || '/no-image.png'}
                  alt={banner.shop_name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-4 text-left">
                  <h3 className="text-lg font-bold mb-1 text-white">{banner.shop_name}</h3>
                  <p className="text-sm text-gray-100"><strong>LINE:</strong> {banner.line_id}</p>
                  <p className="text-sm text-gray-100 mb-2">
                    <strong>Facebook:</strong>{" "}
                    <a href={banner.facebook} className="text-blue-300 underline" target="_blank" rel="noreferrer">
                      {banner.facebook}
                    </a>
                  </p>
                  <p className="text-sm text-gray-100"><strong>โทร:</strong> {banner.phone}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}
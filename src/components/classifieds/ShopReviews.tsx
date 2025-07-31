'use client';

import React, { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient2';

interface ShopReviewsProps {
  shopId: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  users: {
    name: string;
    avatar_url?: string;
  };
}

export default function ShopReviews({ shopId }: ShopReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchReviews = async () => {
    setLoading(true);

    const { data, error } = await supabase
  .from('shop_reviews')
  .select('id, rating, comment, created_at, users(name, avatar_url)')
  .eq('shop_id', shopId)
  .order('created_at', { ascending: false })
  .returns<Review[]>(); // ✅ เพิ่มบรรทัดนี้


    if (error) {
      console.error('Fetch error:', error);
    } else if (data && Array.isArray(data)) {
      setReviews(data as Review[]); // ✅ cast แบบปลอดภัย
    }

    setLoading(false);
  };

  fetchReviews();
}, [shopId]);

  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg mt-4">
      <h3 className="text-xl font-semibold mb-3">รีวิวร้าน</h3>

      {loading ? (
        <p className="text-gray-400">กำลังโหลดรีวิว...</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-400">ยังไม่มีรีวิว</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="bg-gray-800 p-3 rounded">
              <div className="flex items-center mb-1">
                <img
                  src={r.users?.avatar_url || '/default-avatar.png'}
                  alt="avatar"
                  className="w-6 h-6 rounded-full mr-2 object-cover"
                />
                <span className="font-semibold">{r.users?.name || 'ไม่ทราบชื่อ'}</span>
                <span className="ml-auto text-yellow-400">★ {r.rating}</span>
              </div>
              <p className="text-sm text-gray-300">{r.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

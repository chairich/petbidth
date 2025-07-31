'use client';

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient2'; // ✅ fixed import
import { User } from '@supabase/supabase-js';

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

export default function ReviewList({ classifiedId }: { classifiedId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState<number | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
  .from('shop_reviews')
  .select('id, rating, comment, created_at, users(name, avatar_url)')
  .eq('classified_id', classifiedId)
  .order('created_at', { ascending: false })
  .returns<Review[]>(); // ✅ เพิ่มตรงนี้


      if (data) {
        setReviews(data);
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setAverage(Number(avg.toFixed(1)));
      }
    };

    fetchReviews();
  }, [classifiedId]);

  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg mt-4">
      <h3 className="text-xl font-semibold mb-3">รีวิวจากผู้ใช้งาน</h3>
      {average !== null && (
        <p className="text-yellow-400 mb-4">⭐️ คะแนนเฉลี่ย: {average} / 5</p>
      )}
      {reviews.length === 0 && <p className="text-gray-400">ยังไม่มีรีวิว</p>}
      <ul className="space-y-3">
        {reviews.map((r) => (
          <li key={r.id} className="bg-gray-800 p-3 rounded">
            <div className="flex items-center mb-1">
              <img
                src={r.users?.avatar_url || '/default-avatar.png'}
                alt="avatar"
                className="w-6 h-6 rounded-full mr-2"
              />
              <span className="font-semibold">{r.users?.name || 'ไม่ทราบชื่อ'}</span>
              <span className="ml-auto text-yellow-400">★ {r.rating}</span>
            </div>
            <p className="text-sm text-gray-300">{r.comment}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

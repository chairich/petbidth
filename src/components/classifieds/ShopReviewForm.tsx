'use client';

import { useState } from 'react';
import supabase from '@/lib/supabaseClient2';

interface ShopReviewFormProps {
  shopId: string;
  onReviewSubmitted: () => void;
}

export default function ShopReviewForm({ shopId, onReviewSubmitted }: ShopReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user_id = 'example-user-id'; // Replace with actual user ID logic

    const { error } = await supabase.from('shop_reviews').insert({
      shop_id: shopId,
      user_id,
      rating,
      comment,
    });

    if (!error) {
      setRating(5);
      setComment('');
      onReviewSubmitted();
    } else {
      console.error('Submit error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 text-white p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">เขียนรีวิว</h3>
      <div className="mb-2">
        <label className="block text-sm mb-1">คะแนน</label>
        <input
          type="number"
          min={1}
          max={5}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm mb-1">ความคิดเห็น</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white"
      >
        ส่งรีวิว
      </button>
    </form>
  );
}

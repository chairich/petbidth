'use client';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient2';

export default function ReviewForm({
  shopBannerId,
  onClose,
}: {
  shopBannerId: string;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [toast, setToast] = useState('');
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      const [{ data: auction }, { data: purchase }] = await Promise.all([
        supabase.from('auctions').select('winner_id').eq('shop_id', shopBannerId).single(),
        supabase.from('purchases').select('id').eq('shop_id', shopBannerId).eq('user_id', userId).single(),
      ]);

      if (auction?.winner_id === userId || purchase) {
        setAllowed(true);
      } else {
        setToast('❌ คุณไม่มีสิทธิ์ให้คะแนน');
      }
    };

    checkPermission();
  }, [shopBannerId]);

  const handleSubmit = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId || !allowed) return;

    const ip = (await fetch('https://api64.ipify.org?format=json')).json().then(d => d.ip);

    const { data: existing } = await supabase
      .from('shop_reviews')
      .select('id')
      .eq('shop_id', shopBannerId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) return setToast('❌ รีวิวซ้ำไม่ได้');

    const { error } = await supabase.from('shop_reviews').insert({
      shop_id: shopBannerId,
      user_id: userId,
      rating,
      comment,
      ip_address: await ip,
    });

    if (error) return setToast('❌ เกิดข้อผิดพลาด');

    setToast('✅ รีวิวเรียบร้อย');
    setComment('');
    setRating(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-900 text-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">⭐ รีวิวร้านนี้</h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-600">✖</button>
        </div>

        <div className="mb-2">ให้คะแนน:</div>
        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <label key={i} className="cursor-pointer">
              <input
                type="radio"
                name="rating"
                value={i}
                checked={rating === i}
                onChange={() => setRating(i)}
                className="hidden"
              />
              <span className={`text-2xl ${i <= rating ? 'text-yellow-400' : 'text-gray-500'}`}>
                ★
              </span>
            </label>
          ))}
        </div>

        <textarea
          className="w-full p-2 text-black rounded mb-3"
          rows={3}
          placeholder="เขียนความคิดเห็น..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded">ยกเลิก</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 rounded">ส่งรีวิว</button>
        </div>

        {toast && <p className="mt-2 text-sm text-green-400">{toast}</p>}
      </div>
    </div>
  );
}

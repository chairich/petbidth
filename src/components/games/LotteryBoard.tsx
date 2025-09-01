'use client';
import React, { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient3';

interface LotteryData {
  number: number;
  username: string;
  user_id: string;
}

// กำหนดรางวัล
const WINNING_NUMBERS: { number: number; user_id?: string }[] = [
  { number: 31 }, // รางวัลที่ 1 ไม่มีคนถูก
  { number: 32, user_id: 'A043' }, // รางวัลที่ 2
  { number: 33 }, // รางวัลที่ 3
  { number: 30 }, // รางวัลที่ 4
  { number: 29, user_id: 'A073' }, // รางวัลที่ 5
];

export default function LotteryBoard() {
  const [selectedNumbers, setSelectedNumbers] = useState<Record<number, LotteryData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: lotteryData } = await supabase.from('lottery_board').select('*').limit(1000);
      const mapped: Record<number, LotteryData> = {};
      lotteryData?.forEach((item) => {
        mapped[item.number] = item;
      });
      setSelectedNumbers(mapped);
      setLoading(false);
    };
    fetchData();
  }, []);

  const getResult = (num: number) => {
    const exact = WINNING_NUMBERS.find(r => r.number === num);
    if (exact && exact.user_id) return `🎉 ถูกตรงรางวัล! (ไอดี ${exact.user_id})`;
    if (WINNING_NUMBERS.some(r => Math.abs(r.number - num) === 1)) return '🥳 เลขใกล้เคียง!';
    return '';
  };

  if (loading) return <div className="text-center text-white">Loading...</div>;

  // คัดเฉพาะเลขที่มีคนถูก หรือใกล้เคียง
  const winners = WINNING_NUMBERS.filter(r => r.user_id || 
    Object.keys(selectedNumbers).some(k => Math.abs(Number(k) - r.number) === 1)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-black to-gray-900 text-white py-10 px-4">
      <h2 className="text-4xl font-extrabold text-center mb-8">🏆 ผู้ถูกรางวัลเลขท้าย 2 ตัว</h2>

      <div className="flex flex-col items-center space-y-6">
        {winners.length === 0 && <p className="text-xl text-yellow-400">ไม่มีผู้ถูกรางวัลในงวดนี้ 😢</p>}

        {winners.map((r, idx) => {
          const entry = r.user_id ? selectedNumbers[r.number] : null;
          const message = getResult(r.number);
          return (
            <div key={idx} className="w-full max-w-md bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 rounded-xl p-6 shadow-2xl transform hover:scale-105 transition duration-300">
              <div className="flex items-center space-x-6">
                {/* ตัวเลขเด่น ๆ */}
                <div className="bg-transparent rounded-full w-20 h-20 flex items-center justify-center text-white font-extrabold text-3xl border-4 border-white shadow-lg">
                  {r.number.toString().padStart(2, '0')}
                </div>
                <div>
                  <p className="text-xl font-bold">{entry ? entry.username : 'ไม่มีผู้ถูกรางวัล'}</p>
                  <p className="text-sm mt-1">{message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 text-center text-white">
        <h3 className="text-xl font-bold mb-2">📜 สรุปรางวัล</h3>
        <ul className="text-sm space-y-1">
          {WINNING_NUMBERS.map((r, idx) => (
            <li key={idx}>
              รางวัลที่ {idx + 1}: เลข {r.number} {r.user_id ? `- ไอดี ${r.user_id}` : '- ไม่มีคนถูก'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

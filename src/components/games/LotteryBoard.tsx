'use client';
import React, { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient3';

interface User {
  id: string;
  email: string;
}

interface LotteryData {
  number: number;
  username: string;
  avatar_url: string;
  user_id: string;
}

const WINNING_NUMBER = 31; // หมายเลขที่ออกสำหรับ 2 ตัว (แก้ไขตามผลจริง)

export default function LotteryBoard() {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [selectedNumbers, setSelectedNumbers] = useState<Record<number, LotteryData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return setLoading(false);

      const [{ data: profile }, { data: lotteryData, error }] = await Promise.all([
        supabase.from('users').select('name, avatar_url').eq('id', session.user.id).single(),
        supabase.from('lottery_board').select('*').limit(1000),
      ]);

      if (session.user.email) {
        setUser({ id: session.user.id, email: session.user.email });
      }

      if (profile?.name) {
        setUsername(profile.name);
      }

      if (!error && lotteryData) {
        const mapped: Record<number, LotteryData> = {};
        lotteryData.forEach((item) => {
          mapped[item.number] = item;
        });
        setSelectedNumbers(mapped);
      } else {
        console.error('Error loading lottery data:', error);
      }

      setLoading(false);
    };

    fetchData();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user && session.user.email) {
        setUser({ id: session.user.id, email: session.user.email });
        const { data: profile } = await supabase
          .from('users')
          .select('name, avatar_url')
          .eq('id', session.user.id)
          .single();
        if (profile?.name) setUsername(profile.name);
      } else {
        setUser(null);
        setUsername(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const checkWinning = (number: number) => {
    if (number === WINNING_NUMBER) {
      return '🎉 ยินดีด้วย! คุณถูกรางวัล!';
    } else if (Math.abs(number - WINNING_NUMBER) === 1) {
      return '🥳 คุณเกือบจะถูกรางวัล! เลขใกล้เคียง!';
    }
    return '';
  };

  if (loading) return <div className="text-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4">
      <h2 className="text-2xl font-bold text-center">
        🎯 ตรวจสอบผลรางวัล 00–99
      </h2>
      {user && (
        <p className="text-center text-sm text-green-400 mt-2">
          👤 เข้าสู่ระบบ: <strong>{user.email}</strong>
        </p>
      )}

      <div className="mt-6 flex flex-wrap justify-center">
        {/* แสดงผลเลขที่ลงทะเบียนไว้เรียงตามลำดับ */}
        {[...Array(100).keys()].map((i) => {
          const entry = selectedNumbers[i];
          return (
            <div key={i} className="text-center text-white">
              <p>{entry ? `${entry.username} - หมายเลข: ${i.toString().padStart(2, '0')}` : `หมายเลข: ${i.toString().padStart(2, '0')} - ยังไม่มีการลงทะเบียน`}</p>
              <p>{entry && checkWinning(i)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';
import React, { useEffect, useState, useMemo } from 'react';
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

export default function LotteryBoard() {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [selectedNumbers, setSelectedNumbers] = useState<Record<number, LotteryData>>({});
  const [loading, setLoading] = useState(true);

  const getUserGroupKey = (name?: string | null) => {
    if (!name) return null;
    if (/^A0\d{2}$/.test(name)) return 'group1';
    if (/^A1\d{2}$/.test(name) || /^VIP\d+$/i.test(name)) return 'group2';
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

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
        const groupKey = getUserGroupKey(profile?.name);
        const filtered = lotteryData.filter(item => getUserGroupKey(item.username) === groupKey);
        const mapped: Record<number, LotteryData> = {};
        filtered.forEach((item) => {
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

  const canUserSelect = () => {
    if (!username) return false;
    return /^A0\d{2}$/.test(username) || /^A1\d{2}$/.test(username) || /^VIP\d+$/i.test(username);
  };

  const handleSelect = async (number: number) => {
    if (!user || !username || selectedNumbers[number]) return;

    const now = new Date();
    const startDate = new Date('2025-08-17T00:00:00+07:00');
    if (now < startDate) {
      alert('⏳ ระบบจะเปิดให้เลือกเลขในวันที่ 17 สิงหาคม 2568');
      return;
    }

    if (!canUserSelect()) {
      alert('❌ คุณไม่มีสิทธิ์เลือกเลข กรุณาตรวจสอบกลุ่มของคุณ');
      return;
    }

    const { data: existing } = await supabase
      .from('lottery_board')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      alert(`❌ คุณได้เลือกเลข ${existing.number.toString().padStart(2, '0')} ไปแล้ว`);
      return;
    }

    const { data: profile } = await supabase
      .from('users')
      .select('avatar_url')
      .eq('id', user.id)
      .single();

    const avatar_url = profile?.avatar_url || '';

    const { error } = await supabase.from('lottery_board').insert([
      {
        number,
        user_id: user.id,
        username,
        avatar_url,
      },
    ]);

    if (!error) {
      setSelectedNumbers((prev) => ({
        ...prev,
        [number]: { number, user_id: user.id, username, avatar_url },
      }));
    } else {
      console.error('Insert error:', error);
    }
  };

  const boardButtons = useMemo(() => {
  const buttons: JSX.Element[] = [];
  for (let i = 0; i < 100; i++) {
    const label = i.toString().padStart(2, '0');
    const entry = selectedNumbers[i];
    const takenBy = entry?.username;
    const avatar = entry?.avatar_url;
    const username = entry?.username; // ใช้ username แทน
    const btnClass = takenBy
      ? 'm-1 px-2 py-1 rounded text-xs font-bold border bg-gray-700 text-white'
      : 'm-1 px-2 py-1 rounded text-xs font-bold border bg-white/80 backdrop-blur text-black hover:bg-yellow-300';

    const isDisabled = !!takenBy || !canUserSelect();

    buttons.push(
      <button
        key={i}
        onClick={() => handleSelect(i)}
        disabled={isDisabled}
        className={btnClass}
      >
        {label}
        {takenBy && avatar && (
          <div className="mt-1 flex items-center justify-center">
            <img
              src={avatar || '/icons/default.png'}
              alt="avatar"
              width="36"
              height="36"
              loading="lazy"
              className="rounded-full object-cover"
            />
            <div className="text-xs text-center mt-1">{username}</div> {/* แสดง username */}
          </div>
        )}
      </button>
    );
  }
  return buttons;
}, [selectedNumbers, username]);


  const getUserGroupText = () => {
    if (!username) return null;
    if (/^A0\d{2}$/.test(username)) return '🎯 ท่านลุ้นรางวัลเลขท้าย 2 ตัวล่าง';
    if (/^A1\d{2}$/.test(username) || /^VIP\d+$/i.test(username)) return '🎯 ท่านลุ้นรางวัลเลขท้าย 2 ตัวบน (รางวัลที่ 1)';
    return null;
  };

  if (loading) return <div className="text-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4">
      <h2 className="text-2xl font-bold text-center">
        🎯 เลือกเลข <span className="text-yellow-400">00–99</span> เพื่อลุ้นรางวัล
      </h2>
      {user && (
        <p className="text-center text-sm text-green-400 mt-2">
          👤 เข้าสู่ระบบ: <strong>{user.email}</strong>
        </p>
      )}
      <p className="text-center mt-2 text-yellow-400">{getUserGroupText()}</p>
      <div className="mt-6 flex flex-wrap justify-center">{boardButtons}</div>

      {getUserGroupKey(username) === 'group1' && (
        <div className="mt-10 max-w-3xl mx-auto bg-transparent text-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-4">📜 กติกาการร่วมสนุก (2 ตัวล่าง)</h3>
          <p className="mb-1">สำหรับสมาชิก <strong>A001-A099</strong> เท่านั้น</p>
          <ul className="list-disc pl-6 text-sm space-y-1">
            <li>ระยะเวลากิจกรรม: 16 – 31 สิงหาคม 2568 เวลา 23:59 น. หรือจนกว่าหมายเลขจะเต็ม</li>
            <li>ผู้ร่วมสนุกต้องล็อกอิน และเป็นสมาชิก A001-A099</li>
            <li>ร่วมกิจกรรมที่ "ร้านขายนกพระประแดง"</li>
            <li>จำกัด 1 สิทธิ์ ต่อ 1 บัญชี Facebook</li>
            <li>บัญชีต้องมีการเคลื่อนไหวล่าสุดภายในวันที่ 1 สิงหาคม 2568</li>
            <li>ห้ามใช้บัญชี Facebook สำรอง หากพบจะถูกตัดสิทธิ์ทันที</li>
            <li>--------------------------------------------</li>
            <li>สอบถามข้อมูลเพิ่มเติมที่แอดมิน หรือติดต่อ โทร: 091 7030 732 เฟส https://www.facebook.com/paklatfarm</li>
          </ul>
        </div>
      )}

      {getUserGroupKey(username) === 'group2' && (
        <div className="mt-10 max-w-3xl mx-auto bg-transparent text-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-4">📜 กติกาการร่วมสนุก (2 ตัวบน)</h3>
          <p className="mb-1">สำหรับสมาชิก <strong>A100-A150 และ VIP</strong> เท่านั้น</p>
          <ul className="list-disc pl-6 text-sm space-y-1">
            <li>ระยะเวลากิจกรรม: 16 – 31 สิงหาคม 2568 เวลา 23:59 น. หรือจนกว่าหมายเลขจะเต็ม</li>
            <li>ผู้ร่วมสนุกต้องล็อกอิน และเป็นสมาชิก A100-A150 หรือ VIP</li>
            <li>ร่วมกิจกรรมที่ "ร้านขายนกพระประแดง"</li>
            <li>จำกัด 1 สิทธิ์ ต่อ 1 บัญชี Facebook</li>
            <li>บัญชีต้องมีการเคลื่อนไหวล่าสุดภายในวันที่ 1 สิงหาคม 2568</li>
            <li>ห้ามใช้บัญชี Facebook สำรอง หากพบจะถูกตัดสิทธิ์ทันที</li>
            <li>--------------------------------------------</li>
            <li>สอบถามข้อมูลเพิ่มเติมที่แอดมิน หรือติดต่อ โทร: 091 7030 732 เฟส https://www.facebook.com/paklatfarm</li>
          </ul>
        </div>
      )}
    </div>
  );
}

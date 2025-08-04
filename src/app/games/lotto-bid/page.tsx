'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient3'; // แก้ path ตามโปรเจกต์ของคุณ
import dayjs from 'dayjs';

interface User {
  id: string;
  email: string;
}

export default function DemoAuctionForLottery() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [mockCount, setMockCount] = useState(0);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const auctionId = 'demo123';
  const startPrice = 1000;

  const canBid = (() => {
    if (!username) return false;
    if (/^A0\d{2}$/.test(username)) return true; // A001–A099
    if (/^A1([0-4]\d|50)$/.test(username)) return true; // A100–A150
    if (/^VIP\d{3}$/i.test(username)) return true; // VIP001–VIP999
    return false;
  })();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return setLoading(false);

      const uid = session.user.id;
      const email = session.user.email || '';
      const { data: profile } = await supabase
        .from('users')
        .select('name, avatar_url')
        .eq('id', uid)
        .single();

      const name = profile?.name || '';
      const avatar = profile?.avatar_url || '/icons/icon-512x512.png';

      localStorage.removeItem(`mock-bid-count-${auctionId}-${uid}`);

      setUser({ id: uid, email });
      setUsername(name);
      setAvatarUrl(avatar);
      setMockCount(0);
      setBids([]);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleMockBid = () => {
    if (!user) return alert('กรุณาเข้าสู่ระบบก่อนเคาะ');
    if (!canBid) return alert('คุณไม่มีสิทธิ์เข้าร่วมกิจกรรมนี้');

    const key = `mock-bid-count-${auctionId}-${user.id}`;
    const newCount = (Number(localStorage.getItem(key)) || 0) + 1;
    localStorage.setItem(key, newCount.toString());

    const bidPrice = startPrice + newCount * 100;
    const fakeBid = {
      id: `mock-${newCount}`,
      bid_price: bidPrice,
      created_at: new Date().toISOString(),
      users: {
        name: username,
        avatar_url: avatarUrl,
      },
    };

    setMockCount(newCount);
    setBids([fakeBid, ...bids]);

    if (newCount >= 3) {
      alert('🎉 คุณเคาะครบ 3 ครั้งแล้ว! พร้อมเข้าสู่กิจกรรมทายหวย');
      router.push('/games/LotteryBoard');
    } else {
      alert(`✅ เคาะครั้งที่ ${newCount}/3 สำเร็จ!`);
    }
  };

  if (loading) return <div className="text-center text-white py-6">⏳ กำลังโหลดข้อมูล...</div>;

  return (
    <div className="container py-5 text-white">
      {!canBid && username && (
        <div className="alert alert-warning text-center">
          ⚠️ บัญชีของคุณไม่มีสิทธิ์ร่วมกิจกรรมนี้
        </div>
      )}

      {username && (
        <div className="text-center mb-4">
          <p className="text-green-400">
            สวัสดี 👤 คุณ: <strong>{username}</strong>
          </p>
          <img
            src={avatarUrl}
            alt="avatar"
            width={64}
            height={64}
            className="mx-auto rounded-full mt-2"
            loading="lazy"
          />
          <h2 className="mt-4">ขอเชิญสัมผัสบรรยากาศเคาะประมูล โดยเชิญร่วมเข้า!</h2>
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="border rounded overflow-hidden bg-dark mb-3">
            <img
              src="https://lhrszqycskubmmtisyou.supabase.co/storage/v1/object/public/news-images/news-images/1753945797789_0.jpg"
              alt="demo"
              width={600}
              height={600}
              className="img-fluid w-100"
              loading="lazy"
            />
          </div>
        </div>
        <div className="col-lg-6">
          <h2>🎯 เคาะจำลองเพื่อเข้าสู่กิจกรรมทายหวย</h2>
          <p>ทดลองเคาะประมูลเหมือนจริง เคาะครบ 3 ครั้ง รับสิทธิ์เข้าสู่เกมทายเลขท้าย 2 ตัว!</p>
          <div className="my-3 h5 text-warning">
            ราคาปัจจุบัน: {(startPrice + mockCount * 100).toLocaleString()} บาท
          </div>
          <button
            className="btn btn-primary rounded-pill w-100"
            onClick={handleMockBid}
            disabled={!canBid}
          >
            เคาะประมูลจำลอง
          </button>
          <div className="mt-4">
            <h5>ประวัติการเคาะ (จำลอง)</h5>
            <ul className="list-group">
              {bids.length === 0 ? (
                <li className="list-group-item bg-dark text-light">ยังไม่มีการเคาะ</li>
              ) : (
                bids.map((bid) => (
                  <li key={bid.id} className="list-group-item bg-dark text-light">
                    <div className="d-flex align-items-center">
                      <img
                        src={bid.users.avatar_url}
                        className="rounded-circle me-2"
                        width="24"
                        height="24"
                        alt="avatar"
                        loading="lazy"
                      />
                      <div>
                        {bid.users.name} เคาะ {bid.bid_price.toLocaleString()} บาท<br />
                        <small className="text-muted">
                          {dayjs(bid.created_at).format('HH:mm:ss')}
                        </small>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

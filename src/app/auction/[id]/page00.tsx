// src/app/auction/[id]/page.tsx

'use client'; // เพิ่มบรรทัดนี้เพื่อให้ Next.js รู้ว่าเป็น Client Component

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';




const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL|| '', // กำหนดค่าว่างถ้าไม่พบค่า 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '' // กำหนดค่าว่างถ้าไม่พบค่า
);

export default function LiveAuctionPage() {
  const { id } = useParams();
  const [auction, setAuction] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [session, setSession] = useState<any>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [bidPrice, setBidPrice] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setIsLoadingSession(true);

        const { data: sessionData, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error fetching session:', error);
          setIsLoadingSession(false);
          return;
        }

        if (sessionData?.session) {
          setSession(sessionData.session);
        } else {
          setSession(null);
        }

        setIsLoadingSession(false);

        const { subscription } = supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session);
          setIsLoadingSession(false);
        });

        return () => {
          if (subscription) {
            subscription.unsubscribe();
          }
        };
      } catch (error) {
        console.error('Error fetching session:', error);
        setIsLoadingSession(false);
      }
    };

    fetchSession();
  }, []); 

  useEffect(() => {
    if (!id) return;
    fetchAuction();
    const interval = setInterval(fetchAuction, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchAuction = async () => {
    try {
      const { data } = await supabase
        .from('auctions')
        .select('*, bids(*, users:users!bids_user_id_fkey(*)), creator:users!auctions_created_by_fkey(*)')
        .eq('id', id)
        .order('created_at', { referencedTable: 'bids', ascending: false })
        .single();
        console.log("Bids data:", bids); // ตรวจสอบข้อมูล bids ที่ดึงมา
        console.log("User data:", bids.map(bid => bid.users)); // ตรวจสอบข้อมูล user สำหรับแต่ละบิด
   

      if (data) {
        const highestBid = (data.bids || [])[0]?.bid_price;
        data.current_price = highestBid ?? data.start_price;
        setAuction(data);
        setBids(data.bids || []);
        handleAutoEndLogic(data, data.bids || []);
        updateTimeLeft(data.end_time);
        

      }
    } catch (error) {
      console.error('Error fetching auction data:', error);
    }
  };

  const handleAutoEndLogic = async (auctionData: any, bids: any[]) => {
    if (!auctionData || auctionData.is_closed) return;

    const createdAt = Date.parse(auctionData.created_at);
    const now = Date.now();

    if (bids.length === 0) {
      const tenMinutes = 10 * 60 * 1000;
      if (now - createdAt > tenMinutes) {
        await supabase.from('auctions')
          .update({ is_closed: true })
          .eq('id', auctionData.id);
        console.log("🛑 ปิดประมูลเนื่องจากไม่มีบิดใน 10 นาที");
      }
    } else {
      const latestBidTime = new Date(bids[0].created_at).getTime();
      const proposedEndTime = new Date(latestBidTime + 4 * 60 * 1000).toISOString();
      if (proposedEndTime !== auctionData.end_time) {
        await supabase.from('auctions')
          .update({ end_time: proposedEndTime })
          .eq('id', auctionData.id);
        console.log("⏱️ ขยายเวลาประมูล 4 นาที");
      }
    }
  };

  const updateTimeLeft = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return setTimeLeft('หมดเวลา');
    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);
    setTimeLeft(`${days} วัน ${hours} ชม. ${minutes} นาที ${seconds} วิ`);
  };

  const handleEndAuction = async () => {
    const { error } = await supabase
      .from('auctions')
      .update({ end_time: new Date().toISOString() })
      .eq('id', auction.id);

    if (error) {
      alert('เกิดข้อผิดพลาดในการปิดประมูล');
    } else {
      alert('ประมูลถูกปิดแล้ว');
      fetchAuction();
    }
  };

  const handleBidSubmit = async () => {
    if (isLoadingSession) {
      alert("กำลังโหลดข้อมูลผู้ใช้...");
      return;
    }

    if (!session?.user) {
      alert("กรุณาเข้าสู่ระบบก่อนทำการประมูล");
      return;
    }

    const newBid = Number(bidPrice);
    const currentPrice = Number(auction.current_price ?? auction.start_price ?? 0);

    if (!newBid || isNaN(newBid)) {
      alert("กรุณาใส่ราคาที่ถูกต้อง");
      return;
    }

    if (newBid < currentPrice + 100) {
      alert("ราคาที่บิดต้องมากกว่าราคาปัจจุบัน");
      return;
    }

    const latestBid = bids[0];
    if (latestBid && latestBid.bid_price === newBid) {
      alert("ราคานี้ถูกเสนอไปแล้ว กรุณาเพิ่มราคาสูงขึ้น");
      return;
    }

    const { error } = await supabase.from('bids').insert([{
      auction_id: auction.id,
      user_id: session?.user?.id,
      bid_price: newBid,
    }]);

    if (error) {
      alert("บันทึกการบิดล้มเหลว");
    } else {
      setShowModal(false);
      setBidPrice('');
      fetchAuction();
    }
  };

  if (!auction || isLoadingSession) {
    return <div className="p-4 text-center text-white">กำลังโหลดข้อมูล...</div>;
  }
 
  return (
    <div className="container py-5 text-white">
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="border rounded overflow-hidden bg-dark mb-3">
            {auction.images && auction.images[selectedImageIndex] && (
              <Image
                src={auction.images[selectedImageIndex]}
                alt="auction"
                width={600}
                height={600}
                className="img-fluid w-100"
                priority={true}
              />
            )}
          </div>
          <div className="d-flex gap-2">
            {auction.images?.slice(0, 5).map((img: string, idx: number) => (
              <div
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`border rounded overflow-hidden ${selectedImageIndex === idx ? 'border-warning' : ''}`}
                style={{ width: '80px', height: '80px', cursor: 'pointer' }}
              >
                <Image src={img} alt={`thumb-${idx}`} width={80} height={80} className="img-fluid" />
              </div>
            ))}
          </div>
        </div>

        <div className="col-lg-6">
          <h2>{auction.title}</h2>
          <p>{auction.description}</p>
          <div className="my-3 h5 text-warning">
           ราคาปัจจุบัน:  {auction.current_price.toLocaleString()} บาท</div>

          <div className="mb-3">เวลาที่เหลือ: <strong>{timeLeft}</strong></div>

{/* แสดงราคานำโดยผู้บิด */}
<div className="my-3">
  <p>
    ราคานำโดย:  
    {bids.length > 0 ? (
      <span>
        {/* แสดง avatar ของผู้บิด */}
        <img 
          src={bids[0]?.users?.avatar_url || 'https://default-avatar-url.com'} 
          className="rounded-circle me-2" 
          width="24" 
          height="24" 
          alt="User Avatar" 
        />
        {bids[0]?.users?.name ?? 'ไม่ทราบชื่อ'} - {bids[0]?.bid_price.toLocaleString()} บาท
      </span>
    ) : (
      'ยังไม่มีการประมูล'
    )}
  </p>
</div>



          <button 
  className="btn btn-primary rounded-pill w-100" 
  onClick={() => {
    if (timeLeft === 'หมดเวลา') {
      alert("เวลาประมูลหมดแล้วไม่สามารถเคาะบิดได้");
      return;
    }

    const current = Number(auction.current_price ?? auction.start_price ?? 0);
    setBidPrice((current + 100).toString());
    setShowModal(true);
  }}
>
  เคาะประมูล
</button>

          {session?.user?.id === auction.created_by && (
            <button onClick={handleEndAuction} className="btn btn-danger rounded-pill w-100 mt-3">
              🛑 ปิดประมูลทันที (เฉพาะแอดมิน)
            </button>
          )}

          <div className="mt-5">
            <h5>ประวัติการประมูล</h5>
            <ul className="list-group">
              {bids.length === 0 && <li className="list-group-item">ยังไม่มีการประมูล</li>}
              {bids.map((bid, i) => (
                <li key={i} className="list-group-item bg-dark text-light">
                 <img src={bid.users?.avatar_url || 'https://lhrszqycskubmmtisyou.supabase.co/storage/v1/object/public/auction-images/auction-images/1752563441344_0.png'} className="rounded-circle me-2" width="24" height="24" alt="" />
                  {bid.users?.name ?? bid.user_id?.slice(0, 6) ?? 'ไม่ทราบ'} เคาะ {bid.bid_price} บาท
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-dark">
              <div className="modal-header">
                <h5 className="modal-title">ใส่ราคาที่คุณต้องการบิด</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="number"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)}
                  className="form-control"
                  placeholder={`เช่น ${Number(bids[0]?.bid_price ?? auction.start_price) + 100}`}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>ยกเลิก</button>
                <button className="btn btn-primary" onClick={handleBidSubmit}>ยืนยัน</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



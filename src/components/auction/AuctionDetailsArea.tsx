
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { supabase } from '@/lib/supabaseClient';


dayjs.extend(utc);
dayjs.extend(timezone);


export default function LiveAuctionPage() {
  const { id } = useParams();
  const [auction, setAuction] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<string>('กำลังคำนวณ...');
  const [session, setSession] = useState<any>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [bidPrice, setBidPrice] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);


  useEffect(() => {
    const fetchSession = async () => {
      setIsLoadingSession(true);
      const { data: sessionData, error } = await supabase.auth.getSession();
      if (!error) setSession(sessionData?.session ?? null);
      setIsLoadingSession(false);
     const { data } = supabase.auth.onAuthStateChange((_event, session) => {
  setSession(session)
  setIsLoadingSession(false)
})
return () => data?.subscription?.unsubscribe()

    };
    fetchSession();
  }, []);

  useEffect(() => {
    if (!id) return;
    fetchAuction();
    const fetchInterval = setInterval(fetchAuction, 5000);
    return () => clearInterval(fetchInterval);
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (auction?.end_time) updateTimeLeft(auction.end_time);
    }, 1000);
    return () => clearInterval(interval);
  }, [auction]);

  const fetchAuction = async () => {
    const { data } = await supabase
      .from('auctions')
      .select('*, bids(*, users:users!bids_user_id_fkey(*)), creator:users!auctions_created_by_fkey(*)')
      .eq('id', id)
      .order('created_at', { referencedTable: 'bids', ascending: false })
      .single();
    if (data) {
      const highestBid = (data.bids || [])[0]?.bid_price;
      data.current_price = highestBid ?? data.start_price;
      setAuction(data);
      setBids(data.bids || []);
      handleAutoEndLogic(data, data.bids || []);
    }
  };

  const handleAutoEndLogic = async (auctionData: any, bids: any[]) => {
  if (!auctionData || auctionData.is_closed) return;

  if (bids.length === 0) {
    const createdAt = new Date(auctionData.created_at).getTime();
    const now = new Date().getTime();
    if (now - createdAt > 10 * 60 * 1000) {
      await supabase.from('auctions').update({ is_closed: true }).eq('id', auctionData.id);
      console.log("🛑 ปิดประมูลเพราะไม่มีคนบิดใน 10 นาที");
    }
  } else {
    const latestBidTime = new Date(bids[0].created_at).getTime();
    const currentEndTime = new Date(auctionData.end_time).getTime();

    // ✅ ถ้ามีเคาะใน 1 นาทีสุดท้ายก่อน end_time ⇒ ต่อเวลาอีก 4 นาที
    const oneMinuteBeforeEnd = currentEndTime - 60 * 1000;

    if (latestBidTime >= oneMinuteBeforeEnd && latestBidTime <= currentEndTime) {
      const newEndTime = new Date(latestBidTime + 4 * 60 * 1000);
      await supabase
        .from('auctions')
        .update({ end_time: newEndTime.toISOString() })
        .eq('id', auctionData.id);

      console.log("⏱️ ขยายเวลา 4 นาทีจากการเคาะใน 1 นาทีสุดท้าย:", newEndTime.toLocaleString());
    }
  }
};
  const updateTimeLeft = (endTime: string) => {
    const nowTime = dayjs().tz('Asia/Bangkok');
    const end = dayjs(endTime).tz('Asia/Bangkok');
    const diff = end.diff(nowTime);
    setIsUrgent(diff <= 10000);

    if (diff <= 0) {
      setTimeLeft('หมดเวลา');
    } else {
      const seconds = Math.floor((diff / 1000) % 60);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
      const days = Math.floor(diff / 1000 / 60 / 60 / 24);
      setTimeLeft(`${days} วัน ${hours} ชม. ${minutes} นาที ${seconds} วิ`);
    }
  };

  const handleEndAuction = async () => {
    const { error } = await supabase
      .from('auctions')
      .update({ end_time: new Date().toISOString() })
      .eq('id', auction.id);
    if (!error) {
      alert('ประมูลถูกปิดแล้ว');
      fetchAuction();
    } else {
      alert('เกิดข้อผิดพลาดในการปิดประมูล');
    }
  };

  const handleBidSubmit = async () => {
    if (isLoadingSession) return alert("กำลังโหลดข้อมูลผู้ใช้...");
    if (!session?.user) return alert("กรุณาเข้าสู่ระบบก่อนทำการประมูล");

    const newBid = Number(bidPrice);
    const currentPrice = Number(auction.current_price ?? auction.start_price ?? 0);
    if (!newBid || isNaN(newBid)) return alert("กรุณาใส่ราคาที่ถูกต้อง");
    if (newBid < currentPrice + 100) return alert("ราคาที่บิดต้องมากกว่าราคาปัจจุบัน");
    const latestBid = bids[0];
    if (latestBid && latestBid.bid_price === newBid) return alert("ราคานี้ถูกเสนอไปแล้ว กรุณาเพิ่มราคาสูงขึ้น");

    const { error } = await supabase.from('bids').insert([{
      auction_id: auction.id,
      user_id: session?.user?.id,
      bid_price: newBid,
    }]);

    if (!error) {
      setShowModal(false);
      setBidPrice('');
      fetchAuction();
    } else {
      alert("บันทึกการบิดล้มเหลว");
    }
  };

  if (!auction || isLoadingSession) return <div className="p-4 text-center text-white">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="container py-5 text-white">
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="border rounded overflow-hidden bg-dark mb-3">
  {auction.images?.[selectedImageIndex] && (
    <div className="position-relative">
      <Image
        src={auction.images[selectedImageIndex]}
        alt="auction"
        width={600}
        height={600}
        className="img-fluid w-100"
        priority
      />
      {auction.overlay_text &&
        selectedImageIndex === (auction.cover_image_index ?? 0) && (
          <div
            className="position-absolute top-0 start-0 m-3 px-3 py-2 bg-dark bg-opacity-75 text-white rounded small z-2"
            style={{
              whiteSpace: 'pre-wrap',
              maxWidth: '90%',
              fontSize: '14px',
              lineHeight: '1.5',
            }}
          >
            {auction.overlay_text}
          </div>
        )}
    </div>



)}

          </div>
          <div className="d-flex gap-2">
            {auction.images?.slice(0, 5).map((img: string, idx: number) => (
              <div key={idx} onClick={() => setSelectedImageIndex(idx)} className={`border rounded overflow-hidden ${selectedImageIndex === idx ? 'border-warning' : ''}`} style={{ width: '80px', height: '80px', cursor: 'pointer' }}>
                <Image src={img} alt={`thumb-${idx}`} width={80} height={80} className="img-fluid" />
              </div>
            ))}
          </div>
        </div>

        <div className="col-lg-6">
          <h2>{auction.title}</h2>
          <p>{auction.description}</p>
          <div className="my-3 h5 text-warning">ราคาปัจจุบัน: {auction.current_price.toLocaleString()} บาท</div>
          <div className="mb-3">
  เวลาที่เหลือ:{" "}
  <strong style={{ color: isUrgent ? "red" : "inherit" }}>{timeLeft}</strong>
</div>


          <div className="my-3">
            <p>ราคานำโดย:
              {bids.length > 0 ? (
                <span>
                  <img src={bids[0]?.users?.avatar_url || '/icons/icon-512x512.png'} className="rounded-circle me-2" width="24" height="24" alt="User Avatar" />
                  {bids[0]?.users?.name ?? 'ไม่ทราบชื่อ'} - {bids[0]?.bid_price.toLocaleString()} บาท
                </span>
              ) : 'ยังไม่มีการประมูล'}
            </p>
          </div>

          <button
  className="btn btn-primary rounded-pill w-100"
  onClick={() => {
    const now = dayjs().tz('Asia/Bangkok');
    const start = dayjs(auction.start_time).tz('Asia/Bangkok');
    const end = dayjs(auction.end_time).tz('Asia/Bangkok');

    if (now.isBefore(start)) {
      return alert(`ยังไม่ถึงเวลาเริ่มเคาะประมูล\nเริ่มเคาะประมูล: ${start.format('D MMMM YYYY เวลา HH:mm')} น.`);
    }

    if (now.isAfter(end)) {
      return alert("เวลาประมูลหมดแล้ว ไม่สามารถเคาะบิดได้");
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
              {bids.map((bid, i) => {
  const formattedTime = dayjs.utc(bid.created_at).tz('Asia/Bangkok').format('D/M/YY HH:mm');
  return (
    <li key={i} className="list-group-item bg-dark text-light">
      <img src={bid.users?.avatar_url || 'https://default-avatar-url.com'} className="rounded-circle me-2" width="24" height="24" alt="" />
      {bid.users?.name ?? bid.user_id?.slice(0, 6) ?? 'ไม่ทราบ'} เคาะ {bid.bid_price} บาท<br />
      <small className="text-muted">{formattedTime}</small>
    </li>
  );
})}

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
                <input type="number" value={bidPrice} onChange={(e) => setBidPrice(e.target.value)} className="form-control" placeholder={`เช่น ${Number(bids[0]?.bid_price ?? auction.start_price) + 100}`} />
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

'use client';

import { useEffect, useState } from 'react';
import DeleteBidButton from '@/components/admin/DeleteBidButton';
import { useParams } from 'next/navigation';
import Image from 'next/image';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { supabase } from '@/lib/supabaseClient';

dayjs.extend(utc);
dayjs.extend(timezone);
import 'dayjs/locale/th';
dayjs.locale('th');

export default function LiveAuctionPage() {
  const { id } = useParams();
  const [auction, setAuction] = useState<any>(null);
const [announcement, setAnnouncement] = useState('');
  const [bids, setBids] = useState<any[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<string>('กำลังคำนวณ...');
  const [session, setSession] = useState<any>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [bidPrice, setBidPrice] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      setIsLoadingSession(true);
      const { data: sessionData, error } = await supabase.auth.getSession();
      if (!error) setSession(sessionData?.session ?? null);
      setIsLoadingSession(false);
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setIsLoadingSession(false);
      });
      return () => data?.subscription?.unsubscribe();
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
  if (!auction?.start_time) return;
  const now = dayjs().tz('Asia/Bangkok');
  const start = dayjs.utc(auction.start_time).tz('Asia/Bangkok');
  setHasStarted(now.isAfter(start));
}, [auction]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (auction?.end_time) updateTimeLeft(auction.end_time);
    }, 1000);
    return () => clearInterval(interval);
  }, [auction]);

  const fetchAuction = async () => {
    const { data } = await supabase
      .from('auctions')
     .select(`*, 
  bids(id, bid_price, bid_time, created_at, user_id, users:users!bids_user_id_fkey(*)), 
  creator:users!auctions_created_by_fkey(*)
`)

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
      const createdAt = dayjs.utc(auctionData.created_at).tz('Asia/Bangkok').valueOf();
      const now = dayjs().tz('Asia/Bangkok').valueOf();
      if (now - createdAt > 10 * 60 * 1000) {
        await supabase.from('auctions').update({ is_closed: true }).eq('id', auctionData.id);
        console.log("🛑 ปิดประมูลเพราะไม่มีคนบิดใน 10 นาที");
      }
    } else {
      const latestBidTime = dayjs.utc(bids[0].bid_time).tz('Asia/Bangkok').valueOf();
      const currentEndTime = dayjs.utc(auctionData.end_time).tz('Asia/Bangkok').valueOf();
      const oneMinuteBeforeEnd = currentEndTime - 60 * 1000;

      const newEndTime = latestBidTime + 4 * 60 * 1000;
if (newEndTime > currentEndTime) {
  await supabase
    .from('auctions')
    .update({ end_time: dayjs(newEndTime).tz('Asia/Bangkok').toISOString() })
    .eq('id', auctionData.id);
  console.log("⏰ ต่อเวลา 4 นาทีหลังการบิด");
}

    }
  };

  const updateTimeLeft = (endTime: string) => {
  const nowTime = dayjs().tz('Asia/Bangkok');
  const end = dayjs.utc(endTime).tz('Asia/Bangkok'); // ✅ แก้ตรงนี้
  const diff = end.diff(nowTime);
  setIsUrgent(diff <= 30000);

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
      .update({ end_time: dayjs().tz('Asia/Bangkok').toISOString() })
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
      bid_time: dayjs().tz('Asia/Bangkok').toISOString(),
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
          {auction.video_url && (
            <div className="mb-4">
              {auction.video_url.endsWith('.mp4') ? (
                <video controls width="100%" src={auction.video_url}></video>
              ) : (
                <div className="ratio ratio-16x9">
                  <iframe
                    src={auction.video_url.includes('youtube.com/watch') ? auction.video_url.replace('watch?v=', 'embed/') : auction.video_url}
                    title="วิดีโอ"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
          )}

          <div className="my-3 h5 text-warning">ราคาปัจจุบัน: {auction.current_price.toLocaleString()} บาท</div>
          <div className="mb-3">
  เวลาที่เหลือ:{" "}
  {hasStarted ? (
    <strong style={{ color: isUrgent ? "red" : "inherit" }}>{timeLeft}</strong>
  ) : (
    <strong className="text-warning">
      เวลาประมูลจะเริ่ม {dayjs.utc(auction.start_time).tz('Asia/Bangkok').format('D MMMM YYYY เวลา HH:mm')} น.
    </strong>
  )}
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

          
{timeLeft === 'หมดเวลา' && bids.length > 0 && (
  <div className="alert alert-success mt-4 fw-bold fs-5">
    🎉 การประมูลสิ้นสุดแล้ว <br />
    ผู้ชนะคือ <img src={bids[0]?.users?.avatar_url || '/icons/icon-512x512.png'} className="rounded-circle me-2" width="24" height="24" alt="avatar" />
    <strong>{bids[0]?.users?.name ?? 'ไม่ทราบชื่อ'}</strong> ด้วยราคา 
    <strong>{bids[0]?.bid_price.toLocaleString()} บาท</strong> <br />
    ขอแสดงความยินดีด้วยครับ!
  </div>
)}

{timeLeft === 'หมดเวลา' && bids.length === 0 && (
  <div className="alert alert-danger mt-4 fw-bold fs-5">
    ❌ การประมูลสิ้นสุดแล้ว และไม่มีผู้เสนอราคา
  </div>
)}

<button
  className="btn btn-primary rounded-pill w-100"
 onClick={() => {
  const now = dayjs().tz('Asia/Bangkok');
  const start = dayjs.utc(auction.start_time).tz('Asia/Bangkok'); // ✅ ต้องใส่ .utc() เช่นกัน
  const end = dayjs.utc(auction.end_time).tz('Asia/Bangkok');     // ✅

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
            
          )}{session?.user?.id === auction.created_by && (
  <div className="mb-3">
    <label htmlFor="announcement" className="form-label">📢 แก้ไขประกาศ:</label>
    <textarea
      id="announcement"
      className="form-control"
      rows={3}
      value={announcement}
      onChange={(e) => setAnnouncement(e.target.value)}
    ></textarea>
    <button
      className="btn btn-warning mt-2"
      onClick={async () => {
        const { error } = await supabase
          .from('auctions')
          .update({ announcement })
          .eq('id', auction.id);
        if (!error) {
          alert('บันทึกประกาศแล้ว');
          setAuction({ ...auction, announcement });
        }
      }}
    >
      💾 บันทึกประกาศ
    </button>
  </div>
)}

{auction.announcement && (
  <div className="fw-bold text-warning border border-warning p-3 rounded">
    📢 ประกาศ: {auction.announcement}
  </div>
)}

          <div className="mt-5">
            <h5>ประวัติการประมูล</h5>
            <ul className="list-group">
             {bids.length === 0 ? (
  <li className="list-group-item bg-dark text-light">ยังไม่มีการประมูล</li>
) : (
  bids.map((bid) => {
    const isOwner = session?.user?.id === auction.created_by;
    const formattedTime = dayjs
      .utc(bid.created_at)
      .tz('Asia/Bangkok')
      .format('D/M/YY HH:mm');

    return (
      <li key={bid.id} className="list-group-item bg-dark text-light">
        <div className="d-flex align-items-center">
          <img
            src={bid.users?.avatar_url || 'https://default-avatar-url.com'}
            className="rounded-circle me-2"
            width="24"
            height="24"
            alt="avatar"
          />
          <div>
            {bid.users?.name ?? bid.user_id?.slice(0, 6) ?? 'ไม่ทราบ'} เคาะ {bid.bid_price} บาท
            <br />
            <small className="text-muted">{formattedTime}</small>
          </div>
        </div>

        {isOwner && (
          <div className="bg-dark text-light" >
            <DeleteBidButton bidId={bid.id} onDeleted={fetchAuction} />
          </div>
        )}
      </li>
    );
  })
)}


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
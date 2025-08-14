'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/th';
import { supabase } from '@/lib/supabaseClient';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('th');

// กติกาเวลา: ก่อนเคาะแรก 10 นาที, หลังมีเคาะแล้วทุกครั้ง 4 นาที
const PRE_FIRST_BID_MIN = 10; // ยังไม่มีคนเคาะ
const POST_BID_MIN = 4;       // หลังมีบิดแล้วทุกครั้ง

type AuctionRow = {
  id: string;
  title: string;
  description: string;
  start_time: string | null;
  start_price: number;
  current_price?: number;
  images?: string[];
  video_url?: string | null;
  overlay_text?: string | null;
  cover_image_index?: number | null;
  is_closed?: boolean | null;
  created_at: string;
  created_by: string;
  announcement?: string | null;
  bid_step?: number | null; // ขั้นต่ำต่อครั้ง (20/50/100)
};

export default function LiveAuctionPage() {
  const { id } = useParams();
  const [auction, setAuction] = useState<AuctionRow | null>(null);
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
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });

  // สถานะหมดเวลาฝั่ง client
  const [isExpiredClient, setIsExpiredClient] = useState(false);
  // กันยิงอัปเดตปิด DB ซ้ำ ๆ
  const closeSentRef = useRef(false);

  // ===== Helpers =====
  function getBaseUtc(auctionData: AuctionRow, bidsArr: any[]) {
    // เวลาอ้างอิง: บิดล่าสุด (ถ้าไม่มี ใช้เวลาสร้างโพสต์)
    const ts = bidsArr?.[0]?.bid_time || bidsArr?.[0]?.created_at || auctionData.created_at;
    return dayjs.utc(ts);
  }
  function getWindowMinutes(bidsArr: any[]) {
    return bidsArr && bidsArr.length > 0 ? POST_BID_MIN : PRE_FIRST_BID_MIN;
  }

  // ดึง session
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

  // ดึง auction
  useEffect(() => {
    if (!id) return;
    fetchAuction();
    const fetchInterval = setInterval(fetchAuction, 5000);
    return () => clearInterval(fetchInterval);
  }, [id]);

  // เริ่มประมูลหรือยัง (ใช้ start_time ถ้ามี)
  useEffect(() => {
    if (!auction?.start_time) return;
    const now = dayjs().tz('Asia/Bangkok');
    const start = dayjs.utc(auction.start_time).tz('Asia/Bangkok');
    setHasStarted(now.isAfter(start));
  }, [auction]);

  const fetchAuction = async () => {
    const { data, error } = await supabase
      .from('auctions')
      .select(`*, 
        bids(id, bid_price, bid_time, created_at, user_id, users:users!bids_user_id_fkey(*)), 
        creator:users!auctions_created_by_fkey(*)
      `)
      .eq('id', id as string)
      .order('bid_time', { referencedTable: 'bids', ascending: false, nullsFirst: false })
      .order('created_at', { referencedTable: 'bids', ascending: false })
      .single();

    if (error) {
      console.error(error);
      return;
    }
    if (data) {
      const highestBid = (data.bids || [])[0]?.bid_price;
      data.current_price = highestBid ?? data.start_price;
      setAuction(data as AuctionRow);
      setBids(data.bids || []);
      handleAutoCloseLogic(data as AuctionRow, data.bids || []);
    }
  };

  // ปิดอัตโนมัติ: ไม่มีการบิดเกิน window (10m ก่อนบิดแรก / 4m หลังมีบิด)
  const handleAutoCloseLogic = async (auctionData: AuctionRow, bidsArr: any[]) => {
    if (!auctionData || auctionData.is_closed) return;
    const baseUtc = getBaseUtc(auctionData, bidsArr);
    const windowMin = getWindowMinutes(bidsArr);
    const nowUtc = dayjs.utc();
    if (nowUtc.diff(baseUtc) > windowMin * 60 * 1000) {
      if (closeSentRef.current) return;
      closeSentRef.current = true;
      await supabase.from('auctions').update({ is_closed: true }).eq('id', auctionData.id);
      fetchAuction();
    }
  };

  // นับถอยหลังแบบ hybrid
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!auction) return;

      const baseUtc = getBaseUtc(auction, bids);
      const windowMin = getWindowMinutes(bids);
      const deadlineUtc = baseUtc.add(windowMin, 'minute');
      const nowUtc = dayjs.utc();

      const diff = deadlineUtc.diff(nowUtc);
      setIsUrgent(diff <= 30 * 1000); // 30 วิสุดท้าย

      if (diff <= 0) {
        setIsExpiredClient(true);
        setTimeLeft('หมดเวลา');
        setT({ d: 0, h: 0, m: 0, s: 0 });

        if (!auction.is_closed && !closeSentRef.current) {
          try {
            closeSentRef.current = true;
            await supabase.from('auctions').update({ is_closed: true }).eq('id', auction.id);
            fetchAuction();
          } catch (e) {
            console.error('close-on-zero error', e);
          }
        }
      } else {
        setIsExpiredClient(false);
        const seconds = Math.floor((diff / 1000) % 60);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
        const days = Math.floor(diff / 1000 / 60 / 60 / 24);
        setTimeLeft(`${days} วัน ${hours} ชม. ${minutes} นาที ${seconds} วิ`);
        setT({ d: days, h: hours, m: minutes, s: seconds });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [auction, bids]);

  const handleEndAuction = async () => {
    if (!auction) return;
    closeSentRef.current = true;
    const { error } = await supabase
      .from('auctions')
      .update({ is_closed: true })
      .eq('id', auction.id);
    if (!error) {
      alert('ประมูลถูกปิดแล้ว');
      fetchAuction();
    } else {
      alert('เกิดข้อผิดพลาดในการปิดประมูล');
    }
  };

  // ขั้นต่ำต่อครั้งจากแอดมินโพสต์ (ล็อก 20/50/100)
  const step = useMemo(() => {
    const s = Number(auction?.bid_step ?? 100);
    return [20, 50, 100].includes(s) ? s : 100;
  }, [auction?.bid_step]);

  const current = useMemo(
    () => Number(auction?.current_price ?? auction?.start_price ?? 0),
    [auction?.current_price, auction?.start_price]
  );

  const isClosedOrExpired = !!auction?.is_closed || isExpiredClient;

  const handleBidSubmit = async () => {
    if (isLoadingSession) return alert('กำลังโหลดข้อมูลผู้ใช้...');
    if (!session?.user) return alert('กรุณาเข้าสู่ระบบก่อนทำการประมูล');
    if (!auction) return;

    if (isClosedOrExpired) {
      return alert('เวลาประมูลหมดแล้ว ไม่สามารถเคาะบิดได้');
    }

    const newBid = Number(bidPrice);
    if (!newBid || isNaN(newBid)) return alert('กรุณาใส่ราคาที่ถูกต้อง');

    // ต้องมากกว่าปัจจุบันอย่างน้อย step
    if (newBid < current + step) {
      return alert(`ราคาที่บิดต้องมากกว่าราคาปัจจุบันอย่างน้อย ${step.toLocaleString()} บาท`);
    }
    // ต้องเพิ่มเป็นจำนวนเท่าของ step
    if ((newBid - current) % step !== 0) {
      return alert(`ต้องเพิ่มราคาเป็นจำนวนเท่าของ ${step} บาท (เช่น +${step}, +${step * 2})`);
    }

    const latestBid = bids[0];
    if (latestBid && latestBid.bid_price === newBid) {
      return alert('ราคานี้ถูกเสนอไปแล้ว กรุณาเพิ่มราคาสูงขึ้น');
    }

    const { error } = await supabase.from('bids').insert([
      {
        auction_id: auction.id,
        user_id: session?.user?.id,
        bid_price: newBid,
        bid_time: new Date().toISOString(), // UTC
      },
    ]);

    if (!error) {
      setShowModal(false);
      setBidPrice('');
      fetchAuction();
    } else {
      alert('บันทึกการบิดล้มเหลว');
    }
  };

  // ลบ bid แบบ inline
  const handleAdminDeleteBid = async (bidId: string) => {
    if (!auction) return;
    if (session?.user?.id !== auction.created_by) {
      return alert('เฉพาะผู้สร้างโพสต์เท่านั้นที่ลบได้');
    }
    const ok = confirm('ยืนยันการลบราคาเคาะนี้?');
    if (!ok) return;
    const { error } = await supabase.from('bids').delete().eq('id', bidId);
    if (error) {
      alert('ลบไม่สำเร็จ อาจติด policy หรือสิทธิ์');
    } else {
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
                      style={{ whiteSpace: 'pre-wrap', maxWidth: '90%', fontSize: '14px', lineHeight: '1.5' }}
                    >
                      {auction.overlay_text}
                    </div>
                  )}
              </div>
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

          {auction.video_url && (
            <div className="mb-4">
              {auction.video_url.endsWith('.mp4') ? (
                <video controls width="100%" src={auction.video_url}></video>
              ) : (
                <div className="ratio ratio-16x9">
                  <iframe
                    src={
                      auction.video_url.includes('youtube.com/watch')
                        ? auction.video_url.replace('watch?v=', 'embed/')
                        : auction.video_url
                    }
                    title="วิดีโอ"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
          )}

          <div className="my-3 h5 text-warning">ราคาปัจจุบัน: {auction.current_price?.toLocaleString()} บาท</div>
          <div className="mb-2">บิดขั้นต่ำต่อครั้ง: <strong>{Number(step).toLocaleString()} บาท</strong></div>

          {/* Countdown */}
          <div className="countdown-wrap my-4">
            {hasStarted ? (
              <>
                <div className={`countdown ${isUrgent ? 'urgent' : ''}`}>
                  <div className="seg">
                    <span className="num">{String(t.d).padStart(2, '0')}</span>
                    <span className="lbl">วัน</span>
                  </div>
                  <span className="colon">:</span>
                  <div className="seg">
                    <span className="num">{String(t.h).padStart(2, '0')}</span>
                    <span className="lbl">ชม.</span>
                  </div>
                  <span className="colon">:</span>
                  <div className="seg">
                    <span className="num">{String(t.m).padStart(2, '0')}</span>
                    <span className="lbl">นาที</span>
                  </div>
                  <span className="colon">:</span>
                  <div className="seg">
                    <span className="num">{String(t.s).padStart(2, '0')}</span>
                    <span className="lbl">วิ</span>
                  </div>
                </div>
                <div className={`hint ${isUrgent ? 'urgent' : ''}`}>
                  {bids.length === 0
                    ? `จะปิดหากไม่มีการบิดภายใน ${PRE_FIRST_BID_MIN} นาที (ก่อนเคาะแรก)`
                    : `จะปิดหากไม่มีการบิดภายใน ${POST_BID_MIN} นาที (หลังเคาะทุกครั้ง)`}
                </div>
              </>
            ) : (
              <strong className="text-warning">
                เวลาประมูลจะเริ่ม{' '}
                {auction.start_time
                  ? dayjs.utc(auction.start_time).tz('Asia/Bangkok').format('D MMMM YYYY เวลา HH:mm')
                  : 'เร็ว ๆ นี้'}
                น.
              </strong>
            )}
          </div>

          {/* styles เฉพาะ countdown */}
          <style jsx>{`
            .countdown-wrap { display:flex; flex-direction:column; align-items:center; }
            .countdown { display:flex; align-items:center; gap:12px; padding:16px 28px; background:#0e0e0f; border:1px solid rgba(255,255,255,0.06); border-radius:14px; }
            .countdown.urgent { border-color: rgba(211,47,47,0.35); }
            .seg { display:flex; flex-direction:column; align-items:center; min-width:72px; }
            .num { font-size:3rem; font-weight:800; color:#fbc02d; font-family:'Courier New', monospace; line-height:1; }
            .countdown.urgent .num { color:#d32f2f; }
            .lbl { font-size:0.9rem; color:#cfcfcf; margin-top:6px; }
            .colon { font-size:2.4rem; color:#fbc02d; }
            .countdown.urgent .colon { color:#d32f2f; }
            .hint { margin-top:10px; font-size:0.95rem; color:#fbc02d; text-align:center; }
            .hint.urgent { color:#d32f2f; }
            @media (max-width: 480px) {
              .num { font-size:2.4rem; }
              .colon { font-size:2rem; }
              .seg { min-width:56px; }
            }
          `}</style>

          {/* ราคานำ/ผู้ชนะ */}
          <div className="my-3">
            <p className="d-flex align-items-center gap-2">
              {isClosedOrExpired ? 'ผู้ชนะคือ:' : 'ราคานำโดย:'}
              {bids.length > 0 ? (
                <span>
                  <img
                    src={bids[0]?.users?.avatar_url || '/icons/icon-512x512.png'}
                    className="rounded-circle me-2"
                    width="24"
                    height="24"
                    alt="User Avatar"
                  />
                  {(bids[0]?.users?.name ?? 'ไม่ทราบชื่อ')} - {Number(bids[0]?.bid_price ?? 0).toLocaleString()} บาท
                </span>
              ) : (
                'ยังไม่มีการประมูล'
              )}
            </p>
          </div>

          {/* การ์ดสรุปเมื่อปิด/หมดเวลา */}
          {isClosedOrExpired && bids.length > 0 && (
            <div className="alert alert-success mt-4 fw-bold fs-5">
              🎉 การประมูลสิ้นสุดแล้ว <br />
              ผู้ชนะคือ{' '}
              <img
                src={bids[0]?.users?.avatar_url || '/icons/icon-512x512.png'}
                className="rounded-circle me-2"
                width="24"
                height="24"
                alt="avatar"
              />
              <strong>{bids[0]?.users?.name ?? 'ไม่ทราบชื่อ'}</strong> ด้วยราคา{' '}
              <strong>{Number(bids[0]?.bid_price ?? 0).toLocaleString()} บาท</strong> <br />
              ขอแสดงความยินดีด้วยครับ!
            </div>
          )}

          {isClosedOrExpired && bids.length === 0 && (
            <div className="alert alert-danger mt-4 fw-bold fs-5">❌ การประมูลสิ้นสุดแล้ว และไม่มีผู้เสนอราคา</div>
          )}

          {/* ปุ่มบิด — ซ่อนเมื่อหมดเวลา/ปิดแล้ว */}
          {!isClosedOrExpired && (
            <button
              className="btn btn-primary rounded-pill w-100"
              onClick={() => {
                const now = dayjs().tz('Asia/Bangkok');
                const start = auction.start_time ? dayjs.utc(auction.start_time).tz('Asia/Bangkok') : null;
                if (start && now.isBefore(start)) {
                  return alert(`ยังไม่ถึงเวลาเริ่มเคาะประมูล\nเริ่มเคาะประมูล: ${start.format('D MMMM YYYY เวลา HH:mm')} น.`);
                }
                setBidPrice(String(current + step));
                setShowModal(true);
              }}
            >
              เคาะประมูล
            </button>
          )}

          {session?.user?.id === auction.created_by && (
            <button onClick={handleEndAuction} className="btn btn-danger rounded-pill w-100 mt-3">
              🛑 ปิดประมูลทันที (เฉพาะแอดมิน)
            </button>
          )}

          {session?.user?.id === auction.created_by && (
            <div className="mb-3">
              <label htmlFor="announcement" className="form-label">📢 แก้ไขประกาศ:</label>
              <textarea id="announcement" className="form-control" rows={3} value={announcement} onChange={(e) => setAnnouncement(e.target.value)}></textarea>
              <button
                className="btn btn-warning mt-2"
                onClick={async () => {
                  const { error } = await supabase.from('auctions').update({ announcement }).eq('id', auction.id);
                  if (!error) {
                    alert('บันทึกประกาศแล้ว');
                    setAuction({ ...auction, announcement } as AuctionRow);
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
                  const formattedTime = dayjs.utc(bid.created_at).tz('Asia/Bangkok').format('D/M/YY HH:mm');
                  return (
                    <li key={bid.id} className="list-group-item bg-dark text-light">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <img src={bid.users?.avatar_url || '/icons/icon-512x512.png'} className="rounded-circle me-2" width="24" height="24" alt="avatar" />
                          <div>
                            {bid.users?.name ?? bid.user_id?.slice(0, 6) ?? 'ไม่ทราบ'} เคาะ {Number(bid.bid_price ?? 0).toLocaleString()} บาท
                            <br />
                            <small className="text-muted">{formattedTime}</small>
                          </div>
                        </div>

                        {isOwner && (
                          <div className="d-flex align-items-center gap-2">
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleAdminDeleteBid(bid.id)}>
                              ลบ
                            </button>
                          </div>
                        )}
                      </div>
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
                <input
                  type="number"
                  step={step}
                  value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)}
                  className="form-control"
                  placeholder={`เช่น ${(Number(bids[0]?.bid_price ?? auction.start_price) + step).toLocaleString()}`}
                />
                <small className="text-muted">ต้องเพิ่มทีละ {step.toLocaleString()} บาทขึ้นไป</small>
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

'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const PRE_FIRST_BID_MIN = 10;
const POST_BID_MIN = 4;

// เผื่อใช้ทีหลัง
const MyTimer = dynamic(() => import('@/components/common/Timer'), { ssr: false });

type Auction = {
  id: string;
  title: string;
  description?: string;
  start_time?: string | null;
  start_price: number;
  images?: string[];
  cover_image_index?: number | null;
  created_at: string;
  created_by: string;
  is_closed?: boolean | null;
  video_url?: string | null;
  users?: { avatar_url?: string | null; name?: string | null };
  bids?: Array<{ id: string; bid_time?: string | null; created_at: string }>;
};

const LiveAuctionHomeOne = ({ style_2 }: any) => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  // ===== helpers =====
  const getBaseUtc = (a: Auction) => {
    const b = a.bids?.[0];
    const ts = b?.bid_time || b?.created_at || a.created_at;
    return dayjs.utc(ts);
  };
  const getWindowMin = (a: Auction) => (a.bids && a.bids.length > 0 ? POST_BID_MIN : PRE_FIRST_BID_MIN);
  const getDeadlineUtc = (a: Auction) => getBaseUtc(a).add(getWindowMin(a), 'minute');

  useEffect(() => {
    const fetchUser = () => {
      const currentUser = Cookies.get('session');
      if (currentUser) {
        setUser(JSON.parse(currentUser));
      } else {
        supabase.auth.getSession().then(({ data }) => {
          const userData = data?.session?.user || null;
          if (userData) {
            setUser(userData);
            Cookies.set('session', JSON.stringify(userData), { expires: 1, path: '/' });
          }
        });
      }
    };
    fetchUser();
  }, []);

  const handleActive = (id: string) => {
    setActive((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
  const fetchAuctions = async () => {
    const { data, error } = await supabase
      .from('auctions')
      .select(`
        *,
        users:users!auctions_created_by_fkey(avatar_url,name),
        bids(id, bid_time, created_at)
      `)
      .eq('is_closed', false)          // ตัดที่ปิดแล้วออกก่อน
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching auctions:', error);
      setAuctions([]);
      return;
    }

    // เรียง bids ล่าสุดก่อน
    const normalized = (data || []).map((a: any) => ({
      ...a,
      bids: (a.bids || []).sort(
        (x: any, y: any) =>
          dayjs.utc(y.bid_time || y.created_at).valueOf() -
          dayjs.utc(x.bid_time || x.created_at).valueOf()
      ),
    }));

    // filter: เอาเฉพาะ "รอเริ่ม" หรือ "กำลังประมูล"
    const now = dayjs.utc();
    const getBaseUtc = (au: any) => {
      const b = au.bids?.[0];
      const ts = b?.bid_time || b?.created_at || au.created_at;
      return dayjs.utc(ts);
    };
    const getWindowMin = (au: any) => (au.bids && au.bids.length > 0 ? 4 : 10);
    const getDeadlineUtc = (au: any) => getBaseUtc(au).add(getWindowMin(au), 'minute');

    const filtered = normalized.filter((au: any) => {
      const start = au.start_time ? dayjs.utc(au.start_time) : null;
      const notStarted = start ? now.isBefore(start) : false;
      const estimatedEnded = now.isAfter(getDeadlineUtc(au));
      const isLive = !notStarted && !estimatedEnded;
      // ✅ เอาเฉพาะ รอเริ่ม หรือ กำลังประมูล
      return notStarted || isLive;
    });

    setAuctions(filtered);
  };

  fetchAuctions();
}, []);


  const handleJoinAuction = (auctionId: string) => {
    router.push(`/auction/${auctionId}`);
  };

  const now = dayjs.utc();

  return (
    <div className={`live-bidding-wrapper ${style_2 ? '' : 'bg-gray pt-120 pb-120'}`}>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-7">
            <div className="section-heading d-flex align-items-center">
              <div className="spinner-grow text-danger" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h2 className="mb-0 ms-2">ห้อง {style_2 ? 'ประมูล' : 'ประมูลสด'}</h2>
            </div>
          </div>
          <div className="col-5 text-end">
            <Link className="btn rounded-pill btn-outline-primary btn-sm border-2 mb-5" href="/live-bidding">
              ดูทั้งหมด
            </Link>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row g-4 justify-content-center">
          {[...auctions]
            // เรียงรายการใกล้หมดเวลาก่อน (ฐาน + 10/4 นาที)
            .sort((a, b) => getDeadlineUtc(a).diff(now) - getDeadlineUtc(b).diff(now))
            .slice(0, 4)
            .map((item, i) => {
              const start = item.start_time ? dayjs.utc(item.start_time) : null;
              const notStarted = start ? now.isBefore(start) : false;
              const estimatedEnded = now.isAfter(getDeadlineUtc(item));
              const isEnded = !!item.is_closed || estimatedEnded;

              // live = เริ่มแล้ว และยังไม่จบ (ตามกติกา)
              const isLive = !notStarted && !isEnded;

              return (
                <div key={item.id || i} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                  <div className="nft-card card border-0">
                    <div className="card-body">
                      <div className="img-wrap position-relative">

                        {/* badge สถานะ */}
                        {notStarted ? (
                          <div style={badgeStyle('#FFD700', '#000')}>รอเริ่มประมูล</div>
                        ) : isLive ? (
                          <div style={badgeStyle('#28a745', '#fff')}>กำลังประมูล</div>
                        ) : (
                          <div style={badgeStyle('#6c757d', '#fff')}>ปิดประมูลแล้ว</div>
                        )}

                        {/* ปุ่มดูวิดีโอ (ถ้ามี) */}
                        {item.video_url && (
                          <button
                            className="btn btn-outline-light btn-sm mt-2 w-100"
                            onClick={() => {
                              setVideoUrl(item.video_url!);
                              setShowVideoModal(true);
                            }}
                          >
                            🎥 ดูวิดีโอ
                          </button>
                        )}

                        <img
                          src={item.images?.[item.cover_image_index || 0] || '/assets/img/default.jpg'}
                          alt="auction"
                        />

                        <div className="dropdown">
                          <button
                            onClick={() => handleActive(item.id)}
                            className={`btn dropdown-toggle rounded-pill shadow-sm ${active === item.id ? 'show' : ''}`}
                            type="button"
                          >
                            <i className="bi bi-three-dots-vertical"></i>
                          </button>
                          <ul
                            className={`dropdown-menu dropdown-menu-end ${active === item.id ? 'show' : ''}`}
                            style={{ position: 'absolute', inset: '0px 0px auto auto', transform: 'translate(0px, 34px)' }}
                          >
                            <li><a className="dropdown-item" href="#"><i className="me-1 bi bi-share"></i>แชร์</a></li>
                            <li><a className="dropdown-item" href="#"><i className="me-1 bi bi-flag"></i>รายงาน</a></li>
                            <li><a className="dropdown-item" href="#"><i className="me-1 bi bi-bookmark"></i>บันทึก</a></li>
                          </ul>
                        </div>

                      </div>

                      <div className="row gx-2 align-items-center mt-3" style={{ color: '#8084AE' }}>
                        <div className="col-8">
                          <span className="d-block fz-12">
                            <i className="bi bi-bag me-1"></i>{(item as any).category || 'ไม่ระบุหมวดหมู่'}
                          </span>
                        </div>
                        <div className="col-4 text-end">
                          <button className="wishlist-btn" type="button"><i className="bi"></i></button>
                        </div>
                      </div>

                      <div className="row gx-2 align-items-center mt-2">
                        <div className="col-8">
                          <div className="name-info d-flex align-items-center">
                            <div className="author-img position-relative">
                              <img
                                className="shadow"
                                src={item.users?.avatar_url || '/assets/img/default-avatar.png'}
                                alt="avatar"
                              />
                              <i className="bi bi-check position-absolute bg-success"></i>
                            </div>
                            <div className="name-author">
                              <Link className="name d-block hover-primary fw-bold text-truncate" href={`/auction/${item.id}`}>
                                {item.title}
                              </Link>
                              <span className="author d-block fz-12 hover-primary text-truncate">
                                @{item.users?.name || 'ไม่ระบุ'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="col-4" style={{ color: '#8084AE' }}>
                          <div className="price text-end">
                            <span className="fz-12 d-block">ราคาเริ่มต้น</span>
                            <h6 className="mb-0">{Number(item.start_price).toLocaleString()} บาท</h6>
                          </div>
                        </div>
                        <div className="col-12">
                          <button
                            onClick={() => handleJoinAuction(item.id)}
                            className="btn btn-primary rounded-pill btn-sm mt-3 w-100"
                          >
                            เข้าร่วมประมูล
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* วิดีโอโมดัล */}
      {showVideoModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">ชมวิดีโอ</h5>
                <button type="button" className="btn-close" onClick={() => setShowVideoModal(false)}></button>
              </div>
              <div className="modal-body">
                {videoUrl.endsWith('.mp4') ? (
                  <video controls width="100%" src={videoUrl}></video>
                ) : (
                  <div className="ratio ratio-16x9">
                    <iframe
                      src={videoUrl.includes('youtube.com/watch') ? videoUrl.replace('watch?v=', 'embed/') : videoUrl}
                      title="วิดีโอ"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const badgeStyle = (bg: string, color: string): React.CSSProperties => ({
  position: 'absolute',
  top: 10,
  left: 10,
  backgroundColor: bg,
  color,
  fontWeight: 'bold',
  padding: '3px 8px',
  borderRadius: '8px',
  fontSize: '12px',
  zIndex: 10,
});

export default LiveAuctionHomeOne;

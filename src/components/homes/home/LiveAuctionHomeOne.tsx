'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient';
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

const MyTimer = dynamic(() => import('@/components/common/Timer'), { ssr: false });

const LiveAuctionHomeOne = ({ style_2 }: any) => {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [active, setActive] = useState(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

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

  const handleActive = (id: any) => {
    setActive(active === id ? null : id);
  };

  useEffect(() => {
    const fetchAuctions = async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('auctions')
        .select('*, users:users!auctions_created_by_fkey(avatar_url, name)')
        .eq('status', 'active')
        .gte('end_time', now)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching auctions:', error);
      } else {
        setAuctions(data);
      }
    };

    fetchAuctions();
  }, []);

  const handleJoinAuction = (auctionId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    router.push(`/auction/${auctionId}`);
  };

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
            .sort((a, b) => dayjs.utc(a.end_time).diff(dayjs.utc()) - dayjs.utc(b.end_time).diff(dayjs.utc()))
            .slice(0, 4)
            .map((item, i) => {
              const isEnded = dayjs.utc().isAfter(dayjs.utc(item.end_time));
              return (
                <div key={i} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                  <div className="nft-card card border-0">
                    <div className="card-body">
                      <div className="img-wrap position-relative">
              {(() => {
                const now = dayjs.utc();
                const start = dayjs.utc(item.start_time);
                const end = dayjs.utc(item.end_time);
                const isBeforeStart = now.isBefore(start);
                const isEnded = now.isAfter(end);
                const isLive = !isBeforeStart && !isEnded;

                if (isBeforeStart) {
                  return (
                    <div style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      backgroundColor: '#FFD700',
                      color: '#000',
                      fontWeight: 'bold',
                      padding: '3px 8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      zIndex: 10,
                    }}>
                      รอเริ่มประมูล
                    </div>
                  );
                } else if (isLive) {
                  return (
                    <div style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      backgroundColor: '#28a745',
                      color: '#fff',
                      fontWeight: 'bold',
                      padding: '3px 8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      zIndex: 10,
                    }}>
                      กำลังประมูล
                    </div>
                  );
                } else if (isEnded) {
                  return (
                    <div style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      backgroundColor: '#6c757d',
                      color: '#fff',
                      fontWeight: 'bold',
                      padding: '3px 8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      zIndex: 10,
                    }}>
                      ปิดประมูลแล้ว
                    </div>
                  );
                }
              })()}

                        
{item.video_url && (
  <button
    className="btn btn-outline-light btn-sm mt-2 w-100"
    onClick={() => {
      setVideoUrl(item.video_url);
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
                            <i className="bi bi-bag me-1"></i>{item.category || 'ไม่ระบุหมวดหมู่'}
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
                            <h6 className="mb-0">{item.start_price} บาท</h6>
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
    
{showVideoModal && (
  <div className="modal show d-block" tabIndex={-1}>
    <div className="modal-dialog modal-dialog-centered modal-lg">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">ชมวิดีโอ</h5>
          <button type="button" className="btn-close" onClick={() => setShowVideoModal(false)}></button>
        </div>
        <div className="modal-body">
          {videoUrl.endsWith(".mp4") ? (
            <video controls width="100%" src={videoUrl}></video>
          ) : (
            <div className="ratio ratio-16x9">
              <iframe
                src={videoUrl.includes("youtube.com/watch") ? videoUrl.replace("watch?v=", "embed/") : videoUrl}
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

export default LiveAuctionHomeOne;
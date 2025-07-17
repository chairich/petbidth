
'use client';

import { useRouter } from 'next/navigation';  // ใช้ useRouter สำหรับ App Router
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie'; // ใช้ js-cookie
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient';
const MyTimer = dynamic(() => import('@/components/common/Timer'), { ssr: false });



const LiveAuctionHomeOne = ({ style_2 }: any) => {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [active, setActive] = useState(null);
  const [user, setUser] = useState<any>(null);

  const router = useRouter();  // ใช้ useRouter สำหรับ App Router

  // Redirect to login if user not logged in
  useEffect(() => {
    const fetchUser = () => {
      const currentUser = Cookies.get('session');  // Get session from cookies
      if (currentUser) {
        setUser(JSON.parse(currentUser));  // Set user from cookies
      } else {
        supabase.auth.getSession().then(({ data }) => {
          const userData = data?.session?.user || null;
          if (userData) {
            setUser(userData);
            Cookies.set('session', JSON.stringify(userData), { expires: 1, path: '/' });  // Save session to cookies
          } else {
            // removed global redirect; handled in handleJoinAuction
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
      const { data, error } = await supabase
        .from('auctions')
        .select('*')
        .eq('status', 'active')  // ค้นหาการประมูลที่มีสถานะ active
        .order('created_at', { ascending: false });  // เรียงตามวันที่สร้างล่าสุด

      if (error) {
        console.error('Error fetching auctions:', error);
      } else {
        setAuctions(data);  // ตั้งค่าให้แสดงผล
      }
    };

    fetchAuctions();
  }, []);

  const handleJoinAuction = (auctionId: string) => {
    if (!user) {
      router.push('/login');  // ✅ Redirect to login only when clicking
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
              <h2 className="mb-0 ms-2">กำลัง {style_2 ? 'ประมูล' : 'ประมูลสด'}</h2>
            </div>
          </div>
          <div className="col-5 text-end">
            <Link className="btn rounded-pill btn-outline-primary btn-sm border-2 mb-5" href="/live-bidding">ดูทั้งหมด</Link>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row g-4 justify-content-center">
          {auctions.length > 0 ? (
            auctions.slice(0, 4).map((item, i) => (
              <div key={i} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                <div className="nft-card card border-0">
                  <div className="card-body">
                    <div className="img-wrap">
                      <img src={item.images?.[item.cover_image_index || 0] || '/assets/img/default.jpg'} alt="auction" />
                      <div className="badge bg-success position-absolute">กำลังเปิดประมูล</div>
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
                      <MyTimer endTime={item.end_time} />
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
                            <img className="shadow" src={item.users_avatar_url || 'https://lhrszqycskubmmtisyou.supabase.co/storage/v1/object/public/auction-images/auction-images/1752563441344_0.png'} alt="avatar" />
                            <i className="bi bi-check position-absolute bg-success"></i>
                          </div>
                          <div className="name-author">
                            <Link className="name d-block hover-primary fw-bold text-truncate" href={`/auction/${item.id}`}>{item.title}</Link>
                            <span className="author d-block fz-12 hover-primary text-truncate">@{item.owner_name}</span>
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
            ))
          ) : (
            <p>ยังไม่มีการประมูลที่เปิดอยู่</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveAuctionHomeOne;

'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const LiveBiddingArea = () => {
  const [active, setActive] = useState(null);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [count, setCount] = useState(12);
  const [noMorePost, setNoMorePost] = useState(false);
  const [user, setUser] = useState<any>(null);

  const handleActive = (id: any) => {
    setActive(active === id ? null : id);
  };

  const countSlice = auctions.slice(0, count);

  const handleLoadMore = () => {
    setCount(count + 4);
    if (count >= auctions.length) {
      setNoMorePost(true);
    }
  };

  useEffect(() => {
    fetchAuctions();
    checkUser();
  }, []);

  async function fetchAuctions() {
    const { data } = await supabase
      .from('auctions')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (data) setAuctions(data);
  }

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  }

  return (
    <div className="live-bids-wrapper">
      <div className="container">
        <div className="row g-4 justify-content-center">
          {countSlice.map((item, i) => (
            <div key={i} className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <div className="nft-card card shadow-sm">
                <div className="card-body">
                  <div className="img-wrap">
                    <img src={item.images?.[0] || '/placeholder.png'} alt="" />
                    <div className="badge bg-warning position-absolute">
                      <img src="/img/core-img/fire.png" alt="" />รายการใหม่
                    </div>

                    <div className="dropdown">
                      <button
                        onClick={() => handleActive(item.id)}
                        className={`btn dropdown-toggle rounded-pill shadow-sm ${active === item.id ? 'show' : ''}`}
                        id="dropdownMenuButton"
                        type="button"
                      >
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>
                      <ul
                        className={`dropdown-menu dropdown-menu-end ${active === item.id ? 'show' : ''}`}
                      >
                        <li><a className="dropdown-item" href="#"><i className="me-1 bi bi-share"></i>แชร์</a></li>
                        <li><a className="dropdown-item" href="#"><i className="me-1 bi bi-flag"></i>รายงาน</a></li>
                        <li><a className="dropdown-item" href="#"><i className="me-1 bi bi-bookmark"></i>บันทึก</a></li>
                      </ul>
                    </div>

                    <div className="bid-ends">
                      <div><span className="days"></span><span>วัน</span></div>
                      <div><span className="hours"></span><span>ชม.</span></div>
                      <div><span className="minutes"></span><span>นาที</span></div>
                      <div><span className="seconds"></span><span>วิ</span></div>
                    </div>
                  </div>

                  <div className="row gx-2 align-items-center mt-3">
                    <div className="col-8" style={{ color: '#8480AE' }}>
                      <span className="d-block fz-12"><i className="bi bi-bag me-1"></i>{item.category || 'ทั่วไป'}</span>
                    </div>
                    <div className="col-4 text-end">
                      <button className="wishlist-btn" type="button"><i className="bi"></i></button>
                    </div>
                  </div>

                  <div className="row gx-2 align-items-center mt-2">
                    <div className="col-8">
                      <div className="name-info d-flex align-items-center">
                        <div className="author-img position-relative">
                          <img className="shadow" src={item.author_avatar || '/img/default-user.png'} alt="" />
                          <i className="bi bi-check position-absolute bg-success"></i>
                        </div>
                        <div className="name-author">
                          <Link className="name d-block hover-primary fw-bold text-truncate" href="/item-details">
                            {item.title}
                          </Link>
                          <Link className="author d-block fz-12 hover-primary text-truncate" href="/author">
                            @ {item.created_by || 'ไม่ระบุ'}
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="col-4" style={{ color: '#8480AE' }}>
                      <div className="price text-end">
                        <span className="fz-12 d-block">ราคาล่าสุด</span>
                        <h6 className="mb-0">{item.current_bid || item.starting_price || 0} บาท</h6>
                      </div>
                    </div>
                    <div className="col-12">
                      {user ? (
                        <Link className="btn btn-primary rounded-pill btn-sm mt-3 w-100" href={`/auction/${item.id}`}>
                          เข้าร่วมประมูล
                        </Link>
                      ) : (
                        <Link className="btn btn-outline-primary rounded-pill btn-sm mt-3 w-100" href="/login">
                          เข้าสู่ระบบเพื่อประมูล
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container">
        <div className="text-center mt-70">
          <button
            onClick={handleLoadMore}
            className="btn btn-primary btn-sm rounded-pill"
          >
            {noMorePost ? 'ไม่มีรายการเพิ่มเติม' : 'ดูรายการเพิ่มเติม'}
            <i className="ms-1 bi bi-arrow-repeat"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveBiddingArea;

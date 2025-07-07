'use client'

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import dynamic from 'next/dynamic';

const MyTimer = dynamic(() => import('@/common/Timer'), { ssr: false });

const supabaseUrl = 'https://ykinhwdtvucjgryyjyvj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LiveAuctionHomeOne = ({ style_2 }: any) => {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    const fetchAuctions = async () => {
      const { data, error } = await supabase
        .from('auctions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);
      if (data) setAuctions(data);
    };
    fetchAuctions();
  }, []);

  const handleActive = (id: any) => {
    if (active === id) {
      setActive(null);
    } else {
      setActive(id);
    }
  };

  return (
    <div className={`live-bidding-wrapper ${style_2 ? '' : 'bg-gray pt-120 pb-120'}`}>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-7">
            <div className="section-heading d-flex align-items-center">
              <div className="spinner-grow text-danger" role="status"><span className="visually-hidden">Loading...</span></div>
              <h2 className="mb-0 ms-2">Live {style_2 ? 'Bid' : 'Auctions'}</h2>
            </div>
          </div>
          <div className="col-5 text-end">
            <Link className="btn rounded-pill btn-outline-primary btn-sm border-2 mb-5" href="/live-bidding">View All Auctions</Link>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row g-4 justify-content-center">
          {auctions.map((item, i) => (
            <div key={i} className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <div className="nft-card card border-0">
                <div className="card-body">
                  <div className="img-wrap">
                    <img src={item.image_urls?.[0] || '/placeholder.jpg'} alt="" />
                    <div className="dropdown">
                      <button
                        onClick={() => handleActive(item.id)}
                        className={`btn dropdown-toggle rounded-pill shadow-sm ${active === item.id ? 'show' : ''}`}
                        id={`dropdown-${item.id}`}
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>
                      <ul className={`dropdown-menu dropdown-menu-end ${active === item.id ? 'show' : ''}`}>
                        <li><a className="dropdown-item" href="#"><i className="me-1 bi bi-share"></i>Share</a></li>
                        <li><a className="dropdown-item" href="#"><i className="me-1 bi bi-flag"></i>Report</a></li>
                        <li><a className="dropdown-item" href="#"><i className="me-1 bi bi-bookmark"></i>Bookmark</a></li>
                      </ul>
                    </div>
                    <MyTimer endTime={item.end_time} />
                  </div>

                  <div className="row gx-2 align-items-center mt-3" style={{ color: '#8084AE' }}>
                    <div className="col-8">
                      <span className="d-block fz-12">
                        <i className="bi bi-bag me-1"></i>{item.category || 'หมวดหมู่ทั่วไป'}
                      </span>
                    </div>
                  </div>

                  <div className="row gx-2 align-items-center mt-2">
                    <div className="col-8">
                      <div className="name-info d-flex align-items-center">
                        <div className="author-img position-relative">
                          <img className="shadow" src={item.author_avatar || '/user.png'} alt="" />
                          <i className="bi bi-check position-absolute bg-success"></i>
                        </div>
                        <div className="name-author">
                          <Link className="name d-block hover-primary fw-bold text-truncate" href="/item-details">{item.title}</Link>
                          <Link className="author d-block fz-12 hover-primary text-truncate" href="/author">@{item.author_name}</Link>
                        </div>
                      </div>
                    </div>
                    <div className="col-4" style={{ color: '#8084AE' }}>
                      <div className="price text-end">
                        <span className="fz-12 d-block">ราคาเริ่มต้น</span>
                        <h6 className="mb-0">{item.current_price || '0'} บาท</h6>
                      </div>
                    </div>
                    <div className="col-12">
                      <Link href={`/auction/${item.id}`} className="btn btn-primary rounded-pill btn-sm mt-3 w-100">เข้าร่วมประมูล</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveAuctionHomeOne;

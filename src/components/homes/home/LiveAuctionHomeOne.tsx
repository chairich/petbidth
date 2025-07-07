
'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';

const MyTimer = dynamic(() => import('@/common/Timer').then(mod => mod.default), {
  ssr: false,
}) as React.FC<{ endTime: string | Date }>;

// Supabase config
const supabaseUrl = 'https://ykinhwdtvucjgryyjyvj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LiveAuctionHomeOne = () => {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    const fetchAuctions = async () => {
      const { data, error } = await supabase.from('auctions').select('*').order('created_at', { ascending: false });
      if (error) console.error('Fetch auctions error:', error);
      else setAuctions(data || []);
    };

    fetchAuctions();
  }, []);

  const handleActive = (id: any) => {
    setActive(active === id ? null : id);
  };

  return (
    <div className="live-bidding-wrapper bg-gray pt-120 pb-120">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-7">
            <div className="section-heading d-flex align-items-center">
              <div className="spinner-grow text-danger" role="status"><span className="visually-hidden">Loading...</span></div>
              <h2 className="mb-0 ms-2">Live Auctions</h2>
            </div>
          </div>
          <div className="col-5 text-end">
            <Link className="btn rounded-pill btn-outline-primary btn-sm border-2 mb-5" href="/live-bidding">View All Auctions</Link>
          </div>
        </div>
        <div className="row g-4 justify-content-center">
          {auctions.slice(0, 4).map((item, i) => (
            <div key={i} className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <div className="nft-card card border-0">
                <div className="card-body">
                  <div className="img-wrap">
                    <img src={item.image_urls?.[0]} alt="" />
                    <div className="dropdown">
                      <button
                        onClick={() => handleActive(item.id)}
                        className={`btn dropdown-toggle rounded-pill shadow-sm ${active === item.id ? 'show' : ''}`}>
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
                        <i className="bi bi-bag me-1"></i>{item.title}
                      </span>
                    </div>
                    <div className="col-4 text-end">
                      <button className="wishlist-btn" type="button"><i className="bi"></i></button>
                    </div>
                  </div>
                  <div className="col-12"><a className="btn btn-primary rounded-pill btn-sm mt-3 w-100" href="#">Place Bid</a></div>
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

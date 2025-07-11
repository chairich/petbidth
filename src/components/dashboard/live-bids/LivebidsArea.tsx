"use client";

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import MyTimer from '@/components/common/MyTimer';


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const LivebidsArea = () => {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [count, setCount] = useState(8);

  useEffect(() => {
    const fetchAuctions = async () => {
      const { data, error } = await supabase
        .from('auctions')
        .select('*')
        .eq('is_closed', false)
        .order('created_at', { ascending: false });
      if (!error && data) {
        setAuctions(data);
      }
    };
    fetchAuctions();
  }, []);

  const countSlice = auctions.slice(0, count);

  return (
    <div className="rn-live-bidding-area rn-section-gapTop">
      <div className="container">
        <div className="row mb--30">
          <div className="col-12 text-center">
            <h3 className="title">Your all live bids</h3>
          </div>
        </div>

        <div className="row g-5">
          {countSlice.map((item, index) => (
            <div className="col-lg-3 col-md-4 col-sm-6 col-12" key={item.id}>
              <div className="rbt-card variation-01 rbt-hover">
                <div className="inner">
                  <div className="thumbnail">
                    <Link href={`/auction/${item.id}`}>
                      <img src={item.images?.[0]} alt={item.title} className="w-100" />
                    </Link>
                    <div className="timer mt-2">
                      <MyTimer endTime={item.end_time} />
                    </div>
                  </div>
                  <div className="content mt-2">
                    <h6 className="title text-white">{item.title}</h6>
                    <span className="latest-bid text-white">เริ่มต้น {item.start_price} บาท</span>
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

export default LivebidsArea;

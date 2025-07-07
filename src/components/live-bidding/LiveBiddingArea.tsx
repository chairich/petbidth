'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

const LiveBiddingArea = () => {
  const [auctions, setAuctions] = useState<any[]>([])
  const [active, setActive] = useState<number | null>(null)

  const fetchAuctions = async () => {
    const { data, error } = await supabase
      .from('auctions')
      .select('*')
      .eq('status', 'open') // แสดงเฉพาะที่เปิดประมูล

    if (error) console.error(error)
    else setAuctions(data || [])
  }

  useEffect(() => {
    fetchAuctions()
  }, [])

  const handleActive = (id: number) => {
    setActive(active === id ? null : id)
  }

  return (
    <div className="live-bids-wrapper">
      <div className="container">
        <div className="row g-4 justify-content-center">
          {auctions.map((item, i) => (
            <div key={i} className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <div className="nft-card card shadow-sm">
                <div className="card-body">
                  <div className="img-wrap">
                    <img src={item.cover_image || '/assets/img/bg-img/9.jpg'} alt="" />
                    <div className="badge bg-dark position-absolute">
                      🔥 ประมูลสด
                    </div>
                    {/* ปุ่ม Dropdown */}
                    <div className="dropdown">
                      <button
                        onClick={() => handleActive(item.id)}
                        className={`btn dropdown-toggle rounded-pill shadow-sm ${
                          active === item.id ? 'show' : ''
                        }`}
                      >
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>
                      <ul
                        className={`dropdown-menu dropdown-menu-end ${
                          active === item.id ? 'show' : ''
                        }`}
                      >
                        <li><a className="dropdown-item" href="#"><i className="me-1 bi bi-share"></i>แชร์</a></li>
                        <li><a className="dropdown-item" href="#"><i className="me-1 bi bi-flag"></i>รายงาน</a></li>
                      </ul>
                    </div>
                  </div>
                  <div className="row gx-2 align-items-center mt-3">
                    <div className="col-12">
                      <Link href={`/auction/${item.id}`} className="d-block fw-bold hover-primary text-truncate">
                        {item.title}
                      </Link>
                      <small className="text-muted">ราคาเริ่มต้น: {item.current_bid} บาท</small>
                    </div>
                    <div className="col-12 mt-2">
                      <Link
                        className="btn btn-primary rounded-pill w-100 btn-sm"
                        href={`/auction/${item.id}`}
                      >
                        เข้าร่วมประมูล
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {auctions.length === 0 && (
          <div className="text-center mt-5 text-muted">ยังไม่มีรายการประมูลในขณะนี้</div>
        )}
      </div>
    </div>
  )
}

export default LiveBiddingArea

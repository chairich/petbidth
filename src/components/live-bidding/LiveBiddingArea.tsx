'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import LikeButton from '@/components/LikeButton'

dayjs.extend(duration)
dayjs.extend(utc)
dayjs.extend(timezone)

const LiveBiddingArea = () => {
  const [auctions, setAuctions] = useState<any[]>([])
  const [active, setActive] = useState<number | null>(null)
  const [countdowns, setCountdowns] = useState<{ [key: string]: string }>({})
  const [likes, setLikes] = useState<{ [key: string]: boolean }>({})
  const [userRole, setUserRole] = useState<string | null>(null)

  const fetchAuctions = async () => {
    const { data, error } = await supabase
      .from('auctions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.error(error)
    else setAuctions(data || [])
  }

  const fetchUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      if (!error) setUserRole(data?.role || null)
    }
  }

  useEffect(() => {
    fetchAuctions()
    fetchUserRole()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedCountdowns: { [key: string]: string } = {}

      auctions.forEach((auction) => {
        const now = dayjs().tz('Asia/Bangkok')
        const start = dayjs(auction.start_time).tz('Asia/Bangkok')
        const end = dayjs(auction.end_time).tz('Asia/Bangkok')

        if (now.isBefore(start)) {
          const dur = dayjs.duration(start.diff(now))
          updatedCountdowns[auction.id] = `เริ่มใน ${dur.hours()} ชม ${dur.minutes()} นาที`
        } else if (now.isBefore(end)) {
          const dur = dayjs.duration(end.diff(now))
          updatedCountdowns[auction.id] = `เหลือเวลา ${dur.hours()} ชม ${dur.minutes()} นาที`
        } else {
          updatedCountdowns[auction.id] = `หมดเวลาแล้ว`
        }
      })

      setCountdowns(updatedCountdowns)
    }, 1000)

    return () => clearInterval(interval)
  }, [auctions])

  const handleActive = (id: number) => {
    setActive(active === id ? null : id)
  }

  const toggleLike = (id: string) => {
    setLikes((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="live-bids-wrapper">
      <div className="container">
        <div className="row g-4 justify-content-center">
          {auctions.map((item, i) => {
            const now = dayjs.utc()
            const hasStarted = now.isAfter(dayjs.utc(item.start_time))
            const isEnded = now.isAfter(dayjs.utc(item.end_time))
            return (
              <div key={i} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                <div className="nft-card card shadow-sm">
                  <div className="card-body">
                    <div className="img-wrap position-relative">
                      <img
                        src={item.images?.[item.cover_image_index] || '/assets/img/bg-img/9.jpg'}
                        alt=""
                        className="w-100 rounded"
                        style={{ height: 240, objectFit: 'cover' }}
                      />
                      <div className={`badge position-absolute ${isEnded ? 'bg-secondary' : hasStarted ? 'bg-success' : 'bg-warning'}`}>
                        {isEnded ? 'ปิดประมูลแล้ว' : hasStarted ? 'กำลังเปิดประมูล' : 'รอเริ่มประมูล'}
                      </div>
                      <div className="position-absolute top-0 end-0 m-2">
                        <button onClick={() => toggleLike(item.id)} className="btn btn-sm text-white">
                          <img src={item.image} alt="" /><LikeButton auctionId={item.id} />
                        </button>
                      </div>
                      
                      <div className="dropdown position-absolute top-0 start-50 translate-middle-x mt-2">
                        <button
                          onClick={() => handleActive(item.id)}
                          className={`btn dropdown-toggle rounded-pill shadow-sm ${active === item.id ? 'show' : ''}`}
                        >
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul className={`dropdown-menu dropdown-menu-end ${active === item.id ? 'show' : ''}`}>
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
                        <small className="text-muted">ราคาเริ่มต้น: {item.start_price} บาท</small>
                      </div>
                      <div className="col-12 mt-2">
                        <Link
                          className="btn btn-primary rounded-pill w-100 btn-sm mb-2"
                          href={`/auction/${item.id}`}
                        >
                          ดูรายการประมูล
                        </Link>
                        {userRole === 'admin' && (
                          <Link
                            className="btn btn-warning rounded-pill w-100 btn-sm"
                            href={`/admin/auctions/edit-auction/${item.id}`}
                          >
                            ✏️ แก้ไขกระทู้
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {auctions.length === 0 && (
          <div className="text-center mt-5 text-muted">ยังไม่มีรายการประมูลในขณะนี้</div>
        )}
      </div>
    </div>
  )
}

export default LiveBiddingArea

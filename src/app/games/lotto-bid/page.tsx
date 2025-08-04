'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import dayjs from 'dayjs'
import Image from 'next/image'

export default function DemoAuctionForLottery() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [canBid, setCanBid] = useState(false)
  const [mockCount, setMockCount] = useState(0)
  const [bids, setBids] = useState<any[]>([])
  const [auction, setAuction] = useState({
    id: 'demo123',
    title: '🎯 เคาะจำลองเพื่อเข้าสู่กิจกรรมทายหวย',
    description: 'ทดลองเคาะประมูลเหมือนจริง เคาะครบ 3 ครั้ง รับสิทธิ์เข้าสู่เกมทายเลขท้าย 2 ตัว!',
    start_price: 1000,
    current_price: 1000,
    images: ['https://lhrszqycskubmmtisyou.supabase.co/storage/v1/object/public/news-images/news-images/1753945797789_0.jpg'],
  })

  // โหลด user แบบเร็ว
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user
      if (currentUser) setUser(currentUser)
      setLoading(false)
    }

    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (newSession?.user) {
        setUser(newSession.user)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // รีเซ็ต mock เมื่อ user มาใหม่
  useEffect(() => {
    if (!user) return
    const key = `mock-bid-count-${auction.id}-${user.id}`
    localStorage.removeItem(key)
    setMockCount(0)
    setBids([])
    setAuction((prev) => ({ ...prev, current_price: prev.start_price }))
  }, [user])

  // ดึงโปรไฟล์
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      const { data: profile } = await supabase.from('users').select('name, avatar_url').eq('id', user.id).single()

      const name = profile?.name || ''
      const avatar = profile?.avatar_url || ''
      setUserName(name)
      setAvatarUrl(avatar)

      const isAllowed = /^A1\d{2}$/.test(name) || /^VIP\d+$/i.test(name)
      setCanBid(isAllowed)
    }

    fetchProfile()
  }, [user])

  const handleMockBid = () => {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนเคาะ')
      return
    }

    if (!canBid) {
      alert('คุณไม่มีสิทธิ์เข้าร่วมกิจกรรมนี้')
      return
    }

    const userId = user.id
    const key = `mock-bid-count-${auction.id}-${userId}`
    const newCount = (Number(localStorage.getItem(key)) || 0) + 1
    localStorage.setItem(key, newCount.toString())

    const nextPrice = auction.current_price + 100
    const fakeBid = {
      id: `mock-${newCount}`,
      bid_price: nextPrice,
      created_at: new Date().toISOString(),
      users: {
        name: userName,
        avatar_url: avatarUrl || '/icons/icon-512x512.png',
      },
    }

    setAuction({ ...auction, current_price: nextPrice })
    setBids([fakeBid, ...bids])
    setMockCount(newCount)

    if (newCount >= 3) {
      alert('🎉 คุณเคาะครบ 3 ครั้งแล้ว! พร้อมเข้าสู่กิจกรรมทายหวย')
      router.push('/games/LotteryBoard')
    } else {
      alert(`✅ เคาะครั้งที่ ${newCount}/3 สำเร็จ!`)
    }
  }

  if (loading) {
    return <div className="text-center py-5 text-white">⏳ กำลังโหลดข้อมูล...</div>
  }

  return (
    <div className="container py-5 text-white">
      {!user && <div className="alert alert-danger text-center">⚠️ ยังไม่ได้เข้าสู่ระบบ</div>}
      {user && !canBid && (
        <div className="alert alert-warning text-center">⚠️ บัญชีของคุณไม่มีสิทธิ์ร่วมกิจกรรมนี้</div>
      )}

      {userName && (
        <div className="text-center mb-4">
          <p className="text-green-400">สวัสดี 👤 คุณ: <strong>{userName}  👋</strong></p>
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt="avatar"
              width={64}
              height={64}
              className="mx-auto rounded-full mt-2"
            />
          )}
          <p className="mt-3 text-white text-lg">
            <br />
            <h2> ขอเชิญสัมผัสบรรยากาศเคาะประมูล โดยเชิญร่วมเข้า!</h2><br />
          </p>
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="border rounded overflow-hidden bg-dark mb-3">
            <Image src={auction.images[0]} alt="demo" width={600} height={600} className="img-fluid w-100" priority unoptimized />
          </div>
        </div>
        <div className="col-lg-6">
          <h2>{auction.title}</h2>
          <p>{auction.description}</p>
          <div className="my-3 h5 text-warning">ราคาปัจจุบัน: {auction.current_price.toLocaleString()} บาท</div>
          <button className="btn btn-primary rounded-pill w-100" onClick={handleMockBid} disabled={!canBid}>
            เคาะประมูลจำลอง
          </button>
          <div className="mt-4">
            <h5>ประวัติการเคาะ (จำลอง)</h5>
            <ul className="list-group">
              {bids.length === 0 ? (
                <li className="list-group-item bg-dark text-light">ยังไม่มีการเคาะ</li>
              ) : (
                bids.map((bid) => (
                  <li key={bid.id} className="list-group-item bg-dark text-light">
                    <div className="d-flex align-items-center">
                      <img src={bid.users.avatar_url} className="rounded-circle me-2" width="24" height="24" alt="avatar" />
                      <div>
                        {bid.users.name} เคาะ {bid.bid_price.toLocaleString()} บาท<br />
                        <small className="text-muted">{dayjs(bid.created_at).format('HH:mm:ss')}</small>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

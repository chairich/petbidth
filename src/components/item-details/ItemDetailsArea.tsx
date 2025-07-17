'use client'; // เพิ่มบรรทัดนี้เพื่อให้ Next.js รู้ว่าเป็น Client Component
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

const ItemDetailsArea = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [session, setSession] = useState<any>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [bidPrice, setBidPrice] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setIsLoadingSession(true);
        const { data: sessionData, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error fetching session:', error);
          setIsLoadingSession(false);
          return;
        }

        if (sessionData?.session) {
          setSession(sessionData.session);
        } else {
          setSession(null);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
  setSession(session);
  setIsLoadingSession(false);
});

        return () => {
          if (subscription) {
            subscription.unsubscribe();
          }
        };
      } catch (error) {
        console.error('Error fetching session:', error);
        setIsLoadingSession(false);
      }
    };

    fetchSession();
  }, []); 

  useEffect(() => {
    if (!id) return;
    fetchAuction();
    const interval = setInterval(fetchAuction, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchAuction = async () => {
    try {
      const { data } = await supabase
        .from('auctions')
        .select('*, bids(*, users:users!bids_user_id_fkey(*)), creator:users!auctions_created_by_fkey(*)')
        .eq('id', id)
        .order('created_at', { referencedTable: 'bids', ascending: false })
        .single();

      if (data) {
        const highestBid = (data.bids || [])[0]?.bid_price;
        data.current_price = highestBid ?? data.start_price;
        setAuction(data);
        setBids(data.bids || []);
        handleAutoEndLogic(data, data.bids || []);
        updateTimeLeft(data.end_time);
      }
    } catch (error) {
      console.error('Error fetching auction data:', error);
    }
  };

  const handleAutoEndLogic = async (auctionData: any, bids: any[]) => {
    if (!auctionData || auctionData.is_closed) return;
    const createdAt = Date.parse(auctionData.created_at);
    const now = Date.now();
    if (bids.length === 0) {
      const tenMinutes = 10 * 60 * 1000;
      if (now - createdAt > tenMinutes) {
        await supabase.from('auctions')
          .update({ is_closed: true })
          .eq('id', auctionData.id);
        console.log("🛑 ปิดประมูลเนื่องจากไม่มีบิดใน 10 นาที");
      }
    } else {
      const latestBidTime = new Date(bids[0].created_at).getTime();
      const proposedEndTime = new Date(latestBidTime + 4 * 60 * 1000).toISOString();
      if (proposedEndTime !== auctionData.end_time) {
        await supabase.from('auctions')
          .update({ end_time: proposedEndTime })
          .eq('id', auctionData.id);
        console.log("⏱️ ขยายเวลาประมูล 4 นาที");
      }
    }
  };

  const updateTimeLeft = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return setTimeLeft('หมดเวลา');
    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);
    setTimeLeft(`${days} วัน ${hours} ชม. ${minutes} นาที ${seconds} วิ`);
  };

  const handleBidSubmit = async () => {
    if (isLoadingSession) {
      alert("กำลังโหลดข้อมูลผู้ใช้...");
      return;
    }

    if (!session?.user) {
      alert("กรุณาเข้าสู่ระบบก่อนทำการประมูล");
      return;
    }

    const newBid = Number(bidPrice);
    const currentPrice = Number(auction.current_price ?? auction.start_price ?? 0);

    if (!newBid || isNaN(newBid)) {
      alert("กรุณาใส่ราคาที่ถูกต้อง");
      return;
    }

    if (newBid < currentPrice + 100) {
      alert("ราคาที่บิดต้องมากกว่าราคาปัจจุบัน");
      return;
    }

    const latestBid = bids[0];
    if (latestBid && latestBid.bid_price === newBid) {
      alert("ราคานี้ถูกเสนอไปแล้ว กรุณาเพิ่มราคาสูงขึ้น");
      return;
    }

    const { error } = await supabase.from('bids').insert([{
      auction_id: auction.id,
      user_id: session?.user?.id,
      bid_price: newBid,
    }]);

    if (error) {
      alert("บันทึกการบิดล้มเหลว");
    } else {
      setShowModal(false);
      setBidPrice('');
      fetchAuction();
    }
  };

  return (
    <div className="container py-5 text-white">
      {/* แทรกเนื้อหาจากหน้า LiveAuctionPage ที่นี่ */}
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="border rounded overflow-hidden bg-dark mb-3">
            {auction?.images && auction?.images[selectedImageIndex] && (
              <Image
                src={auction.images[selectedImageIndex]}
                alt="auction"
                width={600}
                height={600}
                className="img-fluid w-100"
                priority={true}
              />
            )}
          </div>
        </div>
        <div className="col-lg-6">
          <h2>{auction?.title}</h2>
          <p>{auction?.description}</p>
          <div className="my-3 h5 text-warning">
            ราคาปัจจุบัน: {auction?.current_price?.toLocaleString()} บาท
          </div>
          <div className="mb-3">เวลาที่เหลือ: <strong>{timeLeft}</strong></div>
          {/* รายการอื่นๆ */}
        </div>
      </div>
    </div>
  );
}

export default ItemDetailsArea;

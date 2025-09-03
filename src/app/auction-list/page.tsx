'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const BUCKET_NAME = 'auction-images';

// ฟังก์ชันช่วยแปลง string JSON -> array
function safeImagesArray(images: string | string[] | null | undefined): string[] {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  try {
    const arr = JSON.parse(images);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

const AuctionList = () => {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const { data, error } = await supabase
          .from('auction_items')
          .select('id, price, shipping_conditions, images, created_at, username, user_email, user_avatar')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAuctions(data ?? []);
      } catch (err: any) {
        console.error('Unexpected error fetching auctions:', err.message || err);
        setErrorMessage('ไม่สามารถดึงข้อมูลการประมูลได้');
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  if (loading) {
    return (
      <div className="text-center">
        <p className="text-white">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h2 className="text-white text-center">รายการประมูล</h2>

      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      <div className="row">
        {auctions.length > 0 ? (
          auctions.map((auction) => {
            const imgs = safeImagesArray(auction.images);
            const firstPath = imgs[0];

            // สร้าง public URL จาก Supabase Storage
            let imageUrl = '/no-image.png';
            if (firstPath) {
              const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(firstPath);
              if (data?.publicUrl) imageUrl = data.publicUrl;
            }

            const sellerName = auction.username ?? auction.user_email ?? 'ไม่ระบุ';

            return (
              <div className="col-md-4 mb-4" key={auction.id}>
                <div className="card h-100">
                  <img
                    src={imageUrl}
                    alt="Auction Item"
                    className="card-img-top"
                    style={{ height: 200, objectFit: 'cover' }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/no-image.png';
                    }}
                  />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{auction.price} บาท</h5>
                    <p className="card-text mb-1">{auction.shipping_conditions}</p>
                    <small className="text-muted mb-3 d-flex align-items-center gap-2">
                      {auction.user_avatar && (
                        <img
                          src={auction.user_avatar}
                          alt={sellerName}
                          width={24}
                          height={24}
                          style={{ borderRadius: '50%' }}
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                      ผู้ส่ง: {sellerName}
                    </small>

                    <a href={`/auction-list/${auction.id}`} className="btn btn-primary mt-auto">
                      ดูรายละเอียด
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-white text-center">ยังไม่มีการประมูลในขณะนี้</p>
        )}
      </div>
    </div>
  );
};

export default AuctionList;

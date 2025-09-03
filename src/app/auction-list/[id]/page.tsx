'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface AuctionDetailPageProps {
  params: { id: string };
}

const BUCKET_NAME = 'auction-images';

function safeImagesArray(images: string | string[] | null | undefined): string[] {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  try {
    const arr = JSON.parse(images as string);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

const AuctionDetail = ({ params }: AuctionDetailPageProps) => {
  const id = params.id;
  const [auction, setAuction] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!id) return;

    const fetchAuction = async () => {
      setLoading(true);
      setError('');

      try {
        const { data, error } = await supabase
          .from('auction_items')
          .select('id,title,price,shipping_conditions,images,created_at,username,user_email,user_avatar,overlay_text')
          .eq('id', id)
          .single();

        if (error) throw error;

        setAuction(data);
      } catch (err: any) {
        console.error(err);
        setError('ไม่สามารถดึงรายละเอียดการประมูลได้');
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
  }, [id]);

  if (loading) return <div className="container py-5">Loading auction details...</div>;
  if (error) return <div className="container py-5 text-danger">{error}</div>;
  if (!auction) return <div className="container py-5">No auction found</div>;

  const imgs = safeImagesArray(auction.images);

  return (
    <div className="container py-5">
      <h2>{auction.title || `Auction #${auction.id}`}</h2>
      <p><strong>Price:</strong> {auction.price} Baht</p>
      <p><strong>Shipping:</strong> {auction.shipping_conditions}</p>
      <p><strong>Created At:</strong> {new Date(auction.created_at).toLocaleString()}</p>

      <div className="mb-3 d-flex align-items-center gap-2">
        {auction.user_avatar && (
          <img
            src={auction.user_avatar}
            alt={auction.username || auction.user_email || 'ผู้ส่ง'}
            width={36}
            height={36}
            style={{ borderRadius: '50%' }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        <div>
          <div><strong>ผู้ส่ง:</strong> {auction.username ?? auction.user_email ?? 'ไม่ระบุ'}</div>
          {auction.user_email && <div className="text-muted" style={{ fontSize: 12 }}>{auction.user_email}</div>}
        </div>
      </div>

      <div className="mb-4">
        <strong>Uploaded Images:</strong>
        <div className="d-flex gap-2 flex-wrap mt-2">
          {imgs.length > 0 ? (
            imgs.map((imagePath: string, idx: number) => {
              const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(imagePath);
              const thumbUrl = data?.publicUrl || '/no-image.png';
              return (
                <a key={idx} href={thumbUrl} target="_blank" rel="noreferrer">
                  <img
                    src={thumbUrl}
                    alt={`image-${idx}`}
                    className="border rounded"
                    width={120}
                    height={120}
                    style={{ objectFit: 'cover' }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/no-image.png';
                    }}
                  />
                </a>
              );
            })
          ) : (
            <p className="mb-0">No images available</p>
          )}
        </div>
      </div>

      <div>
        <strong>Overlay Text:</strong>
        <p className="mb-0">{auction.overlay_text || 'No additional text'}</p>
      </div>
    </div>
  );
};

export default AuctionDetail;

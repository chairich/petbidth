"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient2"; // ✅ client เดียวทั่วโปรเจกต์
import HeaderOne from "@/layouts/headers/HeaderOne";
import FooterOne from "@/layouts/footers/FooterOne";
import Divider from "@/components/common/Divider";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function VipShopOwnerPage() {
  const params = useParams();
  const router = useRouter();
  const bannerId = params?.id as string;
  const [shop, setShop] = useState<any>(null);
  const [classifieds, setClassifieds] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);

      const { data: shopData } = await supabase
        .from("banners")
        .select("*, user:users!user_id(*)")
        .eq("id", bannerId)
        .single();

      if (!shopData) return;
      setShop(shopData);

      const { data: postsData } = await supabase
        .from("classifieds")
        .select("*")
        .eq("created_by", shopData.user?.id)
        .order("created_at", { ascending: false });

      setClassifieds(postsData || []);

      const { data: reviewData } = await supabase
        .from("shop_reviews")
        .select("*, user:users(*)")
        .eq("shop_id", shopData.id);

      setReviews(reviewData || []);
    };

    if (bannerId) fetchData();
  }, [bannerId]);

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจว่าต้องการลบรายการนี้?")) return;
    const { error } = await supabase.from("classifieds").delete().eq("id", id);
    if (error) toast.error("ลบไม่สำเร็จ");
    else {
      toast.success("ลบเรียบร้อย");
      setClassifieds((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return toast.error("พิมพ์ข้อความก่อน");
    if (!currentUser?.id || currentUser.id === shop?.user?.id)
      return toast.error("ไม่สามารถส่งข้อความถึงร้านตัวเองได้");

    const { error } = await supabase.from("messages").insert({
      sender_id: currentUser.id,
      receiver_id: shop?.user?.id,
      content: messageInput,
    });

    if (error) toast.error("ส่งไม่สำเร็จ");
    else {
      toast.success("ส่งข้อความแล้ว");
      setMessageInput("");
    }
  };

  if (!isClient) return null;

  const user = shop?.user;
  const cover = shop?.images?.[shop?.cover_image_index || 0] || "/no-image.jpg";

  return (
    <>
      <HeaderOne />
      <Divider />
      <div className="container py-5 text-white">
        <div className="text-center mb-4">
          <img src={user?.avatar_url || "/default-avatar.png"} width={96} height={96} className="rounded-circle mb-3" alt="avatar" />
          <h2 className="h4 fw-bold">{shop?.shop_name || "ชื่อร้าน"}</h2>
          <p className="text-muted">{shop?.description || "ไม่มีคำแนะนำร้านค้า"}</p>
          {currentUser?.id === shop?.user?.id && (
            <Link href={`/classifieds/new?shop_banner_id=${bannerId}`} className="btn btn-success">➕ เพิ่มสินค้า</Link>
          )}
        </div>

        {shop?.images?.length > 0 && (
          <div className="mb-4 text-center">
            <img src={cover} className="rounded w-100" alt="cover" />
          </div>
        )}

        {shop?.images?.length > 1 && (
          <div className="row g-2 mb-4">
            {shop.images.map((img: string, idx: number) => (
              <div key={idx} className="col-4 col-md-2">
                <img src={img} className="img-fluid rounded" alt={`img-${idx}`} />
              </div>
            ))}
          </div>
        )}

        <h5 className="text-info mb-3">📦 สินค้าจากร้านนี้</h5>
        {classifieds.length === 0 ? (
          <p className="text-muted">ยังไม่มีสินค้า</p>
        ) : (
          <div className="row">
            {classifieds.map((item) => (
              <div key={item.id} className="col-md-6 col-lg-4 mb-4">
                <div className="bg-dark p-3 rounded h-100 d-flex flex-column">
                  <div className="ratio ratio-4x3 mb-2">
                    <img src={item.images?.[0] || "/no-image.jpg"} className="rounded w-100 h-100 object-fit-cover" />
                  </div>
                  <h6 className="fw-bold">{item.title || "ไม่มีชื่อ"}</h6>
                  <p className="text-success fw-bold">{item.price ?? "-"} บาท</p>
                  <Link href={`/classifieds/${item.id}`} className="btn btn-sm btn-primary mt-auto">ดูรายละเอียด</Link>
                  {currentUser?.id === shop?.user?.id && (
                    <div className="mt-2 d-flex gap-2">
                      <Link href={`/classifieds/edit/${item.id}`} className="btn btn-sm btn-warning">✏️ แก้ไข</Link>
                      <button onClick={() => handleDelete(item.id)} className="btn btn-sm btn-danger">🗑️ ลบ</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Divider />
        <h5 className="text-warning mb-3">⭐ รีวิวร้านค้า</h5>
        {reviews.length === 0 ? (
          <p className="text-muted">ยังไม่มีรีวิว</p>
        ) : (
          <ul className="list-unstyled">
            {reviews.map((r) => (
              <li key={r.id} className="bg-dark p-3 rounded mb-3">
                <div className="d-flex align-items-center mb-2">
                  <img src={r.user?.avatar_url || "/noavatar.png"} width={40} height={40} className="rounded-circle me-2" />
                  <strong>{r.user?.username}</strong>
                  <span className="ms-2 text-warning">★ {r.rating}/5</span>
                </div>
                <p>{r.comment}</p>
              </li>
            ))}
          </ul>
        )}

        {currentUser?.id !== shop?.user?.id && (
          <>
            <Divider />
            <div className="text-center mt-4">
              <button onClick={() => setIsChatOpen(true)} className="btn btn-warning">
                💬 ส่งข้อความถึงร้านนี้
              </button>
            </div>
          </>
        )}

        {isChatOpen && (
          <div className="fixed bottom-4 end-4 bg-dark text-white p-3 rounded shadow w-96 z-50">
            <div className="d-flex justify-content-between mb-2">
              <strong>💬 แชทกับร้าน</strong>
              <button onClick={() => setIsChatOpen(false)} className="btn btn-sm btn-danger">ปิด</button>
            </div>
            <div className="bg-black rounded p-2 mb-2" style={{ height: '200px', overflowY: 'auto' }}>
              <p className="text-muted">ยังไม่มีข้อความ</p>
            </div>
            <div className="d-flex">
              <input type="text" className="form-control me-2 bg-secondary text-white" placeholder="พิมพ์ข้อความ..." value={messageInput} onChange={(e) => setMessageInput(e.target.value)} />
              <button className="btn btn-success" onClick={handleSendMessage}>ส่ง</button>
            </div>
          </div>
        )}
      </div>
      <Divider />
      <FooterOne />
    </>
  );
}

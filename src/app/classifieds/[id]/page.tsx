"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import supabase from "@/lib/supabaseClient2";
import Link from "next/link";
import ChatPopup from "@/components/classifieds/ChatPopup";
import ReviewForm from "@/components/classifieds/ReviewForm";

type ClassifiedPost = {
  id: string;
  title: string;
  description: string;
  price: number;
  contact: string;
  category: string;
  images: string[];
  user_id: string;
  shop_banner_id?: string;
  user?: {
    id: string;
    name: string;
  };
};

export default function ClassifiedDetail() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0] || "";
  const [post, setPost] = useState<ClassifiedPost | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasMessageHistory, setHasMessageHistory] = useState<boolean>(false);
  const [showChat, setShowChat] = useState(false);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      setUserId(user?.id || null);

      if (user?.id) {
        const { data: roleData } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();
        setUserRole(roleData?.role || null);
      }

      const { data } = await supabase
        .from("classifieds")
        .select("*, user:users(id, name)")
        .eq("id", id)
        .single();
      setPost(data);
    };

    load();
  }, [id]);

  useEffect(() => {
    const checkMessageHistory = async () => {
      if (!userId || !post?.user_id || userId === post.user_id) return;
      const { data } = await supabase
        .from("messages")
        .select("id")
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .limit(1);
      setHasMessageHistory(!!data?.length);
    };

    if (post?.user_id) {
      checkMessageHistory();
    }
  }, [userId, post]);

  if (!post) return <div className="text-white p-5">กำลังโหลด...</div>;

  return (
    <div className="container py-5 text-white">
      <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
      <p className="text-green-400 font-semibold mb-4">{post.price} บาท</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {post.images?.map((img, i) => (
          <div key={i}>
            <img src={img} alt="" className="rounded w-full h-auto" />
          </div>
        ))}
      </div>

      <p><strong>หมวดหมู่:</strong> {post.category}</p>

      <div
        className="prose prose-invert max-w-none my-4"
        dangerouslySetInnerHTML={{ __html: post.description }}
      />

      <p><strong>ติดต่อ:</strong> {post.contact}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {userId && userId !== post.user_id && (
          <button className="btn btn-outline-light" onClick={() => setShowChat(true)}>
            💬 แชทกับเจ้าของโพสต์
          </button>
        )}

        {post.shop_banner_id && (
          <button className="btn btn-warning" onClick={() => setShowReview(true)}>
            ⭐ รีวิวร้านนี้
          </button>
        )}
      </div>

      {showChat && userId && post.user && (
        <ChatPopup
          userId={userId}
          receiverId={post.user.id}
          receiverName={post.user.name}
          userRole={userRole}
          allowReply={userRole !== "user" || hasMessageHistory}
          onClose={() => setShowChat(false)}
        />
      )}

      {showReview && post.shop_banner_id && (
        <ReviewForm
          shopBannerId={post.shop_banner_id}
          onClose={() => setShowReview(false)}
        />
      )}
    </div>
  );
}

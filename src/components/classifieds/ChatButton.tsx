'use client';

import { useRouter } from 'next/navigation';
import supabase from "@/lib/supabaseClient2"; // ✅ client เดียวทั่วโปรเจกต์

type Props = {
  shopId: string;
};

export default function ChatButton({ shopId }: Props) {
  const router = useRouter();

  const handleClick = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) return;

    const { data: existing } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('shop_id', shopId)
      .maybeSingle();

    if (existing) {
      router.push(`/messages/${existing.id}`);
    } else {
      const { data: newRoom } = await supabase
        .from('chat_rooms')
        .insert({ user_id: session.user.id, shop_id: shopId })
        .select()
        .single();

      if (newRoom) {
        router.push(`/messages/${newRoom.id}`);
      }
    }
  };

  return (
    <button onClick={handleClick} className="bg-gray-700 text-white px-3 py-2 rounded mt-2">
      💬 ทักข้อความร้านนี้
    </button>
  );
}

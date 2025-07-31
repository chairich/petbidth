'use client';

import { useEffect, useState } from 'react';
import ChatPopup from '@/components/classifieds/ChatPopup';
import supabase from "@/lib/supabaseClient2";

type User = {
  id: string;
  name: string;
  avatar_url: string;
};

type Message = {
  id: string;
  content: string;
  inserted_at: string;
  sender_id: string;
  receiver_id: string;
  sender: User[] | null;
  receiver: User[] | null;
};

type Conversation = {
  id: string;
  name: string;
  avatar_url: string;
  last_message: string;
  last_time: string;
};

export default function MessagePage({ params }: { params: { id: string } }) {
  const userId = String(params.id);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<Conversation | null>(null);
  const [userRole, setUserRole] = useState<string>('user');

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
      if (data?.role) {
        setUserRole(data.role);
      }
    };
    fetchUserRole();
  }, [userId]);

  useEffect(() => {
    const fetchConversations = async () => {
      const result = await supabase
        .from('messages')
        .select(`
          id,
          content,
          inserted_at,
          sender_id,
          receiver_id,
          sender:users!sender_id(id,name,avatar_url),
          receiver:users!receiver_id(id,name,avatar_url)
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('inserted_at', { ascending: false });

      if (!result.data || result.error) return;

      const typedData = result.data as Message[];

      const partnerMap = new Map<string, Conversation>();
      for (const msg of typedData) {
        const partner = msg.sender_id === userId ? msg.receiver?.[0] : msg.sender?.[0];
        if (partner?.id && !partnerMap.has(partner.id)) {
          partnerMap.set(partner.id, {
            id: partner.id,
            name: partner.name,
            avatar_url: partner.avatar_url,
            last_message: msg.content,
            last_time: msg.inserted_at,
          });
        }
      }

      setConversations(Array.from(partnerMap.values()));
    };

    fetchConversations();
  }, [userId]);

  return (
    <div className="p-4 text-white">
      <h1 className="text-xl mb-4">📩 กล่องข้อความ</h1>

      {conversations.length === 0 && <p>ไม่มีข้อความ</p>}

      <div className="space-y-3">
        {conversations.map((c) => (
          <div key={c.id} className="bg-gray-800 p-3 rounded shadow flex justify-between items-center">
            <div>
              <div className="text-lg">{c.name}</div>
              <div className="text-sm text-gray-400">{c.last_message}</div>
            </div>
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded"
              onClick={() => setSelectedUser(c)}
            >
              แชท
            </button>
          </div>
        ))}
      </div>

      {selectedUser !== null && (
        <ChatPopup
          userId={userId}
          receiverId={selectedUser.id}
          receiverName={selectedUser.name}
          userRole={userRole}
          allowReply={true} // กรณีนี้ให้แชทได้ทุกคน เพราะมีประวัติ
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}

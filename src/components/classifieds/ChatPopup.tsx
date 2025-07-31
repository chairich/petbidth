'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

interface ChatPopupProps {
  userId: string;
  receiverId: string;
  receiverName: string;
  userRole: string | null;
  onClose: () => void;
  allowReply?: boolean;
}

export default function ChatPopup({ userId, receiverId, receiverName, userRole, onClose, allowReply }: ChatPopupProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const markMessagesAsRead = async () => {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('receiver_id', userId)
      .eq('is_read', false);
  };

  const loadMessages = async () => {
    if (!userId || !receiverId) return;
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:users!sender_id(id,name), receiver:users!receiver_id(id,name)')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }
    setMessages((data || []).reverse());
    await markMessagesAsRead();
    window.dispatchEvent(new Event('refresh-unread-count'));
  };

  useEffect(() => {
    loadMessages();
  }, [userId, receiverId]);

  useEffect(() => {
    const handleOpen = () => {
      markMessagesAsRead();
      window.dispatchEvent(new Event('refresh-unread-count'));
    };
    window.addEventListener('open-chat-popup', handleOpen);
    return () => window.removeEventListener('open-chat-popup', handleOpen);
  }, [userId]);

  useEffect(() => {
    const channel = supabase
      .channel('realtime:chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`
      }, async (payload) => {
        if (payload.new.sender_id === receiverId) {
          await loadMessages();
          toast('📩 ข้อความใหม่เข้ามา');
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, receiverId]);

  const sendMessage = async () => {
    if (!receiverId) {
      toast.error('กรุณาเลือกผู้รับก่อนส่งข้อความ');
      return;
    }
    if (!input.trim()) {
      toast.error('กรุณาพิมพ์ข้อความก่อนส่ง');
      return;
    }
    if (userRole === 'user' && !allowReply) {
      toast.error('คุณไม่มีสิทธิ์เริ่มต้นการสนทนา');
      return;
    }

    const { error } = await supabase.from('messages').insert({
      sender_id: userId,
      receiver_id: receiverId,
      content: input.trim(),
      is_read: false,
    });

    if (error) {
      toast.error('ส่งข้อความไม่สำเร็จ');
      console.error('sendMessage error:', error);
      return;
    }

    setInput('');
    await loadMessages();
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const deleteReadMessages = async () => {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('receiver_id', userId)
      .eq('sender_id', receiverId)
      .eq('is_read', true);

    if (error) {
      toast.error('ลบข้อความไม่สำเร็จ');
      console.error('Delete error:', error);
    } else {
      toast.success('ลบข้อความที่อ่านแล้วแล้ว');
      await loadMessages();
    }
  };

  return (
    <div
      id="chat-popup" style={{ backgroundColor: "#1e293b", color: "white" }}
      className="fixed bottom-4 right-4 sm:top-20 sm:bottom-auto w-96 max-w-full bg-gray-900 text-white shadow-2xl rounded-3xl z-50 flex flex-col border border-gray-500"
    >
      <div
        className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-4 rounded-t-3xl flex justify-between items-center shadow"
        onDoubleClick={onClose}
        title="ดับเบิลคลิกเพื่อปิดแชท"
      >
        <span className="font-semibold text-lg">💬 แชทกับ {receiverName}</span>
        <button
          onClick={onClose}
          className="text-white text-2xl font-bold leading-none hover:text-red-300 focus:outline-none"
          aria-label="Close chat popup"
        >
          &times;
        </button>
      </div>

      <div className="p-4 overflow-y-auto flex-1 max-h-[60vh] space-y-3" style={{ backgroundColor: "#1e293b", color: "white" }}>
        {messages.length === 0 ? (
          <div className="text-center text-gray-500">ยังไม่มีข้อความ</div>
        ) : (
          messages.map((msg, i) => {
            const isMine = msg?.sender_id === userId;
            return (
              <div
                key={msg.id || i}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-3`}
              >
                <div className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-md text-sm leading-relaxed ${
      isMine
        ? 'bg-blue-500 text-white border border-blue-600'
        : 'bg-gray-700 text-white'
    }`}>
                  <div className="text-xs text-gray-400 mb-1">
                    {isMine ? 'คุณ' : msg.sender?.name || 'ไม่ระบุ'} ➜ {msg.receiver?.name || 'ไม่ระบุ'}
                  </div>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t bg-white space-y-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          placeholder="พิมพ์ข้อความ..."
        />
        <div className="flex space-x-2">
          <button
            onClick={sendMessage}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-black font-bold px-4 py-2 rounded-xl hover:from-blue-700 hover:to-blue-600 shadow-md"
          >
            🚀 ส่งข้อความ
          </button>
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-red-500 to-red-400 text-black font-bold px-4 py-2 rounded-xl hover:from-red-600 hover:to-red-500 shadow-md"
          >
            ❌ ปิด
          </button>
        </div>
        <button
          onClick={deleteReadMessages}
          className="w-full bg-gradient-to-r from-gray-200 to-gray-50 text-gray-800 px-4 py-2 rounded-xl hover:from-gray-300 hover:to-gray-200 font-semibold shadow-sm"
        >
          🗑 ลบข้อความ
        </button>
      </div>
    </div>
  );
}

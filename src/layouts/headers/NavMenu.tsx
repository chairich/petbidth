'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import menu_data from "./MenuData";
import Cookies from "js-cookie";
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';
import ChatPopup from '@/components/classifieds/ChatPopup';

const NavMenu = () => {
  const [userSession, setUserSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasAdminNotification, setHasAdminNotification] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);
  const [showChat, setShowChat] = useState(false);
  const [openChatPopup, setOpenChatPopup] = useState(false);
  const [receiverId, setReceiverId] = useState<string | null>(null);
  const [receiverName, setReceiverName] = useState<string>('');
  const [userList, setUserList] = useState<{ id: string; name: string }[]>([]);
  const [hasMessageHistory, setHasMessageHistory] = useState(false);
  const [pendingSenderId, setPendingSenderId] = useState<string | null>(null);
  const [pendingSenderName, setPendingSenderName] = useState<string>('');

  const playSound = () => {
    const audio = new Audio('/notify.mp3');
    audio.play().catch(err => console.log("ไม่สามารถเล่นเสียง:", err));
  };

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user || null;
      setUserSession(user);

      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        setUserRole(userData?.role || null);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!userSession?.id) return;
      const { data } = await supabase
        .from('users')
        .select('id, name')
        .neq('id', userSession.id);
      setUserList(data || []);
    };
    fetchUsers();
  }, [userSession]);

  const refreshUnreadCount = async () => {
    if (!userSession?.id) return;
    const { count } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('receiver_id', userSession.id)
      .filter('is_read', 'eq', false);
    setUnreadMessagesCount(count || 0);
  };

  useEffect(() => {
    refreshUnreadCount();
  }, [userSession]);

  const openChat = () => {
    setShowChat(true);
    setOpenChatPopup(true);
    setUnreadMessagesCount(0);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setOpenChatPopup(false);
  };

  useEffect(() => {
    const checkNotifications = async () => {
      if (userRole === 'admin' || userRole === 'vip') {
        const { count } = await supabase
          .from('shop_reviews')
          .select('id', { count: 'exact' })
          .filter('is_read', 'eq', false);
        if ((count || 0) > 0) setHasAdminNotification(true);
      }
    };

    const checkMessages = async () => {
      if (userSession?.id) {
        const { data, count } = await supabase
          .from('messages')
          .select('*, sender:users!sender_id(id,name)', { count: 'exact' })
          .eq('receiver_id', userSession.id)
          .filter('is_read', 'eq', false);

        if (count && data?.length > 0) {
          const senderId = data[0]?.sender?.id;
          const senderName = data[0]?.sender?.name || 'ใครบางคน';
          setUnreadMessagesCount(count);
          playSound();

          toast.custom((t) => (
            <div
              onClick={() => {
                setReceiverId(senderId);
                setReceiverName(senderName);
                toast.dismiss(t.id);
                openChat();
              }}
              style={{
                cursor: 'pointer',
                padding: '10px',
                background: '#1e293b',
                color: '#fff',
                borderRadius: '10px',
                fontWeight: 'bold',
              }}
            >
              📬 ข้อความใหม่จาก {senderName}
            </div>
          ));
        }
      }
    };

    if (userSession?.id) {
      checkNotifications();
      checkMessages();
    }
  }, [userSession?.id, userRole]);

  useEffect(() => {
    if (!userSession?.id) return;

    const channel = supabase
      .channel('realtime:messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userSession.id}`
      }, async (payload) => {
        if (payload.new.is_read) return;

        const { sender_id } = payload.new;
        const { data: senderData } = await supabase
          .from('users')
          .select('name')
          .eq('id', sender_id)
          .single();

        const senderName = senderData?.name || 'ใครบางคน';
        playSound();
        setUnreadMessagesCount(prev => prev + 1);

        toast.custom((t) => (
          <div
            onClick={() => {
              setReceiverId(sender_id);
              setReceiverName(senderName);
              toast.dismiss(t.id);
              openChat();
            }}
            style={{
              cursor: 'pointer',
              padding: '10px',
              background: '#1e293b',
              color: '#fff',
              borderRadius: '10px',
              fontWeight: 'bold',
            }}
          >
            📬 ข้อความใหม่จาก {senderName}
          </div>
        ));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userSession]);

  useEffect(() => {
    return () => {
      window.removeEventListener('open-chat-popup', openChat);
      window.removeEventListener('refresh-unread-count', refreshUnreadCount);
    };
  }, [userSession]);

  useEffect(() => {
    const checkHistory = async () => {
      if (!userSession?.id || !receiverId) return;

      const condition1 = `sender_id.eq.${receiverId},receiver_id.eq.${userSession.id}`;
      const condition2 = `sender_id.eq.${userSession.id},receiver_id.eq.${receiverId}`;

      const { data } = await supabase
        .from('messages')
        .select('id')
        .or(`${condition1};${condition2}`)
        .limit(1);

      setHasMessageHistory(Array.isArray(data) && data.length > 0);
    };

    checkHistory();
  }, [userSession, receiverId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    Cookies.remove("session");
    window.location.href = "/";
  };

  return (
    <>
      <ul className="navbar-nav navbar-nav-scroll my-2 my-lg-0">
        {menu_data.map((item, i) => (
          <li key={i}>
            <Link href={item.link}>{item.title}</Link>
          </li>
        ))}

        {userRole === 'admin' && (
          <li className="ft-dd">
            <span>
              ⚙ เมนูแอดมิน{' '}
              {hasAdminNotification && <span style={{ color: 'red' }}>●</span>}
            </span>
            <ul className="ft-dd-menu">
              <li><Link href="/admin/auctions">📢 จัดการประมูล</Link></li>
              <li><Link href="/vip-shop/edit-shop/">🏷 จัดการแบนเนอร์</Link></li>
              <li><Link href="/knowledge/admin">🧠 โพสต์บทความ</Link></li>
              <li><Link href="/admin/users">📝 จัดการผู้ใช้</Link></li>
            </ul>
          </li>
        )}

        {userRole === 'vip' && (
          <li className="ft-dd">
            <span>
              🏅 เมนู VIP{' '}
              {hasAdminNotification && <span style={{ color: 'orange' }}>●</span>}
            </span>
            <ul className="ft-dd-menu">
              <li><Link href={`/vip-shop/edit-shop/${userSession?.id}`}>✏️ แก้ไขร้านค้า</Link></li>
              <li><Link href="/vip-shop/create-shop">🏗️ สร้างร้านค้าใหม่</Link></li>
            </ul>
          </li>
        )}

        {userSession?.id && (userRole === "admin" || userRole === "vip") && (
          <li>
            <span>💬 แชท</span>
            <select
              value={receiverId || ''}
              onChange={(e) => {
                const selected = userList.find((u) => u.id === e.target.value);
                setReceiverId(selected?.id || null);
                setReceiverName(selected?.name || '');
                setShowChat(true);
                setOpenChatPopup(true);
              }}
            >
              <option value="">เลือกผู้รับ</option>
              {userList.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </li>
        )}

        {userSession?.id ? (
          <>
            <li><Link href="/profile">🛠 แก้ไขโปรไฟล์</Link></li>
            <li><Link href="/games/LotteryBoard">🆕 รวมเล่นเกมส์</Link></li>
            <li>
            <button onClick={handleLogout} className="btn btn-link nav-link p-0">
              🚪 ออกจากระบบ
            </button>
          </li>
          </>
        ) : (
          <>
            <li><Link href="/login">🔐 เข้าสู่ระบบ</Link></li>
            <li><Link href="/">🆕 สมัครสมาชิก</Link></li>
          </>
        )}
      </ul>

      {userSession?.id && (receiverId || pendingSenderId) && (receiverName || pendingSenderName) && showChat && openChatPopup && (
        <ChatPopup
          userId={userSession.id}
          receiverId={String(receiverId || pendingSenderId)}
          receiverName={receiverName || pendingSenderName || ''}
          userRole={userRole}
          allowReply={userRole !== 'user' || hasMessageHistory}
          onClose={() => {
            handleCloseChat();
            setPendingSenderId(null);
            setPendingSenderName('');
          }}
        />
      )}
    </>
  );
};

export default NavMenu;

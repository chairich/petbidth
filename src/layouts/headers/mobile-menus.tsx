'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import menu_data from "./MenuData";
import Cookies from "js-cookie";
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';
import ChatPopup from '@/components/classifieds/ChatPopup';

const MobileMenus = ({ setOpenMenu, openMenu }: any) => {
  const [navTitle, setNavTitle] = useState("");
  const [navTitle2, setNavTitle2] = useState("");
  const [userSession, setUserSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [openChatPopup, setOpenChatPopup] = useState(false);
  const [receiverId, setReceiverId] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [userList, setUserList] = useState<{ id: string; name: string }[]>([]);

  const [pendingSenderId, setPendingSenderId] = useState<string | null>(null);
  const [pendingSenderName, setPendingSenderName] = useState<string>('');
  const [showChat, setShowChat] = useState<boolean>(false);
  const [hasMessageHistory, setHasMessageHistory] = useState<boolean>(false);

  const handleCloseChat = () => {
    setShowChat(false);
    setOpenChatPopup(false);
  };

  useEffect(() => {
    const fetchSessionAndRole = async () => {
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
    fetchSessionAndRole();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from("users").select("id, name");
      if (data) setUserList(data);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const matchedUser = userList.find(user => user.name === receiverName);
    if (matchedUser) {
      setReceiverId(matchedUser.id);
    }
  }, [receiverName]);

  useEffect(() => {
    const fetchUnread = async () => {
      if (!userSession?.id) return;
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact" })
        .eq("receiver_id", userSession.id)
        .eq("is_read", false);
      setUnreadMessagesCount(count || 0);
    };

    fetchUnread();
    window.addEventListener("refresh-unread-count", fetchUnread);
    return () => window.removeEventListener("refresh-unread-count", fetchUnread);
  }, [userSession]);

  useEffect(() => {
    const checkMessageHistory = async () => {
      if (!userSession?.id || !receiverId) return;
      const { data } = await supabase
        .from("messages")
        .select("id")
        .or(`sender_id.eq.${receiverId},receiver_id.eq.${receiverId}`)
        .limit(1);

      setHasMessageHistory(!!data?.length);
    };

    checkMessageHistory();
  }, [receiverId, userSession]);

  useEffect(() => {
    const handleOpenMessage = (event: any) => {
      const { senderId, senderName } = event.detail;
      if (senderId && senderName) {
        setReceiverId(senderId);
        setReceiverName(senderName);
        setPendingSenderId(senderId);
        setPendingSenderName(senderName);
        setShowChat(true);
        setOpenChatPopup(true);
      }
    };

    window.addEventListener("open-message-from-notification", handleOpenMessage);
    return () => {
      window.removeEventListener("open-message-from-notification", handleOpenMessage);
    };
  }, []);

  const toggleDropdown = (menu: string, level: 1 | 2) => {
    if (level === 1) {
      setNavTitle(navTitle === menu ? "" : menu);
    } else {
      setNavTitle2(navTitle2 === menu ? "" : menu);
    }
  };

  return (
    <>
      <div className={`navbar-collapse collapse ${openMenu ? "show" : ""} bg-black text-white`} id="funtoNav">
        <ul className="navbar-nav navbar-nav-scroll my-2 my-lg-0 px-4 py-3 space-y-2">
          {menu_data.map((item, i) => (
            <li key={i} className={item.has_dropdown ? "ft-dd" : ""} onClick={() => toggleDropdown(item.title, 1)}>
              <Link href={item.link} className="block py-2 px-3 rounded hover:bg-black transition-all duration-150">
                {item.title}
              </Link>
              {item.has_dropdown && (
                <>
                  <div className="dropdown-toggler"><i className="bi bi-caret-down-fill"></i></div>
                  <ul className="ft-dd-menu bg-black text-white rounded-md shadow-md" style={{ display: navTitle === item.title ? "block" : "none" }}>
                    {item.sub_menus?.map((sub_item, index) => (
                      <li key={index} className={sub_item.inner_has_dropdown ? "ft-dd" : ""} onClick={() => toggleDropdown(sub_item.title, 2)}>
                        <Link href={sub_item.link} className="block px-3 py-2 hover:bg-black rounded">
                          {sub_item.title}
                        </Link>
                        {sub_item.inner_has_dropdown && (
                          <>
                            <div className="dropdown-toggler"><i className="bi bi-caret-down-fill"></i></div>
                            <ul className="ft-dd-menu bg-black rounded" style={{ display: navTitle2 === sub_item.title ? "block" : "none" }}>
                              {sub_item.inner_sub?.map((inner_sub, sub_index) => (
                                <li key={sub_index}><Link href={inner_sub.link} className="block px-3 py-1 hover:bg-gray-600 rounded">{inner_sub.title}</Link></li>
                              ))}
                            </ul>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </li>
          ))}

          {userSession?.id ? (
            <>
              <li className="pt-2">
                <span className="ps-2">💬 ข้อความ</span>
                {userRole !== 'user' && (
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => {
                      setReceiverName(e.target.value);
                      const matched = userList.find(u => u.name === e.target.value);
                      setReceiverId(matched?.id || "");
                    }}
                    placeholder="พิมพ์ชื่อผู้รับ..."
                    className="mt-1 border border-gray-500 bg-dark text-white rounded px-3 py-1 w-full"
                    onFocus={() => {
                      setShowChat(true);
                      setOpenChatPopup(true);
                    }}
                  />
                )}
                {unreadMessagesCount > 0 && (
                  <span className="text-yellow-300 ms-2">🔔 {unreadMessagesCount}</span>
                )}
              </li>

              {userRole === "admin" && (
                <li className="ft-dd" onClick={() => toggleDropdown("⚙ เมนูแอดมิน", 1)}>
                  <span className="ps-2">⚙ เมนูแอดมิน</span>
                  <ul className="ft-dd-menu bg-gray-800 rounded shadow-md" style={{ display: navTitle === "⚙ เมนูแอดมิน" ? "block" : "none" }}>
                    <li><Link href="/admin/auctions">📢 จัดการประมูล</Link></li>
                    <li><Link href="/admin/banner">🏷 จัดการแบนเนอร์</Link></li>
                     <li><Link href="/admin/blogs/new">🧠 โพสต์บทความ</Link></li>
                    <li><Link href="/admin/users">📝 จัดการผู้ใช้</Link></li>
                    <li><Link href="/auction-list">📝 จัดการฝากประมูล</Link></li>
                  </ul>
                </li>
              )}

              {userRole === "vip" && (
                <li className="ft-dd" onClick={() => toggleDropdown("🏅 เมนู VIP", 1)}>
                  <span className="ps-2">🏅 เมนู VIP</span>
                  <ul className="ft-dd-menu bg-gray-800 rounded shadow-md" style={{ display: navTitle === "🏅 เมนู VIP" ? "block" : "none" }}>
                    <li><Link href="/vip-shop/edit-shop">🖌 แก้ไขแบนเนอร์ร้านค้า</Link></li>
                    <li><Link href="/vip-shop/create-shop">🏗 สร้างร้านค้าใหม่</Link></li>
                  </ul>
                </li>
              )}

              <li><Link href="/profile">🛠 แก้ไขโปรไฟล์</Link></li>
              <li><Link href="/games/LotteryBoard">🆕 เช็คผลเล่นเกมส์</Link></li>
              <li>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    Cookies.remove("session");
                    window.location.href = "/";
                  }}
                  className="btn btn-link nav-link text-left ps-2 text-red-400 hover:underline"
                >
                  🚪 ออกจากระบบ
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link href="/register">🆕 สมัครสมาชิก</Link></li>
              <li><Link href="/login">🔐 เข้าสู่ระบบ</Link></li>
            </>
          )}
        </ul>
      </div>

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

export default MobileMenus;

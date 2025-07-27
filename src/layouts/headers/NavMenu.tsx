'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import menu_data from "./MenuData";
import Cookies from "js-cookie";
import { supabase } from '@/lib/supabaseClient';

const NavMenu = () => {
  const [userSession, setUserSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasAdminNotification, setHasAdminNotification] = useState(false);

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
    const checkNotifications = async () => {
      if (userRole === 'admin' || userRole === 'vip') {
        const { data } = await supabase
          .from('shop_reviews')
          .select('id', { count: 'exact', head: true })
          .eq('is_read', false);
        if ((data?.length || 0) > 0) {
          setHasAdminNotification(true);
        }
      }
    };
    checkNotifications();
  }, [userRole]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    Cookies.remove("session");
    window.location.href = "/";
  };

  return (
    <ul className="navbar-nav navbar-nav-scroll my-2 my-lg-0">
      {menu_data.map((item, i) => (
        <li key={i} className={item.has_dropdown ? "ft-dd" : ""}>
          <Link href={item.link}>{item.title}</Link>
          {item.has_dropdown && (
            <ul className="ft-dd-menu">
              {item.sub_menus?.map((sub_item, index) => (
                <li key={index} className={sub_item.inner_has_dropdown ? "ft-dd" : ""}>
                  <Link href={sub_item.link}>{sub_item.title}</Link>
                  {sub_item.inner_has_dropdown && (
                    <ul className="ft-dd-menu">
                      {sub_item.inner_sub?.map((inner_sub, inner_index) => (
                        <li key={inner_index}>
                          <Link href={inner_sub.link}>{inner_sub.title}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}

      {userSession?.id ? (
        <>
          {userRole === 'admin' && (
            <li className="ft-dd">
              <span>
                ⚙ เมนูแอดมิน{" "}
                {hasAdminNotification && <span style={{ color: "red" }}>●</span>}
              </span>
              <ul className="ft-dd-menu">
                <li><Link href="/admin/auctions">📢 จัดการประมูล</Link></li>
                <li><Link href="/admin/banner">🏷 จัดการแบนเนอร์</Link></li>
                <li><Link href="/knowledge/admin">🧠 โพสต์บทความ</Link></li>
                <li><Link href="/admin/users">📝 จัดการผู้ใช้</Link></li>
              </ul>
            </li>
          )}
          {userRole === 'vip' && (
            <li className="ft-dd">
              <span>
                🏅 เมนู VIP{" "}
                {hasAdminNotification && <span style={{ color: "orange" }}>●</span>}
              </span>
              <ul className="ft-dd-menu">
                <li><Link href="/vip-shop/edit-shop">✏️ แก้ไขแบนเนอร์ร้านค้า</Link></li>
                <li><Link href="/vip-shop/create-shop">🏗️ สร้างร้านค้าใหม่</Link></li>
              </ul>
            </li>
          )}
          <li><Link href="/profile">🛠 แก้ไขโปรไฟล์</Link></li>
          <li>
            <button onClick={handleLogout} className="btn btn-link nav-link p-0">
              🚪 ออกจากระบบ
            </button>
          </li>
        </>
      ) : (
        <>
          <li><Link href="/">🆕 สมัครสมาชิก</Link></li>
          <li><Link href="/login">🔐 เข้าสู่ระบบ</Link></li>
        </>
      )}
    </ul>
  );
};

export default NavMenu;

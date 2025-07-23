'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import menu_data from './MenuData'
import { supabase } from '@/lib/supabaseClient'
import Cookies from 'js-cookie'

const MobileMenus = ({ setOpenMenu, openMenu }: any) => {
  const [navTitle, setNavTitle] = useState('')
  const [navTitle2, setNavTitle2] = useState('')
  const [userSession, setUserSession] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const fetchSessionAndRole = async () => {
      const { data } = await supabase.auth.getSession()
      const user = data?.session?.user || null
      setUserSession(user)

      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        setUserRole(userData?.role || null)
      }
    }
    fetchSessionAndRole()
  }, [])

  const openMobileMenu = (menu: string) => {
    setNavTitle((prev) => (prev === menu ? '' : menu))
  }

  const openMobileMenu2 = (menu: string) => {
    setNavTitle2((prev) => (prev === menu ? '' : menu))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    Cookies.remove('session')
    window.location.href = '/'
  }

  return (
    <div className={`navbar-collapse collapse ${openMenu ? 'show' : ''}`} id="funtoNav">
      <ul className="navbar-nav navbar-nav-scroll my-2 my-lg-0">
        {menu_data.map((item, i) => (
          <li key={i} className={`${item.has_dropdown ? 'ft-dd' : ''}`} onClick={() => openMobileMenu(item.title)}>
            <Link href={item.link}>{item.title}</Link>
            {item.has_dropdown && (
              <>
                <div className="dropdown-toggler">
                  <i className="bi bi-caret-down-fill"></i>
                </div>
                <ul className="ft-dd-menu" style={{ display: navTitle === item.title ? 'block' : 'none' }}>
                  {item.sub_menus?.map((submenu, index) => (
                    <li
                      key={index}
                      className={`${submenu.inner_has_dropdown ? 'ft-dd' : ''}`}
                      onClick={() => openMobileMenu2(submenu.title)}
                    >
                      <Link href={submenu.link}>{submenu.title}</Link>
                      {submenu.inner_has_dropdown && (
                        <>
                          <div className="dropdown-toggler">
                            <i className="bi bi-caret-down-fill"></i>
                          </div>
                          <ul className="ft-dd-menu" style={{ display: navTitle2 === submenu.title ? 'block' : 'none' }}>
                            {submenu.inner_sub?.map((sub_item, sub_index) => (
                              <li key={sub_index}>
                                <Link href={sub_item.link}>{sub_item.title}</Link>
                              </li>
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

        {/* เมนูที่ต้อง login ก่อนจะแสดง */}
        {userSession?.id && (
          <>
            <li><Link href="/forum/new">📝 โพสต์กระทู้</Link></li>

            {userRole === 'admin' && (
              <>
                <li><Link href="/admin/post-auction">📢 โพสต์ประมูล</Link></li>
                <li><Link href="/admin/banner">🏷 จัดการแบนเนอร์</Link></li>
                <li><Link href="/knowledge/admin">🧠 โพสต์บทความ</Link></li>
              </>
            )}

            {userRole === 'vip' && (
              <>
                <li><Link href="/vip-shop/edit-shop">🖌 แก้ไขแบนเนอร์ร้านค้า</Link></li>
                <li><Link href="/vip-shop/create-shop">🏗 สร้างร้านค้าใหม่</Link></li>
              </>
            )}

            <li><Link href="/profile">🛠 แก้ไขโปรไฟล์</Link></li>
            <li>
              <button onClick={handleLogout} className="btn btn-link nav-link p-0">
                🚪 ออกจากระบบ
              </button>
            </li>
          </>
        )}

        {!userSession?.id && (
          <>
            <li><Link href="/login">🔐 เข้าสู่ระบบ</Link></li>
            <li><Link href="/">🆕 สมัครสมาชิก</Link></li>
          </>
        )}
      </ul>
    </div>
  )
}

export default MobileMenus

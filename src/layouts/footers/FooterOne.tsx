"use client";
import Link from "next/link";
import useOnlineStatus from "@/hooks/useOnlineStatus";
import useTrackVisitor from "@/hooks/useTrackVisitor";
import { useUser } from "@supabase/auth-helpers-react";
import React, { useEffect, useState } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from "next/image";

type NewsItem = {
  id: string;
  title: string;
  images: string[];
  cover_image_index: number;
  created_at: string;
};

const FooterOne = () => {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  const supabase = createClientComponentClient();
  const user = useUser();

  useOnlineStatus();
  useTrackVisitor();

  useEffect(() => {
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from('store_news')
        .select('id, title, images, cover_image_index, created_at')
        .order('created_at', { ascending: false })
        .limit(1);
      if (!error) setNewsList(data || []);
    };

    const fetchOnlineUsers = async () => {
      const since = new Date(Date.now() - 2 * 60 * 1000).toISOString();

      const { count, error } = await supabase
        .from('page_views')
        .select('ip_address', { count: 'exact', head: true })
        .gt('viewed_at', since);
      if (!error) setOnlineCount(count ?? 0);

      const { data: usersOnline } = await supabase
        .from('users')
        .select('id, name, avatar_url, last_seen')
        .gt('last_seen', since);
      setOnlineUsers(usersOnline ?? []);
    };

    const fetchRole = async () => {
      if (user?.id) {
        const { data } = await supabase.from("users").select("role").eq("id", user.id).single();
        setUserRole(data?.role || null);
      }
    };

    fetchNews();
    fetchOnlineUsers();
    fetchRole();

    const interval = setInterval(fetchOnlineUsers, 60000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <footer className="footer-area pb-5 pt-120" style={{ backgroundImage: `url(/assets/img/bg-img/1.jpg)` }}>
      <img className="footer-bg-shape" src="/assets/img/core-img/shape1.png" alt="" />
      <div className="container">
        <div className="row">
          <div className="col-12 col-lg-5">
            <div className="footer-widget-area mb-70 pe-lg-4 pe-xl-5 me-lg-4 me-xl-5 border-end">
              <Link className="d-block mb-4" href="/">
                <img className="light-logo" src="/assets/img/core-img/logo.png" alt="" />
                <img className="dark-logo" src="/assets/img/core-img/logo-white.png" alt="" />
              </Link>
              <p>แพลตฟอร์มแห่งความหวัง...ที่ซึ่งปีกแห่งรักโบยบินสู่บ้านใหม่.</p>
              <p className="mb-0">โทร: 091 7030 732 <br /> อีเมล: tadadon2507@gmail.com</p>

              <h5 className="mt-4 mb-3">เข้าร่วมชุมชนเรา</h5>
              <div className="footer-social-icon d-flex align-items-center flex-wrap">
                <a href="https://facebook.com" target="_blank"><img src="/assets/img/core-img/icons8-facebook.svg" alt="" /></a>
                <a href="https://twitter.com" target="_blank"><img src="/assets/img/core-img/icons8-twitter.svg" alt="" /></a>
                <a href="https://instagram.com" target="_blank"><img src="/assets/img/core-img/icons8-instagram.svg" alt="" /></a>
                <a href="https://slack.com" target="_blank"><img src="/assets/img/core-img/icons8-slack.svg" alt="" /></a>
                <a href="https://youtube.com" target="_blank"><img src="/assets/img/core-img/icons8-player.svg" alt="" /></a>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-7">
            <div className="footer-widget-area mb-70">
              <h5 className="mb-4 text-white">ข่าวสารจากร้าน 🕊</h5>
              {newsList.map((news) => (
                <div key={news.id} className="bg-white text-black rounded shadow-sm overflow-hidden">
                  {news.images?.length > 0 && (
                    <Image
                      src={news.images[news.cover_image_index || 0]}
                      alt={news.title}
                      width={400}
                      height={150}
                      className="w-full h-[150px] object-cover"
                    />
                  )}
                  <div className="p-3">
                    <h6 className="fw-bold mb-1">{news.title}</h6>
                    <p className="text-muted mb-1 text-sm">
                      🗓 {new Date(news.created_at).toLocaleDateString("th-TH", { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                    <Link href={`/news/${news.id}`} className="text-primary text-sm hover:underline">
                      อ่านต่อ →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-4 text-light">
          👥 ขณะนี้มีผู้ใช้งานออนไลน์ <strong>{onlineCount}</strong> คน
        </div>

        {userRole === 'admin' && onlineUsers.length > 0 && (
          <div className="container mt-3">
            <div className="row row-cols-2 row-cols-md-3 g-3 justify-content-center">
              {onlineUsers.map(user => (
                <div key={user.id} className="col">
                  <div className="bg-transparent text-light rounded d-flex align-items-center gap-2 px-3 py-2 shadow-sm">
                    <img
                      src={user.avatar_url || '/assets/img/core-img/avatar-placeholder.png'}
                      alt={user.name || user.username}
                      width={32}
                      height={32}
                      className="rounded-circle"
                    />
                    <span>
                      @{user.name?.trim() || "ไม่ระบุชื่อ"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-top mt-4 pt-4 d-flex flex-column flex-md-row justify-content-between align-items-center text-center">
          <div className="text-sm text-gray-400 mb-2 mb-md-0">
            {new Date().getFullYear()} © All rights reserved by{" "}
            <a href="https://petbidthai.com" className="text-white fw-semibold" target="_blank" rel="noopener noreferrer">
              petBIDthai.com
            </a>
          </div>
          <div className="text-sm text-gray-400">
            <Link href="/privacy" className="me-3">นโยบายความเป็นส่วนตัว</Link>
            <Link href="/terms">ข้อกำหนด & เงื่อนไข</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterOne;

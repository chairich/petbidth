"use client";
import Link from "next/link";
import useOnlineStatus from "@/hooks/useOnlineStatus";
import useTrackVisitor from "@/hooks/useTrackVisitor";
import { useUser } from "@supabase/auth-helpers-react"; // หรือดึงจาก session
import React, { useEffect, useState } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from "next/image";

type NewsItem = {
  id: string;
  title: string;
  image_url: string;
  created_at: string;
};

const FooterOne = () => {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const supabase = createClientComponentClient();
const user = useUser();

  useOnlineStatus(); // ✅ เรียกตรงนี้ — เพื่อให้ footer ใช้ hook นี้ทุกครั้งที่โหลด
  useTrackVisitor(); // ✅ บันทึกผู้เข้าชมทุกคน
  useEffect(() => {
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from('store_news')
        .select('id, title, image_url, created_at')
        .order('created_at', { ascending: false })
        .limit(2);

      if (error) {
        console.error("Error fetching news:", error);
      } else {
        setNewsList(data || []);
      }
    };

    const fetchOnlineUsers = async () => {
      try {
        const since = new Date(Date.now() - 2 * 60 * 1000).toISOString(); // 2 นาที
        const { count, error } = await supabase
          .from('page_views')
          .select('ip_address', { count: 'exact', head: true })
          .gt('viewed_at', since);


        if (error) {
          console.error("Error fetching online users:", error);
          return;
        }

        setOnlineCount(count ?? 0);
      } catch (err) {
        console.error("Unexpected error fetching online count:", err);
      }
    };

    fetchNews();
    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 60000); // รีเฟรชทุก 1 นาที
    return () => clearInterval(interval);
  }, []);

  return (
    <>
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
                  <a href="https://facebook.com" target="_blank" title="Facebook"><img src="/assets/img/core-img/icons8-facebook.svg" alt="" /></a>
                  <a href="https://twitter.com" target="_blank" title="Twitter"><img src="/assets/img/core-img/icons8-twitter.svg" alt="" /></a>
                  <a href="https://instagram.com" target="_blank" title="Instagram"><img src="/assets/img/core-img/icons8-instagram.svg" alt="" /></a>
                  <a href="https://slack.com" target="_blank" title="Slack"><img src="/assets/img/core-img/icons8-slack.svg" alt="" /></a>
                  <a href="https://youtube.com" target="_blank" title="Youtube"><img src="/assets/img/core-img/icons8-player.svg" alt="" /></a>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-7">
              <div className="footer-widget-area mb-70">
                <h5 className="mb-4 text-white">ข่าวสารจากร้าน 🕊</h5>
                <div className="row g-4">
                  {newsList.map((news) => (
                    <div key={news.id} className="col-6">
                      <div className="bg-white text-black rounded shadow-sm overflow-hidden h-100">
                        {news.image_url && (
                          <Image
                            src={news.image_url}
                            alt={news.title}
                            width={400}
                            height={150}
                            className="w-full h-[150px] object-cover"
                          />
                        )}
                        <div className="p-3">
                          <h6 className="fw-bold mb-1">{news.title}</h6>
                          <p className="text-muted mb-1 text-sm">
                            🗓 {new Date(news.created_at).toLocaleDateString("th-TH", {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                          <Link href={`/news/${news.id}`} className="text-primary text-sm hover:underline">
                            อ่านต่อ →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* แสดงจำนวนผู้ใช้งานออนไลน์ */}
          <div className="text-center mt-4 text-light">
            👥 ขณะนี้มีผู้ใช้งานออนไลน์ <strong>{onlineCount}</strong> คน
          </div>

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
    </>
  );
};

export default FooterOne;

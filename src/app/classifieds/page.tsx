"use client";
import React, { useEffect, useState } from "react";
import HeaderOne from "@/layouts/headers/HeaderOne";
import FooterOne from "@/layouts/footers/FooterOne";
import Divider from "@/components/common/Divider";
import Link from "next/link";
import supabase from "@/lib/supabaseClient2"; // ✅ เปลี่ยนตรงนี้
import { useUser } from "@supabase/auth-helpers-react";

type ClassifiedItem = {
  id: string;
  title?: string;
  price?: number;
  images?: string[];
  shop_banner_id?: string;
};

export default function ClassifiedsPage() {
  const [classifieds, setClassifieds] = useState<ClassifiedItem[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const user = useUser() ?? null;

  useEffect(() => {
    const fetchRoleAndData = async () => {
      if (user?.email) {
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("role")
          .eq("email", user.email)
          .single();

        if (profileError) console.error("Error fetching role:", profileError);
        setRole(profile?.role ?? null);
      }

      const { data: classifiedsData, error: classifiedsError } = await supabase
        .from("classifieds")
        .select("*")
        .order("created_at", { ascending: false });

      if (classifiedsError) console.error("Error fetching classifieds:", classifiedsError);
      setClassifieds(classifiedsData || []);
    };

    fetchRoleAndData();
  }, [user]);

  return (
    <>
      <HeaderOne />
      <Divider />
      <div className="container py-5 text-white">
        <h1 className="h3 fw-bold text-center mb-4">🛒 ตลาดซื้อขาย</h1>

        {/* ปุ่มเพิ่มรายการ */}
        <div className="text-center mb-4">
          {(role === "vip" || role === "admin") ? (
            <Link href="/classifieds/new" className="btn btn-success">
              ➕ เพิ่มรายการขาย
            </Link>
          ) : role !== null ? (
            <p className="text-warning">
              ต้องเป็นสมาชิก VIP ขึ้นไปจึงสามารถโพสต์ขายสินค้าได้
            </p>
          ) : (
            <p className="text-secondary">กำลังโหลดข้อมูลสมาชิก...</p>
          )}
        </div>

        <div className="row">
          {classifieds.map((item) => (
            <div className="col-md-6 col-lg-4 mb-4" key={item.id}>
              <div className="bg-dark rounded p-3 h-100 shadow-sm">
                <img
                  src={(item.images && item.images[0]) || "/no-image.jpg"}
                  alt={item.title || "image"}
                  className="img-fluid rounded mb-3"
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <h5>{item.title || "ไม่มีชื่อ"}</h5>
                <p className="text-success fw-bold">{item.price ?? "-"} บาท</p>
                <Link
                  href={`/classifieds/${item.id}`}
                  className="btn btn-primary w-100"
                >
                  ดูรายละเอียด
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Divider />
      <FooterOne />
    </>
  );
}

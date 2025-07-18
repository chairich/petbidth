"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function CallbackHandler() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      // ทำงาน เช่น ส่ง token ไป backend หรือลงทะเบียนผู้ใช้ ฯลฯ
      console.log("Token:", token);
    }
  }, [token]);

  return (
    <div>
      กำลังตรวจสอบ token...
    </div>
  );
}

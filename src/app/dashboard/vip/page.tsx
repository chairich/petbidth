
'use client'
import React from 'react';
import Link from 'next/link';

export default function VipDashboard() {
  return (
    <div className="container py-5">
      <h1>ยินดีต้อนรับ, ลูกค้า VIP</h1>
      <p>นี่คือแดชบอร์ดสำหรับลูกค้า VIP</p>
      <Link href="/create-new" className="btn btn-primary mt-3">สร้างประมูลใหม่</Link>
      {/* ใส่คอนเทนต์อื่น ๆ ได้ตามต้องการ */}
    </div>
  );
}

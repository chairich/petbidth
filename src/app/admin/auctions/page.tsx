'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import dayjs from 'dayjs';
import HeaderOne from '@/layouts/headers/HeaderOne';
import FooterOne from '@/layouts/footers/FooterOne';
import Breadcrumb from '@/components/common/Breadcrumb';
import Divider from '@/components/common/Divider';

const AdminAuctionDashboard = () => {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('auctions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setAuctions(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบโพสต์นี้?')) return;
    const { error } = await supabase.from('auctions').delete().eq('id', id);
    if (!error) {
      alert('ลบเรียบร้อยแล้ว');
      fetchAuctions();
    } else {
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  };

  return (
    <>
      <HeaderOne />
      <Breadcrumb title="จัดการกระทู้ประมูล" />
      <div className="container py-5 text-white">
        <h2 className="mb-4">🎯 จัดการกระทู้ประมูล</h2>

        <div className="mb-3 text-end">
          <Link href="/admin/auctions/post-auction">
            <button className="btn btn-success">➕ สร้างกระทู้ใหม่</button>
          </Link>
        </div>

        {loading ? (
          <p>กำลังโหลดข้อมูล...</p>
        ) : auctions.length === 0 ? (
          <p>ยังไม่มีกระทู้ประมูล</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-bordered align-middle">
              <thead>
                <tr>
                  <th>ชื่อโพสต์</th>
                  <th>ราคาเริ่มต้น</th>
                  <th>สถานะ</th>
                  <th>วันหมดเขต</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {auctions.map((a) => (
                  <tr key={a.id}>
                    <td>{a.title}</td>
                    <td>{a.start_price} บาท</td>
                    <td>{a.is_closed ? '⛔️ ปิด' : '✅ เปิด'}</td>
                    <td>{dayjs(a.end_time).format('D/M/YY HH:mm')}</td>
                    <td>
                      <Link href={`/admin/auctions/edit-auction/${a.id}`}>
                        <button className="btn btn-sm btn-warning me-2">✏️ แก้ไข</button>
                      </Link>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(a.id)}>
                        🗑️ ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Divider />
      <FooterOne />
    </>
  );
};

export default AdminAuctionDashboard;

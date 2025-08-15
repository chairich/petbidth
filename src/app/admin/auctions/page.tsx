'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/th';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('th');

type AuctionRow = {
  id: string;
  title: string;
  start_price: number;
  start_time: string | null;
  end_time: string | null;
  is_closed: boolean | null;
  created_at: string;
};

export default function Page() {
  const [rows, setRows] = useState<AuctionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('auctions')
        .select('id, title, start_price, start_time, end_time, is_closed, created_at')
        .order('created_at', { ascending: false });
      if (!error && data) setRows(data as AuctionRow[]);
      setLoading(false);
    };
    fetchAuctions();
  }, []);

  const fmt = (iso?: string | null) =>
    iso ? dayjs.utc(iso).tz('Asia/Bangkok').format('D/M/YY HH:mm') : '-';

  const computeStatus = (r: AuctionRow) => {
    const now = dayjs.utc();
    const start = r.start_time ? dayjs.utc(r.start_time) : null;

    if (r.is_closed) return 'ปิดแล้ว';
    if (start && now.isBefore(start)) return 'กำลังจะเริ่ม';
    return 'กำลังประมูล';
  };

  const handleDelete = async (row: AuctionRow) => {
    const ok = window.confirm(`ยืนยันลบประมูล: "${row.title}" ?\nการลบไม่สามารถยกเลิกได้`);
    if (!ok) return;
    try {
      setDeletingId(row.id);
      const { error } = await supabase.from('auctions').delete().eq('id', row.id);
      if (error) throw error;
      // ลบออกจากตารางทันที
      setRows(prev => prev.filter(r => r.id !== row.id));
      alert('ลบประมูลเรียบร้อย');
    } catch (e: any) {
      alert('ลบไม่สำเร็จ: ' + (e?.message || ''));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="m-0">รายการประมูล</h3>
        <Link href="/admin/post-auction/" className="btn btn-primary">+ สร้างประมูลใหม่</Link>
      </div>

      {loading ? (
        <div className="text-muted">กำลังโหลด...</div>
      ) : rows.length === 0 ? (
        <div className="text-muted">ยังไม่มีรายการ</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-dark table-striped align-middle">
            <thead>
              <tr>
                <th style={{width: '36px'}}>#</th>
                <th>ชื่อ</th>
                <th className="text-end">เริ่มต้น (บาท)</th>
                <th className="text-center">สถานะ</th>
                <th className="text-center">เวลา (ไทย)</th>
                <th className="text-end">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={r.id}>
                  <td>{idx + 1}</td>
                  <td className="fw-semibold">{r.title}</td>
                  <td className="text-end">{Number(r.start_price ?? 0).toLocaleString()}</td>
                  <td className="text-center">
                    <span className={`badge ${
                      computeStatus(r) === 'ปิดแล้ว' ? 'bg-danger' :
                      computeStatus(r) === 'กำลังจะเริ่ม' ? 'bg-warning text-dark' :
                      'bg-success'
                    }`}>
                      {computeStatus(r)}
                    </span>
                  </td>

                  {/* เวลาไทย: เริ่ม/หมด */}
                  <td className="text-center">
                    <div><strong>เริ่ม:</strong> {fmt(r.start_time)}</div>
                    <div><strong>หมด:</strong> {fmt(r.end_time)}</div>
                  </td>

                  <td className="text-end">
                    <div className="btn-group">
                      <Link href={`/auction/${r.id}`} className="btn btn-sm btn-outline-light">
                        เปิดดู
                      </Link>
                      <Link href={`/admin/edit-auction/${r.id}/`} className="btn btn-sm btn-outline-warning">
                        แก้ไข
                      </Link>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(r)}
                        disabled={deletingId === r.id}
                        title="ลบประมูล"
                      >
                        {deletingId === r.id ? 'กำลังลบ...' : 'ลบ'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .badge { font-size: 0.85rem; }
      `}</style>
    </div>
  );
}

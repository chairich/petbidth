
'use client'
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const AdminDashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [auctionCount, setAuctionCount] = useState(0);
  const [bidCount, setBidCount] = useState(0);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadStats = async () => {
      const [{ count: userCount }, { count: auctionCount }, { count: bidCount }, { data: auctionData }, { data: userData }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('auctions').select('*', { count: 'exact', head: true }),
        supabase.from('bids').select('*', { count: 'exact', head: true }),
        supabase.from('auctions').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false })
      ]);

      setUserCount(userCount || 0);
      setAuctionCount(auctionCount || 0);
      setBidCount(bidCount || 0);
      setAuctions(auctionData || []);
      setUsers(userData || []);
    };

    loadStats();
  }, []);

  const handleCloseAuction = async (auctionId: string) => {
    const confirmClose = confirm("คุณแน่ใจว่าต้องการปิดประมูลนี้หรือไม่?");
    if (!confirmClose) return;

    await supabase.from('auctions').update({ is_closed: true }).eq('id', auctionId);
    alert("ปิดประมูลเรียบร้อยแล้ว");
    setAuctions(prev => prev.map(a => a.id === auctionId ? { ...a, is_closed: true } : a));
  };

  const handleToggleBan = async (userId: string, isBanned: boolean) => {
    const action = isBanned ? "ปลดแบน" : "แบน";
    const confirmBan = confirm(`คุณต้องการ${action}ผู้ใช้นี้ใช่หรือไม่?`);
    if (!confirmBan) return;

    await supabase.from('profiles').update({ is_banned: !isBanned }).eq('id', userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_banned: !isBanned } : u));
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Admin Dashboard</h2>
      <div className="row mb-4">
        <div className="col-md-4"><div className="card p-3 shadow-sm">👥 ผู้ใช้ทั้งหมด: <strong>{userCount}</strong></div></div>
        <div className="col-md-4"><div className="card p-3 shadow-sm">📦 รายการประมูล: <strong>{auctionCount}</strong></div></div>
        <div className="col-md-4"><div className="card p-3 shadow-sm">💸 การบิดทั้งหมด: <strong>{bidCount}</strong></div></div>
      </div>

      <h4 className="mb-3">จัดการรายการประมูล</h4>
      <div className="table-responsive mb-5">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>ชื่อ</th>
              <th>ผู้สร้าง</th>
              <th>สถานะ</th>
              <th>ดู / ปิด</th>
            </tr>
          </thead>
          <tbody>
            {auctions.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{item.created_by_role}</td>
                <td>{item.is_closed ? 'ปิดแล้ว' : 'กำลังเปิด'}</td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => router.push(`/auction/${item.id}`)}>ดู</button>
                  {!item.is_closed && (
                    <button className="btn btn-sm btn-danger" onClick={() => handleCloseAuction(item.id)}>ปิด</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4 className="mb-3">จัดการผู้ใช้งาน</h4>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>ชื่อ</th>
              <th>อีเมล</th>
              <th>บทบาท</th>
              <th>สถานะ</th>
              <th>แบน / ปลดแบน</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.fullname || '-'}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.is_banned ? 'ถูกแบน' : 'ปกติ'}</td>
                <td>
                  <button className={`btn btn-sm ${u.is_banned ? 'btn-success' : 'btn-danger'}`}
                          onClick={() => handleToggleBan(u.id, u.is_banned)}>
                    {u.is_banned ? 'ปลดแบน' : 'แบน'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;

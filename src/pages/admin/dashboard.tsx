// File: /pages/admin/dashboard.tsx

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import DashboardHeader from '@/layouts/headers/DashboardHeader';
import FooterOne from '@/layouts/footers/FooterOne';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [vipUsers, setVipUsers] = useState<any[]>([]);
  const [bannedUsers, setBannedUsers] = useState<any[]>([]);
  const [auctions, setAuctions] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: allUsers } = await supabase.from('users').select('*');
      const { data: allAuctions } = await supabase.from('auctions').select('*');
      const vip = allUsers?.filter((u) => u.role === 'vip') || [];
      const banned = allUsers?.filter((u) => u.status === 'banned') || [];

      setUsers(allUsers || []);
      setVipUsers(vip);
      setBannedUsers(banned);
      setAuctions(allAuctions || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <>
      <DashboardHeader />
      <main className="container py-10">
        <h1 className="text-3xl font-bold mb-6">แดชบอร์ดแอดมิน</h1>

        {loading ? (
          <p>กำลังโหลดข้อมูล...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">สมาชิกทั้งหมด</h2>
                <p className="text-4xl font-bold">{users.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">VIP</h2>
                <p className="text-4xl font-bold">{vipUsers.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">โพสต์ประมูล</h2>
                <p className="text-4xl font-bold">{auctions.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">ผู้ใช้ถูกแบน</h2>
                <p className="text-4xl font-bold">{bannedUsers.length}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <FooterOne />
    </>
  );
}


'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (!profile) {
        router.push('/login');
        return;
      }
      switch (profile.role) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'vip':
          router.push('/dashboard/vip');
          break;
        default:
          router.push('/dashboard/general');
          break;
      }
    };
    checkRole();
  }, [router]);

  return <div>กำลังโหลดข้อมูล...</div>;
}

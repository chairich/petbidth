
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export default async function AuctionDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/register');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'vip'].includes(profile.role)) {
    redirect('/register');
  }

  return (
    <div className="text-white p-4">
      <h1 className="text-2xl font-bold mb-4">Auction ID: {params.id}</h1>
      <p>แสดงรายละเอียดการประมูลที่นี่</p>
    </div>
  );
}

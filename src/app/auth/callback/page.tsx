
'use client'
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const supabase = createClientComponentClient();

  useEffect(() => {
    supabase.auth.getSession().then(() => {
      router.push(callbackUrl);
    });
  }, []);

  return <p>กำลังเข้าสู่ระบบ...</p>;
}

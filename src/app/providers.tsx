'use client';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { useState } from 'react';
import useOnlineStatus from '@/hooks/useOnlineStatus';
import OnlineTracker from '@/components/OnlineTracker';
import { Toaster } from 'react-hot-toast'; // ✅ เพิ่ม Toaster

export function Providers({ children }: { children: React.ReactNode }) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());
  useOnlineStatus(); // ✅ ติดตามสถานะออนไลน์
  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      <OnlineTracker />
      <Toaster position="top-center" reverseOrder={false} /> {/* ✅ ครอบ Toaster ที่นี่ */}
      {children}
    </SessionContextProvider>
  );
}

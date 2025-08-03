'use client';

import React from 'react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import HeaderOne from '@/layouts/headers/HeaderOne';
import FooterOne from '@/layouts/footers/FooterOne';
import Divider from '@/components/common/Divider';

export default function Layout({ children }: { children: React.ReactNode }) {
  const supabaseClient = createClientComponentClient();

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      <HeaderOne />
      <Divider />
      <main className="min-h-screen text-white p-4 bg-gray-800">{children}</main>
      <Divider />
      <FooterOne />
    </SessionContextProvider>
  );
}

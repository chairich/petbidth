
'use client';

import HeaderOne from '@/layouts/headers/HeaderOne';
import FooterOne from '@/layouts/footers/FooterOne';
import { useEffect, useState } from 'react';
import Divider from '@/components/common/Divider';

import { useUser } from '@supabase/auth-helpers-react';
import NewThreadForm from '@/components/forum/NewThreadForm';

export default function ForumNewPage() {
  return (
    <>
      <HeaderOne />
      <Divider />
      <main className="container py-10">
        <h1 className="text-2xl font-bold mb-4">ตั้งกระทู้ใหม่</h1>
        <NewThreadForm />
      </main>
      <Divider />
      <FooterOne />
    </>
  );
}

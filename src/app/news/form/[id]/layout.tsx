import React from 'react';
import HeaderOne from '@/layouts/headers/HeaderOne';
import FooterOne from '@/layouts/footers/FooterOne';
import Divider from '@/components/common/Divider';

export default function NewsFormLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderOne />
      <Divider />
      <main className="min-h-screen bg-gray-900 text-white px-4">
        {children}
      </main>
      <Divider />
  
    </>
  );
}

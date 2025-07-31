
import React from 'react';
import HeaderOne from '@/layouts/headers/HeaderOne';
import FooterOne from '@/layouts/footers/FooterOne';
import Divider from '@/components/common/Divider';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderOne />
      <Divider />
      <main className="min-h-screen  text-white p-4">{children}</main>
      <Divider />
      <FooterOne />
    </>
  );
}

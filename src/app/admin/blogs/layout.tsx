// app/knowledge/layout.tsx
import HeaderOne from '@/layouts/headers/HeaderOne';
import FooterOne from '@/layouts/footers/FooterOne';
import Divider from '@/components/common/Divider';
import React from 'react';

export default function KnowledgeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderOne />
      <Divider />
      <main className="container py-5">{children}</main>
      <FooterOne />
    </>
  );
}

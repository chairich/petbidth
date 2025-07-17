// src/components/PageWrapper.tsx
import React from 'react';
import HeaderOne from '@/layouts/headers/HeaderOne';  // นำเข้า Header
import FooterOne from '@/layouts/footers/FooterOne';  // นำเข้า Footer

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <HeaderOne />  {/* หัวข้อของเว็บไซต์ */}
      <main>{children}</main> {/* ส่วนเนื้อหาของหน้า */}
      <FooterOne />  {/* ส่วนท้ายของเว็บไซต์ */}
    </>
  );
};

export default PageWrapper;

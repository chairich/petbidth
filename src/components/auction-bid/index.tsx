

'use client';
import HeaderOne from '@/layouts/headers/HeaderOne';
import React from 'react';
import Breadcrumb from '../common/Breadcrumb';
import Divider from '../common/Divider';
import FooterOne from '@/layouts/footers/FooterOne';
import RegistAreaAuctionForm from './RegistAreaAuction';

const RegistAuctionArea = () => {
  return (
    <>
      <HeaderOne />
      <Breadcrumb subtitle="เงื่อนไขการลงประมูล" title="ขั้นตอนการลงประมูลกับเรา" />
      <Divider />
      <RegistAreaAuctionForm />
      <Divider />
      <FooterOne />

    </>
  );
};

export default RegistAuctionArea;


'use client';
import HeaderOne from '@/layouts/headers/HeaderOne';
import React from 'react';
import Breadcrumb from '../common/Breadcrumb';
import Divider from '../common/Divider';
import FooterOne from '@/layouts/footers/FooterOne';
import AuctionForm from './AuctionForm';

const AuctionArea = () => {
  return (
    <>
      <HeaderOne />
      <Breadcrumb subtitle="การลงประมูล" title="ขั้นตอนการลงประมูล" />
      <Divider />
      <AuctionForm />
      <Divider />
      <FooterOne />

    </>
  );
};

export default AuctionArea;
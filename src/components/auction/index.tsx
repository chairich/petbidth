
'use client'

import HeaderOne from '@/layouts/headers/HeaderOne';
import React from 'react';
import Breadcrumb from '../common/Breadcrumb';
import Divider from '../common/Divider';
import ItemDetailsArea from './AuctionDetailsArea';
import FooterOne from '@/layouts/footers/FooterOne';
import ShopBannerCarousel from '../homes/home/ShopBannerCarousel';

 

const AuctionDetailsArea = () => {

  if (typeof window !== "undefined") {
    require("bootstrap/dist/js/bootstrap");
  }

  

  return (
    <>
    <HeaderOne />
    <Breadcrumb title="หน้าประมูล" subtitle="หน้าประมูล" />
    <Divider />
    <ItemDetailsArea />
    <Divider />
    <ShopBannerCarousel />
    <Divider /> 
    <FooterOne />      
    </>
  );
};

export default AuctionDetailsArea;
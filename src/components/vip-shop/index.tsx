

import HeaderOne from '@/layouts/headers/HeaderOne';
import React from 'react';
import Breadcrumb from '../common/Breadcrumb';
import Divider from '../common/Divider';
import FooterOne from '@/layouts/footers/FooterOne';
import ShopDetails from './ShopFormArea';

const ShopFormArea = () => {
  return (
    <>
      <HeaderOne />
      <Breadcrumb subtitle="ร้านค้า สมาชิกวี.ไอ.พี" title="ร้านค้า" />
      <Divider />
       <ShopDetails />
      <Divider />
      <FooterOne />

    </>
  );
};

export default ShopFormArea;
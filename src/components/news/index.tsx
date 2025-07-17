

import HeaderOne from '@/layouts/headers/HeaderOne';
import React from 'react';
import Breadcrumb from '../common/Breadcrumb';
import Divider from '../common/Divider';
import FooterOne from '@/layouts/footers/FooterOne';
import NewsDetails from './NewsFormArea';

const NewsFormArea = () => {
  return (
    <>
      <HeaderOne />
      <Breadcrumb subtitle="ข้อมูลข่าวสาร" title="ข่าวสารจากเรา" />
      <Divider />
       <NewsDetails />
      <Divider />
      <FooterOne />

    </>
  );
};

export default NewsFormArea;
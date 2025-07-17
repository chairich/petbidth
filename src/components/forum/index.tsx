

import HeaderOne from '@/layouts/headers/HeaderOne';
import React from 'react';
import Breadcrumb from '../common/Breadcrumb';
import Divider from '../common/Divider';
import FooterOne from '@/layouts/footers/FooterOne';
import ForumDetails from './NewsForumArea';

const NewsForumArea = () => {
  return (
    <>
      <HeaderOne />
      <Breadcrumb subtitle="ชุมชนแบ่งปัน" title="กระทู้พูดคุย" />
      <Divider />
       <ForumDetails />
      <Divider />
      <FooterOne />

    </>
  );
};

export default NewsForumArea;
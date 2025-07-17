
import HeaderOne from '@/layouts/headers/HeaderOne';
import React from 'react';
import Breadcrumb from '../common/Breadcrumb';
import Divider from '../common/Divider';
import FooterOne from '@/layouts/footers/FooterOne';
import CreateBanner from './CreateBannerForm';

const CreateBannerForm = () => {
  return (
    <>
    <HeaderOne />
    <Breadcrumb title="สร้างป้ายแบนด์เนอร์" subtitle="ป้ายร้านวี.ไอ.พี" />
    <Divider />
    <CreateBanner />
    <Divider />
    <FooterOne />      
    </>
  );
};

export default CreateBannerForm;
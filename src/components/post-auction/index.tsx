
import HeaderOne from '@/layouts/headers/HeaderOne';
import React from 'react';
import Breadcrumb from '../common/Breadcrumb';
import Divider from '../common/Divider';
import FooterOne from '@/layouts/footers/FooterOne';
import CreateAuctionForm from './CreateAuction';

const CreateAuction = () => {
  return (
    <>
    <HeaderOne />
    <Breadcrumb title="โพสกระทู้ประมูล" subtitle="สร้างกระทู้ประมูล" />
    <Divider />
    <CreateAuctionForm />
    <Divider />
    <FooterOne />      
    </>
  );
};

export default CreateAuction;
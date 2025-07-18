
import HeaderOne from '@/layouts/headers/HeaderOne';
import React from 'react';
import Breadcrumb from '../common/Breadcrumb';
import Divider from '../common/Divider';
import FooterOne from '@/layouts/footers/FooterOne';
import EditAuctionForm from './EditAuction';

const EditAuction = () => {
  return (
    <>
    <HeaderOne />
    <Breadcrumb title="แก้ไขะทู้ประมูล" subtitle="แก้ไขกระทู้ประมูล"></Breadcrumb>
    <Divider />
    <EditAuctionForm />
    <Divider />
    <FooterOne />      
    </>
  );
};

export default EditAuction;
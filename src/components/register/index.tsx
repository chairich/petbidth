

'use client';
import HeaderOne from '@/layouts/headers/HeaderOne';
import React from 'react';
import Breadcrumb from '../common/Breadcrumb';
import Divider from '../common/Divider';
import FooterOne from '@/layouts/footers/FooterOne';
import RegistAreaForm from './RegistArea';

const RegistArea = () => {
  return (
    <>
      <HeaderOne />
      <Breadcrumb subtitle="การสมัครสมาชิก" title="ขั้นตอนสมัครสมาชิก" />
      <Divider />
      <RegistAreaForm />
      <Divider />
      <FooterOne />

    </>
  );
};

export default RegistArea;
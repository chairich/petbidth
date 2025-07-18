

'use client';
import HeaderOne from '@/layouts/headers/HeaderOne';
import React from 'react';
import Breadcrumb from '../common/Breadcrumb';
import Divider from '../common/Divider';
import FooterOne from '@/layouts/footers/FooterOne';
import LoginAreaForm from './LoginArea';

const LoginArea = () => {
  return (
    <>
      <HeaderOne />
      <Breadcrumb subtitle="เข้าสู่ระบบสมาชิก" title="Login" />
      <Divider />
      <LoginAreaForm />
      <Divider />
      <FooterOne />

    </>
  );
};

export default LoginArea;
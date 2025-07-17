

import HeaderOne from '@/layouts/headers/HeaderOne';
import React from 'react';
import Breadcrumb from '../common/Breadcrumb';
import Divider from '../common/Divider';
import ItemDetailsArea2 from './EditProfileArea';
import FooterOne from '@/layouts/footers/FooterOne';


 

const EditProfileArea = () => {

  if (typeof window !== "undefined") {
    require("bootstrap/dist/js/bootstrap");
  }

  

  return (
    <>
    <HeaderOne />
    <Breadcrumb title="หน้าประมูล" subtitle="หน้าประมูล" />
    <Divider />
    <ItemDetailsArea2 />
    <Divider /> 
    <FooterOne />      
    </>
  );
};

export default EditProfileArea;
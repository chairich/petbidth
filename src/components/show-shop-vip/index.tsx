import HeaderOne from '@/layouts/headers/HeaderOne';
import React from 'react';
import Breadcrumb from '../common/Breadcrumb';
import Divider from '../common/Divider';
import FooterOne from '@/layouts/footers/FooterOne';
import ShowShopAreaDetails from './ShowShopArea';

const ShowShopArea = () => {
  return (
    <>
      <HeaderOne />
      <Breadcrumb subtitle="ร้านค้า สมาชิกวี.ไอ.พี" title="ร้านค้า" />

      <section className="pt-8 pb-12 bg-slate-900">
        <div className="container mx-auto px-4">
          <ShowShopAreaDetails />
        </div>
      </section>

      <Divider />
      <FooterOne />
    </>
  );
};

export default ShowShopArea;

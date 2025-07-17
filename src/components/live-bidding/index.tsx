
import React from 'react';
import HeaderOne from '@/layouts/headers/HeaderOne';
import LiveBiddingArea from './LiveBiddingArea';
import Breadcrumb from '../common/Breadcrumb';
import Divider from '../common/Divider';
import FooterOne from '@/layouts/footers/FooterOne';

const LiveBidding = () => {
  return (
    <>
    <HeaderOne />
    <Breadcrumb title="ประมูล" subtitle="ประมูล" />
    <Divider />
    <LiveBiddingArea />
    <Divider />
    <FooterOne />      
    </>
  );
};

export default LiveBidding;
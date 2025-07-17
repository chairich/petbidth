'use client';

import React from "react";
import HeorAreaHomeOne from "./HeorAreaHomeOne";
import HeaderOne from "@/layouts/headers/HeaderOne";
import LiveAuctionHomeOne from "./LiveAuctionHomeOne";
import Divider from "@/components/common/Divider";
import ShopBannerCarousel from "./ShopBannerCarousel";
import FooterOne from "@/layouts/footers/FooterOne";



const HomeOne = () => {
	if (typeof window !== "undefined") {
		require("bootstrap/dist/js/bootstrap");
	}
	return (
		<>
			
			<HeaderOne />
			<HeorAreaHomeOne />
			<Divider />
			<LiveAuctionHomeOne />
			<Divider />
			<ShopBannerCarousel />
			<Divider />
			<FooterOne />
		</>
	);
};

export default HomeOne;

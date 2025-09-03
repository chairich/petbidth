import React, { Suspense } from "react";
import RegistAuctionArea from "@/components/auction-bid";

export const metadata = {
  title: "การลงประมูล - เว็บประมูล เพ็ชบิดไทย",
};

const Page = () => {
  return (
    <Suspense fallback={<div>กำลังโหลด...</div>}>
      <RegistAuctionArea />
    </Suspense>
  );
};

export default Page;

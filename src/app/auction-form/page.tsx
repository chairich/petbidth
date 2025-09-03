import React, { Suspense } from "react";
import AuctionForm from "@/components/auction-form";

export const metadata = {
  title: "การลงประมูล - เว็บประมูล เพ็ชบิดไทย",
};

const Page = () => {
  return (
    <Suspense fallback={<div>กำลังโหลด...</div>}>
      <AuctionForm />
    </Suspense>
  );
};

export default Page;

import React, { Suspense } from "react";
import RegistArea from "@/components/register";

export const metadata = {
  title: "การสมัครสมาชิก - เว็บประมูล เพ็ชบิดไทย",
};

const Page = () => {
  return (
    <Suspense fallback={<div>กำลังโหลด...</div>}>
      <RegistArea />
    </Suspense>
  );
};

export default Page;

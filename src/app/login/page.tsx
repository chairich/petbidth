import React, { Suspense } from "react";
import LoginArea from "@/components/login";

export const metadata = {
  title: "เข้าสู่ระบบ - เว็บประมูล เพ็ชบิดไทย",
};

const Page = () => {
  return (
    <Suspense fallback={<div>กำลังโหลด...</div>}>
      <LoginArea />
    </Suspense>
  );
};

export default Page;

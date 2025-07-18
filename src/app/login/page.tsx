// src/app/login/page.tsx
import React, { Suspense } from "react";
import LoginArea from "@/components/login";
export const metadata = {
	title: "เข้าสู่ระบบสมาชิก - เว็บประมูล เพ็ชบิดไทย",
};

const index = () => {
	return (
		<>
			<LoginArea />
		</>
	);
};

export default index;
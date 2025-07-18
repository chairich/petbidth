// src/app/login/page.tsx

import LoginArea from "@/components/login";
import React from "react";

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
import { Suspense } from "react";
import dynamic from "next/dynamic";

const HeaderOne = dynamic(() => import("@/layouts/headers/HeaderOne"), { ssr: false });
const FooterOne = dynamic(() => import("@/layouts/footers/FooterOne"), { ssr: false });
const Divider = dynamic(() => import("@/components/common/Divider"), { ssr: false });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="bg-[#111827] text-white">
        <Suspense fallback={<div>กำลังโหลด...</div>}>
          <HeaderOne />
          <Divider />
        </Suspense>

        <main className="container py-5">{children}</main>

        <Suspense fallback={<div />}>
          <Divider />
          <FooterOne />
        </Suspense>
      </body>
    </html>
  );
}

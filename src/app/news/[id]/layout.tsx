import HeaderOne from '@/layouts/headers/HeaderOne';
import FooterOne from '@/layouts/footers/FooterOne';
import Divider from '@/components/common/Divider';

export default function NewsDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <HeaderOne />
      <Divider />
      <main className="flex-grow bg-gray-900 text-white px-4 py-6">
        <div className="pb-32">
          {children}
        </div>
      </main>
      <Divider />
   
    </div>
  );
}

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const SearchClient = dynamic(() => import('./SearchClient'), { ssr: false });

export default function SearchPage() {
  return (
    <Suspense fallback={<div>กำลังโหลด...</div>}>
      <SearchClient />
    </Suspense>
  );
}

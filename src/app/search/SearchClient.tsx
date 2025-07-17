'use client';
import { useSearchParams } from 'next/navigation';

export default function SearchClient() {
  const params = useSearchParams();
  const keyword = params.get('q');

  return <div>ผลการค้นหา: {keyword}</div>;
}

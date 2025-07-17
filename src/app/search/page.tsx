'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('auctions')
        .select('*')
        .ilike('title', `%${query}%`);

      setResults(data || []);
    };
    if (query) fetchData();
  }, [query]);

  return (
    <div className="container mt-5 text-white">
      <h3>ผลการค้นหา: <strong>{query}</strong></h3>
      {results.length === 0 && <p>ไม่พบรายการที่ตรงกับคำค้น</p>}
      <div className="row mt-4">
        {results.map((item) => (
          <div key={item.id} className="col-md-4 mb-3">
            <div className="card text-dark">
              <img src={item.image_urls?.[0]} className="card-img-top" />
              <div className="card-body">
                <h5 className="card-title">{item.title}</h5>
                <p className="card-text">{item.description?.slice(0, 80)}...</p>
                <a href={`/auction/${item.id}`} className="btn btn-primary">ดูรายละเอียด</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

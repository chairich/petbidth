// NewsPage.tsx
'use client';

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import Image from "next/image";
import { useParams } from 'next/navigation';

export default function NewsDetail() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from("store_news")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) setData(data);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading) return <p className="text-white text-center pt-10">กำลังโหลด...</p>;
  if (!data) return <p className="text-white text-center pt-10">ไม่พบข้อมูลข่าว</p>;

  const formattedDate = new Date(data.created_at).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
   
   <div className="container py-0 text-white">
      <div>
        <div className="col-lg-10">
          <div className="border rounded overflow-hidden bg-dark mb-3"></div>
  
          <h1>{data.title}</h1>
          <p>{formattedDate}</p>

          {data.image_url && (
            <div>
              <Image
                src={data.image_url}
                alt={data.title}
                width={500}
                height={250}
                className="rounded-lg w-full h-auto object-cover"
              />
            </div>
          )}

          <div className="me-2 bi bi-grid-3x3-gap"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        
    </div></div></div>
 
    
  );
}

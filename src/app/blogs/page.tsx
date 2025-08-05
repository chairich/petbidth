'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverimage: string;
  created_at: string;
}

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([]);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchArticles = async () => {
      const { data, error } = await supabase
        .from('seo_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setArticles(data);
      if (error) console.error('Fetch error:', error);
    };

    fetchArticles();
  }, []);

  return (
    <main className="min-h-screen px-4 py-10 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8 text-center">บทความทั้งหมด</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <article
            key={article.id}
            className="bg-gray-900 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col h-full"
          >
            <Link href={`/blogs/${article.slug}`}>
              <img
                src={article.coverimage}
                alt={article.title}
                className="w-full h-[200px] object-cover"
              />
            </Link>

            <div className="p-4 flex flex-col flex-grow">
              <Link href={`/blogs/${article.slug}`}>
                <h2 className="text-lg font-semibold text-white hover:text-blue-400 line-clamp-2">
                  {article.title}
                </h2>
              </Link>

              <p className="text-sm text-gray-400 mt-2 line-clamp-3 flex-grow">{article.excerpt}</p>

              <p className="text-xs text-gray-500 mt-2">
                📅 {new Date(article.created_at).toLocaleDateString('th-TH')}
              </p>

              <Link
                href={`/blogs/${article.slug}`}
                className="text-blue-500 text-sm inline-block mt-2 hover:underline"
              >
                อ่านต่อ →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

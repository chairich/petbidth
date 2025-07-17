'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

export default function ForumPage() {
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    const fetchThreads = async () => {
      const { data } = await supabase
        .from('threads')
        .select('id, title, created_at, users(name)')
        .order('created_at', { ascending: false });
      setThreads(data || []);
    };
    fetchThreads();
  }, []);

  return (
    <div className="container py-5">
      <h1 className="mb-4">เว็บบอร์ด</h1>
      <Link href="/forum/new" className="btn btn-primary mb-4">+ ตั้งกระทู้ใหม่</Link>
      <ul className="list-group">
        {threads.map((thread: any) => (
          <li key={thread.id} className="list-group-item">
            <Link href={`/forum/${thread.id}`} className="fw-bold">{thread.title}</Link>
            <div className="text-muted">โดย {thread.users?.name ?? 'ไม่ระบุ'} • {new Date(thread.created_at).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

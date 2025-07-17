'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

export default function NewThreadPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) return alert('กรุณาเข้าสู่ระบบ');

    const { data, error } = await supabase.from('threads').insert({
      title,
      content,
      author: user.user_metadata.name,
      user_id: user.id
    }).select().single();

    if (error) return alert(error.message);
    router.push(`/forum/{data.id}`);
  };

  return (
    <div className="container py-5">
      <h2>ตั้งกระทู้ใหม่</h2>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-3">
          <label className="form-label">หัวข้อ</label>
          <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">เนื้อหา</label>
          <textarea className="form-control" rows={5} value={content} onChange={e => setContent(e.target.value)} required />
        </div>
        <button className="btn btn-primary" type="submit">โพสต์</button>
      </form>
    </div>
  );
}

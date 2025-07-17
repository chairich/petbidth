'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

export default function NewThreadPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return alert("กรุณาเข้าสู่ระบบ");

    const { error } = await supabase.from('threads').insert({
      title, content, user_id: session.user.id
    });
    if (!error) router.push('/forum');
  };

  return (
    <div className="container py-5">
      <h1>ตั้งกระทู้ใหม่</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">หัวข้อ</label>
          <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">เนื้อหา</label>
          <textarea className="form-control" value={content} onChange={e => setContent(e.target.value)} required />
        </div>
        <button className="btn btn-success">โพสต์</button>
      </form>
    </div>
  );
}

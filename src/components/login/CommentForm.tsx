'use client';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function CommentForm({ postId }: { postId: string }) {
  const [content, setContent] = useState('');
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert('กรุณาเข้าสู่ระบบ');

    await supabase.from('knowledge_comments').insert([{
      post_id: postId,
      content,
      user_id: user.id
    }]);

    setContent('');
    location.reload();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="แสดงความคิดเห็น..." className="w-full p-2 bg-zinc-800 rounded"></textarea>
      <button type="submit" className="px-4 py-2 bg-blue-500 rounded">ส่งความคิดเห็น</button>
    </form>
  );
}

'use client';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useUser } from '@supabase/auth-helpers-react';

const CommentForm = ({ thread_id }) => {
  const [content, setContent] = useState('');
  const supabase = createClientComponentClient();
  const router = useRouter();
  const user = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content) return;
    await supabase.from('comments').insert({
      thread_id,
      user_id: user?.id,
      content
    });
    setContent('');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-2">
      <textarea className="form-control" rows={3} placeholder="เขียนความคิดเห็น..." value={content} onChange={(e) => setContent(e.target.value)} required />
      <button type="submit" className="btn btn-primary">ส่งความคิดเห็น</button>
    </form>
  );
};
export default CommentForm;
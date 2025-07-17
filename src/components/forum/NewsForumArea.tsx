'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

export default function ForumDetailPage() {
  const { id } = useParams();
  const [thread, setThread] = useState<any>(null);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: threadData } = await supabase
        .from('threads')
        .select('*, users(name)')
        .eq('id', id)
        .single();

      const { data: commentsData } = await supabase
        .from('comments')
        .select('*, users(name)')
        .eq('thread_id', id)
        .order('created_at');

      setThread(threadData);
      setComments(commentsData || []);
    };

    fetchData();
  }, [id]);

  return (
    <div className="container py-5">
      {thread && (
        <>
          <h2>{thread.title}</h2>
          <p className="text-muted">โดย {thread.users?.name} • {new Date(thread.created_at).toLocaleString()}</p>
          <p>{thread.content}</p>
        </>
      )}

      <hr />
      <h5>ความคิดเห็น</h5>
      {comments.map((c: any) => (
        <div key={c.id} className="mb-3 p-3 bg-light rounded">
          <strong>{c.users?.name}:</strong>
          <div>{c.content}</div>
          <small className="text-muted">{new Date(c.created_at).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}

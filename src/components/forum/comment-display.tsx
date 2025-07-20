import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const CommentDisplay = ({ threadId }: { threadId: string }) => {
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    const fetchComments = async () => {
      const { data } = await supabase
        .from('comments')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: false });
      setComments(data || []);
    };
    fetchComments();
  }, [threadId]);

  return (
    <div className="space-y-4 mt-4">
      {comments.map((comment) => (
        <div key={comment.id} className="border p-3 rounded-xl">
          <p>{comment.content}</p>
          {comment.image_url && (
            <img
              src={`https://your-project.supabase.co/storage/v1/object/public/comment-images/${comment.image_url}`}
              alt="comment image"
              className="w-32 mt-2 rounded"
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default CommentDisplay;

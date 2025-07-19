'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import HeaderOne from '@/layouts/headers/HeaderOne';
import FooterOne from '@/layouts/footers/FooterOne';
import Breadcrumb from '@/components/common/Breadcrumb';
import Divider from '@/components/common/Divider';

import ThreadContent from '@/components/forum/ThreadContent';
import CommentList from '@/components/forum/CommentList';
import CommentForm from '@/components/forum/CommentForm';

const ThreadDetail = () => {
  const { id } = useParams();
  const [thread, setThread] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadData = async () => {
      const { data: threadData } = await supabase
        .from('threads')
        .select('*')
        .eq('id', id)
        .single();

      const { data: commentData } = await supabase
        .from('comments')
        .select('*')
        .eq('thread_id', id)
        .order('created_at');

      setThread(threadData);
      setComments(commentData || []);
    };
    loadData();
  }, [id]);

  if (!thread) return <div className="p-5">กำลังโหลด...</div>;

  return (
    <>
      <HeaderOne />
      <Breadcrumb title={thread.title} subtitle="รายละเอียดกระทู้" />
      <div className="container py-10">
        <ThreadContent {...thread} />
        <Divider />
        <h2 className="text-xl font-bold mb-2">ความคิดเห็น</h2>
        <CommentList comments={comments} />
        <CommentForm thread_id={thread.id} />
      </div>
      <Divider />
      <FooterOne />
    </>
  );
};

export default ThreadDetail;

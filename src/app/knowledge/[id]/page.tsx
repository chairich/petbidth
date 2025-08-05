'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const ViewKnowledgePost = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [sections, setSections] = useState<{ subheading: string; body: string }[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      const { data: post } = await supabase
        .from('knowledge_posts')
        .select('title, images')
        .eq('id', id)
        .single();

      const { data: sectionData } = await supabase
        .from('knowledge_sections')
        .select('subheading, body')
        .eq('post_id', id);

      if (post) {
        setTitle(post.title);
        setImages(post.images || []);
        setSections(sectionData || []);
      }
    };

    const fetchUserAndComments = async () => {
      const { data: user } = await supabase.auth.getUser();
      setUserId(user?.user?.id ?? null);

      const { data } = await supabase
        .from('knowledge_comments')
        .select('id, content, created_at, user:users(username)')
        .eq('post_id', id)
        .order('created_at', { ascending: false });

      setComments(data ?? []);
    };

    fetchPost();
    fetchUserAndComments();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText || !userId) return;

    const { error } = await supabase.from('knowledge_comments').insert({
      post_id: id,
      user_id: userId,
      content: commentText,
    });

    if (!error) {
      setCommentText('');
      const { data } = await supabase
        .from('knowledge_comments')
        .select('id, content, created_at, user:users(username)')
        .eq('post_id', id)
        .order('created_at', { ascending: false });
      setComments(data ?? []);
    }
  };

  return (
    <div className="container py-5 max-w-3xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {images.map((url, index) => (
            <img key={index} src={url} alt={`img-${index}`} className="w-full rounded" />
          ))}
        </div>
      )}

      {sections.map((section, index) => (
        <div key={index} className="mb-6">
          <h2 className="text-xl font-semibold text-blue-400 mb-1">{section.subheading}</h2>
          <div
            className="text-gray-200 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: section.body }}
          />
        </div>
      ))}

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-3">💬 ความคิดเห็น</h2>
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="form-control" rows={4}
            placeholder="เขียนความคิดเห็นของคุณ..."
            
          /><br />
          <button
            type="submit" className="btn btn-primary"
          >
            ส่งความคิดเห็น
          </button>
        </form>

        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-slate-800 p-4 rounded">
              <p className="text-sm text-gray-400">@{comment.user?.username ?? 'ไม่ทราบชื่อ'} - {new Date(comment.created_at).toLocaleString('th-TH')}</p>
              <p className="text-white mt-1">{comment.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewKnowledgePost;
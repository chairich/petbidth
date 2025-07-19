
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const NewThreadForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setIsSubmitting(true);

    let uploadedImageUrl: string | null = null;

    if (image) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('forum-images')
        .upload(fileName, image);

      if (error) {
        console.error('Upload error:', error);
        setIsSubmitting(false);
        return;
      }

      uploadedImageUrl = data?.path ?? null;
      setImageUrl(uploadedImageUrl);
    }

    const { error } = await supabase.from('threads').insert([{
      title,
      content,
      image_url: uploadedImageUrl,
    }]);

    if (error) {
      console.error('Insert error:', error);
    } else {
      setTitle('');
      setContent('');
      setImage(null);
      setPreviewUrl(null);
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="หัวข้อกระทู้"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <textarea
        placeholder="เนื้อหากระทู้"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="w-full"
      />
      {previewUrl && <img src={previewUrl} alt="Preview" className="w-40 h-auto mt-2" />}
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'กำลังโพสต์...' : 'โพสต์กระทู้'}
      </button>
    </form>
  );
};

export default NewThreadForm;

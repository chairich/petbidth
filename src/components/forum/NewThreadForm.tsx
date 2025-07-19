
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';

export default function NewThreadForm() {
  const supabase = createClientComponentClient();
  const user = useUser();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);

      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = null;
    if (image) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage.from('forum-images').upload(fileName, image);
      if (error) {
        console.error('Image upload error:', error.message);
        return;
      }
      imageUrl = data?.path;
    }

    const { error } = await supabase.from('threads').insert([{
      title,
      content,
      image_url: imageUrl,
      user_id: user?.id,
    }]);

    if (!error) {
      router.push('/forum');
    } else {
      console.error('Error inserting thread:', error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="หัวข้อกระทู้"
        className="w-full p-2 border rounded"
        required
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="รายละเอียดกระทู้"
        className="w-full p-2 border rounded"
        rows={5}
        required
      />
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {previewUrl && <img src={previewUrl} alt="Preview" className="w-48 mt-2 rounded" />}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        โพสต์กระทู้
      </button>
    </form>
  );
}

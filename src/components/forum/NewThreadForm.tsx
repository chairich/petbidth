'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';

const NewThreadForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [role, setRole] = useState('');
  const supabase = createClientComponentClient();
  const router = useRouter();
  const user = useUser();

  useEffect(() => {
    if (image) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(image);
    } else {
      setPreviewUrl(null);
    }
  }, [image]);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) return;
      const { data } = await supabase.from('users').select('role').eq('id', user.id).single();
      if (data?.role) setRole(data.role);
    };
    fetchRole();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = null;

    if (image) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage.from('forum-images').upload(fileName, image);

      if (error) {
        alert('อัปโหลดรูปภาพล้มเหลว: ' + error.message);
        return;
      }

      const { data: publicUrlData } = supabase
        .storage
        .from('forum-images')
        .getPublicUrl(data.path);
      imageUrl = publicUrlData?.publicUrl;
    }

    const { error } = await supabase.from('threads').insert({
      title,
      content,
      image_url: imageUrl,
      user_id: user?.id,
      is_admin: role === 'admin'
    });

    if (error) {
      alert('เกิดข้อผิดพลาดในการโพสต์: ' + error.message);
    } else {
      router.push('/forum');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" placeholder="หัวข้อกระทู้" value={title} onChange={(e) => setTitle(e.target.value)} className="form-control" required />
      <textarea rows={5} placeholder="เนื้อหากระทู้" value={content} onChange={(e) => setContent(e.target.value)} className="form-control" required />
      <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
      {previewUrl && <img src={previewUrl} alt="preview" className="rounded border w-64 mt-2" />}
      <button type="submit" className="btn btn-primary">โพสต์</button>
    </form>
  );
};

export default NewThreadForm;

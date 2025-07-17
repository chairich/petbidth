'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { v4 as uuidv4 } from 'uuid';

export default function EditPost({ params }: { params: { id: string } }) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [form, setForm] = useState({ title: '', content: '', image_url: '' });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      const { data } = await supabase.from('store_news').select('*').eq('id', params.id).single();
      if (data) setForm(data);
    };
    fetchPost();
  }, [params.id]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e: any) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    let image_url = form.image_url;

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `news-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(filePath, file);

      if (uploadError) {
        alert('อัปโหลดรูปไม่สำเร็จ');
        return;
      }

      const { data } = supabase.storage.from('news-images').getPublicUrl(filePath);
      image_url = data.publicUrl;
    }

    const { error } = await supabase.from('store_news').update({
      ...form,
      image_url,
    }).eq('id', params.id);

    if (!error) router.push('/admin/news');
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">แก้ไขข่าว</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="title" onChange={handleChange} value={form.title} required placeholder="หัวข้อ" className="w-full border p-2 rounded"/>
        <input type="file" accept="image/*" onChange={handleFile} className="w-full border p-2 rounded"/>
        <textarea name="content" rows={6} onChange={handleChange} value={form.content} required placeholder="เนื้อหา" className="w-full border p-2 rounded"/>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">อัปเดต</button>
      </form>
    </div>
  );
}
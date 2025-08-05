'use client'

import React, { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

export default function NewBlogPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCoverFile(e.target.files[0]);
    }
  };

  const uploadCover = async (): Promise<string | null> => {
    if (!coverFile) return null;

    const ext = coverFile.name.split('.').pop();
    const fileName = `cover_${Date.now()}.${ext}`;
    const filePath = `news-images/${fileName}`;

    const { error } = await supabase.storage.from('news-images').upload(filePath, coverFile);

    if (error) {
      console.error("❌ Upload error:", error);
      alert('เกิดข้อผิดพลาดในการอัปโหลดภาพหน้าปก');
      return null;
    }

    const { data } = supabase.storage.from('news-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !slug || !excerpt || !body) {
      alert('กรุณากรอกข้อมูลให้ครบ');
      return;
    }

    setUploading(true);

    const coverUrl = await uploadCover();
    if (!coverUrl) {
      setUploading(false);
      return;
    }

    const payload = {
      title,
      slug,
      excerpt,
      content: body,         // ✅ ใช้ field ที่ตรงกับ schema
      coverimage: coverUrl,  // ✅ ใช้ field ที่ตรงกับ schema
    };

    console.log("📤 กำลังโพสต์ข้อมูล:", payload);

    const { error } = await supabase.from('seo_articles').insert([payload]);

    setUploading(false);

    if (error) {
      console.error("❌ Insert error:", error);
      alert('โพสต์ไม่สำเร็จ');
    } else {
      alert('✅ โพสต์บทความสำเร็จ!');
      router.push('/admin/blogs');
    }
  };

  return (
    <div className="container py-6 max-w-3xl mx-auto text-white">
      <h2 className="text-2xl mb-4">📝 เพิ่มบทความ SEO</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>ชื่อบทความ</label>
          <input
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Slug (ลิงก์ URL)</label>
          <input
            className="form-control"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            placeholder="เช่น: green-cheek-care"
          />
        </div>

        <div>
          <label>คำเกริ่น (Excerpt)</label>
          <textarea
            className="form-control"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <label>เนื้อหาหลัก</label>
          <ReactQuill value={body} onChange={setBody} modules={quillModules} theme="snow" />
        </div>

        <div>
          <label>ภาพหน้าปก</label>
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={handleCoverChange}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={uploading}>
          {uploading ? 'กำลังโพสต์...' : 'โพสต์บทความ'}
        </button>
      </form>
    </div>
  );
}

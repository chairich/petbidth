
'use client'

import React, { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

const CreateKnowledge = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [sections, setSections] = useState([{ subheading: '', body: '' }]);
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleSectionChange = (index: number, field: 'subheading' | 'body', value: string) => {
    const updated = [...sections];
    updated[index][field] = value;
    setSections(updated);
  };

  const addSection = () => {
    setSections([...sections, { subheading: '', body: '' }]);
  };

  const removeSection = (index: number) => {
    if (sections.length === 1) return;
    const updated = sections.filter((_, i) => i !== index);
    setSections(updated);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert('สามารถอัปโหลดได้สูงสุด 5 รูปเท่านั้น');
      return;
    }
    setImages(files);
  };

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${i}.${fileExt}`;
      const filePath = `knowledge-images/${fileName}`;
      const { error } = await supabase.storage.from('knowledge-images').upload(filePath, file);
      if (error) {
        alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ: ' + error.message);
        return [];
      }
      const { data } = supabase.storage.from('knowledge-images').getPublicUrl(filePath);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || sections.some((s) => !s.subheading || !s.body)) {
      alert('กรุณากรอกหัวข้อ และเนื้อหาให้ครบทุกส่วน');
      return;
    }
    setUploading(true);
    const imageUrls = await uploadImages();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      alert('กรุณาเข้าสู่ระบบก่อนโพสต์');
      setUploading(false);
      return;
    }

    const { data: post, error } = await supabase
      .from('knowledge_posts')
      .insert({
        title,
        images: imageUrls,
        author_id: userData.user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error || !post) {
      alert('เกิดข้อผิดพลาดในการสร้างบทความ');
      setUploading(false);
      return;
    }

    for (const s of sections) {
      await supabase.from('knowledge_sections').insert({
        post_id: post.id,
        subheading: s.subheading,
        body: s.body
      });
    }

    alert('โพสต์เรียบร้อยแล้ว');
    router.push(`/knowledge/${post.id}`);
  };

  return (
    <div className="container py-5 max-w-3xl mx-auto text-white">
      <h2 className="text-2xl mb-4">📝 สร้างบทความความรู้</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label>หัวข้อบทความ</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {sections.map((section, index) => (
          <div key={index} className="mb-4 border p-3 rounded bg-[#0e1b3c]">
            <label>หัวข้อย่อย #{index + 1}</label>
            <input
              type="text"
              className="form-control mb-2"
              value={section.subheading}
              onChange={(e) => handleSectionChange(index, 'subheading', e.target.value)}
              placeholder="หัวข้อย่อย"
              required
            />
            <ReactQuill
              value={section.body}
              onChange={(value) => handleSectionChange(index, 'body', value)}
              modules={quillModules}
              theme="snow"
            />
            <button type="button" onClick={() => removeSection(index)} className="text-sm text-red-400 mt-2">
              ลบหัวข้อนี้
            </button>
          </div>
        ))}

        <div className="mb-4">
          <button type="button" onClick={addSection} className="btn btn-secondary">
            ➕ เพิ่มหัวข้อย่อย
          </button>
        </div>

        <div className="mb-4">
          <label>อัปโหลดรูปภาพ (สูงสุด 5 รูป)</label>
          <input type="file" multiple accept="image/*" className="form-control" onChange={handleImageChange} />
        </div>

        <button type="submit" className="btn btn-primary" disabled={uploading}>
          {uploading ? 'กำลังโพสต์...' : 'โพสต์บทความ'}
        </button>
      </form>
    </div>
  );
};

export default CreateKnowledge;

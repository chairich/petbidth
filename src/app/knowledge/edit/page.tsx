'use client';

import React, { useEffect, useState, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const EditKnowledgePost = () => {
  const router = useRouter();
  const { id } = useParams(); // ต้องเป็น dynamic route /knowledge/edit/[id]
  const [title, setTitle] = useState('');
  const [sections, setSections] = useState([{ id: null, subheading: '', body: '' }]);
  const [images, setImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      const { data: post } = await supabase
        .from('knowledge_posts')
        .select('title, images')
        .eq('id', id)
        .single();

      const { data: sectionData } = await supabase
        .from('knowledge_sections')
        .select('id, subheading, body')
        .eq('post_id', id);

      if (post) {
        setTitle(post.title);
        setImages(post.images || []);
        setSections(sectionData || []);
      }
    };

    fetchPost();
  }, [id]);

  const handleSectionChange = (index: number, field: 'subheading' | 'body', value: string) => {
    const updated = [...sections];
    updated[index][field] = value;
    setSections(updated);
  };

  const addSection = () => {
    setSections([...sections, { id: null, subheading: '', body: '' }]);
  };

  const removeSection = (index: number) => {
    const updated = sections.filter((_, i) => i !== index);
    setSections(updated);
  };

  const handleNewImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      alert('สามารถมีรูปภาพรวมได้ไม่เกิน 5 รูป');
      return;
    }
    setNewImages(files);
  };

  const uploadNewImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (let i = 0; i < newImages.length; i++) {
      const file = newImages[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${i}.${fileExt}`;
      const filePath = `knowledge-images/${fileName}`;
      const { error } = await supabase.storage.from('knowledge-images').upload(filePath, file);
      if (error) {
        alert('อัปโหลดรูปภาพล้มเหลว: ' + error.message);
        return [];
      }
      const { data } = supabase.storage.from('knowledge-images').getPublicUrl(filePath);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    const uploadedNew = await uploadNewImages();
    const updatedImages = [...images, ...uploadedNew];

    const { error: updateError } = await supabase
      .from('knowledge_posts')
      .update({ title, images: updatedImages })
      .eq('id', id);

    // ลบ section ทั้งหมดก่อน แล้วเพิ่มใหม่
    await supabase.from('knowledge_sections').delete().eq('post_id', id);

    for (const s of sections) {
      await supabase.from('knowledge_sections').insert({
        post_id: id,
        subheading: s.subheading,
        body: s.body
      });
    }

    if (updateError) {
      alert('บันทึกไม่สำเร็จ');
    } else {
      alert('บันทึกเรียบร้อย');
      router.push(`/knowledge/${id}`);
    }
    setUploading(false);
  };

  return (
    <div className="container py-5 max-w-3xl mx-auto text-white">
      <h2 className="text-2xl mb-4">✏️ แก้ไขบทความ</h2>
      <form onSubmit={handleSave}>
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
            <textarea
              className="form-control"
              rows={4}
              value={section.body}
              onChange={(e) => handleSectionChange(index, 'body', e.target.value)}
              placeholder="เนื้อหาในหัวข้อนี้"
              required
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
          <label>ภาพที่มีอยู่</label>
          <ul className="list-disc ps-4">
            {images.map((url, i) => (
              <li key={i} className="text-sm">{url}</li>
            ))}
          </ul>
        </div>

        <div className="mb-4">
          <label>เพิ่มรูปภาพใหม่ (รวมได้สูงสุด 5 รูป)</label>
          <input type="file" multiple accept="image/*" className="form-control" onChange={handleNewImageChange} />
        </div>

        <button type="submit" className="btn btn-primary" disabled={uploading}>
          {uploading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
        </button>
      </form>
    </div>
  );
};

export default EditKnowledgePost;

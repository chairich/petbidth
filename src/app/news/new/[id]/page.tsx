
'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function NewsForm() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { id } = useParams();
  const isEdit = !!id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [coverImageIndex, setCoverImageIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isEdit) return;
      const { data, error } = await supabase
        .from('store_news')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        console.error('Error loading news:', error);
        return;
      }
      if (data) {
        setTitle(data.title);
        setContent(data.content);
        setExistingImages(data.images || []);
        setCoverImageIndex(data.cover_image_index || 0);
      }
    };
    fetchData();
  }, [id]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert('สามารถอัปโหลดได้สูงสุด 5 รูปเท่านั้น');
      return;
    }
    setImages(files);
    setCoverImageIndex(0);
  };

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const fileName = `${Date.now()}_${i}.${file.name.split('.').pop()}`;
      const filePath = `news-images/${fileName}`;
      const { error } = await supabase.storage.from('news-images').upload(filePath, file);
      if (error) {
        alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ: ' + error.message);
        return [];
      }
      const { data } = supabase.storage.from('news-images').getPublicUrl(filePath);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  
const handleDelete = async () => {
  const confirmDelete = confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข่าวนี้?");
  if (!confirmDelete) return;

  setUploading(true);
  const { error } = await supabase.from("store_news").delete().eq("id", id);

  setUploading(false);
  if (error) {
    alert("เกิดข้อผิดพลาดในการลบ: " + error.message);
  } else {
    alert("ลบข่าวเรียบร้อยแล้ว");
    router.push("/news");
  }
};

const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    if (!title || !content) return alert('กรุณากรอกข้อมูลให้ครบ');

    setUploading(true);
    const imageUrls = images.length > 0 ? await uploadImages() : existingImages;

    const payload = {
      title,
      content,
      images: imageUrls,
      cover_image_index: coverImageIndex,
    };

    let result;
    if (isEdit) {
      result = await supabase.from('store_news').update(payload).eq('id', id);
    } else {
      result = await supabase.from('store_news').insert(payload);
    }

    setUploading(false);
    if (result.error) {
      alert('บันทึกข่าวล้มเหลว: ' + result.error.message);
    } else {
      alert('บันทึกข่าวสำเร็จ');
      router.push('/news');
    }
  };

  return (
    <div className="container py-5">
      <h2>{isEdit ? 'แก้ไขข่าว' : 'เพิ่มข่าว'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>หัวข้อข่าว</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>เนื้อหา</label>
          <textarea
            className="form-control"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="mb-3">
          <label>อัปโหลดรูปภาพ (สูงสุด 5 รูป)</label>
          <input type="file" multiple accept="image/*" className="form-control" onChange={handleImageChange} />
          {(images.length > 0 || existingImages.length > 0) && (
            <div className="mt-2 d-flex gap-2 flex-wrap">
              {(images.length > 0 ? images : existingImages).map((img, idx) => {
                const src = typeof img === 'string' ? img : URL.createObjectURL(img);
                return (
                  <div key={idx} onClick={() => setCoverImageIndex(idx)} style={{ cursor: 'pointer', border: coverImageIndex === idx ? '2px solid blue' : 'none' }}>
                    <img src={src} alt={`img-${idx}`} width={80} height={80} />
                    <div className="text-center">{coverImageIndex === idx ? 'หน้าปก' : ''}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
<div className="d-flex gap-2">
  <button type="submit" className="btn btn-primary" disabled={uploading}>
    {uploading ? 'กำลังบันทึก...' : isEdit ? 'อัปเดตข่าว' : 'เพิ่มข่าว'}
  </button>
  {isEdit && (
    <button
      type="button"
      onClick={handleDelete}
      className="btn btn-danger"
      disabled={uploading}
    >
      ลบข่าวนี้
    </button>
  )}
</div>

      </form>
    </div>
  );
}

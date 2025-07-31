'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function NewsForm() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { id } = useParams();
  const isEdit = !!id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [coverImageIndex, setCoverImageIndex] = useState(0);
  const [uploading, setUploading] = useState(false);

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

  const handleDeleteImage = (index: number) => {
    const confirmDelete = confirm("ลบรูปภาพนี้?");
    if (!confirmDelete) return;
    const updatedImages = [...existingImages];
    updatedImages.splice(index, 1);
    setExistingImages(updatedImages);
    if (coverImageIndex === index) setCoverImageIndex(0);
    else if (coverImageIndex > index) setCoverImageIndex(coverImageIndex - 1);
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
    <div className="container py-5 text-white">
      <h2 className="text-2xl font-bold mb-4">{isEdit ? 'แก้ไขข่าว' : 'เพิ่มข่าว'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-semibold mb-1">หัวข้อข่าว</label>
          <input
            type="text"
            className="w-full px-3 py-2 text-black rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">เนื้อหา</label>
          <ReactQuill value={content} onChange={setContent} theme="snow" />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">อัปโหลดรูปภาพ (สูงสุด 5 รูป)</label>
          <input type="file" multiple accept="image/*" onChange={handleImageChange} />
        </div>

        {(images.length > 0 || existingImages.length > 0) && (
          <div className="flex gap-2 flex-wrap mb-4">
            {(images.length > 0 ? images.map((file, idx) => ({
              src: URL.createObjectURL(file),
              isNew: true,
            })) : existingImages.map((url) => ({
              src: url,
              isNew: false,
            }))).map((img, idx) => (
              <div key={idx} className="relative">
                <img
                  src={img.src}
                  width={80}
                  height={80}
                  className={`rounded border ${coverImageIndex === idx ? 'border-blue-500 border-2' : ''}`}
                  onClick={() => setCoverImageIndex(idx)}
                />
                {!img.isNew && (
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(idx)}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded" disabled={uploading}>
            {uploading ? 'กำลังบันทึก...' : isEdit ? 'อัปเดตข่าว' : 'เพิ่มข่าว'}
          </button>
          {isEdit && (
            <button type="button" onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
              ลบข่าวนี้
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

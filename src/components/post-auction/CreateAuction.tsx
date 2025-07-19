'use client'
import React, { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const CreateAuction = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_price: '',
    end_time: '',
    overlay_text: '', // ✅ เพิ่มฟิลด์ใหม่
  });
  const [images, setImages] = useState<File[]>([]);
  const [coverImageIndex, setCoverImageIndex] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${i}.${fileExt}`;
      const filePath = `auction-images/${fileName}`;
      const { error } = await supabase.storage.from('auction-images').upload(filePath, file);
      if (error) {
        alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ: ' + error.message);
        return [];
      }
      const { data } = supabase.storage.from('auction-images').getPublicUrl(filePath);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.start_price || !formData.end_time) {
      alert('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }
    if (images.length === 0) {
      alert('กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป');
      return;
    }

    setUploading(true);
    const imageUrls = await uploadImages();
    if (imageUrls.length === 0) {
      setUploading(false);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      alert('กรุณาเข้าสู่ระบบก่อนสร้างประมูล');
      setUploading(false);
      return;
    }

    const newAuction = {
      title: formData.title,
      description: formData.description,
      start_price: parseFloat(formData.start_price),
      end_time: formData.end_time,
      cover_image_index: coverImageIndex,
      images: imageUrls,
      overlay_text: formData.overlay_text, // ✅ ส่ง overlay ไปด้วย
      created_by: userData.user.id,
      is_closed: false,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('auctions').insert(newAuction).select().single();

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
      setUploading(false);
      return;
    }

    alert('สร้างกระทู้ประมูลเรียบร้อยแล้ว');
    router.push(`/auction/${data.id}`);
  };

  return (
    <div className="container py-5">
      <h2>สร้างกระทู้ประมูลใหม่</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>ชื่อประมูล</label>
          <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label>รายละเอียด</label>
          <textarea name="description" className="form-control" rows={4} value={formData.description} onChange={handleChange} required></textarea>
        </div>

        <div className="mb-3">
          <label>ราคาเริ่มต้น (บาท)</label>
          <input type="number" name="start_price" className="form-control" value={formData.start_price} onChange={handleChange} required min="0" step="0.01" />
        </div>

        <div className="mb-3">
          <label>วันเวลาสิ้นสุดการประมูล</label>
          <input type="datetime-local" name="end_time" className="form-control" value={formData.end_time} onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label>ข้อความที่จะแสดงบนภาพแรก (เช่น "ปิดประมูลแล้ว" หรือ "รายการพิเศษ")</label>
          <textarea
  name="overlay_text"
  className="form-control"
  rows={4}
  value={formData.overlay_text}
  onChange={handleChange}
  placeholder={`ใส่ข้อความ เช่น\n1. ข้อแรก\n2. ข้อสอง\n3. ข้อสาม`}
/>



        </div>

        <div className="mb-3">
          <label>อัปโหลดรูปภาพ (สูงสุด 5 รูป)</label>
          <input type="file" multiple accept="image/*" className="form-control" onChange={handleImageChange} />
          {images.length > 0 && (
            <div className="mt-2 d-flex gap-2 flex-wrap">
              {images.map((img, idx) => (
                <div key={idx} onClick={() => setCoverImageIndex(idx)} style={{ cursor: 'pointer', border: coverImageIndex === idx ? '2px solid blue' : 'none' }}>
                  <img src={URL.createObjectURL(img)} alt={`img-${idx}`} width={80} height={80} />
                  <div className="text-center">{coverImageIndex === idx ? 'หน้าปก' : ''}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary" disabled={uploading}>
          {uploading ? 'กำลังสร้าง...' : 'สร้างกระทู้ประมูล'}
        </button>
      </form>
    </div>
  );
};

export default CreateAuction;

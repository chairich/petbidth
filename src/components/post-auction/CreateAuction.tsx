'use client';

import React, { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import dayjs from 'dayjs';

const CreateAuction = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_price: '',
    start_time: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [coverImageIndex, setCoverImageIndex] = useState(0);
  const [uploading, setUploading] = useState(false);

  // ✅ แอดมินเลือกขั้นต่ำ 20/50/100
  const [bidRoomStep, setBidRoomStep] = useState<number>(100);

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
    setImages(files as File[]);
  };

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of images) {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage.from('auction-images').upload(fileName, file);
      if (error) throw error;
      const { data: publicUrl } = supabase.storage.from('auction-images').getPublicUrl(fileName);
      urls.push(publicUrl.publicUrl);
    }
    return urls;
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (uploading) return;
  try {
    setUploading(true);

    const startPrice = Number(formData.start_price || 0);
    if (![20, 50, 100].includes(bidRoomStep)) {
      alert('ขั้นต่ำต่อครั้งต้องเป็น 20, 50 หรือ 100 เท่านั้น');
      setUploading(false);
      return;
    }

    let imageUrls: string[] = [];
    if (images.length > 0) {
      imageUrls = await uploadImages();
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    const payload: any = {
      title: formData.title,
      description: formData.description,
      start_price: startPrice,
      start_time: formData.start_time ? dayjs(formData.start_time).toISOString() : null,
      images: imageUrls,
      cover_image_index: coverImageIndex,
      created_by: userId,
      bid_step: bidRoomStep,
    };

    // ⬇️ เปลี่ยนตรงนี้: insert และดึง id กลับมา
    const { data: inserted, error } = await supabase
      .from('auctions')
      .insert([payload])
      .select('id')
      .single();

    if (error) throw error;

    alert('สร้างกระทู้ประมูลสำเร็จ');
    // ⬇️ เปลี่ยนจาก /admin/auctions เป็นหน้า auction ที่สร้าง
    router.push(`/auction/${inserted.id}`);
  } catch (err: any) {
    alert('เกิดข้อผิดพลาดในการสร้าง: ' + err.message);
  } finally {
    setUploading(false);
  }
};


  return (
    <div className="container py-4">
      <h2>สร้างกระทู้ประมูล</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">ชื่อสินค้า</label>
          <input className="form-control" name="title" value={formData.title} onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label">รายละเอียด</label>
          <textarea className="form-control" name="description" value={formData.description} onChange={handleChange} />
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">ราคาเริ่มต้น (บาท)</label>
            <input type="number" className="form-control" name="start_price" value={formData.start_price} onChange={handleChange} required />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">เริ่มประมูล</label>
            <input type="datetime-local" className="form-control" name="start_time" value={formData.start_time} onChange={handleChange} />
          </div>
        </div>

        {/* ✅ เลือกขั้นต่ำต่อครั้ง */}
        <div className="mb-3">
          <label className="form-label">ขั้นต่ำต่อครั้ง (แยกห้อง)</label>
          <select className="form-select" value={bidRoomStep} onChange={(e) => setBidRoomStep(Number(e.target.value))}>
            <option value={20}>20 บาท</option>
            <option value={50}>50 บาท</option>
            <option value={100}>100 บาท</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">รูปภาพ (สูงสุด 5 รูป)</label>
          <input type="file" accept="image/*" multiple className="form-control" onChange={handleImageChange} />
        </div>

        {images.length > 0 && (
          <div className="mb-3">
            <label className="form-label">ภาพหน้าปก</label>
            <div className="d-flex gap-2 flex-wrap">
              {images.map((file, idx) => (
                <button
                  type="button"
                  key={idx}
                  className={`btn btn-sm ${coverImageIndex === idx ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setCoverImageIndex(idx)}
                >
                  รูปที่ {idx + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={uploading}>
          {uploading ? 'กำลังสร้าง...' : 'สร้างกระทู้ประมูล'}
        </button>
      </form>
    </div>
  );
};

export default CreateAuction;

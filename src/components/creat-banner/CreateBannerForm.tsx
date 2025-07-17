
'use client'
import React, { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CreateBanner = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    shop_name: '',
    phone: '',
    line_id: '',
    facebook: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [coverImageIndex, setCoverImageIndex] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (!formData.shop_name || !formData.phone) {
      alert('กรุณากรอกข้อมูลให้ครบ');
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
      alert('กรุณาเข้าสู่ระบบก่อนสร้างแบนเนอร์');
      setUploading(false);
      return;
    }

    const newBanner = {
      shop_name: formData.shop_name,
      phone: formData.phone,
      line_id: formData.line_id,
      facebook: formData.facebook,
      images: imageUrls,
      cover_image_index: coverImageIndex,
      created_by: userData.user.id,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('banners').insert(newBanner);
    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
      setUploading(false);
      return;
    }

    alert('สร้างแบนเนอร์ร้านค้าสำเร็จ');
    router.push('/vip/dashboard');
  };

  return (
    <div className="container py-5 text-white">
      <h2>สร้างแบนเนอร์ร้านค้า</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>ชื่อร้าน</label>
          <input type="text" name="shop_name" className="form-control" value={formData.shop_name} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>เบอร์โทร</label>
          <input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>LINE ID</label>
          <input type="text" name="line_id" className="form-control" value={formData.line_id} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label>Facebook</label>
          <input type="text" name="facebook" className="form-control" value={formData.facebook} onChange={handleChange} />
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
          {uploading ? 'กำลังสร้าง...' : 'สร้างแบนเนอร์ร้านค้า'}
        </button>
      </form>
    </div>
  );
};

export default CreateBanner;

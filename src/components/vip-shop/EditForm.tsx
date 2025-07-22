'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import HeaderOne from '@/layouts/headers/HeaderOne';
import Breadcrumb from '../common/Breadcrumb';
import Divider from '../common/Divider';
import FooterOne from '@/layouts/footers/FooterOne';
import Image from 'next/image';

export default function EditForm({ data }: { data: any }) {
  const [form, setForm] = useState<any>({ ...data, cover_image_index: data.cover_image_index ?? 0 });
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (files.length > 5) return alert('อัปโหลดได้สูงสุด 5 รูป');

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = `shop-images/${Date.now()}_${i}.${file.name.split('.').pop()}`;

      const { data, error } = await supabase.storage.from('auction-images').upload(filePath, file);
      if (error) {
        console.error('Upload failed:', error.message);
        continue;
      }

      const { data: publicUrlData } = supabase.storage.from('auction-images').getPublicUrl(filePath);
      if (publicUrlData?.publicUrl) {
        uploadedUrls.push(publicUrlData.publicUrl);
      }
    }

    setForm((prev: any) => ({
      ...prev,
      images: [...(prev.images || []), ...uploadedUrls],
    }));
    setUploading(false);
  };

  const handleImageRemove = (index: number) => {
    const newImages = [...form.images];
    newImages.splice(index, 1);
    const newCoverIndex =
      form.cover_image_index === index
        ? 0
        : form.cover_image_index > index
        ? form.cover_image_index - 1
        : form.cover_image_index;
    setForm((prev: any) => ({
      ...prev,
      images: newImages,
      cover_image_index: newCoverIndex,
    }));
  };

  const handleSubmit = async () => {
    if (!form?.id) {
      setMessage('❌ ไม่พบ ID ของร้านค้า');
      return;
    }

    const { error } = await supabase
      .from('banners')
      .update({
        shop_name: form.shop_name,
        facebook: form.facebook,
        line_id: form.line_id,
        phone: form.phone,
        description: form.description,
        store_details: form.store_details,
        images: form.images,
        cover_image_index: form.cover_image_index,
      })
      .eq('id', form.id);

    if (error) {
      console.error('❌ อัปเดตไม่สำเร็จ:', error.message);
      setMessage('❌ เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
    } else {
      setMessage('✅ แก้ไขร้านค้าสำเร็จแล้ว');
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  if (!form) return <p>ไม่พบข้อมูลร้านค้า</p>;

  return (
    <>
      <HeaderOne />
      <Breadcrumb title="แก้ไขร้านค้า" />
      <Divider />
      <div className="container py-5 text-white">
        <h2 className="mb-4">แก้ไขร้านค้า</h2>

        {form.images?.length > 0 && (
          <>
            <div className="text-center mb-4">
              <Image
                src={form.images[form.cover_image_index]}
                alt="cover"
                width={500}
                height={375}
                className="rounded shadow"
              />
            </div>
            <div className="d-flex gap-2 flex-wrap justify-center mb-4">
  {form.images.map((url: string, index: number) => (
    <div
      key={index}
      className={`relative cursor-pointer border rounded p-1 ${
        index === form.cover_image_index ? 'border-primary border-2' : 'border-secondary'
      }`}
    >
      <Image
        src={url}
        alt={`thumb-${index}`}
        width={100}
        height={75}
        className="rounded"
        onClick={() => setForm((prev: any) => ({ ...prev, cover_image_index: index }))}
      />
      <div className="text-center text-xs mt-1">
        {form.cover_image_index === index ? 'ภาพหลัก' : ''}
      </div>
      {/* ปุ่มลบ */}
      <button
        type="button"
        onClick={() => handleImageRemove(index)}
        className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-2 py-0.5 text-xs hover:bg-red-700"
        style={{ transform: 'translate(50%, -50%)' }}
      >
        x
      </button>
    </div>
  ))}
</div>

          </>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div className="mb-3">
            <label>ชื่อร้าน</label>
            <input name="shop_name" value={form.shop_name || ''} onChange={handleChange} className="form-control" />
          </div>
          <div className="mb-3">
            <label>Facebook</label>
            <input name="facebook" value={form.facebook || ''} onChange={handleChange} className="form-control" />
          </div>
          <div className="mb-3">
            <label>LINE ID</label>
            <input name="line_id" value={form.line_id || ''} onChange={handleChange} className="form-control" />
          </div>
          <div className="mb-3">
            <label>เบอร์โทร</label>
            <input name="phone" value={form.phone || ''} onChange={handleChange} className="form-control" />
          </div>
          <div className="mb-3">
            <label>รายละเอียดร้าน</label>
            <textarea name="description" value={form.description || ''} onChange={handleChange} className="form-control" rows={3} />
          </div>
          <div className="mb-3">
            <label>ข้อมูลติดต่อเพิ่มเติม</label>
            <textarea name="store_details" value={form.store_details || ''} onChange={handleChange} className="form-control" rows={2} />
          </div>
          <div className="mb-3">
            <label>อัปโหลดรูปภาพ (สูงสุด 5 รูป)</label>
            <input type="file" multiple accept="image/*" className="form-control" onChange={handleImageUpload} />
            {uploading && <p className="text-warning mt-2">กำลังอัปโหลด...</p>}
          </div>
          <button type="submit" className="btn btn-primary mt-2">บันทึก</button>
          {message && <p className="mt-2 text-success">{message}</p>}
        </form>
      </div>
      <FooterOne />
    </>
  );
}
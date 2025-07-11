import React, { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useUser } from '@/utils/userContext';

const CreateNewArea = () => {
  const { user } = useUser();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startPrice, setStartPrice] = useState('');
  const [endTime, setEndTime] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async () => {
    const urls: string[] = [];
    for (const image of images) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `auctions/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('images').upload(filePath, image);

      if (uploadError) {
        console.error(uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const uploadedImageUrls = await handleImageUpload();

      const { error } = await supabase.from('auctions').insert([
        {
          title,
          description,
          images: uploadedImageUrls,
          cover_image_index: coverIndex,
          start_price: Number(startPrice),
          end_time: endTime,
          created_by: user?.id,
          is_closed: false,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;
      alert('สร้างโพสต์สำเร็จ');
    } catch (err: any) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">สร้างกระทู้ประมูลใหม่</h1>
      <input
        className="mb-2 p-2 bg-gray-800 w-full"
        placeholder="ชื่อประมูล"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="mb-2 p-2 bg-gray-800 w-full"
        placeholder="รายละเอียด"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="number"
        className="mb-2 p-2 bg-gray-800 w-full"
        placeholder="ราคาเริ่มต้น (บาท)"
        value={startPrice}
        onChange={(e) => setStartPrice(e.target.value)}
      />
      <input
        type="datetime-local"
        className="mb-2 p-2 bg-gray-800 w-full"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        multiple
        className="mb-2"
        onChange={(e) => {
          const files = e.target.files;
          if (files) setImages(Array.from(files).slice(0, 5));
        }}
      />

      <div className="flex gap-2 mb-4">
        {images.map((file, index) => (
          <div
            key={index}
            className={`border ${coverIndex === index ? 'border-blue-400' : 'border-gray-600'} p-1`}
            onClick={() => setCoverIndex(index)}
          >
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
              className="w-24 h-24 object-cover"
            />
            {coverIndex === index && <div className="text-center text-xs">หน้าปก</div>}
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
      >
        {loading ? 'กำลังสร้าง...' : 'สร้างโพสต์'}
      </button>
    </div>
  );
};

export default CreateNewArea;

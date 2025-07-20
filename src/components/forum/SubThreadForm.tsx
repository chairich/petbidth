'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import EmojiPicker from 'emoji-picker-react';

const SubThreadForm = ({ parentThreadId }: { parentThreadId: string }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);

  const handleEmojiClick = (emojiData: any) => {
    setContent((prev) => prev + emojiData.emoji);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = null;
    if (image) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('forum-images')
        .upload(fileName, image);

      if (error) {
        alert('อัปโหลดรูปภาพล้มเหลว: ' + error.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('forum-images')
        .getPublicUrl(data.path);

      imageUrl = publicUrlData?.publicUrl;
    }

    const { error } = await supabase.from('threads').insert({
      title,
      content,
      image_url: imageUrl,
      parent_id: parentThreadId,
    });

    if (error) {
      alert('เกิดข้อผิดพลาดในการโพสต์');
    } else {
      setTitle('');
      setContent('');
      setImage(null);
      alert('โพสต์สำเร็จ!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <input
        type="text"
        className="w-full border p-2 rounded"
        placeholder="ชื่อหัวข้อย่อย"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        className="w-full border p-2 rounded"
        rows={4}
        placeholder="เขียนรายละเอียด..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
      />
      <button type="button" onClick={() => setEmojiOpen(!emojiOpen)}>
        😊 เลือกอีโมจิ
      </button>
      {emojiOpen && (
        <EmojiPicker onEmojiClick={handleEmojiClick} height={300} width={250} />
      )}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        ส่งหัวข้อย่อย
      </button>
    </form>
  );
};

export default SubThreadForm;

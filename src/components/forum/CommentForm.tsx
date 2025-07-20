import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const CommentForm = ({ threadId }: { threadId: string }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageUrl = null;

    if (image) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage.from('comment-images').upload(fileName, image);
      if (error) return;
      imageUrl = data?.path;
    }

    await supabase.from('comments').insert([
      { content, thread_id: threadId, image_url: imageUrl }
    ]);

    setContent('');
    setImage(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 border rounded-xl">
      <textarea
        className="w-full p-2 border rounded"
        rows={3}
        placeholder="เขียนความคิดเห็นของคุณ..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex items-center gap-2">
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
        <button
          type="button"
          onClick={() => setEmojiPickerVisible(!emojiPickerVisible)}
          className="text-lg"
        >😊</button>
        {emojiPickerVisible && (
          <div className="absolute z-10 bg-white border p-2 rounded shadow">
            {['😀','😅','😎','😍','🥳','😭','😡'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setContent(content + emoji);
                  setEmojiPickerVisible(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
        <button type="submit" className="ml-auto bg-blue-600 text-white px-4 py-2 rounded">
          ส่งความคิดเห็น
        </button>
      </div>
    </form>
  );
};

export default CommentForm;

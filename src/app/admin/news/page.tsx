"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function PostNewsPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [form, setForm] = useState({ title: "", content: "" });
  const [imageFile, setImageFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file?.type.startsWith("image/")) {
      alert("กรุณาเลือกรูปภาพเท่านั้น");
      return;
    }
    setImageFile(file);
    setPreviewURL(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      alert("กรุณากรอกหัวข้อและเนื้อหาให้ครบ");
      return;
    }

    setLoading(true);
    let image_url = "";

    if (imageFile) {
      const filename = `${Date.now()}_${imageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("news")
        .upload(filename, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        alert("อัปโหลดรูปไม่สำเร็จ: " + uploadError.message);
        setLoading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("news").getPublicUrl(filename);

      image_url = publicUrl;
    }

    const { error } = await supabase.from("store_news").insert([
      {
        title: form.title.trim(),
        content: form.content.trim(),
        image_url,
      },
    ]);

    setLoading(false);

    if (!error) {
      router.push("/news");
    } else {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-white">
      <h1 className="text-3xl font-bold mb-6">📢 โพสต์ข่าวสารใหม่</h1>
      <form onSubmit={handleSubmit} className="space-y-6">

        <div>
          <label className="block mb-1 font-medium">หัวข้อข่าว *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full px-3 py-2 text-black rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">เลือกรูปภาพ (ไม่บังคับ)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-white"
          />
          {previewURL && (
            <img src={previewURL} alt="preview" className="mt-4 w-full max-h-80 object-contain rounded border" />
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">เนื้อหาข่าว (HTML)*</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            rows={10}
            className="w-full px-3 py-2 text-black font-mono text-sm rounded"
            placeholder="<p>พิมพ์ HTML ได้ เช่น <strong>ตัวหนา</strong>, <br />, <ul><li>รายการ</li></ul>"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 px-6 py-2 rounded text-white hover:bg-blue-700"
        >
          {loading ? "🚀 กำลังโพสต์..." : "โพสต์ข่าว"}
        </button>
      </form>
    </div>
  );
}
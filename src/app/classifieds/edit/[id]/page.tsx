
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useParams } from "next/navigation";
import supabase from "@/lib/supabaseClient2";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

export default function EditClassified() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    contact: "",
    category: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [oldImages, setOldImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("classifieds")
        .select("*")
        .eq("id", id)
        .single();
      if (data) {
        setForm({
          title: data.title,
          description: data.description,
          price: data.price,
          contact: data.contact,
          category: data.category,
        });
        setOldImages(data.images || []);
      }
    };
    if (id) fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDescriptionChange = (value: string) => {
    setForm({ ...form, description: value });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setImages(Array.from(files).slice(0, 5));
    }
  };

  const handleDeleteOldImage = (index: number) => {
    const updated = [...oldImages];
    updated.splice(index, 1);
    setOldImages(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const imageUrls = [...oldImages];

    for (const file of images) {
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("classifieds").upload(fileName, file);
      if (uploadError) {
        alert("อัปโหลดรูปภาพล้มเหลว");
        return;
      }
      const { data } = supabase.storage.from("classifieds").getPublicUrl(fileName);
      if (data?.publicUrl) imageUrls.push(data.publicUrl);
    }

    const { error } = await supabase.from("classifieds").update({
      ...form,
      price: parseFloat(form.price),
      images: imageUrls,
    }).eq("id", id);

    if (!error) {
      router.push("/classifieds");
    } else {
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  return (
    <div className="bg-transparent text-white min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto bg-transparent p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-6">✏️ แก้ไขประกาศ</h2>
        <form onSubmit={handleSubmit}>
          <input className="form-control mb-3" name="title" value={form.title} onChange={handleChange} placeholder="ชื่อสินค้า" required />

          <div className="mb-3 text-black">
            <label className="block text-sm font-semibold mb-1 text-white">รายละเอียด</label>
            <ReactQuill
              value={form.description}
              onChange={handleDescriptionChange}
              theme="snow"
              className="bg-white dark:bg-gray-800 dark:text-white rounded"
              modules={{
                toolbar: [
                  [{ header: [1, 2, false] }],
                  ["bold", "italic", "underline", "strike"],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["link", "image"],
                  ["clean"],
                ],
              }}
              formats={[
                "header", "bold", "italic", "underline", "strike",
                "list", "bullet", "link", "image",
              ]}
            />
          </div>

          <input className="form-control mb-3" name="price" type="number" value={form.price} onChange={handleChange} placeholder="ราคา" required />
          <input className="form-control mb-3" name="contact" value={form.contact} onChange={handleChange} placeholder="ช่องทางติดต่อ" required />
          <input className="form-control mb-3" name="category" value={form.category} onChange={handleChange} placeholder="หมวดหมู่" />
          <input className="form-control mb-3" type="file" accept="image/*" multiple onChange={handleFile} />

          <div className="grid grid-cols-3 gap-3 mb-4">
            {oldImages.map((url, idx) => (
              <div key={idx} className="relative">
                <img src={url} className="rounded shadow w-full h-28 object-cover" alt="preview" />
                <button
                  type="button"
                  onClick={() => handleDeleteOldImage(idx)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button type="submit" className="btn btn-primary w-full">บันทึกการแก้ไข</button>
        </form>
      </div>
    </div>
  );
}

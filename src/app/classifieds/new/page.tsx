
"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import supabase from "@/lib/supabaseClient2";
import { useRouter } from "next/navigation";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

export default function NewClassified() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    contact: "",
    category: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [shopBannerId, setShopBannerId] = useState<string | null>(null);

  useEffect(() => {
    const fetchShop = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: banner } = await supabase
        .from("banners")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (banner?.id) {
        setShopBannerId(banner.id);
      }
    };
    fetchShop();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const imageUrls: string[] = [];

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

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    const { error } = await supabase.from("classifieds").insert({
      ...form,
      price: parseFloat(form.price),
      images: imageUrls,
      created_by: userId,
      shop_banner_id: shopBannerId ?? null,
    });

    if (!error) {
      router.push("/classifieds");
    } else {
      alert("เกิดข้อผิดพลาดในการโพสต์");
    }
  };

  return (
    <div className="bg-transparent text-white min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto bg-transparent p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-6">📋 โพสต์ประกาศใหม่</h2>
        <form onSubmit={handleSubmit}>
          <input className="form-control mb-3" name="title" placeholder="ชื่อสินค้า" onChange={handleChange} required />

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

          <input className="form-control mb-3" name="price" type="number" placeholder="ราคา" onChange={handleChange} required />
          <input className="form-control mb-3" name="contact" placeholder="ช่องทางติดต่อ" onChange={handleChange} required />
          <input className="form-control mb-3" name="category" placeholder="หมวดหมู่" onChange={handleChange} />
          <input className="form-control mb-3" type="file" accept="image/*" multiple onChange={handleFile} />
          <button type="submit" className="btn btn-primary w-full">บันทึก</button>
        </form>
      </div>
    </div>
  );
}

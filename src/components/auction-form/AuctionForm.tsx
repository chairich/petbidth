'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuctionForm = () => {
  const [images, setImages] = useState<File[]>([]);
  const [price, setPrice] = useState('');
  const [shippingConditions, setShippingConditions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [user, setUser] = useState<any>(null); // เก็บข้อมูลผู้ใช้

  // ตรวจสอบผู้ใช้ล็อกอิน
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    };
    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(session.user);
      else setUser(null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setImages(Array.from(files).slice(0, 5)); // จำกัดสูงสุด 5 รูป
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('คุณต้องเป็นสมาชิกก่อนจึงจะส่งข้อมูลประมูล กรุณาติดต่อแอดมินหรือสมัครสมาชิก');
      return;
    }

    if (images.length === 0 || !price || !shippingConditions) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วนและส่งรูปภาพ');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const uploadedImages: string[] = [];
    let uploadError = false;

    try {
      // อัปโหลดรูปภาพ
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const fileExt = image.name.split('.').pop();
        const fileName = `image-${Date.now()}-${i}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('auction-images')
          .upload(fileName, image);

        if (error) {
          console.error('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ:', error.message);
          setErrorMessage('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
          uploadError = true;
          break;
        }

        uploadedImages.push(data?.path || '');
      }

      // ถ้ามีข้อผิดพลาดในการอัปโหลดรูปภาพ
      if (uploadError) {
        setIsSubmitting(false);
        return;
      }

      // ส่งข้อมูลประมูล
      const { data, error } = await supabase
        .from('auction_items')
        .insert([
          {
            price,
            shipping_conditions: shippingConditions,
            images: uploadedImages,
            user_id: user.id,
            user_email: user.email,
          },
        ]);

      if (error) {
        console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', error.message);
        setErrorMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      } else {
        alert('ข้อมูลของคุณถูกส่งไปยังแอดมินแล้ว!');
        setImages([]);
        setPrice('');
        setShippingConditions('');
      }
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการดำเนินการ:', err);
      setErrorMessage('เกิดข้อผิดพลาดในการดำเนินการ');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ถ้ายังไม่เป็นสมาชิก
  if (!user) {
    return (
      <div className="container my-5 text-center">
        <h2 className="text-white">คุณยังไม่เป็นสมาชิก</h2>
        <p className="text-white">
          กรุณาเป็นสมาชิกก่อนจึงจะสามารถส่งข้อมูลประมูลได้
        </p>
        <div className="d-flex justify-content-center gap-3 mt-4">
          <a href="/register" className="btn btn-primary">สมัครสมาชิก</a>
          <a
            href="https://m.me/PetBidThai"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-warning text-white"
          >
            ติดต่อแอดมิน
          </a>
        </div>
      </div>
    );
  }

  // ถ้าเป็นสมาชิกแล้ว แสดงฟอร์ม
  return (
    <div className="container my-5">
      <div className="text-center mb-4">
        <h1 className="display-4 text-white">ส่งข้อมูลนกสำหรับประมูล</h1>
        <p className="text-white">กรุณากรอกข้อมูลและส่งรูปภาพนกของท่านเพื่อเริ่มการประมูล</p>
      </div>

      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      <div className="row">
        <div className="col-md-12">
          <div className="card shadow-sm border-light">
            <div className="card-header bg-warning text-white">
              <h3 className="card-title">ฟอร์มการส่งข้อมูลนกประมูล</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label text-white">ราคาที่ต้องการ</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="กรุณาระบุราคาเริ่มต้น"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-white">เงื่อนไขการจัดส่ง</label>
                  <textarea
                    className="form-control"
                    placeholder="กรุณาระบุเงื่อนไขการจัดส่ง"
                    value={shippingConditions}
                    onChange={(e) => setShippingConditions(e.target.value)}
                    required
                    rows={4}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-white">อัปโหลดรูปภาพ (สูงสุด 5 รูป)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="form-control"
                    onChange={handleImageChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-white">ตัวอย่างรูปภาพที่อัปโหลด</label>
                  {images.length > 0 && (
                    <div className="d-flex gap-2 flex-wrap">
                      {images.map((img, idx) => (
                        <div key={idx} className="position-relative">
                          <img
                            src={URL.createObjectURL(img)}
                            alt={`img-${idx}`}
                            width={100}
                            height={100}
                            className="border rounded"
                          />
                          <span className="position-absolute top-0 start-0 badge bg-dark">{idx + 1}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-success w-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลประมูล'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-5">
        <p className="lead text-white">
          หากท่านต้องการคำแนะนำเพิ่มเติม กรุณาติดต่อแอดมินผ่าน <strong>PetBidThai Facebook</strong>
        </p>
      </div>
    </div>
  );
};

export default AuctionForm;

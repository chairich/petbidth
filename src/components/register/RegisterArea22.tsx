'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Modal from '@/components/ui/Modal';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const RegisterArea = () => {
  const router = useRouter();
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [formData, setFormData] = useState({
    email: '', password: '', username: '', fullname: '', phone: '', facebook: '', memberType: 'general'
  });

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const { email, password, username, fullname, phone, facebook, memberType } = formData;
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user?.id) return alert('เกิดข้อผิดพลาด: ' + error?.message);
    await new Promise((r) => setTimeout(r, 500));
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: data.user.id, email, username, fullname, phone, facebook, role: memberType })
    });
    const result = await res.json();
    if (!res.ok) return alert('เกิดข้อผิดพลาดตอนบันทึกโปรไฟล์: ' + result.error);
    alert('สมัครสมาชิกเรียบร้อยแล้ว กรุณายืนยันอีเมลก่อนใช้งาน');
    router.push('/login');
  };

  return (
    <div className="register-area container">
      <h2>สมัครสมาชิก</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" placeholder="อีเมล" required onChange={handleChange} />
        <input name="username" placeholder="ชื่อผู้ใช้" required onChange={handleChange} />
        <input name="fullname" placeholder="ชื่อ-นามสกุล" required onChange={handleChange} />
        <input name="phone" placeholder="เบอร์โทร" required onChange={handleChange} />
        <input name="facebook" placeholder="Facebook" required onChange={handleChange} />
        <input name="password" type="password" placeholder="รหัสผ่าน" required onChange={handleChange} />
        <select name="memberType" onChange={handleChange} required>
          <option value="general">ผู้ประมูลทั่วไป</option>
          <option value="vip">VIP</option>
        </select>
        <div className="form-check">
          <input type="checkbox" className="form-check-input" id="agree" required />
          <label className="form-check-label" htmlFor="agree">
            ฉันยอมรับ <span className="text-link" onClick={() => setShowTerms(true)}>เงื่อนไขการใช้งาน</span> และ <span className="text-link" onClick={() => setShowPrivacy(true)}>นโยบายความเป็นส่วนตัว</span>
          </label>
        </div>
        <button type="submit">สมัครสมาชิก</button>
      </form>

      <Modal isOpen={showTerms} onClose={() => setShowTerms(false)} title="เงื่อนไขการใช้งาน">
        <p>รายละเอียดเงื่อนไขการใช้งานของเว็บไซต์ ...</p>
      </Modal>
      <Modal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} title="นโยบายความเป็นส่วนตัว">
        <p>รายละเอียดนโยบายความเป็นส่วนตัว เช่น การเก็บข้อมูล การใช้งานคุกกี้ ฯลฯ ...</p>
      </Modal>
    </div>
  );
};

export default RegisterArea;

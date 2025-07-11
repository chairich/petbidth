
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ykinhwdtvucjgryyjyvj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlraW5od2R0dnVjamdyeXlqeXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzI0NTgsImV4cCI6MjA2NzEwODQ1OH0.MFPNlMFkXroHaCUvtkPk5ZUAUB9ElcQ-Aq9jqdqxh3k'
);

const CreateAdmin = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    fullname: '',
    phone: '',
    facebook: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, username, fullname, phone, facebook } = formData;

    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: '' }
    });
    if (signupError) {
      alert('เกิดข้อผิดพลาด: ' + signupError.message);
      return;
    }

    // login ทันที
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (loginError) {
      alert('เข้าสู่ระบบไม่สำเร็จ: ' + loginError.message);
      return;
    }

    const user = loginData?.user;
    if (!user?.id) {
      alert('ไม่สามารถดึงข้อมูลผู้ใช้งานได้');
      return;
    }

    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      email,
      username,
      fullname,
      phone,
      facebook,
      role: 'admin',
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      alert('เกิดข้อผิดพลาดตอนบันทึกโปรไฟล์: ' + insertError.message);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">สมัครแอดมิน</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="อีเมล" required onChange={handleChange} className="form-control mb-2" />
        <input name="username" type="text" placeholder="ชื่อผู้ใช้งาน" required onChange={handleChange} className="form-control mb-2" />
        <input name="fullname" type="text" placeholder="ชื่อ-นามสกุล" required onChange={handleChange} className="form-control mb-2" />
        <input name="phone" type="text" placeholder="เบอร์โทรศัพท์" required onChange={handleChange} className="form-control mb-2" />
        <input name="facebook" type="text" placeholder="Facebook (URL หรือชื่อ)" required onChange={handleChange} className="form-control mb-2" />
        <input name="password" type="password" placeholder="รหัสผ่าน" required onChange={handleChange} className="form-control mb-2" />
        <button type="submit" className="btn btn-success w-100">สมัครแอดมิน</button>
      </form>
    </div>
  );
};

export default CreateAdmin;

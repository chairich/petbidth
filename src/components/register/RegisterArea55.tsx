'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const RegisterArea = () => {
  const supabase = createClient();
  const router = useRouter();

  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    fullname: '',
    phone: '',
    facebook: '',
    role: 'general'
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const { email, password, username, fullname, phone, facebook, role } = form;

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      alert('Signup error: ' + error.message);
    } else {
      alert('สมัครสมาชิกสำเร็จ กรุณายืนยันอีเมลแล้วเข้าสู่ระบบ');
      router.push('/login');
    }
  };

  return (
    <div className="rn-register-area ptb--100 bg_color--1">
      <div className="container">
        <h3 className="title mb--40">สมัครสมาชิก</h3>
        <form onSubmit={handleSubmit}>
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
          <input type="text" name="fullname" placeholder="Full Name" onChange={handleChange} required />
          <input type="text" name="phone" placeholder="Phone" onChange={handleChange} required />
          <input type="text" name="facebook" placeholder="Facebook URL" onChange={handleChange} required />
          <select name="role" onChange={handleChange} defaultValue="general">
            <option value="general">ผู้ใช้ทั่วไป</option>
            <option value="vip">ลูกค้า VIP</option>
          </select>
          <button type="submit" className="btn-default btn-large">สมัครสมาชิก</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterArea;
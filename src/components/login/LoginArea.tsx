'use client'
import Link from 'next/link';
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ykinhwdtvucjgryyjyvj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlraW5od2R0dnVjamdyeXlqeXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzI0NTgsImV4cCI6MjA2NzEwODQ1OH0.MFPNlMFkXroHaCUvtkPk5ZUAUB9ElcQ-Aq9jqdqxh3k';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const RegisterArea = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  const [memberType, setMemberType] = useState('general');

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    fullname: '',
    phone: '',
    facebook: '',
    password: '',
    memberType: 'general'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const { email, password, username, fullname, phone, facebook, memberType } = formData;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
      return;
    }

    await supabase.from('profiles').insert({
      id: data.user?.id,
      username,
      fullname,
      phone,
      facebook,
      member_type: memberType,
    });

    alert('สมัครสมาชิกเรียบร้อยแล้ว กรุณายืนยันอีเมลก่อนใช้งาน');
  };

  const handleFacebookLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: 'https://petbidthai.com/' }
    });
  };

  return (
    <div className="register-area">
      <div className="container">
        <div className="row g-4 g-lg-5 align-items-center justify-content-between">
          <div className="col-12 col-md-6 col-xl-5">
            <div className="register-card">
              <h2>สมัครสมาชิก</h2>
              <p>หากมีบัญชีแล้ว 
                <Link className="ms-1 hover-primary" href="/login">เข้าสู่ระบบ</Link>
              </p>

              <div className="register-form mt-4">
                <form onSubmit={handleSubmit}>
                  <div className="form-group mb-3">
                    <input className="form-control" name="email" type="email" placeholder="อีเมล" required onChange={handleChange} />
                  </div>
                  <div className="form-group mb-3">
                    <input className="form-control" name="username" type="text" placeholder="ชื่อผู้ใช้งาน" required onChange={handleChange} />
                  </div>
                  <div className="form-group mb-3">
                    <input className="form-control" name="fullname" type="text" placeholder="ชื่อ-นามสกุล" required onChange={handleChange} />
                  </div>
                  <div className="form-group mb-3">
                    <input className="form-control" name="phone" type="text" placeholder="เบอร์โทรศัพท์" required onChange={handleChange} />
                  </div>
                  <div className="form-group mb-3">
                    <input className="form-control" name="facebook" type="text" placeholder="Facebook (URL หรือชื่อ)" required onChange={handleChange} />
                    <button type="button" onClick={handleFacebookLogin} className="btn btn-outline-primary btn-sm mt-2">
                      สมัครผ่าน Facebook
                    </button>
                  </div>
                  <div className="form-group mb-3">
                    <label className="label-psswd" htmlFor="registerPassword" onClick={togglePasswordVisibility}>
                      {passwordVisible ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                    </label>
                    <input className="form-control" name="password" id="registerPassword" type={passwordVisible ? 'text' : 'password'} placeholder="รหัสผ่าน" required onChange={handleChange} />
                  </div>

                  <div className="form-group mb-3">
                    <label>เลือกประเภทสมาชิก:</label>
                    <select className="form-control mt-1" name="memberType" value={memberType} onChange={(e) => {
                      setMemberType(e.target.value);
                      handleChange(e);
                    }} required>
                      <option value="general">ผู้ประมูลทั่วไป</option>
                      <option value="vip">ลูกค้า VIP</option>
                      <option value="admin" disabled>แอดมิน (เพิ่มโดยทีมงาน)</option>
                    </select>
                  </div>

                  <div className="form-check mb-3">
                    <input className="form-check-input" id="agree" type="checkbox" required />
                    <label className="form-check-label" htmlFor="agree">
                      ฉันยอมรับ <Link href="/terms" className="text-decoration-underline">เงื่อนไขการใช้งาน</Link>
                    </label>
                  </div>

                  <button className="btn btn-primary w-100" type="submit">สมัครสมาชิก</button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="register-thumbnail mt-5 mt-md-0">
              <img src="/assets/img/illustrator/4.png" alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterArea;

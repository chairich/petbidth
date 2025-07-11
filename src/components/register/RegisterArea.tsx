'use client'

import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const RegisterArea = () => {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password, username, fullname, phone, facebook, memberType } = formData;

    console.log("📥 Input Data:", formData);

    const phonePattern = /^0[6-9]\d{8}$/;
    if (!phonePattern.test(phone)) {
      alert('กรุณากรอกเบอร์โทรให้ถูกต้อง (06x–09x และ 10 หลัก)');
      return;
    }

    try {
      const { data: dupUsers, error: dupError } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${email},username.eq.${username},phone.eq.${phone},facebook.eq.${facebook}`);

      if (dupError) {
        console.error("❌ Error checking duplicates:", dupError);
      }

      if (dupUsers && dupUsers.length > 0) {
        alert('อีเมล, เบอร์โทร, Facebook หรือชื่อผู้ใช้นี้ถูกใช้ไปแล้ว');
        return;
      }

      console.log("📤 Sending to Supabase Auth:", { email, password });
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            fullname,
            phone,
            facebook,
            role: memberType === 'vip' ? 'vip' : 'general',
            status: memberType === 'vip' ? 'pending' : 'approved'
          }
        }
      });

      if (signupError) {
        console.error("❌ Auth Signup Error:", signupError);
        alert("สมัครไม่สำเร็จ: " + signupError.message);
        return;
      }

      const sessionData = await supabase.auth.getSession();
      const access_token = sessionData.data?.session?.access_token;
      const userId = sessionData.data?.session?.user.id;
      console.log("✅ Auth signup success, user ID:", userId);

      if (!userId || !access_token) {
        alert("ไม่สามารถดึง session หรือข้อมูลผู้ใช้ได้ โปรดลองใหม่");
        return;
      }

      const supabaseWithToken = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          },
        }
      );

      const { data: existingUser, error: fetchError } = await supabaseWithToken
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (existingUser) {
        console.log("⚠️ User already exists in 'users' table. Skipping insert.");
        alert("บัญชีนี้มีอยู่ในระบบแล้ว กรุณาเข้าสู่ระบบ");
        router.push('/login');
        return;
      }

      const role = memberType === 'vip' ? 'vip' : 'general';
      const status = memberType === 'vip' ? 'pending' : 'approved';

      const { error: insertError } = await supabaseWithToken.from('users').insert([{
        id: userId,
        email,
        username,
        fullname,
        phone,
        facebook,
        role,
        status,
        created_at: new Date().toISOString()
      }]);

      console.log('📦 Inserted data to users table:', { userId, email, username });

      if (insertError) {
        console.error("❌ Insert Error:", insertError);
        alert('บันทึกข้อมูลล้มเหลว: ' + insertError.message);
        return;
      }

      if (memberType === 'vip') {
        alert('สมัครเรียบร้อย กรุณารอแอดมินอนุมัติ');
        return;
      }

      alert('สมัครสำเร็จ กำลังเข้าสู่ระบบ');
      router.push('/login');

    } catch (error) {
      console.error("❗ Unexpected Error:", error);
      alert('เกิดข้อผิดพลาดไม่คาดคิด');
    }
  };

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  const handleFacebookLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: 'https://petbidthai.com/' }
    });
  };

  return (
    // [โครงสร้าง UI เดิมคงไว้ ไม่ตัดทิ้งเพื่อความสมบูรณ์]
    <div className="register-area">
      <div className="container">
        <div className="row g-4 g-lg-5 align-items-center justify-content-between">
          <div className="col-12 col-md-6 col-xl-5">
            <div className="register-card">
              <h2>สมัครสมาชิก</h2>
              <p>หากมีบัญชีแล้ว <Link className="ms-1 hover-primary" href="/login">เข้าสู่ระบบ</Link></p>
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
                    <div className="input-group">
                      <span className="input-group-text">https://www.facebook.com/</span>
                      <input
                        className="form-control"
                        name="facebook"
                        type="text"
                        placeholder="ชื่อผู้ใช้ (เช่น your.name)"
                        required
                        onChange={(e) => {
                          const usernameOnly = e.target.value.replace(/^https?:\/\/(www\.)?facebook\.com\//, '');
                          setFormData({ ...formData, facebook: 'https://www.facebook.com/' + usernameOnly });
                        }}
                      />
                    </div>
                    <button type="button" onClick={handleFacebookLogin} className="btn btn-outline-primary btn-sm mt-2">สมัครผ่าน Facebook</button>
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
                    </select>
                  </div>
                  <div className="form-check mb-3">
                    <input className="form-check-input" id="agree" type="checkbox" required />
                    <label className="form-check-label" htmlFor="agree">
                      ฉันยอมรับ <Link href="/terms" className="text-decoration-underline">เงื่อนไขการใช้งาน</Link>
                    </label>
                  </div>
                  <button className="btn btn-primary w-100" type="submit" disabled={loading}>{loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}</button>
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
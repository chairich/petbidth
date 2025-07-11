'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const LoginArea = () => {
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // โหลดข้อมูลที่จำไว้
  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');
    if (savedEmail) setEmailOrUsername(savedEmail);
    if (savedPassword) setPassword(savedPassword);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rememberMe) {
      localStorage.setItem('savedEmail', emailOrUsername);
      localStorage.setItem('savedPassword', password);
    } else {
      localStorage.removeItem('savedEmail');
      localStorage.removeItem('savedPassword');
    }

    let emailToUse = emailOrUsername;

    // ถ้าไม่ใช่อีเมล ให้ลองค้นหาจาก username
    if (!emailOrUsername.includes('@')) {
      const { data: usernameLookup, error: lookupError } = await supabase
        .from('users')
        .select('email')
        .eq('username', emailOrUsername)
        .single();

      if (lookupError || !usernameLookup?.email) {
        alert("ไม่พบชื่อผู้ใช้นี้ในระบบ");
        return;
      }

      emailToUse = usernameLookup.email;
    }

    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password,
    });

    if (loginError) {
      alert("ไม่พบบัญชีผู้ใช้นี้หรือรหัสผ่านไม่ถูกต้อง");
      console.error("Login error:", loginError);
      return;
    }

    const user = loginData.user;
    if (!user) {
      alert("เข้าสู่ระบบไม่สำเร็จ");
      return;
    }

    // ตรวจสอบสิทธิ์เพิ่มเติมจากตาราง users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, status')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      alert("ไม่พบข้อมูลผู้ใช้นี้ในระบบ");
      return;
    }

    if (userData.status === 'pending') {
      alert("บัญชีของคุณยังไม่ได้รับการอนุมัติ");
      return;
    }

    // Redirect ตามสิทธิ์
    if (userData.role === 'admin') {
      router.push('/admin/dashboard');
    } else if (userData.role === 'vip') {
      router.push('/dashboard/vip');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <section className="login-area">
      <div className="container">
        <div className="row g-4 align-items-center justify-content-between">
          <div className="col-12 col-md-6 col-lg-5">
            <div className="card login-card">
              <h3 className="mb-4">Welcome Back!</h3>
              <form onSubmit={handleLogin}>
                <div className="form-group mb-3">
                  <input
                    type="text"
                    placeholder="อีเมลหรือชื่อผู้ใช้"
                    className="form-control"
                    required
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                  />
                </div>
                <div className="form-group mb-3">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="รหัสผ่าน"
                    className="form-control"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label
                    className="label-psswd"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ cursor: 'pointer', display: 'block', marginTop: '5px' }}
                  >
                    {showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  </label>
                </div>
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    จดจำรหัสผ่านไว้
                  </label>
                </div>
                <button type="submit" className="btn btn-success w-100">Log In</button>
              </form>
              <p className="mt-3 text-center">
                ยังไม่มีบัญชี? <a href="/register" className="text-decoration-underline">สมัครสมาชิก</a>
              </p>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="login-thumbnail text-center mt-5 mt-md-0">
              <img src="/assets/img/illustrator/4.png" alt="login" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginArea;

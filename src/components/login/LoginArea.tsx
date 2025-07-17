
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie'; // ใช้ js-cookie
import { createClient } from '@supabase/supabase-js';
import { signIn } from 'next-auth/react'; // ✅ เพิ่ม import สำหรับ Facebook login
import { supabase } from '@/lib/supabaseClient';


const LoginArea = () => {
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  // Fetch session data on initial load
  useEffect(() => {
    const fetchSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      setSession(sessionData?.session || null);
      setIsLoading(false); // Finish loading after getting session
    };
    fetchSession();
  }, []);

  // Handle login process
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    let emailToUse = emailOrUsername;

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
      return;
    }

    const user = loginData.user;
    if (!user) {
      alert("เข้าสู่ระบบไม่สำเร็จ");
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      alert("ไม่พบข้อมูลผู้ใช้นี้ในระบบ");
      return;
    }

    // Store user data in cookies
    const role = userData?.role ?? 'user';
    Cookies.set('session', JSON.stringify({
      id: user.id,
      email: user.email,
      role: role
    }), { expires: 1, path: '/' });

    // ✅ Redirect to home after login
    router.push('/');
  }

  return (
    <section className="login-area">
      <div className="container">
        <div className="row g-4 align-items-center justify-content-between">
          <div className="col-12 col-md-6 col-lg-5">
            <div className="card login-card shadow-lg">
              <h3 className="mb-4 text-center">Welcome Back!</h3>
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
                <button onClick={() => signIn("facebook")} className="btn btn-primary mb-3 w-100 rounded-pill">เข้าสู่ระบบด้วย Facebook</button>
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
                <button type="submit" className="btn btn-success w-100">เข้าสู่ระบบ</button>
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

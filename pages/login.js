
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setMessage('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      setLoading(false);
      return;
    }

    // Check if email is confirmed
    const user = data.user;
    if (!user.email_confirmed_at) {
      setMessage('กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ');
      setLoading(false);
      return;
    }

    // Check if banned
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('banned')
      .eq('id', user.id)
      .single();

    if (profile?.banned) {
      setMessage('บัญชีนี้ถูกระงับการใช้งาน');
      setLoading(false);
      return;
    }

    setMessage('✅ เข้าสู่ระบบสำเร็จ กำลังเปลี่ยนหน้า...');
    setTimeout(() => router.push('/'), 1500);
  };

  return (
    <div className="rn-auth-page container mt--100 mb--100">
      <div className="row">
        <div className="col-lg-6">
          <div className="login-form-box">
            <h4 className="title">เข้าสู่ระบบ</h4>
            <form onSubmit={handleLogin}>
              <input
                name="email"
                type="email"
                placeholder="อีเมล"
                onChange={handleChange}
                required
              />
              <input
                name="password"
                type="password"
                placeholder="เบอร์โทร (รหัสผ่าน)"
                onChange={handleChange}
                required
              />
              <div className="input-check-box">
                <input type="checkbox" /> จดจำฉันไว้
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </button>
              {message && <p className="mt-3">{message}</p>}
            </form>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="social-login-box">
            <h6>หรือเข้าสู่ระบบด้วย</h6>
            <button className="btn-default btn-large w-100 mb-2">
              <img src="/assets/images/icons/google.png" alt="" /> เข้าระบบด้วย Google
            </button>
            <button className="btn-default btn-large w-100 mb-2">
              <img src="/assets/images/icons/facebook.png" alt="" /> เข้าระบบด้วย Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

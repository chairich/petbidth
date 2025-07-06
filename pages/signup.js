
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Signup() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', facebook: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Check for duplicates
    const { data: existing, error: dupError } = await supabase
      .from('profiles')
      .select('*')
      .or(
        `email.eq.${form.email},phone.eq.${form.phone},facebook.eq.${form.facebook}`
      );

    if (dupError) {
      setMessage('เกิดข้อผิดพลาดในการตรวจสอบข้อมูลซ้ำ');
      setLoading(false);
      return;
    }

    if (existing.length > 0) {
      setMessage('ชื่อ / เบอร์โทร / อีเมล / Facebook ถูกใช้ไปแล้ว');
      setLoading(false);
      return;
    }

    // Sign up
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: form.email,
      password: form.phone,
    });

    if (signupError) {
      setMessage(signupError.message);
      setLoading(false);
      return;
    }

    const user = signupData.user;

    // Insert into profiles
    const { error: profileError } = await supabase.from('profiles').insert([
      {
        id: user.id,
        name: form.name,
        phone: form.phone,
        email: form.email,
        facebook: form.facebook,
        role: 'user',
        verified: false,
      },
    ]);

    if (profileError) {
      setMessage('สมัครสมาชิกไม่สำเร็จ');
    } else {
      setMessage('✅ สมัครสำเร็จ! กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ');
    }

    setLoading(false);
  };

  return (
    <div className="rn-auth-page container mt--100 mb--100">
      <div className="row">
        <div className="col-lg-6">
          <div className="login-form-box">
            <h4 className="title">สมัครสมาชิก</h4>
            <form onSubmit={handleSubmit}>
              <input name="name" placeholder="ชื่อเต็ม" onChange={handleChange} required />
              <input name="phone" placeholder="เบอร์โทรศัพท์" onChange={handleChange} required />
              <input name="email" type="email" placeholder="อีเมล" onChange={handleChange} required />
              <input name="facebook" placeholder="Facebook (URL หรือชื่อผู้ใช้)" onChange={handleChange} required />
              <div className="input-check-box">
                <input type="checkbox" required /> ฉันยอมรับเงื่อนไขการใช้งาน
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
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

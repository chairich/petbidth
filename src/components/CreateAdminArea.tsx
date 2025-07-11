'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ykinhwdtvucjgryyjyvj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlraW5od2R0dnVjamdyeXlqeXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzI0NTgsImV4cCI6MjA2NzEwODQ1OH0.MFPNlMFkXroHaCUvtkPk5ZUAUB9ElcQ-Aq9jqdqxh3k'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function CreateAdminArea() {
  const router = useRouter()
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    fullname: '',
    phone: '',
    facebook: '',
    password: '',
  })

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // ตรวจสอบว่ามี user ในระบบ auth หรือยัง
      const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers({
        email: formData.email,
      })

      if (listError) throw listError
      if (existingUsers.length > 0) {
        alert('มีผู้ใช้อีเมลนี้ในระบบแล้ว')
        setLoading(false)
        return
      }

      // สร้าง user ใหม่ในระบบ auth
      const { data: userData, error: signupError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
      })

      if (signupError) throw signupError

      // เพิ่มข้อมูล profile เป็น role admin เสมอ
      const { error: profileError } = await supabase.from('profiles').insert({
        id: userData.user.id,
        email: formData.email,
        fullname: formData.fullname,
        phone: formData.phone,
        facebook: formData.facebook,
        role: 'admin',
        created_at: new Date().toISOString(),
      })

      if (profileError) throw profileError

      alert('สร้างแอดมินเรียบร้อยแล้ว')
      router.push('/admin/dashboard')
    } catch (error: any) {
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-area" style={{ maxWidth: 450, margin: '2rem auto', padding: '1rem', backgroundColor: '#1e1e2f', borderRadius: 8 }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#eee' }}>สร้างบัญชีแอดมินใหม่</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          name="email"
          type="email"
          placeholder="อีเมล"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ padding: '0.6rem', borderRadius: 4, border: 'none', fontSize: '1rem', backgroundColor: '#2a2a3d', color: '#fff' }}
        />
        <input
          name="fullname"
          type="text"
          placeholder="ชื่อเต็ม"
          value={formData.fullname}
          onChange={handleChange}
          required
          style={{ padding: '0.6rem', borderRadius: 4, border: 'none', fontSize: '1rem', backgroundColor: '#2a2a3d', color: '#fff' }}
        />
        <input
          name="phone"
          type="text"
          placeholder="เบอร์โทร"
          value={formData.phone}
          onChange={handleChange}
          required
          style={{ padding: '0.6rem', borderRadius: 4, border: 'none', fontSize: '1rem', backgroundColor: '#2a2a3d', color: '#fff' }}
        />
        <input
          name="facebook"
          type="text"
          placeholder="Facebook URL"
          value={formData.facebook}
          onChange={handleChange}
          required
          style={{ padding: '0.6rem', borderRadius: 4, border: 'none', fontSize: '1rem', backgroundColor: '#2a2a3d', color: '#fff' }}
        />
        <div style={{ position: 'relative' }}>
          <input
            name="password"
            type={passwordVisible ? 'text' : 'password'}
            placeholder="รหัสผ่าน"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            style={{ padding: '0.6rem', borderRadius: 4, border: 'none', fontSize: '1rem', backgroundColor: '#2a2a3d', color: '#fff', width: '100%' }}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            style={{
              position: 'absolute',
              top: '50%',
              right: 10,
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#ccc',
              cursor: 'pointer',
            }}
          >
            {passwordVisible ? 'ซ่อน' : 'แสดง'}
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: '1rem',
            padding: '0.75rem',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'กำลังสร้าง...' : 'สร้างแอดมิน'}
        </button>
      </form>
    </div>
  )
}

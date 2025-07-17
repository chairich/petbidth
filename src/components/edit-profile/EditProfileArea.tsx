'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'

export default function EditProfilePage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [password, setPassword] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [email, setEmail] = useState('')
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser()
      if (error || !user) return

      const { data, error: profileError } = await supabase
        .from('users')
        .select('avatar_url, email')
        .eq('id', user.id)
        .single()

      setUser(user)
      setAvatarUrl(data?.avatar_url || '')
      setEmail(data?.email || user.email)
      setLoading(false)
    }

    fetchProfile()
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileName = `${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage
      .from('auction-images')
      .upload(`avatar/${fileName}`, file)

    if (error) {
      alert('อัปโหลดไม่สำเร็จ')
      return
    }

    const publicUrl = supabase.storage
      .from('auction-images')
      .getPublicUrl(`avatar/${fileName}`).data.publicUrl

    setAvatarUrl(publicUrl)
  }

  const updateProfile = async () => {
    setLoading(true)

    if (password) {
      const { error: pwError } = await supabase.auth.updateUser({ password })
      if (pwError) {
        alert('เปลี่ยนรหัสผ่านไม่สำเร็จ')
        setLoading(false)
        return
      }
    }

    const { error } = await supabase.from('users').update({
      avatar_url: avatarUrl,
      email: email
    }).eq('id', user.id)

    if (error) {
      alert('ไม่สามารถบันทึกข้อมูลได้')
    } else {
      alert('บันทึกสำเร็จ')
    }

    setLoading(false)
  }

  if (loading) return <p className="text-center mt-10">กำลังโหลดข้อมูล...</p>

  return (
    <section className="login-area">
      <div className="container">
        <div className="row g-4 align-items-center justify-content-between">
          <div className="col-12 col-md-6 col-lg-5">
            <div className="card login-card shadow-lg">
              <h3 className="mb-4 text-center">แก้ไขโปรไฟล์</h3>

              <div className="form-group mb-3">
                <label className="form-label">อีเมล:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group mb-3">
                {avatarUrl && (
                  <Image
                    src={avatarUrl}
                    alt="avatar"
                    width={100}
                    height={100}
                    className="rounded-circle mb-2"
                  />
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="form-control" />
              </div>

              <div className="form-group mb-3">
                <label className="form-label">รหัสผ่านปัจจุบัน:</label>
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="form-control"
                  placeholder="กรุณากรอกรหัสผ่านปัจจุบัน"
                />
                <small
                  className="text-primary"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowOldPassword(!showOldPassword)}
                >
                  {showOldPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                </small>
              </div>

              <div className="form-group mb-3">
                <label className="form-label">แก้ไขรหัสผ่านใหม่:</label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  placeholder="รหัสผ่านใหม่"
                />
                <small
                  className="text-primary"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                </small>
              </div>

              <button
                className="btn btn-success w-100"
                onClick={updateProfile}
              >
                บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="login-thumbnail text-center mt-5 mt-md-0">
              <img src="/assets/img/illustrator/4.png" alt="profile" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

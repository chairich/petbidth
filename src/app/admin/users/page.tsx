
'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'
import Modal from '@/components/common/Modal'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [tel, setTel] = useState('')
  const [role, setRole] = useState('')
  const [couponBalance, setCouponBalance] = useState(0)
  const [username, setUsername] = useState('')
  const [facebook, setFacebook] = useState('')
  const [totalCoupons, setTotalCoupons] = useState(0)
  const itemsPerPage = 10

  const supabase = createClientComponentClient()
  const avatarBaseUrl = 'https://lhrszqycskubmmtisyou.supabase.co/storage/v1/object/public/auction-images'

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, avatar_url, tel, role, coupon_balance, total_coupons, username, facebook')
      .order('name', { ascending: true })
    if (!error) setUsers(data || [])
  }

  const totalPages = Math.ceil(users.length / itemsPerPage)
  const currentUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  const openEdit = (user: any) => {
    setSelectedUser(user)
    setTel(user.tel || '')
    setRole(user.role || '')
    setCouponBalance(user.coupon_balance || 0)
    setTotalCoupons(user.total_coupons || 0)
    setUsername(user.username || '')
    setFacebook(user.facebook || '')
  }

  const saveEdit = async () => {
    if (!selectedUser) return
    const { error } = await supabase
      .from('users')
      .update({
        tel,
        role,
        coupon_balance: couponBalance,
        total_coupons: totalCoupons,
        username,
        facebook
      })
      .eq('id', selectedUser.id)
    if (!error) {
      await fetchUsers()
      setSelectedUser(null)
    }
  }

  const deleteUser = async (id: string) => {
    if (confirm('ยืนยันการลบผู้ใช้นี้?')) {
      const { error } = await supabase.from('users').delete().eq('id', id)
      if (!error) fetchUsers()
    }
  }

  const banUser = async (id: string) => {
    if (confirm('ยืนยันการแบนผู้ใช้นี้?')) {
      const { error } = await supabase.from('users').update({ role: 'banned' }).eq('id', id)
      if (!error) fetchUsers()
    }
  }

  return (
    <>
      <div className="container py-5 text-white">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <h1 className="h3 fw-bold text-center mb-4">จัดการผู้ใช้งาน</h1>
            <div className="table-responsive bg-dark rounded shadow-sm">
              <table className="table table-dark table-bordered mb-0">
                <thead className="table-secondary text-dark">
                  <tr>
                    <th>Avatar</th>
                    <th>ชื่อ</th>
                                        <th>เบอร์โทร</th>
                    <th>Role</th>
                    <th>Username</th>
                    <th>Facebook</th>
                    <th>คูปอง</th>
                    <th className="text-center">การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <Image
                          src={
                            u.avatar_url?.startsWith('http')
                              ? u.avatar_url
                              : `${avatarBaseUrl}/${u.avatar_url || 'no-avatar.png'}`
                          }
                          alt="avatar"
                          width={40}
                          height={40}
                          className="rounded-circle"
                        />
                      </td>
                      <td>{u.name}</td>
                                            <td>{u.tel || '-'}</td>
                      <td className="text-capitalize">{u.role || '-'}</td>
                      <td>{u.username || '-'}</td>
                      <td>{u.facebook || '-'}</td>
                      <td>{u.coupon_balance || 0} / {u.total_coupons || 0}</td>
                      <td className="text-center">
                        <button onClick={() => openEdit(u)} className="btn btn-outline-primary btn-sm me-1">แก้ไข</button>
                        <button onClick={() => banUser(u.id)} className="btn btn-outline-warning btn-sm me-1">แบน</button>
                        <button onClick={() => deleteUser(u.id)} className="btn btn-danger btn-sm">ลบ</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
              <button onClick={() => goToPage(currentPage - 1)} className="btn btn-outline-light btn-sm" disabled={currentPage === 1}>ก่อนหน้า</button>
              <span>หน้า {currentPage} จาก {totalPages}</span>
              <button onClick={() => goToPage(currentPage + 1)} className="btn btn-outline-light btn-sm" disabled={currentPage === totalPages}>ถัดไป</button>
            </div>
          </div>
        </div>
      </div>

      {selectedUser && (
        <Modal show={selectedUser !== null} onClose={() => setSelectedUser(null)}>
          <div className="p-4">
            <h5 className="fw-bold mb-3">แก้ไขผู้ใช้</h5>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="form-control" />
            </div>
            <div className="mb-3">
              <label className="form-label">Facebook</label>
              <input type="text" value={facebook} onChange={(e) => setFacebook(e.target.value)} className="form-control" />
            </div>
<div className="mb-3">
              <label className="form-label">เบอร์โทร</label>
              <input type="text" value={tel} onChange={(e) => setTel(e.target.value)} className="form-control" />
            </div>
            <div className="mb-3">
              <label className="form-label">Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="form-select">
                <option value="general">general</option>
                <option value="vip">vip</option>
                <option value="admin">admin</option>
                <option value="banned">banned</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">จำนวนคูปองที่เหลือ</label>
              <input type="number" value={couponBalance} onChange={(e) => setCouponBalance(Number(e.target.value))} className="form-control" />
            </div>
            <div className="mb-3">
              <label className="form-label">จำนวนคูปองทั้งหมด</label>
              <input type="number" value={totalCoupons} onChange={(e) => setTotalCoupons(Number(e.target.value))} className="form-control" />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button onClick={() => setSelectedUser(null)} className="btn btn-secondary">ยกเลิก</button>
              <button onClick={saveEdit} className="btn btn-primary">บันทึก</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

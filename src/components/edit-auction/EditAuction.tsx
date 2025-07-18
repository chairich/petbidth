'use client'
import React, { useEffect, useState, ChangeEvent } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

const EditAuction = () => {
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_price: '',
    end_time: '',
  })
  const [images, setImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [coverImageIndex, setCoverImageIndex] = useState(0)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const fetchAuction = async () => {
      const { data, error } = await supabase
        .from('auctions')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        alert('ไม่สามารถโหลดข้อมูลได้: ' + error.message)
        return
      }

      setFormData({
        title: data.title,
        description: data.description,
        start_price: data.start_price.toString(),
        end_time: data.end_time?.slice(0, 16) || '',
      })
      setExistingImages(data.images || [])
      setCoverImageIndex(data.cover_image_index || 0)
    }

    if (id) fetchAuction()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    if (files.length > 5) {
      alert('สามารถอัปโหลดได้สูงสุด 5 รูปเท่านั้น')
      return
    }
    setImages(files)
    setCoverImageIndex(0)
    setExistingImages([])
  }

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = []
    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${i}.${fileExt}`
      const filePath = `auction-images/${fileName}`
      const { error } = await supabase.storage.from('auction-images').upload(filePath, file)
      if (error) {
        alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ: ' + error.message)
        return []
      }
      const { data } = supabase.storage.from('auction-images').getPublicUrl(filePath)
      urls.push(data.publicUrl)
    }
    return urls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.start_price || !formData.end_time) {
      alert('กรุณากรอกข้อมูลให้ครบ')
      return
    }

    setUploading(true)
    let imageUrls = existingImages

    if (images.length > 0) {
      imageUrls = await uploadImages()
      if (imageUrls.length === 0) {
        setUploading(false)
        return
      }
    }

    const now = new Date().toISOString()
    const endHasPassed = new Date(formData.end_time) < new Date(now)

    const updatedData = {
      title: formData.title,
      description: formData.description,
      start_price: parseFloat(formData.start_price),
      end_time: formData.end_time,
      cover_image_index: coverImageIndex,
      images: imageUrls,
      is_closed: endHasPassed,
    }

    const { error } = await supabase
      .from('auctions')
      .update(updatedData)
      .eq('id', id)

    if (error) {
      alert('บันทึกไม่สำเร็จ: ' + error.message)
    } else {
      alert('อัปเดตเรียบร้อยแล้ว')
      if (typeof id === 'string') {
      router.push(`/auction/${id}`)
    } else {
      console.error('auction ID ไม่ถูกต้อง:', id)
      router.push('/')
    }
    }

    setUploading(false)
  }

  return (
    <div className="container py-5">
      <h2>แก้ไขกระทู้ประมูล</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>ชื่อประมูล</label>
          <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label>รายละเอียด</label>
          <textarea name="description" className="form-control" rows={4} value={formData.description} onChange={handleChange} required></textarea>
        </div>

        <div className="mb-3">
          <label>ราคาเริ่มต้น (บาท)</label>
          <input type="number" name="start_price" className="form-control" value={formData.start_price} onChange={handleChange} required min="0" />
        </div>

        <div className="mb-3">
          <label>วันเวลาสิ้นสุดการประมูล</label>
          <input type="datetime-local" name="end_time" className="form-control" value={formData.end_time} onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label>อัปโหลดรูปภาพใหม่ (สูงสุด 5 รูป)</label>
          <input type="file" multiple accept="image/*" className="form-control" onChange={handleImageChange} />
          <div className="mt-2 d-flex gap-2 flex-wrap">
            {existingImages.map((url, idx) => (
              <div key={idx} onClick={() => setCoverImageIndex(idx)} style={{ cursor: 'pointer', border: coverImageIndex === idx ? '2px solid blue' : 'none' }}>
                <img src={url} alt={`img-${idx}`} width={80} height={80} />
                <div className="text-center">{coverImageIndex === idx ? 'หน้าปก' : ''}</div>
              </div>
            ))}
            {images.map((file, idx) => (
              <div key={idx + 100} onClick={() => setCoverImageIndex(idx)} style={{ cursor: 'pointer', border: coverImageIndex === idx ? '2px solid blue' : 'none' }}>
                <img src={URL.createObjectURL(file)} alt={`new-${idx}`} width={80} height={80} />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-success" disabled={uploading}>
          {uploading ? 'กำลังอัปเดต...' : 'บันทึกการแก้ไข'}
        </button>
      </form>
    </div>
  )
}

export default EditAuction

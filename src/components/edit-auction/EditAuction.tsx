'use client'
import React, { useEffect, useState, ChangeEvent } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'

const BUCKET = 'auction-images'

/* ---------- เวลา: helper ---------- */
function isoToLocalInput(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const HH = pad(d.getHours())
  const MM = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${HH}:${MM}`
}
function localToISO(local: string): string | null {
  if (!local) return null
  const d = new Date(local) // local time -> Date
  return isNaN(d.getTime()) ? null : d.toISOString() // store as UTC ISO
}

type AuctionRow = {
  id: string
  title: string
  description: string
  start_price: number
  start_time: string | null
  images: string[] | null
  cover_image_index: number | null
  bid_step: number | null
  is_closed: boolean | null
}

export default function EditAuction() {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_price: '',
    start_time: '', // datetime-local
  })

  const [bidStep, setBidStep] = useState<number>(100) // 20 | 50 | 100
  const [images, setImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [coverImageIndex, setCoverImageIndex] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [isClosed, setIsClosed] = useState<boolean>(false) // สถานะเปิด/ปิด

  useEffect(() => {
    const fetchAuction = async () => {
      const { data, error } = await supabase
        .from('auctions')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        alert('ไม่สามารถโหลดข้อมูลได้')
        return
      }

      const row = data as AuctionRow

      setFormData({
        title: row.title ?? '',
        description: row.description ?? '',
        start_price: String(row.start_price ?? 0),
        start_time: isoToLocalInput(row.start_time), // ถ้า null จะเป็น '' → ผู้ใช้ต้องเลือกใหม่
      })
      const imgs = Array.isArray(row.images) ? row.images.filter(Boolean) : []
      setExistingImages(imgs)
      setCoverImageIndex(Math.min(row.cover_image_index ?? 0, Math.max(0, imgs.length - 1)))
      setBidStep([20, 50, 100].includes(Number(row.bid_step)) ? Number(row.bid_step) : 100)
      setIsClosed(Boolean(row.is_closed))
    }

    if (id) fetchAuction()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    if (files.length > 20) {
      alert('สามารถอัปโหลดได้สูงสุด 20 รูปต่อครั้ง')
      return
    }
    setImages(files)
    // ถ้าเพิ่มชุดใหม่ เลือกหน้าปกกลับไป index 0 ของชุดใหม่หลังอัปโหลดสำเร็จ
    setCoverImageIndex(0)
    // ไม่ล้างรูปเดิมทันที — จะรวมตอนบันทึก (เพื่อเลี่ยงรูปหายถ้าอัปโหลดล้มเหลว)
    e.currentTarget.value = ''
  }

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = []
    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
      const key = `auctions/${id}/${Date.now()}_${i}.${ext}`
      const { error } = await supabase.storage.from(BUCKET).upload(key, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined,
      })
      if (error) {
        alert('อัปโหลดรูปไม่สำเร็จ: ' + error.message)
        return []
      }
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(key)
      urls.push(data.publicUrl)
    }
    return urls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // ตรวจข้อมูลจำเป็น
    if (!formData.title || !formData.description || !formData.start_price) {
      alert('กรุณากรอกข้อมูลให้ครบ')
      return
    }
    if (![20, 50, 100].includes(Number(bidStep))) {
      alert('ตั้งห้องต้องเป็น 20, 50 หรือ 100 เท่านั้น')
      return
    }

    // เวลาเริ่มต้อง valid เสมอ (กัน start_time หาย)
    const startISO = localToISO(formData.start_time)
    if (!startISO) {
      alert('กรุณาเลือกเวลาเริ่มให้ถูกต้อง')
      return
    }

    // คำนวณว่าตอนนี้ยัง "ก่อนเริ่ม" ไหม (เทียบใน UTC)
    const nowISO = new Date().toISOString()
    const startIsFuture = new Date(startISO) > new Date(nowISO)

    setUploading(true)
    try {
      // อัปโหลดรูปใหม่ (ถ้ามี)
      let uploadedUrls: string[] = []
      if (images.length > 0) {
        uploadedUrls = await uploadImages()
        if (uploadedUrls.length === 0) {
          setUploading(false)
          return
        }
      }

      // รวมรูปเดิม + ใหม่ (ถ้ามี)
      const allImages = [...existingImages, ...uploadedUrls]
      const safeCover = Math.min(coverImageIndex, Math.max(0, allImages.length - 1))

      // ❗ กันเปิดทันทีโดยไม่ตั้งใจ:
      // ถ้าเวลาเริ่มยังไม่มาถึง -> บังคับ is_closed=false เสมอ
      // ถ้าเริ่มไปแล้ว -> ใช้ค่าที่เลือกในฟอร์มได้
      const isClosedFinal = startIsFuture ? false : Boolean(isClosed)

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        start_price: parseFloat(formData.start_price),
        start_time: startISO,                 // เก็บเป็น UTC ISO แน่ๆ
        images: allImages,
        cover_image_index: safeCover,
        bid_step: Number(bidStep),
        is_closed: isClosedFinal,             // ✅ เซฟด้วยกฎด้านบน
      }

      const { data, error } = await supabase
        .from('auctions')
        .update(payload)
        .eq('id', id)
        .select('id')

      if (error) throw new Error(error.message)
      if (!data || data.length === 0) {
        alert('ไม่พบแถวสำหรับอัปเดต (id ไม่ตรงหรือ RLS บล็อก)')
        setUploading(false)
        return
      }

      alert('อัปเดตเรียบร้อยแล้ว')
      router.push(`/auction/${id}`)
    } catch (err: any) {
      alert('บันทึกไม่สำเร็จ: ' + (err?.message || err))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container py-5">
      <h2>แก้ไขกระทู้ประมูล</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>ชื่อประมูล</label>
          <input
            type="text"
            name="title"
            className="form-control"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>รายละเอียด</label>
          <textarea
            name="description"
            className="form-control"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <div className="mb-3">
          <label>ราคาเริ่มต้น (บาท)</label>
          <input
            type="number"
            name="start_price"
            className="form-control"
            value={formData.start_price}
            onChange={handleChange}
            required
            min="0"
          />
        </div>

        <div className="mb-3">
          <label>เวลาเริ่มประมูล</label>
          <input
            type="datetime-local"
            name="start_time"
            className="form-control"
            value={formData.start_time}
            onChange={handleChange}
            required
          />
          <div className="form-text">ระบบจะใช้เวลานี้เป็นฐานสำหรับกติกา 10 นาที/4 นาที</div>
        </div>

        <div className="mb-3">
          <label>ตั้งห้อง (บิดขั้นต่ำต่อครั้ง)</label>
          <select
            className="form-select"
            value={bidStep}
            onChange={(e) => setBidStep(Number(e.target.value))}
          >
            <option value={20}>20 บาท</option>
            <option value={50}>50 บาท</option>
            <option value={100}>100 บาท</option>
          </select>
        </div>

        {/* สถานะเปิด/ปิด */}
        <div className="mb-3">
          <label>สถานะการประมูล</label>
          <select
            className="form-select"
            value={isClosed ? 'true' : 'false'}
            onChange={(e) => setIsClosed(e.target.value === 'true')}
          >
            <option value="false">เปิด</option>
            <option value="true">ปิด</option>
          </select>
          <div className="form-text">
            ถ้าเวลาเริ่มยังไม่มาถึง ระบบจะบังคับ “เปิด” ให้อัตโนมัติเมื่อบันทึก
          </div>
        </div>

        {/* รูปภาพ */}
        <div className="mb-3">
          <label>อัปโหลดรูปภาพใหม่ (สูงสุด 20 รูป)</label>
          <input type="file" multiple accept="image/*" className="form-control" onChange={handleImageChange} />
          <div className="mt-2 d-flex gap-2 flex-wrap">
            {existingImages.map((url, idx) => (
              <div
                key={`old-${idx}`}
                onClick={() => setCoverImageIndex(idx)}
                style={{ cursor: 'pointer', border: coverImageIndex === idx ? '2px solid #0d6efd' : '1px solid #ddd', padding: 4 }}
              >
                <img src={url} alt={`img-${idx}`} width={96} height={96} style={{ objectFit: 'cover' }} />
                <div className="text-center small">{coverImageIndex === idx ? 'หน้าปก' : ''}</div>
              </div>
            ))}

            {images.map((file, idx) => (
              <div
                key={`new-${idx}`}
                onClick={() => setCoverImageIndex(existingImages.length + idx)}
                style={{ cursor: 'pointer', border: coverImageIndex === existingImages.length + idx ? '2px solid #0d6efd' : '1px solid #ddd', padding: 4 }}
              >
                <img src={URL.createObjectURL(file)} alt={`new-${idx}`} width={96} height={96} style={{ objectFit: 'cover' }} />
              </div>
            ))}
          </div>
          <div className="form-text">คลิกรูปเพื่อกำหนด “หน้าปก”</div>
        </div>

        <button type="submit" className="btn btn-success" disabled={uploading}>
          {uploading ? 'กำลังอัปเดต...' : 'บันทึกการแก้ไข'}
        </button>
      </form>
    </div>
  )
}

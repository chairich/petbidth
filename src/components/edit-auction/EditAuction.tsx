'use client'
import React, { useEffect, useState, ChangeEvent } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  const d = new Date(local)
  return isNaN(d.getTime()) ? null : d.toISOString()
}

/* ---------- ประเภทข้อมูลรูปภาพในแกลเลอรี ---------- */
type GalleryItem =
  | { kind: 'old'; url: string }
  | { kind: 'new'; file: File }

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
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [coverImageIndex, setCoverImageIndex] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [isClosed, setIsClosed] = useState<boolean>(false)

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
        start_time: isoToLocalInput(row.start_time),
      })

      const imgs = Array.isArray(row.images) ? row.images.filter(Boolean) : []
      setGallery(imgs.map((u) => ({ kind: 'old', url: u } as GalleryItem)))
      setCoverImageIndex(Math.min(row.cover_image_index ?? 0, Math.max(0, imgs.length - 1)))
      setBidStep([20, 50, 100].includes(Number(row.bid_step)) ? Number(row.bid_step) : 100)
      setIsClosed(Boolean(row.is_closed))
    }

    if (id) fetchAuction()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  /* ---------- เพิ่มรูปใหม่เข้าท้ายแกลเลอรี ---------- */
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    const next = [...gallery, ...files.map((f) => ({ kind: 'new', file: f } as GalleryItem))]
    if (next.length > 20) {
      alert('ใส่รูปได้สูงสุด 20 รูปต่อโพสต์')
      e.currentTarget.value = ''
      return
    }
    setGallery(next)
    e.currentTarget.value = ''
  }

  /* ---------- จัดเรียงรูป: ย้ายตำแหน่ง พร้อมอัปเดต index หน้าปก ---------- */
  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= gallery.length || from === to) return
    const next = [...gallery]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)

    let newCover = coverImageIndex
    if (coverImageIndex === from) newCover = to
    else if (coverImageIndex > from && coverImageIndex <= to) newCover = coverImageIndex - 1
    else if (coverImageIndex < from && coverImageIndex >= to) newCover = coverImageIndex + 1

    setGallery(next)
    setCoverImageIndex(newCover)
  }

  /* ---------- อัปโหลดเฉพาะรายการที่เป็น new และส่งกลับ URL ตามลำดับจริง ---------- */
  const resolveGalleryToUrls = async (): Promise<string[]> => {
    const urls: string[] = []
    for (let i = 0; i < gallery.length; i++) {
      const item = gallery[i]
      if (item.kind === 'old') {
        urls.push(item.url)
      } else {
        const file = item.file
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
        const key = `auctions/${id}/${Date.now()}_${i}.${ext}`
        const { error } = await supabase.storage.from(BUCKET).upload(key, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || undefined,
        })
        if (error) throw new Error('อัปโหลดรูปไม่สำเร็จ: ' + error.message)
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(key)
        urls.push(data.publicUrl)
      }
    }
    return urls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.start_price) {
      alert('กรุณากรอกข้อมูลให้ครบ')
      return
    }
    if (![20, 50, 100].includes(Number(bidStep))) {
      alert('ตั้งห้องต้องเป็น 20, 50 หรือ 100 เท่านั้น')
      return
    }

    const startISO = localToISO(formData.start_time)
    if (!startISO) {
      alert('กรุณาเลือกเวลาเริ่มให้ถูกต้อง')
      return
    }

    const startIsFuture = new Date(startISO) > new Date()

    setUploading(true)
    try {
      const orderedUrls = await resolveGalleryToUrls() // ⬅️ ได้ลำดับสุดท้ายจริง
      if (orderedUrls.length === 0) throw new Error('ยังไม่มีรูปภาพ')

      const safeCover = Math.min(coverImageIndex, Math.max(0, orderedUrls.length - 1))
      const isClosedFinal = startIsFuture ? false : Boolean(isClosed)

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        start_price: parseFloat(formData.start_price),
        start_time: startISO,
        images: orderedUrls,
        cover_image_index: safeCover,
        bid_step: Number(bidStep),
        is_closed: isClosedFinal,
      }

      const { data, error } = await supabase
        .from('auctions')
        .update(payload)
        .eq('id', id)
        .select('id')

      if (error) throw new Error(error.message)
      if (!data || data.length === 0) throw new Error('ไม่พบแถวสำหรับอัปเดต (อาจถูก RLS บล็อก)')

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

        {/* แกลเลอรี: จัดเรียงได้ และเลือกหน้าปกได้ */}
        <div className="mb-3">
          <label>รูปภาพ (สูงสุด 20 รูป) — คลิกรูปเพื่อกำหนดหน้าปก, ใช้ปุ่ม ↑ ↓ เพื่อจัดลำดับ</label>
          <input type="file" multiple accept="image/*" className="form-control" onChange={handleImageChange} />

          {gallery.length > 0 && (
            <div className="mt-2 d-flex gap-2 flex-wrap">
              {gallery.map((item, idx) => {
                const src = item.kind === 'old' ? item.url : URL.createObjectURL(item.file)
                const isCover = coverImageIndex === idx
                return (
                  <div key={idx} style={{ textAlign: 'center' }}>
                    <div
                      onClick={() => setCoverImageIndex(idx)}
                      style={{
                        cursor: 'pointer',
                        border: isCover ? '2px solid #0d6efd' : '1px solid #ddd',
                        padding: 4,
                        borderRadius: 6,
                        position: 'relative',
                      }}
                    >
                      <img src={src} alt={`img-${idx}`} width={96} height={96} style={{ objectFit: 'cover' }} />
                      <span
                        style={{
                          position: 'absolute',
                          top: 4,
                          left: 4,
                          background: 'rgba(0,0,0,0.6)',
                          color: '#fff',
                          fontSize: 12,
                          padding: '2px 6px',
                          borderRadius: 4,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <div className="small" style={{ marginTop: 4 }}>{isCover ? 'หน้าปก' : '\u00A0'}</div>
                    </div>
                    <div className="mt-1 d-flex justify-content-center gap-1">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => moveImage(idx, idx - 1)}
                        disabled={idx === 0}
                        title="เลื่อนขึ้น"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => moveImage(idx, idx + 1)}
                        disabled={idx === gallery.length - 1}
                        title="เลื่อนลง"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
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
          <div className="form-text">ถ้าเวลาเริ่มยังไม่มาถึง ระบบจะบังคับ “เปิด” ให้อัตโนมัติเมื่อบันทึก</div>
        </div>

        <button type="submit" className="btn btn-success" disabled={uploading}>
          {uploading ? 'กำลังอัปเดต...' : 'บันทึกการแก้ไข'}
        </button>
      </form>
    </div>
  )
}

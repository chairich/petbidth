'use client'

import React, { useEffect, useState, ChangeEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

const EditKnowledgePage = () => {
  const { id } = useParams()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [sections, setSections] = useState([{ subheading: '', body: '' }])
  const [images, setImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [canEdit, setCanEdit] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data: post } = await supabase.from('knowledge_posts').select('*').eq('id', id).single()
      const { data: sectionData } = await supabase
        .from('knowledge_sections')
        .select('*')
        .eq('post_id', id)
        .order('id')

      const {
        data: { session },
      } = await supabase.auth.getSession()

      const userId = session?.user.id
      const { data: user } = await supabase.from('users').select('role').eq('id', userId).single()

      if (post.author_id !== userId && user?.role !== 'admin') {
        alert('คุณไม่มีสิทธิ์แก้ไขบทความนี้')
        router.push('/knowledge')
        return
      } else {
        setCanEdit(true)
      }

      if (post) {
        setTitle(post.title)
        setExistingImages(post.images || [])
      }

      setSections(sectionData || [])
    }

    if (id) fetchData()
  }, [id])

  const handleSectionChange = (index: number, field: 'subheading' | 'body', value: string) => {
    const updated = [...sections]
    updated[index][field] = value
    setSections(updated)
  }

  const addSection = () => {
    setSections([...sections, { subheading: '', body: '' }])
  }

  const removeSection = (index: number) => {
    if (sections.length === 1) return
    setSections(sections.filter((_, i) => i !== index))
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    const totalImages = existingImages.length + files.length
    if (totalImages > 5) return alert('รวมแล้วอัปโหลดได้ไม่เกิน 5 รูป')
    setImages(files)
  }

  const removeExistingImage = (index: number) => {
    const updated = existingImages.filter((_, i) => i !== index)
    setExistingImages(updated)
  }

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = []
    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}_${i}.${ext}`
      const filePath = `knowledge-images/${fileName}`

      const { error } = await supabase.storage.from('knowledge-images').upload(filePath, file)
      if (error) {
        alert('อัปโหลดภาพล้มเหลว: ' + error.message)
        return []
      }

      const { data } = supabase.storage.from('knowledge-images').getPublicUrl(filePath)
      urls.push(data.publicUrl)
    }
    return urls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || sections.some((s) => !s.subheading || !s.body)) {
      alert('กรอกข้อมูลให้ครบ')
      return
    }

    setUploading(true)
    const newImageUrls = await uploadImages()
    const finalImages = [...existingImages, ...newImageUrls]

    const { error: updateError } = await supabase
      .from('knowledge_posts')
      .update({ title, images: finalImages })
      .eq('id', id)

    if (updateError) {
      alert('อัปเดตบทความล้มเหลว')
      setUploading(false)
      return
    }

    await supabase.from('knowledge_sections').delete().eq('post_id', id)
    for (const s of sections) {
      await supabase.from('knowledge_sections').insert({
        post_id: id,
        subheading: s.subheading,
        body: s.body,
      })
    }

    alert('อัปเดตบทความเรียบร้อย')
    router.push(`/knowledge/${id}`)
  }

  return (
    <div className="container py-5 max-w-3xl mx-auto text-white">
      <h2 className="text-2xl mb-4">🛠 แก้ไขบทความ</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label>หัวข้อบทความ</label>
          <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        {sections.map((section, index) => (
          <div key={index} className="mb-4 border p-3 rounded bg-[#0e1b3c]">
            <label>หัวข้อย่อย #{index + 1}</label>
            <input
              type="text"
              className="form-control mb-2"
              value={section.subheading}
              onChange={(e) => handleSectionChange(index, 'subheading', e.target.value)}
              placeholder="หัวข้อย่อย"
              required
            />
            <textarea
              className="form-control"
              rows={4}
              value={section.body}
              onChange={(e) => handleSectionChange(index, 'body', e.target.value)}
              placeholder="เนื้อหาในหัวข้อนี้"
              required
            />
            <button type="button" onClick={() => removeSection(index)} className="text-sm text-red-400 mt-2">
              ลบหัวข้อนี้
            </button>
          </div>
        ))}

        <div className="mb-4">
          <button type="button" onClick={addSection} className="btn btn-secondary">
            ➕ เพิ่มหัวข้อย่อย
          </button>
        </div>

        <div className="mb-4">
          <label>อัปโหลดรูปภาพ (สูงสุด 5 รูป)</label>
          <input type="file" multiple accept="image/*" className="form-control" onChange={handleImageChange} />
          {existingImages.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {existingImages.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} alt={`image-${i}`} className="w-full h-24 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(i)}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-2 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary" disabled={!canEdit || uploading}>
          {uploading ? 'กำลังอัปเดต...' : 'บันทึกการแก้ไข'}
        </button>
      </form>
    </div>
  )
}

export default EditKnowledgePage

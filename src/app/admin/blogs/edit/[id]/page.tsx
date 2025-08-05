'use client'

import { useEffect, useState, ChangeEvent } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'video'],
    ['clean'],
  ],
}

const quillFormats = [
  'header',
  'bold',
  'italic',
  'underline',
  'list',
  'bullet',
  'link',
  'video',
]

export default function EditBlogPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClientComponentClient()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [body, setBody] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const id = params.id as string

  useEffect(() => {
    if (id) fetchArticle()
  }, [id])

  const fetchArticle = async () => {
    const { data, error } = await supabase
      .from('seo_articles')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      alert('ไม่พบข้อมูลบทความ')
      router.push('/admin/blogs')
      return
    }

    setTitle(data.title)
    setSlug(data.slug)
    setExcerpt(data.excerpt)
    setBody(data.content)
    setCoverImage(data.coverimage)
    setLoading(false)
  }

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCoverFile(e.target.files[0])
    }
  }

  const uploadCoverImage = async (): Promise<string | null> => {
    if (!coverFile) return coverImage
    const ext = coverFile.name.split('.').pop()
    const fileName = `cover_${Date.now()}.${ext}`
    const filePath = `news-images/${fileName}`

    const { error } = await supabase.storage
      .from('news-images')
      .upload(filePath, coverFile)

    if (error) {
      alert('อัปโหลดภาพหน้าปกไม่สำเร็จ')
      console.error(error)
      return null
    }

    const { data } = supabase.storage.from('news-images').getPublicUrl(filePath)
    return data.publicUrl
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !slug || !excerpt || !body) {
      alert('กรุณากรอกข้อมูลให้ครบ')
      return
    }

    setUpdating(true)

    const coverUrl = await uploadCoverImage()
    if (!coverUrl) {
      setUpdating(false)
      return
    }

    const { error } = await supabase
      .from('seo_articles')
      .update({
        title,
        slug,
        excerpt,
        content: body,
        coverimage: coverUrl,
      })
      .eq('id', id)

    setUpdating(false)

    if (error) {
      alert('เกิดข้อผิดพลาดในการอัปเดต')
      console.error(error)
    } else {
      alert('อัปเดตบทความเรียบร้อยแล้ว')
      router.push('/admin/blogs')
    }
  }

  if (loading) return <p className="p-6 text-white">⏳ กำลังโหลดบทความ...</p>

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 text-white">
      <h1 className="text-2xl font-bold mb-4">📝 แก้ไขบทความ SEO</h1>

      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label>ชื่อบทความ</label>
          <input
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Slug</label>
          <input
            className="form-control"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
        </div>

        <div>
          <label>คำเกริ่น (Excerpt)</label>
          <textarea
            className="form-control"
            rows={3}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </div>

        <div>
          <label>เนื้อหา</label>
          <ReactQuill
            value={body}
            onChange={setBody}
            modules={quillModules}
            formats={quillFormats}
            theme="snow"
          />
        </div>

        <div>
          <label>ภาพหน้าปก</label>
          <input type="file" accept="image/*" onChange={handleCoverChange} />
          {coverImage && (
            <img
              src={coverImage}
              alt="cover preview"
              className="mt-2 rounded w-full max-w-md"
            />
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={updating}
        >
          {updating ? 'กำลังอัปเดต...' : '💾 บันทึกการเปลี่ยนแปลง'}
        </button>
      </form>
    </div>
  )
}

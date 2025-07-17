'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function ForumAdminForm({ editId }: { editId?: string }) {
  const supabase = createClient()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState<File | null>(null)

  useEffect(() => {
    if (editId) {
      const fetchPost = async () => {
        const { data, error } = await supabase.from('threads').select('*').eq('id', editId).single()
        if (data) {
          setTitle(data.title)
          setContent(data.content)
        }
      }
      fetchPost()
    }
  }, [editId])

  const handleSubmit = async () => {
    let image_url = null
    if (image) {
      const fileExt = image.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const { data, error } = await supabase.storage.from('forum-images').upload(fileName, image)
      if (error) {
        alert('Upload รูปไม่สำเร็จ')
        return
      }
      image_url = data?.path
    }

    if (editId) {
      await supabase.from('threads').update({ title, content, image_url }).eq('id', editId)
      alert('แก้ไขเรียบร้อยแล้ว')
    } else {
      await supabase.from('threads').insert([{ title, content, image_url }])
      alert('โพสต์เรียบร้อยแล้ว')
    }

    router.push('/forum')
  }

  return (
    <div className="p-6 text-white max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{editId ? 'แก้ไขกระทู้' : 'โพสต์กระทู้ใหม่'}</h1>
      <input
        type="text"
        placeholder="หัวข้อ"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 rounded bg-black border border-gray-600"
      />
      <textarea
        placeholder="เนื้อหา"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-2 rounded bg-black border border-gray-600 min-h-[150px]"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] ?? null)}
        className="text-white"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-800"
      >
        {editId ? 'บันทึกการแก้ไข' : 'โพสต์'}
      </button>
    </div>
  )
}
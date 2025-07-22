'use client'

import { useState } from 'react'

export default function KnowledgeEditForm() {
  const [title, setTitle] = useState('')
  const [sections, setSections] = useState([{ heading: '', content: '' }])
  const [images, setImages] = useState<FileList | null>(null)

  const handleSectionChange = (index: number, field: 'heading' | 'content', value: string) => {
    const updated = [...sections]
    updated[index][field] = value
    setSections(updated)
  }

  const addSection = () => {
    setSections([...sections, { heading: '', content: '' }])
  }

  const removeSection = (index: number) => {
    const updated = [...sections]
    updated.splice(index, 1)
    setSections(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ title, sections, images })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6 text-white">
      <h1 className="text-2xl font-bold">📝 สร้างบทความความรู้</h1>

      <div>
        <label className="block mb-1">หัวข้อบทความ</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 bg-zinc-900 border border-zinc-700 text-white rounded-lg"
          placeholder="เช่น วิธีดูแลนกเบื้องต้น"
        />
      </div>

      {sections.map((section, index) => (
        <div key={index} className="p-4 bg-zinc-800 rounded-lg space-y-3">
          <h3 className="font-semibold">หัวข้อย่อย #{index + 1}</h3>
          <input
            type="text"
            value={section.heading}
            onChange={(e) => handleSectionChange(index, 'heading', e.target.value)}
            className="w-full p-2 bg-zinc-900 border border-zinc-700 text-white rounded"
            placeholder="หัวข้อย่อย"
          />
          <textarea
            value={section.content}
            onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
            rows={4}
            className="w-full p-2 bg-zinc-900 border border-zinc-700 text-white rounded resize-none"
            placeholder="เนื้อหาในหัวข้อนี้"
          />
          <button
            type="button"
            onClick={() => removeSection(index)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
          >
            ลบหัวข้อนี้
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addSection}
        className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg"
      >
        ➕ เพิ่มหัวข้อย่อย
      </button>

      <div>
        <label className="block mb-1 mt-4">อัปโหลดรูปภาพ (สูงสุด 5 รูป)</label>
        <input
          type="file"
          multiple
          onChange={(e) => setImages(e.target.files)}
          className="w-full bg-zinc-900 border border-zinc-700 p-2 text-white rounded"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
      >
        โพสต์บทความ
      </button>
    </form>
  )
}

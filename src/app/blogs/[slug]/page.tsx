'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Article = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverimage: string
}

type Comment = {
  id: string
  name: string
  email: string
  comment: string
  created_at: string
}

export default function BlogDetailPage() {
  const supabase = createClientComponentClient()
  const { slug } = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [commentText, setCommentText] = useState('')

  useEffect(() => {
    const loadArticle = async () => {
      const { data } = await supabase
        .from('seo_articles')
        .select('*')
        .eq('slug', slug)
        .single()
      if (data) {
        setArticle(data)
        loadComments(data.id)
      }
    }

    const loadComments = async (articleId: string) => {
      const { data } = await supabase
        .from('article_comments')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: false })
      if (data) setComments(data)
    }

    loadArticle()
  }, [slug])

  const handleSubmit = async () => {
    if (!article || !name || !email || !commentText) return alert('กรุณากรอกข้อมูลให้ครบ')
    const { error } = await supabase.from('article_comments').insert({
      article_id: article.id,
      name,
      email,
      comment: commentText,
    })
    if (!error) {
      setCommentText('')
      setName('')
      setEmail('')
      // Reload comment
      const { data } = await supabase
        .from('article_comments')
        .select('*')
        .eq('article_id', article.id)
        .order('created_at', { ascending: false })
      if (data) setComments(data)
    } else {
      alert('ไม่สามารถส่งคอมเมนต์ได้')
    }
  }

  if (!article) return <div className="p-4 text-white">กำลังโหลด...</div>

  return (
    <div className="max-w-4xl mx-auto text-white p-4">
      <h1 className="text-3xl font-bold mb-2">{article.title}</h1>
      <p className="mb-4 text-gray-300">{article.excerpt}</p>
      {article.coverimage && (
        <img src={article.coverimage} alt="cover" className="w-full mb-4 rounded" />
      )}
      <div dangerouslySetInnerHTML={{ __html: article.content }} className="prose prose-invert" />

      <hr className="my-6 border-gray-700" />
      <h2 className="text-2xl font-semibold mb-2">ความคิดเห็น</h2>

      <div className="space-y-4 mb-8">
        {comments.map((c) => (
          <div key={c.id} className="bg-gray-900 p-4 rounded">
            <div className="font-semibold">{c.name}</div>
            <div className="text-sm text-gray-400">{new Date(c.created_at).toLocaleString()}</div>
            <p className="mt-2">{c.comment}</p>
          </div>
        ))}
      </div>

      <h3 className="text-xl font-semibold mb-2">แสดงความคิดเห็น</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Your Name"
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
        /><br />
        <input
          type="email"
          placeholder="Your Email"
           name="email" className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br />
      </div>
      <textarea
        placeholder="เสนอความคิดเห็น..."
        name="overlay_text" className="form-control" 
        rows={4}
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
      /><br />
      <button
        type="submit" className="btn btn-primary"
        onClick={handleSubmit}
      >
        ส่งความคิดเห็น
      </button>
    </div>
  )
}

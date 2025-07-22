'use client'

import { useState } from 'react'

type Props = {
  postId: string
}

export default function CommentForm({ postId }: Props) {
  const [comment, setComment] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return

    const res = await fetch('/api/knowledge-comments', {
      method: 'POST',
      body: JSON.stringify({ content: comment, postId }),
    })

    if (res.ok) {
      setComment('')
      location.reload()
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea
          name="description"
          className="form-control"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="พิมพ์ความคิดเห็นของคุณที่นี่..."
          required
        ></textarea>

        <div className="mt-4 text-right">
          <button className="btn btn-success w-100">ส่งความคิดเห็น</button>
        </div>
      </form>
    </div>
  )
}

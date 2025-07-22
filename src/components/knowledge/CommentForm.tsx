'use client'

import { useState } from 'react'

type Props = {
  onSubmit: (comment: string) => void
}

export default function CommentForm({ onSubmit }: Props) {
  const [comment, setComment] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (comment.trim() === '') return
    onSubmit(comment)
    setComment('')
  }

  return (
    <div>
     
      <form onSubmit={handleSubmit}>

         <textarea name="description" className="form-control" rows={4} value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="พิมพ์ความคิดเห็นของคุณที่นี่..."
           required></textarea>
        
        <div className="mt-4 text-right">
           <button className="btn btn-success w-100"> ส่งความคิดเห็น </button>
        </div>
      </form>
    </div>
  )
}

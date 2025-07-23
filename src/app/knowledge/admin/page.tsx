'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

export default function KnowledgeAdminPage() {
  const supabase = createClientComponentClient<Database>()

  const [userRole, setUserRole] = useState<string | null>(null)
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id
      if (userId) {
        const { data: user } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .single()
        setUserRole(user?.role ?? null)
      }

      const { data, error } = await supabase
        .from('knowledge_posts')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching posts:', error)
      } else {
        setPosts(data)
      }
    }

    fetchUserAndPosts()
  }, [])

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4 text-blue-300">บทความให้ความรู้</h1>

      <div className="mb-4 space-x-2">
        <Link href="/knowledge/new" className="inline-flex items-center text-sm text-white hover:underline">
          <span className="mr-1 text-xl">✚</span> เขียนบทความใหม่
        </Link>
        <Link href="/knowledge/my-posts" className="inline-flex items-center text-sm text-yellow-400 hover:underline">
          ✏️ จัดการบทความของฉัน
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {posts.length === 0 ? (
          <p>ยังไม่มีบทความ</p>
        ) : (
          posts.map(post => (
            <div key={post.id}>
              <Link href={`/knowledge/${post.id}`} className="text-lg font-semibold text-blue-400 hover:underline">
                {post.title}
              </Link>{' '}
              <Link href={`/knowledge/edit/${post.id}`} className="text-sm text-yellow-400 hover:underline ml-2">
                ✏️ แก้ไข
              </Link>
              <div className="text-xs text-gray-400">โพสต์เมื่อ {new Date(post.created_at).toLocaleDateString('th-TH')}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

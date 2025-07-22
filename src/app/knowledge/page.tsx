'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

export default function KnowledgePage() {
  const supabase = createClientComponentClient<Database>()

  const [userRole, setUserRole] = useState<string | null>(null)
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    const getUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id

      if (!userId) return
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

      setUserRole(user?.role ?? null)
    }

    const fetchPosts = async () => {
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

    getUserRole()
    fetchPosts()
  }, [])

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4 text-blue-300">บทความให้ความรู้</h1>

      {userRole === 'admin' && (
        <Link href="/knowledge/new" className="inline-flex items-center text-sm text-white hover:underline">
          <span className="mr-1 text-xl">✚</span> เขียนบทความใหม่
        </Link>
      )}

      <div className="mt-6 space-y-3">
        {posts.length === 0 ? (
          <p>ยังไม่มีบทความ</p>
        ) : (
          posts.map(post => (
            <div key={post.id}>
              <Link href={`/knowledge/${post.id}`} className="text-lg font-semibold text-blue-400 hover:underline">
                {post.title}
              </Link>
              <div className="text-xs text-gray-400">โพสต์เมื่อ {new Date(post.created_at).toLocaleDateString('th-TH')}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import Image from 'next/image'
import HeaderOne from '@/layouts/headers/HeaderOne'
import FooterOne from '@/layouts/footers/FooterOne'
import Divider from '@/components/common/Divider'

export default function KnowledgePage() {
  const supabase = createClientComponentClient<Database>()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
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

      const { data } = await supabase
        .from('knowledge_posts')
        .select('id, title, images, created_at')
        .order('created_at', { ascending: false })

      if (data) setPosts(data)
    }

    fetchData()
  }, [])

  return (
    <>
      <HeaderOne />
      <section className="pt-12 pb-6 text-white">
        <div className="container">
          <h1 className="text-center text-3xl font-bold mb-6">🧠 บทความให้ความรู้</h1>

          {userRole === 'admin' && (
            <div className="text-center mb-6">
              <Link href="/knowledge/new" className="btn btn-success mx-1">+ เขียนบทความ</Link>
              <Link href="/knowledge/my-posts" className="btn btn-warning mx-1">✏️ จัดการบทความ</Link>
            </div>
          )}

          <div className="row">
            {posts.map((post) => (
              <div key={post.id} className="col-md-6 col-lg-4 mb-4">
                <div className="bg-slate-900 rounded-lg shadow-md p-3 h-full flex flex-col justify-between">
                  {post.images?.[0] && (
                    <Image
                      src={post.images[0]}
                      alt={post.title}
                      width={400}
                      height={300}
                      className="rounded mb-3 w-full h-[200px] object-cover"
                    />
                  )}
                  <h2 className="text-lg font-semibold text-white line-clamp-2">{post.title}</h2>
                  <div className="mt-3">
                    <Link href={`/knowledge/${post.id}`} className="btn btn-primary w-full">
                      อ่านเพิ่มเติม
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Divider />
      <FooterOne />
    </>
  )
}
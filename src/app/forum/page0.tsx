
'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function ForumPage() {
  const [threads, setThreads] = useState([])

  useEffect(() => {
    const fetchThreads = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('threads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4)

      if (data) setThreads(data)
    }

    fetchThreads()
  }, [])

  return (
    <main className="p-8 text-white min-h-screen bg-[#05050a]">
      <h1 className="text-3xl font-bold mb-4 text-center">กระทู้ล่าสุด</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {threads.map((thread) => (
          <Link
            key={thread.id}
            href={`/forum/${thread.id}`}
            className="bg-[#0e0e1a] rounded-2xl p-6 shadow hover:shadow-lg transition block"
          >
            <h2 className="text-lg font-semibold">{thread.title}</h2>
            <p className="text-sm text-gray-400 mt-1 line-clamp-3">{thread.content.slice(0, 100)}...</p>
            <p className="mt-2 text-xs text-right text-gray-500">{new Date(thread.created_at).toLocaleDateString()}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function OnlineUserCount() {
  const [count, setCount] = useState(0)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchOnlineUsers = async () => {
      const oneMinuteAgo = new Date(Date.now() - 60000).toISOString()

      const { data, error } = await supabase
        .from('online_users')
        .select('user_id')
        .gte('last_seen', oneMinuteAgo)

      if (!error) setCount(data.length)
    }

    fetchOnlineUsers()
    const interval = setInterval(fetchOnlineUsers, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>👥 ขณะนี้มีผู้ใช้งานออนไลน์ {count} คน</div>
  )
}

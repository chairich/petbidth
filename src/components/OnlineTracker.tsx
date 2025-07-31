'use client'

import { useEffect } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'

export default function OnlineTracker() {
  const supabase = useSupabaseClient()
  const user = useUser()

  useEffect(() => {
    const updateLastSeen = async () => {
      if (user) {
        console.log("✅ อัปเดต last_seen ของ", user.email)
        await supabase
          .from('users')
          .update({ last_seen: new Date().toISOString() })
          .eq('id', user.id)
      } else {
        console.log("❌ ไม่พบ user")
      }
    }

    updateLastSeen()
    const interval = setInterval(updateLastSeen, 60000)
    return () => clearInterval(interval)
  }, [user])

  return null
}

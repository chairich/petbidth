// hooks/useOnlineStatus.ts
'use client'

import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const useOnlineStatus = () => {
  const supabase = createClientComponentClient()

  useEffect(() => {
    const updateOnlineStatus = async () => {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser()

      if (error || !user) return

      const { data: profile } = await supabase
        .from('users')
        .select('name')
        .eq('id', user.id)
        .single()

      await supabase
        .from('online_users')
        .upsert({
          user_id: user.id,
          user_name: profile?.name || '',
          last_seen: new Date().toISOString(),
        })
    }

    updateOnlineStatus()
    const interval = setInterval(updateOnlineStatus, 60000) // ทุก 1 นาที

    return () => clearInterval(interval)
  }, [])

  return null
}

export default useOnlineStatus

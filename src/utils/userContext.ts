import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/auth-js'

// ✅ เพิ่มบรรทัดนี้ด้านบน
export const UserContext = createContext<{
  user: User | null
  setUser: React.Dispatch<React.SetStateAction<User | null>>
}>({
  user: null,
  setUser: () => {},
})

// ✅ เพิ่ม custom hook
export const useUser = () => useContext(UserContext)

// ✅ ด้านล่าง return <UserContext.Provider ...> {...}

import { Suspense } from 'react'
import CallbackClient from './callback-client'

export default function Page() {
  return (
    <Suspense fallback={<p>กำลังเข้าสู่ระบบ...</p>}>
      <CallbackClient />
    </Suspense>
  )
}

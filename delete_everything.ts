import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function deleteAllUsers() {
  let nextPage = null;

  do {
    const { data, error } = await supabase.auth.admin.listUsers({ page: nextPage })

    if (error) {
      console.error('❌ ดึงรายชื่อผู้ใช้ล้มเหลว:', error.message)
      return
    }

    for (const user of data.users) {
      const { error: delError } = await supabase.auth.admin.deleteUser(user.id)
      if (delError) {
        console.error(`❌ ลบผู้ใช้ ${user.email} ล้มเหลว:`, delError.message)
      } else {
        console.log(`✅ ลบผู้ใช้แล้ว: ${user.email}`)
      }
    }

    nextPage = data.nextPage
  } while (nextPage)
}

deleteAllUsers()


import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ykinhwdtvucjgryyjyvj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlraW5od2R0dnVjamdyeXlqeXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzI0NTgsImV4cCI6MjA2NzEwODQ1OH0.MFPNlMFkXroHaCUvtkPk5ZUAUB9ElcQ-Aq9jqdqxh3k'
)

const admins = [
  {
    email: 'chairich@gmail.com',
    password: 'AdminSuper21',
    username: 'chairich',
    fullname: 'Chairich Thongsomruk',
    phone: '0945287892',
    facebook: 'chairich',
    role: 'แอดมิน'
  },
  {
    email: 'tadadon2507@gmail.com',
    password: 'AdminSuper88',
    username: 'tadadon',
    fullname: 'Tadadon',
    phone: '0917030732',
    facebook: 'tadadon',
    role: 'แอดมิน'
  }
]

async function registerAdmins() {
  for (const admin of admins) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: admin.email,
      password: admin.password
    })

    if (authError) {
      console.error(`❌ Error creating auth user for ${admin.email}:`, authError.message)
      continue
    }

    const userId = authData.user?.id
    if (!userId) {
      console.error(`❌ No user ID returned for ${admin.email}`)
      continue
    }

    const { error: insertError } = await supabase.from('users').insert([
      {
        id: userId,
        email: admin.email,
        username: admin.username,
        fullname: admin.fullname,
        phone: admin.phone,
        facebook: admin.facebook,
        role: admin.role
      }
    ])

    if (insertError) {
      console.error(`❌ Error inserting user data for ${admin.email}:`, insertError.message)
    } else {
      console.log(`✅ Admin ${admin.email} registered successfully`)
    }
  }
}

registerAdmins()

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const admins = [
  {
    email: 'chai4rich@gmail.com',
    password: 'Cowboys21@1',
    phone: '0945287892',
    fullname: 'Chairich',
    username: 'admin1',
    facebook: 'https://www.facebook.com/civilized.cctv'
  },
  {
    email: 'tadadon2507@gmail.com',
    password: 'SuperAdmin88',
    phone: '0917030732',
    fullname: 'Tadadon',
    username: 'admin2',
    facebook: 'https://www.facebook.com/paklatfarm'
  }
];

async function createAdmins() {
  for (const admin of admins) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: admin.email,
      password: admin.password,
      email_confirm: true,
      user_metadata: {
        phone: admin.phone,
        fullname: admin.fullname,
        username: admin.username,
        facebook: admin.facebook,
        role: 'admin',
        status: 'approved',
      },
    });

    if (error) {
      console.error(`❌ Signup failed for ${admin.email}:`, error.message);
    } else {
      console.log(`✅ Created admin: ${admin.email}`, data?.user?.id);
    }
  }
}

createAdmins();

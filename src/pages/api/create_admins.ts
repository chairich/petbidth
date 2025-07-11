
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const admins = [
  {
    email: 'chairich@gmail.com',
    password: 'Cowboys21@1',
    phone: '0945287892',
    fullname: 'Chairich',
    username: 'admin',
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
    const { data: user, error: signupError } = await supabase.auth.admin.createUser({
      email: admin.email,
      password: admin.password,
      email_confirm: true
    });

    if (signupError) {
      console.error(`❌ Signup failed for ${admin.email}`, signupError.message);
      continue;
    }

    const userId = user.user?.id;

    const { error: insertError } = await supabase.from('users').insert({
      id: userId,
      email: admin.email,
      phone: admin.phone,
      fullname: admin.fullname,
      username: admin.username,
      facebook: admin.facebook,
      role: 'admin',
      status: 'approved'
    });

    if (insertError) {
      console.error(`❌ Insert failed for ${admin.email}`, insertError.message);
    } else {
      console.log(`✅ Admin created: ${admin.email}`);
    }
  }
}

createAdmins();

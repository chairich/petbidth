import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })


import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const admins = [
  {
    email: 'chairich@gmail.com',
    password: 'AdminSuper21',
    username: 'chairich',
    phone: '0945287892',
  },
  {
    email: 'tadadon2507@gmail.com',
    password: 'AdminSuper88',
    username: 'tadadon',
    phone: '0917030732',
  },
];

async function createOrReplaceAdmin(admin) {
  const { email, password, username, phone } = admin;

  // Remove from users table
  await supabase
    .from('users')
    .delete()
    .eq('email', email);

  // Remove from auth.users
  const { data: existingUser } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const userToDelete = existingUser?.users?.find(u => u.email === email);
  if (userToDelete) {
    await supabase.auth.admin.deleteUser(userToDelete.id);
  }

  // Create auth user
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    console.error(`❌ Error creating auth user for ${email}:`, authError.message);
    return;
  }

  // Insert into users table
  const { error: dbError } = await supabase.from('users').insert({
    id: authUser.user.id,
    email,
    username,
    phone,
    role: 'admin',
    created_at: new Date().toISOString(),
  });

  if (dbError) {
    console.error(`❌ Error inserting user data for ${email}:`, dbError.message);
  } else {
    console.log(`✅ Admin ${email} registered successfully`);
  }
}

async function run() {
  for (const admin of admins) {
    await createOrReplaceAdmin(admin);
  }
}

run();
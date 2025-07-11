

const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  'https://ykinhwdtvucjgryyjyvj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlraW5od2R0dnVjamdyeXlqeXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzI0NTgsImV4cCI6MjA2NzEwODQ1OH0.MFPNlMFkXroHaCUvtkPk5ZUAUB9ElcQ-Aq9jqdqxh3k'

);

async function createAdminUser(email, password, fullname, phone) {
  const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    console.error('Error creating user:', authError.message);
    return;
  }

  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: userData.user.id,
    email,
    username: email.split('@')[0],
    fullname,
    phone,
    role: 'admin',
    created_at: new Date().toISOString(),
  });

  if (profileError) {
    console.error('Error inserting profile:', profileError.message);
    return;
  }

  console.log('Admin user created successfully:', userData.user.id);
}

createAdminUser(
  'chairich@gmail.com',
  'admin1234',
  'Chairich Thongsomruk',
  '0945287892'
);

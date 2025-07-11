
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admins = [
    {
      email: 'chairich@gmail.com',
      password: 'Cowboys21@1',
      phone: '0945287892',
      fullname: 'Chairich',
      username: 'admin',
      facebook: 'https://www.facebook.com/civilized.cctv',
    },
    {
      email: 'tadadon2507@gmail.com',
      password: 'SuperAdmin88',
      phone: '0917030732',
      fullname: 'Tadadon',
      username: 'admin2',
      facebook: 'https://www.facebook.com/paklatfarm',
    },
  ];

  const results: any[] = [];

  for (const admin of admins) {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: admin.email,
      password: admin.password,
    });

    if (signUpError || !signUpData.user) {
      results.push({
        email: admin.email,
        success: false,
        error: signUpError?.message || 'Unknown error',
      });
      continue;
    }

    const userId = signUpData.user.id;
    const { error: insertError } = await supabase.from('users').insert([
      {
        id: userId,
        email: admin.email,
        phone: admin.phone,
        fullname: admin.fullname,
        username: admin.username,
        facebook: admin.facebook,
        role: 'admin',
        status: 'approved',
      },
    ]);

    if (insertError) {
      results.push({
        email: admin.email,
        success: false,
        error: insertError.message,
      });
    } else {
      results.push({ email: admin.email, success: true, id: userId });
    }
  }

  return res.status(200).json({ results });
}

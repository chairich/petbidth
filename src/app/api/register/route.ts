import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.json();
  const { id, email, username, fullname, phone, facebook, role } = body;

  const { error } = await supabase.from('profiles').insert({
    id,
    email,
    username,
    fullname,
    phone,
    facebook,
    role,
    created_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: 'Insert success' }, { status: 200 });
}

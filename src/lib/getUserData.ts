// getUserData.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const getUserData = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, avatar_url')
      .eq('id', userId)
      .single();  // ใช้ single() เพื่อดึงข้อมูลแถวเดียว

    if (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

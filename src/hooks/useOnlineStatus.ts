'use client';

import { useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const useOnlineStatus = () => {
  const user = useUser();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!user?.id) return;

    const updateOnlineStatus = async () => {
      await supabase.from('online_users').upsert(
        {
          user_id: user.id,
          user_name: user.user_metadata?.username || user.email || 'anonymous',
          last_seen: new Date().toISOString(),
        },
        {
          onConflict: 'user_id', // ✅ ต้องเป็น string เดี่ยว
        }
      );
    };

    updateOnlineStatus();

    const interval = setInterval(updateOnlineStatus, 30000); // ทุก 30 วินาที
    return () => clearInterval(interval);
  }, [user]);
};

export default useOnlineStatus;

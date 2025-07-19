'use client';

import { useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const useTrackVisitor = () => {
  const supabase = createClientComponentClient();

  useEffect(() => {
    const trackVisitor = async () => {
      const ip = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => 'unknown');

      await supabase.from('page_views').insert({
        ip_address: ip,
        user_agent: navigator.userAgent,
        page: window.location.pathname,
      });
    };

    trackVisitor();
  }, []);
};

export default useTrackVisitor;

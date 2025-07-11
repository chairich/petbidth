// src/utils/userContext.ts
'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from './supabaseClient';

type User = {
  id: string;
  email: string;
  [key: string]: any;
};

const UserContext = createContext<{ user: User | null }>({ user: null });

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);

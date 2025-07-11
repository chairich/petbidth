import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/utils/supabase";
import type { User } from "@supabase/auth-js";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data?.session?.user;
      if (currentUser?.email) {
        setUser(currentUser as User);
      } else {
        setUser(null);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user;
        if (currentUser?.email) {
          setUser(currentUser as User);
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

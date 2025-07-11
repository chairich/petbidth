export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: string;
        };
        Insert: {
          id?: string;
          email: string;
          role: string;
        };
        Update: {
          email?: string;
          role?: string;
        };
      };
    };
  };
}
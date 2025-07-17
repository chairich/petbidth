export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      auctions: {
        Row: {
          id: string;
          title: string;
          description: string;
          images: string[];
          cover_image_index: number;
          start_price: number;
          end_time: string;
          created_by: string;
          is_closed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          images: string[];
          cover_image_index: number;
          start_price: number;
          end_time: string;
          created_by: string;
          is_closed?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["auctions"]["Insert"]>;
      };

      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          facebook: string;
          role: 'general' | 'vip' | 'admin';
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], 'id' | 'created_at'>;
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
      };
    };
  };
}

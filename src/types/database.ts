export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          slug: string;
          title: string;
          subtitle: string | null;
          description: string | null;
          category: string | null;
          year: number | null;
          role: string | null;
          tools: string[];
          tags: string[];
          is_published: boolean;
          is_featured: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          subtitle?: string | null;
          description?: string | null;
          category?: string | null;
          year?: number | null;
          role?: string | null;
          tools?: string[];
          tags?: string[];
          is_published?: boolean;
          is_featured?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          subtitle?: string | null;
          description?: string | null;
          category?: string | null;
          year?: number | null;
          role?: string | null;
          tools?: string[];
          tags?: string[];
          is_published?: boolean;
          is_featured?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      project_images: {
        Row: {
          id: string;
          project_id: string;
          storage_path: string;
          public_url: string | null;
          alt_text: string | null;
          caption: string | null;
          sort_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          storage_path: string;
          public_url?: string | null;
          alt_text?: string | null;
          caption?: string | null;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          storage_path?: string;
          public_url?: string | null;
          alt_text?: string | null;
          caption?: string | null;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
      };
      project_links: {
        Row: {
          id: string;
          project_id: string;
          label: string;
          url: string;
          type: string | null;
          microcopy: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          label: string;
          url: string;
          type?: string | null;
          microcopy?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          label?: string;
          url?: string;
          type?: string | null;
          microcopy?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      admin_users: {
        Row: {
          user_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type DbProject = Database["public"]["Tables"]["projects"]["Row"];
export type DbProjectImage = Database["public"]["Tables"]["project_images"]["Row"];
export type DbProjectLink = Database["public"]["Tables"]["project_links"]["Row"];
export type DbAdminUser = Database["public"]["Tables"]["admin_users"]["Row"];

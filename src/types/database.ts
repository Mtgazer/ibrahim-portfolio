export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ---------------------------------------------------------------------------
// PresentationData — strongly-typed shape of the presentation_data JSONB
// column on the projects table.
//
// This is the canonical application-level contract.  Do NOT widen this to
// Record<string, unknown> in calling code.
// ---------------------------------------------------------------------------

export interface PresentationDataVisualScreen {
  src: string;
  caption?: string;
  isHighlighted?: boolean;
}

export interface PresentationDataVisualSide {
  src: string;
  caption?: string;
}

/**
 * The JSONB visual fallback block stored inside presentation_data.
 *
 * Rendering precedence (applied in src/lib/projects.ts):
 *   1. DB project_images rows (Storage URLs)
 *   2. presentation_data.visuals paths (public/ folder fallback)
 *
 * If all uploaded Storage images are later deleted the public site will
 * fall back to the paths stored here, which render only when the
 * corresponding files exist under public/images/projects/.
 */
export interface PresentationDataVisuals {
  /** Path for the primary / banner image (public/ relative path or URL). */
  main?: string;
  mainCaption?: string;
  mainBadge?: string;
  secondaryLeft?: PresentationDataVisualSide;
  secondaryRight?: PresentationDataVisualSide;
  /** Used by the 'screen-trio' mediaLayout. */
  screens?: PresentationDataVisualScreen[];
}

export type MediaLayout = 'banner-with-grid' | 'screen-trio' | 'split-panel';
export type LayoutVariant = 'default' | 'standard' | 'flipped';

export interface PresentationDataMetric {
  label: string;
  value: string;
  detail: string;
  isGold?: boolean;
}

export interface PresentationDataPillar {
  number: string;
  title: string;
  description: string;
}

export interface PresentationDataGrowthNote {
  title: string;
  text: string;
}

/**
 * Full shape of the presentation_data JSONB column.
 * This is the exported type that application code must use — never
 * use a bare `Json` or `Record<string, unknown>` as the contract.
 */
export interface PresentationData {
  projectNumber: string;
  badge?: string;
  teamStructure?: string;
  disciplineScope?: string;
  statusText?: string;
  growthNote?: PresentationDataGrowthNote;
  metrics?: PresentationDataMetric[];
  pillars?: PresentationDataPillar[];
  coreComponentSet?: string[];
  ctaText?: string;
  ctaMicrocopy?: string;
  layoutVariant?: LayoutVariant;
  mediaLayout?: MediaLayout;
  /**
   * Visual fallback paths. Overridden at render time by DB project_images
   * rows (which carry Supabase Storage public URLs).
   */
  visuals?: PresentationDataVisuals;
}

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
          presentation_data: PresentationData | null;
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
          presentation_data?: PresentationData | null;
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
          presentation_data?: PresentationData | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: "project_images_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "project_links_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
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

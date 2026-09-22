/*
  Project data types.

  These interfaces define the shape of the project data model
  used throughout the public portfolio and admin dashboard.

  They will be connected to the Supabase database schema in Phase 3.
  Database-generated types (from `supabase gen types`) will either
  replace or augment these in Phase 3.
*/

// ---------------------------------------------------------------------------
// Project
// ---------------------------------------------------------------------------

export interface Project {
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
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  heroImageId: string | null;
  coverImageId: string | null;
  createdAt: string;
  updatedAt: string;
  /** Populated when fetched with a joined query */
  images?: ProjectImage[];
  /** Populated when fetched with a joined query */
  links?: ProjectLink[];
}

// ---------------------------------------------------------------------------
// Project Image
// ---------------------------------------------------------------------------

export interface ProjectImage {
  id: string;
  projectId: string;
  /** Path within the Supabase Storage bucket — not a full URL */
  storagePath: string;
  publicUrl?: string | null;
  altText: string | null;
  caption?: string | null;
  sortOrder: number;
  isPrimary?: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Project Link
// ---------------------------------------------------------------------------

export type ProjectLinkType = 'case-study' | 'demo' | 'github' | 'figma' | 'external';

export interface ProjectLink {
  id: string;
  projectId: string;
  /** Display label, e.g. "Live Demo", "GitHub", "Case Study" */
  label: string;
  url: string;
  type?: ProjectLinkType;
  microcopy?: string;
  sortOrder: number;
}

// ---------------------------------------------------------------------------
// Admin User
// ---------------------------------------------------------------------------

export interface AdminUser {
  id: string;
  email: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Editorial Case Study Presentation Types (Phase 2 / Phase 3)
// ---------------------------------------------------------------------------

export interface ProjectMetric {
  label: string;
  value: string;
  detail: string;
  isGold?: boolean;
}

export interface TechnicalPillar {
  number: string;
  title: string;
  description: string;
}

export type MediaLayout = 'banner-with-grid' | 'screen-trio' | 'split-panel';

export interface EditorialProject extends Project {
  projectNumber: string;
  badge?: string;
  teamStructure?: string;
  disciplineScope?: string;
  statusText?: string;
  growthNote?: {
    title: string;
    text: string;
  };
  metrics?: ProjectMetric[];
  pillars?: TechnicalPillar[];
  coreComponentSet?: string[];
  ctaText?: string;
  ctaMicrocopy?: string;
  layoutVariant?: 'default' | 'standard' | 'flipped';
  mediaLayout?: MediaLayout;
  visuals: {
    main?: string;
    mainCaption?: string;
    mainBadge?: string;
    secondaryLeft?: {
      src: string;
      caption?: string;
    };
    secondaryRight?: {
      src: string;
      caption?: string;
    };
    screens?: Array<{
      src: string;
      caption?: string;
      isHighlighted?: boolean;
    }>;
  };
}


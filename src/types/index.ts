/*
  Project data types.

  These interfaces define the shape of the project data model
  used throughout the public portfolio and admin dashboard.

  Presentation-specific types (PresentationData, MediaLayout, LayoutVariant,
  visuals shapes, metrics, pillars) live in src/types/database.ts as they
  directly mirror the presentation_data JSONB column contract.
*/

import type {
  PresentationDataVisuals,
  PresentationDataMetric,
  PresentationDataPillar,
  PresentationDataGrowthNote,
  MediaLayout,
  LayoutVariant,
} from "@/types/database";

// Re-export the PresentationData type family so consumers can import from
// either @/types or @/types/database without caring about which file owns them.
export type {
  PresentationData,
  PresentationDataVisuals,
  PresentationDataVisualScreen,
  PresentationDataVisualSide,
  PresentationDataMetric,
  PresentationDataPillar,
  PresentationDataGrowthNote,
  MediaLayout,
  LayoutVariant,
} from "@/types/database";

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
// Editorial Case Study Presentation Types (Phase 7: sourced from Supabase)
// ---------------------------------------------------------------------------

/** @deprecated Use PresentationDataMetric from @/types/database directly. */
export type ProjectMetric = PresentationDataMetric;

/** @deprecated Use PresentationDataPillar from @/types/database directly. */
export type TechnicalPillar = PresentationDataPillar;

export interface EditorialProject extends Project {
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
   * Resolved visuals for rendering.
   *
   * Precedence (applied in src/lib/projects.ts mapDbProjectToEditorialProject):
   *   1. DB project_images rows (Supabase Storage public URLs)
   *   2. presentation_data.visuals fallback (public/ local paths)
   *
   * If all uploaded Storage images are deleted the site will fall back to
   * public/ paths stored in presentation_data.visuals (if present).
   */
  visuals: PresentationDataVisuals;
}

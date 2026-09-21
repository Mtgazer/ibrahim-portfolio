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
  altText: string | null;
  sortOrder: number;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Project Link
// ---------------------------------------------------------------------------

export interface ProjectLink {
  id: string;
  projectId: string;
  /** Display label, e.g. "Live Demo", "GitHub", "Case Study" */
  label: string;
  url: string;
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

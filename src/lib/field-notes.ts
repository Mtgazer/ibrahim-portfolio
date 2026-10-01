import { FieldNote } from "@/types";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { DbFieldNote } from "@/types/database";
import { fieldNotes as localFallbackNotes } from "@/data/fieldNotes";

/**
 * Data Access Layer for Portfolio Field Notes (Phase 2).
 *
 * Sourced from Supabase PostgreSQL table `public.field_notes` with RLS.
 * Fallbacks to local reference data when Supabase is unconfigured or empty.
 */

import { formatNoteDate } from "@/lib/date";
export { formatNoteDate };

/**
 * Maps a Supabase database row to the strongly-typed domain FieldNote model.
 * Handles snake_case to camelCase conversion, derived technical noteNumber,
 * tag fallbacks, and UI compatibility aliases.
 */
export function mapDbFieldNoteToDomain(row: DbFieldNote): FieldNote {
  const formattedDate = row.note_date ? formatNoteDate(row.note_date) : null;
  const image = row.cover_image_url || row.cover_image_path || null;
  const primaryTag = row.tags && row.tags.length > 0 ? row.tags[0] : row.category ?? null;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    category: row.category,
    noteNumber: row.note_number ?? String(row.sort_order).padStart(2, "0"),
    date: formattedDate,
    noteDate: row.note_date,
    coverImage: image,
    coverImagePath: row.cover_image_path,
    coverImageUrl: row.cover_image_url,
    coverAltText: row.cover_alt_text,
    tags: row.tags ?? [],
    tag: primaryTag,
    externalLink: row.external_link,
    href: row.external_link || "#contact",
    isPublished: row.is_published,
    isFeatured: row.is_featured,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // UI convenience backwards-compatibility alias
    image,
  };
}

/**
 * Retrieves all published field notes, ordered by `sort_order` ascending
 * and `created_at` descending.
 *
 * Security: Subject to PostgreSQL RLS "Public can view published field notes".
 * Anonymous and public requests can only view records where `is_published = true`.
 */
export async function getPublishedFieldNotes(): Promise<FieldNote[]> {
  if (!isSupabaseConfigured()) {
    return localFallbackNotes;
  }

  try {
    const supabase = await createClient();
    if (!supabase) return localFallbackNotes;

    const { data, error } = await supabase
      .from("field_notes")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      // Graceful fallback to verified reference data
      return localFallbackNotes;
    }

    return data.map(mapDbFieldNoteToDomain);
  } catch {
    return localFallbackNotes;
  }
}

/**
 * Retrieves a single field note by its unique ID.
 */
export async function getFieldNoteById(id: string): Promise<FieldNote | null> {
  const getFallback = () => {
    const fallback = localFallbackNotes.find((n) => n.id === id);
    return fallback ? (fallback as FieldNote) : null;
  };

  if (!isSupabaseConfigured()) {
    return getFallback();
  }

  try {
    const supabase = await createClient();
    if (!supabase) return getFallback();

    const { data, error } = await supabase
      .from("field_notes")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return getFallback();
    return mapDbFieldNoteToDomain(data);
  } catch {
    return getFallback();
  }
}

/**
 * Retrieves all field notes for the Admin dashboard (published + drafts).
 * Admin-only: relies on server authorization guard (requireAdmin) and
 * PostgreSQL RLS "Admins have full access to field notes".
 */
export async function getAllAdminFieldNotes(): Promise<FieldNote[]> {
  if (!isSupabaseConfigured()) {
    return localFallbackNotes;
  }

  try {
    const supabase = await createClient();
    if (!supabase) return localFallbackNotes;

    const { data, error } = await supabase
      .from("field_notes")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return localFallbackNotes;
    }
    return data.map(mapDbFieldNoteToDomain);
  } catch {
    return localFallbackNotes;
  }
}

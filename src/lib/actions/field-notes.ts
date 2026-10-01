"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { normalizeSlug, isValidSlug } from "@/lib/slug";
import type { DbFieldNoteUpdate } from "@/types/database";

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface FieldNoteInput {
  title: string;
  slug?: string | null;
  description?: string | null;
  category?: string | null;
  noteNumber?: string | null;
  noteDate?: string | null;
  tags?: string[];
  externalLink?: string | null;
  isPublished?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  coverImagePath?: string | null;
  coverImageUrl?: string | null;
  coverAltText?: string | null;
}

// ---------------------------------------------------------------------------
// Helpers & Validation
// ---------------------------------------------------------------------------

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024; // 10MB strict limit

function sanitizeFilename(originalName: string): string {
  const base = originalName.replace(/^.*[/\\]/, "");
  const clean = base.replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase();
  return clean.slice(-60);
}

function isValidUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    // Allow relative paths and anchor fragments (e.g. #contact)
    return rawUrl.startsWith("#") || rawUrl.startsWith("/");
  }
}

function safeRevalidatePath(path: string): void {
  try {
    revalidatePath(path);
  } catch {
    // Gracefully handle execution outside Next.js request context (e.g. CLI testing)
  }
}

function normalizeTags(rawTags?: string[]): string[] {
  if (!rawTags || !Array.isArray(rawTags)) return [];
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const tag of rawTags) {
    const trimmed = tag.trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      normalized.push(trimmed);
    }
  }

  return normalized;
}

// ---------------------------------------------------------------------------
// Field Note CRUD Actions
// ---------------------------------------------------------------------------

/**
 * Creates a new Field Note record.
 */
export async function createFieldNoteAction(
  input: FieldNoteInput
): Promise<ActionResponse<{ id: string }>> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    if (!supabase) {
      return { success: false, error: "Database client is not available." };
    }

    const title = input.title?.trim();
    if (!title) {
      return { success: false, error: "Field Note title is required." };
    }
    if (title.length > 200) {
      return { success: false, error: "Title exceeds maximum length of 200 characters." };
    }

    // Slug is optional for Field Notes
    let cleanSlug: string | null = null;
    if (input.slug && input.slug.trim()) {
      cleanSlug = normalizeSlug(input.slug.trim());
      if (!isValidSlug(cleanSlug)) {
        return {
          success: false,
          error: "Slug is invalid. It must contain only lowercase letters, numbers, and single hyphens.",
        };
      }

      // Check slug uniqueness
      const { data: existingSlug } = await supabase
        .from("field_notes")
        .select("id")
        .eq("slug", cleanSlug)
        .maybeSingle();

      if (existingSlug) {
        return {
          success: false,
          error: `A field note with the slug "${cleanSlug}" already exists.`,
        };
      }
    }

    // Validate external link if provided
    let cleanExternalLink: string | null = null;
    if (input.externalLink && input.externalLink.trim()) {
      cleanExternalLink = input.externalLink.trim();
      if (!isValidUrl(cleanExternalLink)) {
        return {
          success: false,
          error: "External link must be a valid URL (https://...) or page anchor (#contact).",
        };
      }
    }

    const sortOrder =
      typeof input.sortOrder === "number" && !isNaN(input.sortOrder)
        ? Math.floor(input.sortOrder)
        : 0;

    // Derive or preserve note_number
    const noteNumber =
      input.noteNumber?.trim() || String(sortOrder).padStart(2, "0");

    const tags = normalizeTags(input.tags);

    // Validate note_date if provided
    let cleanDate: string | null = null;
    if (input.noteDate && input.noteDate.trim()) {
      const parsedDate = new Date(input.noteDate.trim());
      if (isNaN(parsedDate.getTime())) {
        return { success: false, error: "Invalid note date provided." };
      }
      cleanDate = input.noteDate.trim();
    }

    const { data, error } = await supabase
      .from("field_notes")
      .insert({
        title,
        slug: cleanSlug,
        description: input.description?.trim() || null,
        category: input.category?.trim() || null,
        note_number: noteNumber,
        note_date: cleanDate,
        tags,
        external_link: cleanExternalLink,
        is_published: Boolean(input.isPublished),
        is_featured: Boolean(input.isFeatured),
        sort_order: sortOrder,
        cover_image_path: input.coverImagePath?.trim() || null,
        cover_image_url: input.coverImageUrl?.trim() || null,
        cover_alt_text: input.coverAltText?.trim() || null,
      })
      .select("id")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    safeRevalidatePath("/");
    safeRevalidatePath("/admin");
    safeRevalidatePath("/admin/field-notes");

    return { success: true, data: { id: data.id } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create field note.";
    return { success: false, error: msg };
  }
}

/**
 * Updates an existing Field Note record.
 */
export async function updateFieldNoteAction(
  id: string,
  input: FieldNoteInput
): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    if (!supabase) {
      return { success: false, error: "Database client is not available." };
    }

    const title = input.title?.trim();
    if (!title) {
      return { success: false, error: "Field Note title is required." };
    }
    if (title.length > 200) {
      return { success: false, error: "Title exceeds maximum length of 200 characters." };
    }

    // Slug is optional
    let cleanSlug: string | null = null;
    if (input.slug && input.slug.trim()) {
      cleanSlug = normalizeSlug(input.slug.trim());
      if (!isValidSlug(cleanSlug)) {
        return {
          success: false,
          error: "Slug is invalid. It must contain only lowercase letters, numbers, and single hyphens.",
        };
      }

      // Check slug uniqueness against other records
      const { data: existingSlug } = await supabase
        .from("field_notes")
        .select("id")
        .eq("slug", cleanSlug)
        .neq("id", id)
        .maybeSingle();

      if (existingSlug) {
        return {
          success: false,
          error: `The slug "${cleanSlug}" is already in use by another field note.`,
        };
      }
    }

    // Validate external link if provided
    let cleanExternalLink: string | null = null;
    if (input.externalLink && input.externalLink.trim()) {
      cleanExternalLink = input.externalLink.trim();
      if (!isValidUrl(cleanExternalLink)) {
        return {
          success: false,
          error: "External link must be a valid URL (https://...) or page anchor (#contact).",
        };
      }
    }

    const sortOrder =
      typeof input.sortOrder === "number" && !isNaN(input.sortOrder)
        ? Math.floor(input.sortOrder)
        : 0;

    const noteNumber =
      input.noteNumber?.trim() || String(sortOrder).padStart(2, "0");

    const tags = normalizeTags(input.tags);

    // Validate note_date if provided
    let cleanDate: string | null = null;
    if (input.noteDate && input.noteDate.trim()) {
      const parsedDate = new Date(input.noteDate.trim());
      if (isNaN(parsedDate.getTime())) {
        return { success: false, error: "Invalid note date provided." };
      }
      cleanDate = input.noteDate.trim();
    }

    const updatePayload: DbFieldNoteUpdate = {
      title,
      slug: cleanSlug,
      description: input.description?.trim() || null,
      category: input.category?.trim() || null,
      note_number: noteNumber,
      note_date: cleanDate,
      tags,
      external_link: cleanExternalLink,
      is_published: Boolean(input.isPublished),
      is_featured: Boolean(input.isFeatured),
      sort_order: sortOrder,
    };

    // If cover image fields are explicitly provided in input, include them
    if (input.coverImagePath !== undefined) {
      updatePayload.cover_image_path = input.coverImagePath?.trim() || null;
    }
    if (input.coverImageUrl !== undefined) {
      updatePayload.cover_image_url = input.coverImageUrl?.trim() || null;
    }
    if (input.coverAltText !== undefined) {
      updatePayload.cover_alt_text = input.coverAltText?.trim() || null;
    }

    const { error } = await supabase
      .from("field_notes")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    safeRevalidatePath("/");
    safeRevalidatePath("/admin");
    safeRevalidatePath("/admin/field-notes");
    safeRevalidatePath(`/admin/field-notes/${id}`);

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update field note.";
    return { success: false, error: msg };
  }
}

/**
 * Toggles publication status of a Field Note.
 */
export async function toggleFieldNotePublishedAction(
  id: string,
  isPublished: boolean
): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    if (!supabase) return { success: false, error: "Database client unavailable." };

    const { error } = await supabase
      .from("field_notes")
      .update({ is_published: isPublished })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    safeRevalidatePath("/");
    safeRevalidatePath("/admin");
    safeRevalidatePath("/admin/field-notes");
    safeRevalidatePath(`/admin/field-notes/${id}`);

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to toggle publication.";
    return { success: false, error: msg };
  }
}

/**
 * Toggles featured status of a Field Note.
 */
export async function toggleFieldNoteFeaturedAction(
  id: string,
  isFeatured: boolean
): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    if (!supabase) return { success: false, error: "Database client unavailable." };

    const { error } = await supabase
      .from("field_notes")
      .update({ is_featured: isFeatured })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    safeRevalidatePath("/");
    safeRevalidatePath("/admin");
    safeRevalidatePath("/admin/field-notes");
    safeRevalidatePath(`/admin/field-notes/${id}`);

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to toggle featured status.";
    return { success: false, error: msg };
  }
}

/**
 * Updates sort order for a Field Note.
 */
export async function updateFieldNoteSortOrderAction(
  id: string,
  sortOrder: number
): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    if (!supabase) return { success: false, error: "Database client unavailable." };

    const cleanOrder = typeof sortOrder === "number" && !isNaN(sortOrder) ? Math.floor(sortOrder) : 0;

    const { error } = await supabase
      .from("field_notes")
      .update({ sort_order: cleanOrder })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    safeRevalidatePath("/");
    safeRevalidatePath("/admin");
    safeRevalidatePath("/admin/field-notes");

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update sort order.";
    return { success: false, error: msg };
  }
}

/**
 * Deletes a Field Note:
 * 1. Checks and cleans up associated cover image in Supabase Storage.
 * 2. Deletes the database record.
 * 3. Revalidates paths.
 */
export async function deleteFieldNoteAction(
  id: string
): Promise<ActionResponse<{ storageCleaned: boolean; warning?: string }>> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    if (!supabase) return { success: false, error: "Database client unavailable." };

    // 1. Retrieve the existing cover image path
    const { data: note } = await supabase
      .from("field_notes")
      .select("cover_image_path")
      .eq("id", id)
      .maybeSingle();

    let storageCleaned = true;
    let warning: string | undefined;

    // 2. Remove from Storage bucket if an image exists
    if (note?.cover_image_path) {
      const { error: storageError } = await supabase.storage
        .from("field-note-images")
        .remove([note.cover_image_path]);

      if (storageError) {
        storageCleaned = false;
        warning = `Storage cleanup warning: ${storageError.message}`;
      }
    }

    // 3. Delete database record
    const { error: dbError } = await supabase
      .from("field_notes")
      .delete()
      .eq("id", id);

    if (dbError) {
      return { success: false, error: dbError.message };
    }

    safeRevalidatePath("/");
    safeRevalidatePath("/admin");
    safeRevalidatePath("/admin/field-notes");

    return { success: true, data: { storageCleaned, warning } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete field note.";
    return { success: false, error: msg };
  }
}

// ---------------------------------------------------------------------------
// Cover Image Storage Mutations
// ---------------------------------------------------------------------------

/**
 * Uploads a single cover image to the `field-note-images` storage bucket,
 * replaces old storage object if present, and updates the database record.
 */
export async function uploadFieldNoteCoverImageAction(
  fieldNoteId: string,
  formData: FormData
): Promise<ActionResponse<{ storagePath: string; publicUrl: string }>> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    if (!supabase) return { success: false, error: "Database client unavailable." };

    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File) || file.size === 0) {
      return { success: false, error: "No image file provided for upload." };
    }

    // Validate type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        success: false,
        error: `Unsupported file format "${file.type}". Allowed formats: JPEG, PNG, WebP, GIF, AVIF.`,
      };
    }

    // Validate size (<= 10MB)
    if (file.size > MAX_IMAGE_FILE_SIZE) {
      const mb = (file.size / (1024 * 1024)).toFixed(2);
      return {
        success: false,
        error: `File size (${mb} MB) exceeds maximum allowed limit of 10 MB.`,
      };
    }

    const altText = (formData.get("altText") as string)?.trim() || null;

    // Check existing note to get old image path for cleanup
    const { data: existingNote } = await supabase
      .from("field_notes")
      .select("cover_image_path")
      .eq("id", fieldNoteId)
      .maybeSingle();

    const oldStoragePath = existingNote?.cover_image_path;

    // Generate path: field-notes/{field_note_id}/{uuid}-{safe_filename}
    const safeName = sanitizeFilename(file.name);
    const uniqueId = crypto.randomUUID();
    const storagePath = `field-notes/${fieldNoteId}/${uniqueId}-${safeName}`;

    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("field-note-images")
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return {
        success: false,
        error: `Storage upload failed: ${uploadError.message}`,
      };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("field-note-images")
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData?.publicUrl || null;

    // Update database record
    const { error: updateError } = await supabase
      .from("field_notes")
      .update({
        cover_image_path: storagePath,
        cover_image_url: publicUrl,
        ...(altText ? { cover_alt_text: altText } : {}),
      })
      .eq("id", fieldNoteId);

    if (updateError) {
      // Rollback uploaded storage object on DB failure
      await supabase.storage.from("field-note-images").remove([storagePath]);
      return {
        success: false,
        error: `Database update failed: ${updateError.message}`,
      };
    }

    // Clean up old storage object if replaced
    if (oldStoragePath && oldStoragePath !== storagePath) {
      await supabase.storage.from("field-note-images").remove([oldStoragePath]);
    }

    safeRevalidatePath("/");
    safeRevalidatePath("/admin");
    safeRevalidatePath("/admin/field-notes");
    safeRevalidatePath(`/admin/field-notes/${fieldNoteId}`);

    return {
      success: true,
      data: {
        storagePath,
        publicUrl: publicUrl || "",
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to upload cover image.";
    return { success: false, error: msg };
  }
}

/**
 * Deletes the cover image from storage and resets image columns on the note record.
 */
export async function deleteFieldNoteCoverImageAction(
  fieldNoteId: string
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    const supabase = await createClient();
    if (!supabase) return { success: false, error: "Database client unavailable." };

    const { data: note } = await supabase
      .from("field_notes")
      .select("cover_image_path")
      .eq("id", fieldNoteId)
      .maybeSingle();

    if (note?.cover_image_path) {
      await supabase.storage
        .from("field-note-images")
        .remove([note.cover_image_path]);
    }

    const { error } = await supabase
      .from("field_notes")
      .update({
        cover_image_path: null,
        cover_image_url: null,
        cover_alt_text: null,
      })
      .eq("id", fieldNoteId);

    if (error) return { success: false, error: error.message };

    safeRevalidatePath("/");
    safeRevalidatePath("/admin");
    safeRevalidatePath("/admin/field-notes");
    safeRevalidatePath(`/admin/field-notes/${fieldNoteId}`);

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to remove cover image.";
    return { success: false, error: msg };
  }
}

/**
 * Updates only the cover image alt text.
 */
export async function updateFieldNoteCoverImageMetaAction(
  fieldNoteId: string,
  altText: string
): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    if (!supabase) return { success: false, error: "Database client unavailable." };

    const { error } = await supabase
      .from("field_notes")
      .update({ cover_alt_text: altText.trim() || null })
      .eq("id", fieldNoteId);

    if (error) return { success: false, error: error.message };

    safeRevalidatePath("/");
    safeRevalidatePath("/admin");
    safeRevalidatePath("/admin/field-notes");
    safeRevalidatePath(`/admin/field-notes/${fieldNoteId}`);

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update cover alt text.";
    return { success: false, error: msg };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ProjectInput {
  title: string;
  slug: string;
  subtitle?: string | null;
  description?: string | null;
  category?: string | null;
  year?: number | null;
  role?: string | null;
  tools?: string[];
  tags?: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
}

export interface ProjectLinkInput {
  label: string;
  url: string;
  type?: "case-study" | "demo" | "github" | "figma" | "external" | null;
  microcopy?: string | null;
  sortOrder?: number;
}

import { normalizeSlug, isValidSlug } from "@/lib/slug";

function isValidUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    // Also allow relative fragment anchors e.g. #contact
    return rawUrl.startsWith("#") || rawUrl.startsWith("/");
  }
}

// ---------------------------------------------------------------------------
// Project Mutations
// ---------------------------------------------------------------------------

/**
 * Creates a new project in Supabase.
 */
export async function createProjectAction(
  input: ProjectInput
): Promise<ActionResponse<{ id: string }>> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    if (!supabase) {
      return { success: false, error: "Database client is not available." };
    }

    const title = input.title?.trim();
    if (!title) {
      return { success: false, error: "Project title is required." };
    }

    const slug = normalizeSlug(input.slug || title);
    if (!isValidSlug(slug)) {
      return {
        success: false,
        error:
          "Slug is invalid. It must contain only lowercase letters, numbers, and single hyphens (e.g. 'my-project').",
      };
    }

    // Check slug uniqueness
    const { data: existingSlug } = await supabase
      .from("projects")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingSlug) {
      return {
        success: false,
        error: `A project with the slug "${slug}" already exists. Please choose a unique slug.`,
      };
    }

    const sortOrder =
      typeof input.sortOrder === "number" && !isNaN(input.sortOrder)
        ? input.sortOrder
        : 0;

    const { data, error } = await supabase
      .from("projects")
      .insert({
        title,
        slug,
        subtitle: input.subtitle?.trim() || null,
        description: input.description?.trim() || null,
        category: input.category?.trim() || null,
        year:
          typeof input.year === "number" && !isNaN(input.year)
            ? input.year
            : null,
        role: input.role?.trim() || null,
        tools: input.tools || [],
        tags: input.tags || [],
        is_published: Boolean(input.isPublished),
        is_featured: Boolean(input.isFeatured),
        sort_order: sortOrder,
      })
      .select("id")
      .single();

    if (error || !data) {
      return {
        success: false,
        error: error?.message || "Failed to create project record.",
      };
    }

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/projects");

    return { success: true, data: { id: data.id } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create project.";
    return { success: false, error: msg };
  }
}

/**
 * Updates an existing project's metadata.
 */
export async function updateProjectAction(
  id: string,
  input: ProjectInput
): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    if (!supabase) {
      return { success: false, error: "Database client is not available." };
    }

    const title = input.title?.trim();
    if (!title) {
      return { success: false, error: "Project title is required." };
    }

    const slug = normalizeSlug(input.slug || title);
    if (!isValidSlug(slug)) {
      return {
        success: false,
        error:
          "Slug is invalid. It must contain only lowercase letters, numbers, and single hyphens.",
      };
    }

    // Check slug uniqueness against other projects
    const { data: existingSlug } = await supabase
      .from("projects")
      .select("id")
      .eq("slug", slug)
      .neq("id", id)
      .maybeSingle();

    if (existingSlug) {
      return {
        success: false,
        error: `The slug "${slug}" is already in use by another project.`,
      };
    }

    const sortOrder =
      typeof input.sortOrder === "number" && !isNaN(input.sortOrder)
        ? input.sortOrder
        : 0;

    const { error } = await supabase
      .from("projects")
      .update({
        title,
        slug,
        subtitle: input.subtitle?.trim() || null,
        description: input.description?.trim() || null,
        category: input.category?.trim() || null,
        year:
          typeof input.year === "number" && !isNaN(input.year)
            ? input.year
            : null,
        role: input.role?.trim() || null,
        tools: input.tools || [],
        tags: input.tags || [],
        is_published: Boolean(input.isPublished),
        is_featured: Boolean(input.isFeatured),
        sort_order: sortOrder,
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${id}`);

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update project.";
    return { success: false, error: msg };
  }
}

/**
 * Toggles a project's publication status.
 */
export async function toggleProjectPublishedAction(
  id: string,
  isPublished: boolean
): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    if (!supabase) return { success: false, error: "Database unavailable." };

    const { error } = await supabase
      .from("projects")
      .update({ is_published: isPublished })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${id}`);

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update publication.";
    return { success: false, error: msg };
  }
}

/**
 * Toggles a project's featured status.
 */
export async function toggleProjectFeaturedAction(
  id: string,
  isFeatured: boolean
): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    if (!supabase) return { success: false, error: "Database unavailable." };

    const { error } = await supabase
      .from("projects")
      .update({ is_featured: isFeatured })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${id}`);

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update featured flag.";
    return { success: false, error: msg };
  }
}

/**
 * Updates a project's sort order.
 */
export async function updateProjectSortOrderAction(
  id: string,
  sortOrder: number
): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    if (!supabase) return { success: false, error: "Database unavailable." };

    const { error } = await supabase
      .from("projects")
      .update({ sort_order: sortOrder })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/projects");

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update sort order.";
    return { success: false, error: msg };
  }
}

/**
 * Deletes a project completely:
 * 1. Requires admin.
 * 2. Loads all associated image storage paths.
 * 3. Cleans up associated storage objects from bucket 'project-images'.
 * 4. Deletes the project record (Postgres cascades delete on child links & images).
 * 5. Revalidates public & admin pages.
 */
export async function deleteProjectAction(
  id: string
): Promise<ActionResponse<{ storageCleaned: boolean; warning?: string }>> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    if (!supabase) return { success: false, error: "Database unavailable." };

    // 1. Load project images to retrieve their storage paths
    const { data: images } = await supabase
      .from("project_images")
      .select("storage_path")
      .eq("project_id", id);

    let storageCleaned = true;
    let warning: string | undefined;

    // 2. Delete storage objects if any exist
    if (images && images.length > 0) {
      const pathsToDelete = images
        .map((img) => img.storage_path)
        .filter(Boolean);

      if (pathsToDelete.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("project-images")
          .remove(pathsToDelete);

        if (storageError) {
          storageCleaned = false;
          warning = `Database record deleted, but some storage files could not be removed: ${storageError.message}`;
        }
      }
    }

    // 3. Delete the project row
    const { error: deleteError } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/projects");

    return { success: true, data: { storageCleaned, warning } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete project.";
    return { success: false, error: msg };
  }
}

// ---------------------------------------------------------------------------
// Project Links Mutations
// ---------------------------------------------------------------------------

/**
 * Creates a new link for a project.
 */
export async function createProjectLinkAction(
  projectId: string,
  input: ProjectLinkInput
): Promise<ActionResponse<{ id: string }>> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    if (!supabase) return { success: false, error: "Database unavailable." };

    const label = input.label?.trim();
    if (!label) return { success: false, error: "Link label is required." };

    const url = input.url?.trim();
    if (!url || !isValidUrl(url)) {
      return {
        success: false,
        error: "A valid URL or anchor (e.g. https://... or #contact) is required.",
      };
    }

    // Determine default sort order
    let sortOrder = input.sortOrder ?? 0;
    if (typeof input.sortOrder !== "number") {
      const { count } = await supabase
        .from("project_links")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId);
      sortOrder = (count || 0) + 1;
    }

    const { data, error } = await supabase
      .from("project_links")
      .insert({
        project_id: projectId,
        label,
        url,
        type: input.type || null,
        microcopy: input.microcopy?.trim() || null,
        sort_order: sortOrder,
      })
      .select("id")
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || "Failed to create link." };
    }

    revalidatePath("/");
    revalidatePath(`/admin/projects/${projectId}`);

    return { success: true, data: { id: data.id } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create link.";
    return { success: false, error: msg };
  }
}

/**
 * Updates an existing project link.
 */
export async function updateProjectLinkAction(
  linkId: string,
  projectId: string,
  input: ProjectLinkInput
): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    if (!supabase) return { success: false, error: "Database unavailable." };

    const label = input.label?.trim();
    if (!label) return { success: false, error: "Link label is required." };

    const url = input.url?.trim();
    if (!url || !isValidUrl(url)) {
      return { success: false, error: "A valid URL or anchor is required." };
    }

    const { error } = await supabase
      .from("project_links")
      .update({
        label,
        url,
        type: input.type || null,
        microcopy: input.microcopy?.trim() || null,
        sort_order: input.sortOrder ?? 0,
      })
      .eq("id", linkId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/");
    revalidatePath(`/admin/projects/${projectId}`);

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update link.";
    return { success: false, error: msg };
  }
}

/**
 * Deletes a project link.
 */
export async function deleteProjectLinkAction(
  linkId: string,
  projectId: string
): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    if (!supabase) return { success: false, error: "Database unavailable." };

    const { error } = await supabase
      .from("project_links")
      .delete()
      .eq("id", linkId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/");
    revalidatePath(`/admin/projects/${projectId}`);

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete link.";
    return { success: false, error: msg };
  }
}

/**
 * Reorders project links based on an ordered array of link IDs.
 */
export async function reorderProjectLinksAction(
  projectId: string,
  orderedLinkIds: string[]
): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    if (!supabase) return { success: false, error: "Database unavailable." };

    const updates = orderedLinkIds.map((id, index) =>
      supabase
        .from("project_links")
        .update({ sort_order: index + 1 })
        .eq("id", id)
    );

    await Promise.all(updates);

    revalidatePath("/");
    revalidatePath(`/admin/projects/${projectId}`);

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to reorder links.";
    return { success: false, error: msg };
  }
}

// ---------------------------------------------------------------------------
// Project Images & Supabase Storage Mutations
// ---------------------------------------------------------------------------

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024; // 10MB strict server limit

function sanitizeFilename(originalName: string): string {
  const base = originalName.replace(/^.*[/\\]/, ""); // strip path traversal
  const clean = base.replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase();
  return clean.slice(-60); // limit length
}

/**
 * Uploads an image to Supabase Storage and inserts a corresponding project_images record.
 * Handles rollback of the uploaded storage file if the database insert fails.
 */
export async function uploadProjectImageAction(
  projectId: string,
  formData: FormData
): Promise<ActionResponse<{ id: string; storagePath: string; publicUrl: string }>> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    if (!supabase) return { success: false, error: "Database client unavailable." };

    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File) || file.size === 0) {
      return { success: false, error: "No image file provided for upload." };
    }

    // Server-side validation: file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        success: false,
        error: `Unsupported file type "${file.type}". Allowed formats: JPEG, PNG, WebP, GIF, AVIF.`,
      };
    }

    // Server-side validation: file size (<= 10MB)
    if (file.size > MAX_IMAGE_FILE_SIZE) {
      const mb = (file.size / (1024 * 1024)).toFixed(2);
      return {
        success: false,
        error: `File size (${mb} MB) exceeds maximum allowed limit of 10 MB.`,
      };
    }

    const altText = (formData.get("altText") as string)?.trim() || null;
    const caption = (formData.get("caption") as string)?.trim() || null;

    // Check existing images for this project to determine primary and sort order
    const { data: existingImages } = await supabase
      .from("project_images")
      .select("id, is_primary, sort_order")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true });

    const isFirstImage = !existingImages || existingImages.length === 0;
    const explicitPrimary = formData.get("isPrimary") === "true";
    const shouldBePrimary = isFirstImage || explicitPrimary;

    const nextSortOrder =
      existingImages && existingImages.length > 0
        ? Math.max(...existingImages.map((img) => img.sort_order)) + 1
        : 1;

    // Generate safe storage path: {projectId}/{uuid}-{safeFilename}
    const safeName = sanitizeFilename(file.name);
    const uniqueId = crypto.randomUUID();
    const storagePath = `${projectId}/${uniqueId}-${safeName}`;

    // Upload to Supabase Storage using authenticated server client
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("project-images")
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

    // Retrieve public URL from bucket
    const { data: publicUrlData } = supabase.storage
      .from("project-images")
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData.publicUrl;

    // If new image should be primary, unset existing primary images first to respect partial unique index
    if (shouldBePrimary && existingImages && existingImages.length > 0) {
      await supabase
        .from("project_images")
        .update({ is_primary: false })
        .eq("project_id", projectId)
        .eq("is_primary", true);
    }

    // Insert database record
    const { data: imageRow, error: insertError } = await supabase
      .from("project_images")
      .insert({
        project_id: projectId,
        storage_path: storagePath,
        public_url: publicUrl,
        alt_text: altText,
        caption: caption,
        sort_order: nextSortOrder,
        is_primary: shouldBePrimary,
      })
      .select("id")
      .single();

    if (insertError || !imageRow) {
      // Rollback: remove uploaded storage file to prevent orphaned files
      await supabase.storage.from("project-images").remove([storagePath]);

      return {
        success: false,
        error: `Database registration failed: ${insertError?.message || "Unknown error"}. Cleaned up uploaded file.`,
      };
    }

    revalidatePath("/");
    revalidatePath(`/admin/projects/${projectId}`);

    return {
      success: true,
      data: {
        id: imageRow.id,
        storagePath,
        publicUrl,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to upload image.";
    return { success: false, error: msg };
  }
}

/**
 * Deletes an image from Supabase Storage and removes its database row.
 * If the deleted image was primary, automatically promotes the next available image to primary.
 */
export async function deleteProjectImageAction(
  imageId: string,
  projectId: string
): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    if (!supabase) return { success: false, error: "Database unavailable." };

    // 1. Fetch image record to retrieve storage_path and is_primary
    const { data: imageRow } = await supabase
      .from("project_images")
      .select("storage_path, is_primary")
      .eq("id", imageId)
      .maybeSingle();

    if (!imageRow) {
      return { success: false, error: "Image record not found." };
    }

    // 2. Remove file from storage
    if (imageRow.storage_path) {
      await supabase.storage
        .from("project-images")
        .remove([imageRow.storage_path]);
    }

    // 3. Delete database row
    const { error: deleteError } = await supabase
      .from("project_images")
      .delete()
      .eq("id", imageId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    // 4. If the deleted image was primary, safely promote the next available image
    if (imageRow.is_primary) {
      const { data: remainingImages } = await supabase
        .from("project_images")
        .select("id")
        .eq("project_id", projectId)
        .order("sort_order", { ascending: true })
        .limit(1);

      if (remainingImages && remainingImages.length > 0) {
        await supabase
          .from("project_images")
          .update({ is_primary: true })
          .eq("id", remainingImages[0].id);
      }
    }

    revalidatePath("/");
    revalidatePath(`/admin/projects/${projectId}`);

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete image.";
    return { success: false, error: msg };
  }
}

/**
 * Sets an image as the single primary image for a project.
 * Unsets any existing primary first, then sets the new primary.
 */
export async function setPrimaryImageAction(
  projectId: string,
  imageId: string
): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    if (!supabase) return { success: false, error: "Database unavailable." };

    // 1. Unset any current primary images for this project
    await supabase
      .from("project_images")
      .update({ is_primary: false })
      .eq("project_id", projectId)
      .eq("is_primary", true);

    // 2. Set the chosen image as primary
    const { error: setError } = await supabase
      .from("project_images")
      .update({ is_primary: true })
      .eq("id", imageId);

    if (setError) {
      return { success: false, error: setError.message };
    }

    revalidatePath("/");
    revalidatePath(`/admin/projects/${projectId}`);

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to set primary image.";
    return { success: false, error: msg };
  }
}

/**
 * Reorders project images based on an ordered array of image IDs.
 */
export async function reorderProjectImagesAction(
  projectId: string,
  orderedImageIds: string[]
): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    if (!supabase) return { success: false, error: "Database unavailable." };

    const updates = orderedImageIds.map((id, index) =>
      supabase
        .from("project_images")
        .update({ sort_order: index + 1 })
        .eq("id", id)
    );

    await Promise.all(updates);

    revalidatePath("/");
    revalidatePath(`/admin/projects/${projectId}`);

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to reorder images.";
    return { success: false, error: msg };
  }
}

/**
 * Updates accessibility metadata (alt text, caption) for an image.
 */
export async function updateProjectImageMetaAction(
  imageId: string,
  projectId: string,
  meta: { altText: string | null; caption?: string | null }
): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    if (!supabase) return { success: false, error: "Database unavailable." };

    const { error } = await supabase
      .from("project_images")
      .update({
        alt_text: meta.altText?.trim() || null,
        caption: meta.caption?.trim() || null,
      })
      .eq("id", imageId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/");
    revalidatePath(`/admin/projects/${projectId}`);

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update image metadata.";
    return { success: false, error: msg };
  }
}

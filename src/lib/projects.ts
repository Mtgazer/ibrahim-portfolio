import { EditorialProject, ProjectImage, ProjectLink } from "@/types";
import type {
  PresentationData,
  PresentationDataVisuals,
} from "@/types/database";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { DbProject, DbProjectImage, DbProjectLink } from "@/types/database";

/**
 * Data Access Layer for Portfolio Projects.
 *
 * Phase 7 flow: Admin → Supabase → Public site.
 *
 * src/data/projects.ts is now seed/reference data only and is NOT used
 * at runtime on the public site.  All project data — including editorial
 * presentation metadata — comes from the `projects.presentation_data` JSONB
 * column in Supabase.
 *
 * Visual rendering precedence (enforced in mapDbProjectToEditorialProject):
 *   1. DB project_images rows   → Supabase Storage public URLs
 *   2. presentation_data.visuals → public/ fallback paths (seeded locally)
 *
 * If all uploaded Storage images are later deleted the site falls back to
 * the paths in presentation_data.visuals, which render if the files exist
 * under public/images/projects/.
 */

type DbProjectWithRelations = DbProject & {
  project_images?: DbProjectImage[] | null;
  project_links?: DbProjectLink[] | null;
};

/**
 * Builds the resolved visuals object for an EditorialProject.
 *
 * Explicit precedence:
 *   1. DB project_images (Supabase Storage) — primary image drives `main`,
 *      remaining sorted images fill secondary slots.
 *   2. presentation_data.visuals fallback.
 *
 * If no Storage images exist AND no presentation_data.visuals are stored,
 * an empty object is returned; the UI renders without images.
 */
function resolveVisuals(
  images: ProjectImage[],
  pd: PresentationData | null,
  mediaLayout: PresentationData["mediaLayout"]
): PresentationDataVisuals {
  const fallback: PresentationDataVisuals = pd?.visuals ?? {};

  // No DB images → use fallback entirely.
  if (images.length === 0) {
    return fallback;
  }

  const sorted = images.slice().sort((a, b) => a.sortOrder - b.sortOrder);
  const primaryImg = sorted.find((img) => img.isPrimary) ?? sorted[0];
  const primarySrc = primaryImg.publicUrl ?? primaryImg.storagePath;
  const remaining = sorted.filter((img) => img.id !== primaryImg.id);

  // For screen-trio layout map DB images to the screens array.
  if (mediaLayout === "screen-trio") {
    const screenImgs = [primaryImg, ...remaining].slice(0, 3);
    return {
      screens: screenImgs.map((img, idx) => ({
        src: img.publicUrl ?? img.storagePath,
        caption: img.caption ?? fallback.screens?.[idx]?.caption,
        isHighlighted: idx === 1,
      })),
    };
  }

  // For banner-with-grid / split-panel: primary → main, remaining → secondary.
  const resolved: PresentationDataVisuals = {
    main: primarySrc,
    mainCaption: primaryImg.caption ?? fallback.mainCaption,
    mainBadge: fallback.mainBadge,
    secondaryLeft: remaining[0]
      ? {
          src: remaining[0].publicUrl ?? remaining[0].storagePath,
          caption: remaining[0].caption ?? fallback.secondaryLeft?.caption,
        }
      : fallback.secondaryLeft,
    secondaryRight: remaining[1]
      ? {
          src: remaining[1].publicUrl ?? remaining[1].storagePath,
          caption: remaining[1].caption ?? fallback.secondaryRight?.caption,
        }
      : fallback.secondaryRight,
  };

  return resolved;
}

/**
 * Maps a Supabase database row (with joined relations) to the domain
 * EditorialProject model.
 *
 * All presentation metadata is read from presentation_data JSONB.
 * The local projects.ts array is NOT consulted at runtime.
 */
function mapDbProjectToEditorialProject(
  dbProject: DbProjectWithRelations
): EditorialProject {
  const pd: PresentationData | null = dbProject.presentation_data ?? null;

  const images: ProjectImage[] = (dbProject.project_images || [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({
      id: img.id,
      projectId: img.project_id,
      storagePath: img.storage_path,
      publicUrl: img.public_url,
      altText: img.alt_text,
      caption: img.caption,
      sortOrder: img.sort_order,
      isPrimary: img.is_primary,
      createdAt: img.created_at,
    }));

  const links: ProjectLink[] = (dbProject.project_links || [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((l) => ({
      id: l.id,
      projectId: l.project_id,
      label: l.label,
      url: l.url,
      type: (l.type as ProjectLink["type"]) || undefined,
      microcopy: l.microcopy || undefined,
      sortOrder: l.sort_order,
    }));

  const mediaLayout: PresentationData["mediaLayout"] =
    pd?.mediaLayout ?? "banner-with-grid";

  const visuals = resolveVisuals(images, pd, mediaLayout);

  return {
    id: dbProject.id,
    slug: dbProject.slug,
    projectNumber:
      pd?.projectNumber ?? String(dbProject.sort_order).padStart(2, "0"),
    badge: pd?.badge,
    title: dbProject.title,
    subtitle: dbProject.subtitle,
    description: dbProject.description,
    category: dbProject.category,
    year: dbProject.year,
    role: dbProject.role,
    teamStructure: pd?.teamStructure,
    disciplineScope: pd?.disciplineScope,
    statusText: pd?.statusText,
    growthNote: pd?.growthNote,
    tools: dbProject.tools ?? [],
    tags: dbProject.tags ?? [],
    isPublished: dbProject.is_published,
    isFeatured: dbProject.is_featured,
    sortOrder: dbProject.sort_order,
    heroImageId: null,
    coverImageId: null,
    createdAt: dbProject.created_at,
    updatedAt: dbProject.updated_at,
    images,
    links,
    metrics: pd?.metrics,
    pillars: pd?.pillars,
    coreComponentSet: pd?.coreComponentSet,
    ctaText: pd?.ctaText,
    ctaMicrocopy: pd?.ctaMicrocopy,
    layoutVariant: pd?.layoutVariant ?? "standard",
    mediaLayout,
    visuals,
  };
}

/**
 * Retrieves all published projects, sorted by `sort_order` ascending.
 * Connects to Supabase; returns an empty array if not configured or on error.
 *
 * NOTE: If Supabase is unconfigured the public site returns no projects
 * (no local fallback) because Phase 7 requires the live data contract.
 */
export async function getPublishedProjects(): Promise<EditorialProject[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("projects")
      .select("*, project_images(*), project_links(*)")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    if (error || !data) return [];

    return (data as DbProjectWithRelations[]).map(mapDbProjectToEditorialProject);
  } catch {
    return [];
  }
}

/**
 * Retrieves all published projects marked as featured.
 */
export async function getFeaturedProjects(): Promise<EditorialProject[]> {
  const published = await getPublishedProjects();
  return published.filter((project) => project.isFeatured);
}

/**
 * Retrieves a single project by its unique slug.
 */
export async function getProjectBySlug(
  slug: string
): Promise<EditorialProject | undefined> {
  const published = await getPublishedProjects();
  return published.find((project) => project.slug === slug);
}

/**
 * Retrieves the total count of published projects.
 */
export async function getProjectCount(): Promise<number> {
  const published = await getPublishedProjects();
  return published.length;
}

/**
 * Computes the year range string for published projects (e.g. "2023–2024").
 */
export async function getProjectIndexRange(): Promise<string> {
  const published = await getPublishedProjects();
  const years = published
    .map((p) => p.year)
    .filter((y): y is number => typeof y === "number");

  if (years.length === 0) return "2023–2024";

  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  return minYear === maxYear ? `${minYear}` : `${minYear}–${maxYear}`;
}

export type { DbProjectWithRelations };

/**
 * Admin: Retrieves all projects in the database (both published and drafts),
 * ordered by sort_order ascending.
 */
export async function getAllAdminProjects(): Promise<DbProjectWithRelations[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("projects")
      .select("*, project_images(*), project_links(*)")
      .order("sort_order", { ascending: true });

    if (error || !data) return [];
    return data as DbProjectWithRelations[];
  } catch {
    return [];
  }
}

/**
 * Admin: Retrieves a single project by its ID, with associated images and links.
 */
export async function getAdminProjectById(
  id: string
): Promise<DbProjectWithRelations | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("projects")
      .select("*, project_images(*), project_links(*)")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return data as DbProjectWithRelations;
  } catch {
    return null;
  }
}

/**
 * Admin: Retrieves dashboard aggregate statistics.
 */
export async function getAdminDashboardStats(): Promise<{
  total: number;
  published: number;
  drafts: number;
  featured: number;
}> {
  const allProjects = await getAllAdminProjects();

  const total = allProjects.length;
  const published = allProjects.filter((p) => p.is_published).length;
  const drafts = allProjects.filter((p) => !p.is_published).length;
  const featured = allProjects.filter((p) => p.is_featured).length;

  return { total, published, drafts, featured };
}

import { EditorialProject, ProjectImage, ProjectLink } from "@/types";
import { projectsData } from "@/data/projects";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { DbProject, DbProjectImage, DbProjectLink } from "@/types/database";

/**
 * Data Access Layer for Portfolio Projects.
 *
 * This layer abstracts data retrieval away from UI components.
 * It connects to Supabase when configured, mapping database rows
 * directly to the strongly typed domain model.
 * If Supabase is unconfigured or the query encounters an error / empty set,
 * it safely falls back to local data to guarantee uninterrupted UI rendering.
 */

type DbProjectWithRelations = DbProject & {
  project_images?: DbProjectImage[] | null;
  project_links?: DbProjectLink[] | null;
};

/**
 * Maps a Supabase database row and its relations to the domain EditorialProject model.
 */
function mapDbProjectToEditorialProject(
  dbProject: DbProjectWithRelations,
  fallbackProject?: EditorialProject
): EditorialProject {
  const images: ProjectImage[] = (dbProject.project_images || [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({
      id: img.id,
      projectId: img.project_id,
      storagePath: img.storage_path,
      altText: img.alt_text,
      sortOrder: img.sort_order,
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

  return {
    id: dbProject.id,
    slug: dbProject.slug,
    projectNumber:
      fallbackProject?.projectNumber ??
      String(dbProject.sort_order).padStart(2, "0"),
    badge: fallbackProject?.badge,
    title: dbProject.title,
    subtitle: dbProject.subtitle,
    description: dbProject.description,
    category: dbProject.category,
    year: dbProject.year,
    role: dbProject.role,
    teamStructure: fallbackProject?.teamStructure,
    disciplineScope: fallbackProject?.disciplineScope,
    statusText: fallbackProject?.statusText,
    growthNote: fallbackProject?.growthNote,
    tools: dbProject.tools ?? [],
    tags: dbProject.tags ?? [],
    isPublished: dbProject.is_published,
    isFeatured: dbProject.is_featured,
    sortOrder: dbProject.sort_order,
    heroImageId: fallbackProject?.heroImageId ?? null,
    coverImageId: fallbackProject?.coverImageId ?? null,
    createdAt: dbProject.created_at,
    updatedAt: dbProject.updated_at,
    images: images.length > 0 ? images : fallbackProject?.images,
    links: links.length > 0 ? links : fallbackProject?.links,
    metrics: fallbackProject?.metrics,
    pillars: fallbackProject?.pillars,
    coreComponentSet: fallbackProject?.coreComponentSet,
    ctaText: fallbackProject?.ctaText,
    ctaMicrocopy: fallbackProject?.ctaMicrocopy,
    layoutVariant: fallbackProject?.layoutVariant ?? "standard",
    mediaLayout: fallbackProject?.mediaLayout ?? "banner-with-grid",
    visuals: fallbackProject?.visuals ?? {
      main: images[0]?.storagePath,
    },
  };
}

/**
 * Returns local published projects as a safe fallback.
 */
function getLocalPublishedProjects(): EditorialProject[] {
  return [...projectsData]
    .filter((project) => project.isPublished)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Retrieves all published projects, sorted by `sortOrder` ascending.
 * Connects to Supabase if configured; falls back safely to local projects.
 */
export async function getPublishedProjects(): Promise<EditorialProject[]> {
  if (!isSupabaseConfigured()) {
    return getLocalPublishedProjects();
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      return getLocalPublishedProjects();
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*, project_images(*), project_links(*)")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return getLocalPublishedProjects();
    }

    const localMap = new Map(projectsData.map((p) => [p.slug, p]));

    return (data as DbProjectWithRelations[]).map((dbRow) => {
      const fallback = localMap.get(dbRow.slug);
      return mapDbProjectToEditorialProject(dbRow, fallback);
    });
  } catch {
    return getLocalPublishedProjects();
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

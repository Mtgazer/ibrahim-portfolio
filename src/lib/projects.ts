import { EditorialProject } from "@/types";
import { projectsData } from "@/data/projects";

/**
 * Data Access Layer for Portfolio Projects (Phase 3).
 *
 * This layer abstracts data retrieval away from UI components.
 * Currently reads from the strongly typed local data source.
 * In Phase 7, the internals of these functions can be replaced
 * with Supabase queries without requiring any changes to UI components.
 */

/**
 * Retrieves all published projects, sorted by `sortOrder` ascending.
 */
export async function getPublishedProjects(): Promise<EditorialProject[]> {
  return [...projectsData]
    .filter((project) => project.isPublished)
    .sort((a, b) => a.sortOrder - b.sortOrder);
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

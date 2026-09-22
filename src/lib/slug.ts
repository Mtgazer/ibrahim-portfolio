/**
 * Slug formatting and validation utilities.
 */

export function normalizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove non-alphanumeric except whitespace/hyphens
    .replace(/[\s_-]+/g, "-") // collapse spaces and underscores to single hyphen
    .replace(/^-+|-+$/g, ""); // trim leading and trailing hyphens
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

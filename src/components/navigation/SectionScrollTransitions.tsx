"use client";

/**
 * SectionScrollTransitions (Deprecated / No-op)
 * The global connected decorative golden scroll path has been removed per visual review.
 * Section indicators are now handled by standalone SectionMarker components reflecting active section state.
 */
export const MARKER_IDS = [
  "section-marker-projects",
  "section-marker-field-notes",
  "section-marker-about",
  "section-marker-contact",
] as const;

export default function SectionScrollTransitions() {
  return null;
}

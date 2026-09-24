-- ============================================================================
-- Ibrahim Khalil Portfolio — Phase 7 Database Migration
-- Adds presentation_data JSONB column to projects table.
--
-- This column stores editorial presentation metadata (layout, visuals,
-- metrics, pillars, etc.) that belongs to a project's display contract
-- but does not belong in normalised relational columns.
--
-- The public site reads ALL project presentation data from Supabase.
-- src/data/projects.ts is now seed/reference data only.
-- ============================================================================

alter table public.projects
  add column if not exists presentation_data jsonb;

comment on column public.projects.presentation_data is
  'JSONB blob holding editorial presentation metadata (PresentationData type). '
  'Contains layout, visuals fallback paths, metrics, pillars, coreComponentSet, '
  'growthNote, badge, teamStructure, disciplineScope, statusText, ctaText, '
  'ctaMicrocopy, and projectNumber. '
  'DB project_images / Storage images always take precedence over '
  'presentation_data.visuals for actual image rendering. '
  'If all uploaded Storage images are deleted the site falls back to the '
  'local public/ paths stored in presentation_data.visuals (if seeded), '
  'and those images will render if the files exist in public/images/projects/.';

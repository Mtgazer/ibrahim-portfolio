-- ============================================================================
-- Ibrahim Khalil Portfolio — Phase 6 Database Migration
-- Enforce at most one primary image per project using partial unique index
-- ============================================================================

create unique index if not exists idx_project_images_one_primary
  on public.project_images (project_id)
  where (is_primary = true);

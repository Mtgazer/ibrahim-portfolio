-- ============================================================================
-- Ibrahim Khalil Portfolio — Phase 10 Database Migration
-- Adds case_study_data JSONB column to projects table.
--
-- This column stores structured, optional project-detail / case-study content:
-- - overview: string
-- - problem: string
-- - solution: string
-- - features: text[]
-- - architecture: string
-- - challenges: string
-- - outcomes: string
--
-- All fields are optional. Existing records remain 100% compatible.
-- ============================================================================

alter table public.projects
  add column if not exists case_study_data jsonb;

comment on column public.projects.case_study_data is
  'Structured, optional project-detail / case-study content (CaseStudyData type). '
  'Contains overview, problem, solution, features, architecture, challenges, outcomes. '
  'All fields are optional and preserve backwards compatibility with legacy projects.';

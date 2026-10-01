-- ============================================================================
-- Ibrahim Khalil Portfolio — Phase 2 Field Notes Database Migration
-- Table: field_notes
-- Storage: field-note-images bucket
-- Security: Row Level Security (RLS) on field_notes and storage.objects
-- ============================================================================

-- 1. TABLE: field_notes
create table if not exists public.field_notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text,
  description text,
  category text,
  note_number text,
  note_date date,
  cover_image_path text,
  cover_image_url text,
  cover_alt_text text,
  tags text[] not null default '{}',
  external_link text,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Comments describing field_notes columns
comment on table public.field_notes is 'Lightweight professional workbench archives, micro-interactions, and design experiments.';
comment on column public.field_notes.slug is 'Optional URL slug; unique when present.';
comment on column public.field_notes.note_number is 'Optional technical note index (e.g. 01, 02). Fallbacks to sort_order if null.';
comment on column public.field_notes.note_date is 'Calendar date of the field note entry.';
comment on column public.field_notes.cover_image_path is 'Storage path in the field-note-images Supabase Storage bucket.';
comment on column public.field_notes.cover_image_url is 'Direct or fallback public URL for cover visual preview.';

-- 2. Trigger for field_notes.updated_at
-- Reuses existing public.handle_updated_at() defined in initial migration
drop trigger if exists set_field_notes_updated_at on public.field_notes;
create trigger set_field_notes_updated_at
  before update on public.field_notes
  for each row
  execute function public.handle_updated_at();

-- 3. Indexes for query performance and data integrity
create index if not exists idx_field_notes_is_published on public.field_notes(is_published);
create index if not exists idx_field_notes_is_featured on public.field_notes(is_featured);
create index if not exists idx_field_notes_sort_order on public.field_notes(sort_order);
create index if not exists idx_field_notes_note_date on public.field_notes(note_date);
create unique index if not exists idx_field_notes_slug on public.field_notes(slug) where slug is not null;

-- 4. Row Level Security (RLS)
alter table public.field_notes enable row level security;

-- Public read rule: Anonymous/public visitors can read only published field notes
drop policy if exists "Public can view published field notes" on public.field_notes;
create policy "Public can view published field notes"
  on public.field_notes for select
  to anon, authenticated
  using (is_published = true);

-- Admin rule: Authenticated admins identified by public.is_admin() have full CRUD access
drop policy if exists "Admins have full access to field notes" on public.field_notes;
create policy "Admins have full access to field notes"
  on public.field_notes for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 5. Storage Configuration: field-note-images bucket
insert into storage.buckets (id, name, public)
values ('field-note-images', 'field-note-images', true)
on conflict (id) do update set public = true;

-- Public can retrieve field note images (read-only)
drop policy if exists "Public can retrieve field note images" on storage.objects;
create policy "Public can retrieve field note images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'field-note-images');

-- Admins can upload field note images
drop policy if exists "Admins can upload field note images" on storage.objects;
create policy "Admins can upload field note images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'field-note-images'
    and public.is_admin()
  );

-- Admins can update field note images
drop policy if exists "Admins can update field note images" on storage.objects;
create policy "Admins can update field note images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'field-note-images'
    and public.is_admin()
  )
  with check (
    bucket_id = 'field-note-images'
    and public.is_admin()
  );

-- Admins can delete field note images
drop policy if exists "Admins can delete field note images" on storage.objects;
create policy "Admins can delete field note images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'field-note-images'
    and public.is_admin()
  );

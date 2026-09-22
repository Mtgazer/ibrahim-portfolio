-- ============================================================================
-- Ibrahim Khalil Portfolio — Phase 4 Database Migration
-- Tables: projects, project_images, project_links, admin_users
-- Storage: project-images bucket
-- Security: Row Level Security (RLS) on all tables and storage objects
-- ============================================================================

-- 1. Helper function for updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 2. TABLE: projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  description text,
  category text,
  year integer,
  role text,
  tools text[] not null default '{}',
  tags text[] not null default '{}',
  is_published boolean not null default false,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger for projects.updated_at
drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
  before update on public.projects
  for each row
  execute function public.handle_updated_at();

-- 3. TABLE: project_images
create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  storage_path text not null,
  public_url text,
  alt_text text,
  caption text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

-- 4. TABLE: project_links
create table if not exists public.project_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  label text not null,
  url text not null,
  type text check (type in ('case-study', 'demo', 'github', 'figma', 'external') or type is null),
  microcopy text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 5. TABLE: admin_users (allowlist of Supabase Auth user IDs)
create table if not exists public.admin_users (
  user_id uuid primary key,
  created_at timestamptz not null default now()
);

-- 6. Indexes for query performance
create index if not exists idx_projects_slug on public.projects(slug);
create index if not exists idx_projects_is_published on public.projects(is_published);
create index if not exists idx_projects_sort_order on public.projects(sort_order);
create index if not exists idx_project_images_project_id on public.project_images(project_id);
create index if not exists idx_project_images_sort_order on public.project_images(sort_order);
create index if not exists idx_project_links_project_id on public.project_links(project_id);
create index if not exists idx_project_links_sort_order on public.project_links(sort_order);
create index if not exists idx_admin_users_user_id on public.admin_users(user_id);

-- 7. Admin Authorization Helper Function (Security Definer)
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- 8. Enable Row Level Security (RLS) on all four tables
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.project_links enable row level security;
alter table public.admin_users enable row level security;

-- ----------------------------------------------------------------------------
-- RLS Policies: public.projects
-- ----------------------------------------------------------------------------
drop policy if exists "Public can view published projects" on public.projects;
create policy "Public can view published projects"
  on public.projects for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "Admins have full access to projects" on public.projects;
create policy "Admins have full access to projects"
  on public.projects for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- RLS Policies: public.project_images
-- ----------------------------------------------------------------------------
drop policy if exists "Public can view images of published projects" on public.project_images;
create policy "Public can view images of published projects"
  on public.project_images for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.projects
      where projects.id = project_images.project_id
        and projects.is_published = true
    )
  );

drop policy if exists "Admins have full access to project images" on public.project_images;
create policy "Admins have full access to project images"
  on public.project_images for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- RLS Policies: public.project_links
-- ----------------------------------------------------------------------------
drop policy if exists "Public can view links of published projects" on public.project_links;
create policy "Public can view links of published projects"
  on public.project_links for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.projects
      where projects.id = project_links.project_id
        and projects.is_published = true
    )
  );

drop policy if exists "Admins have full access to project links" on public.project_links;
create policy "Admins have full access to project links"
  on public.project_links for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- RLS Policies: public.admin_users
-- ----------------------------------------------------------------------------
drop policy if exists "Admins have full access to admin users" on public.admin_users;
create policy "Admins have full access to admin users"
  on public.admin_users for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- 9. Storage Configuration: project-images bucket
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do update set public = true;

-- Storage RLS on storage.objects
drop policy if exists "Public can retrieve project images" on storage.objects;
create policy "Public can retrieve project images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'project-images');

drop policy if exists "Admins can upload project images" on storage.objects;
create policy "Admins can upload project images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'project-images'
    and public.is_admin()
  );

drop policy if exists "Admins can update project images" on storage.objects;
create policy "Admins can update project images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'project-images'
    and public.is_admin()
  )
  with check (
    bucket_id = 'project-images'
    and public.is_admin()
  );

drop policy if exists "Admins can delete project images" on storage.objects;
create policy "Admins can delete project images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'project-images'
    and public.is_admin()
  );

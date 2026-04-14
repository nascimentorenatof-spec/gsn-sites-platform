create extension if not exists pgcrypto;

create table if not exists public.site_projects (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'preview' check (status in ('draft', 'preview', 'checkout_pending', 'paid', 'delivered', 'failed')),
  form_data jsonb not null,
  generated_content jsonb not null,
  preview_html text not null,
  assets jsonb not null default '[]'::jsonb,
  used_ai boolean not null default false,
  ai_log text,
  payment_provider text,
  payment_reference text,
  checkout_url text,
  domain text,
  customer_email text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site_projects_status_idx on public.site_projects(status);
create index if not exists site_projects_payment_reference_idx on public.site_projects(payment_reference);
create index if not exists site_projects_created_at_idx on public.site_projects(created_at desc);

alter table public.site_projects enable row level security;

drop policy if exists "Public can read previews by id" on public.site_projects;
create policy "Public can read previews by id"
on public.site_projects for select
using (status in ('preview', 'checkout_pending', 'paid', 'delivered'));

-- Inserts and updates are made only by serverless functions with SUPABASE_SERVICE_ROLE_KEY.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-assets',
  'site-assets',
  true,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read site assets" on storage.objects;
create policy "Public can read site assets"
on storage.objects for select
using (bucket_id = 'site-assets');

-- Uploads are made only by serverless functions with SUPABASE_SERVICE_ROLE_KEY.

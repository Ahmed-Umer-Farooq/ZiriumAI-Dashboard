-- Create interns table
create table if not exists public.interns (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  role text,
  start_date date,
  end_date date,
  status text default 'active',
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.interns enable row level security;

-- Create policy for interns: only authenticated users (admin dashboard) have full access
create policy "Admins have full access to interns"
  on public.interns
  to authenticated
  using (true)
  with check (true);

-- Create certificates table
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  intern_id uuid references public.interns(id) on delete cascade,
  certificate_code text unique not null,
  verification_token text unique not null,
  issued_at timestamptz default now(),
  issued_by text,
  pdf_url text,
  status text default 'valid',
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.certificates enable row level security;

-- Create policy for certificates: only authenticated users (admin dashboard) have full access
create policy "Admins have full access to certificates"
  on public.certificates
  to authenticated
  using (true)
  with check (true);

-- Create a secure RPC function for public verification (SECURITY DEFINER)
-- This allows anyone to verify a token without exposing the interns or certificates tables directly.
create or replace function public.verify_certificate(p_token text)
returns table (
  full_name text,
  role text,
  start_date date,
  end_date date,
  certificate_code text,
  issued_at timestamptz,
  status text,
  pdf_url text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select 
    i.full_name,
    i.role,
    i.start_date,
    i.end_date,
    c.certificate_code,
    c.issued_at,
    c.status,
    c.pdf_url
  from public.certificates c
  join public.interns i on c.intern_id = i.id
  where c.verification_token = p_token;
end;
$$;

-- Create the public storage bucket for certificates
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'certificates', 
  'certificates', 
  true, 
  null, -- no custom size limit
  array['application/pdf']::text[]
)
on conflict (id) do nothing;

-- RLS policies for storage.objects on the 'certificates' bucket

create policy "Allow authenticated upload of certificates"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'certificates');

create policy "Allow authenticated update of certificates"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'certificates')
  with check (bucket_id = 'certificates');

create policy "Allow authenticated delete of certificates"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'certificates');

create policy "Allow public read of certificates"
  on storage.objects
  for select
  to public
  using (bucket_id = 'certificates');


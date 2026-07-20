-- Create jobs table
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text,
  location text,
  type text,
  description text,
  is_active boolean default true,
  created_at timestamptz default now(),
  experience text,
  requirements text[],
  responsibilities text[],
  duration text
);

-- Enable Row Level Security (RLS)
alter table public.jobs enable row level security;

-- Create policies for jobs
create policy "Allow public select to jobs"
  on public.jobs
  for select
  to public
  using (true);

create policy "Allow authenticated insert to jobs"
  on public.jobs
  for insert
  to authenticated
  with check (true);

create policy "Allow authenticated update to jobs"
  on public.jobs
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Allow authenticated delete to jobs"
  on public.jobs
  for delete
  to authenticated
  using (true);

-- Create job_applications table
create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  role_id text not null,
  role_title text not null,
  name text not null,
  email text not null,
  phone text not null,
  linkedin_url text,
  portfolio_url text,
  resume_url text not null,
  message text,
  status text not null default 'pending',
  gender text,
  gender_role text,
  permanent_address text,
  university_name text,
  semester text,
  program_name text,
  notes text
);

-- Enable Row Level Security (RLS)
alter table public.job_applications enable row level security;

-- Create policies for job_applications
create policy "Allow public insert to job_applications"
  on public.job_applications
  for insert
  to public
  with check (true);

create policy "Allow authenticated select to job_applications"
  on public.job_applications
  for select
  to authenticated
  using (true);

create policy "Allow authenticated update to job_applications"
  on public.job_applications
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Allow authenticated delete to job_applications"
  on public.job_applications
  for delete
  to authenticated
  using (true);

-- Create the private storage bucket for resumes (job applications)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false, -- private bucket
  null,
  null
)
on conflict (id) do nothing;

-- RLS policies for storage.objects on the 'resumes' bucket
create policy "Allow anonymous upload to resumes bucket"
  on storage.objects
  for insert
  to public
  with check (bucket_id = 'resumes');

create policy "Allow authenticated read to resumes bucket"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'resumes');

create policy "Allow authenticated delete of resumes"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'resumes');

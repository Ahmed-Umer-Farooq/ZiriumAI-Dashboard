# Zirium AI Dashboard — Developer Setup & Handover Guide

This guide is designed for developers taking over the Zirium AI Dashboard codebase. It covers the local environment setup, configuration details, codebase structure, and a complete combined SQL script for database and storage setup on Supabase.

---

## Tech Stack Overview

- **Frontend Framework:** React 19 + TypeScript + Vite 8
- **Styling:** Vanilla CSS + Tailwind CSS v4
- **Routing:** React Router DOM v6
- **Database & Auth:** Supabase (Database, Storage, Auth)
- **PDF Generation:** `jspdf` (with canvas & JPEG optimization)
- **QR Code Generation:** `qrcode`

---

## Local Project Setup

### 1. Prerequisites
Ensure you have **Node.js (v18 or higher)** and **npm** installed.

### 2. Install Dependencies
Clone the repository and install the dependencies from the root directory:
```bash
npm install
```

### 3. Running Local Development Server
Start the local development server:
```bash
npm run dev
```
By default, the server will spin up on [http://localhost:5173](http://localhost:5173).

### 4. Building for Production
To build and optimize the code for production:
```bash
npm run build
```
The output files will be built into the `dist/` directory.

---

## Environment Variables Configuration

Create a `.env.local` file in the root directory (based on `.env.example`):

```ini
# Supabase Credentials
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Security & Pathing
VITE_ADMIN_PATH=your-secure-admin-subpath

# Site & App URLs
VITE_SITE_URL=https://your-public-site.com/
VITE_APP_URL=http://localhost:5173
```

### Variable Details:
- **`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`:** Your Supabase project URL and anonymous API key, found in your Supabase project settings under **Project Settings > API**.
- **`VITE_ADMIN_PATH`:** A custom string used as a path suffix to obscure the admin panel URL (e.g. if set to `zr-panel-x7k2`, the login route becomes `localhost:5173/zr-panel-x7k2`).
- **`VITE_SITE_URL`:** The absolute URL of your main production website.
- **`VITE_APP_URL`:** The base URL of the running dashboard application, used to construct the QR verification URL: `{VITE_APP_URL}/verify/{token}`.

---

##  Database & Storage Setup (Supabase)

If setting up a fresh Supabase instance, execute the following SQL script in the **Supabase SQL Editor**, or apply the migration files located in `supabase/migrations/`:

```sql
-- =========================================================================
-- 1. ENABLE EXTENSIONS
-- =========================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 2. CREATE TABLES
-- =========================================================================

-- Interns Table
CREATE TABLE IF NOT EXISTS public.interns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  role text,
  start_date date,
  end_date date,
  status text DEFAULT 'active',
  department text,
  university text,
  created_at timestamptz DEFAULT now()
);

-- Certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intern_id uuid REFERENCES public.interns(id) ON DELETE CASCADE,
  certificate_code text UNIQUE NOT NULL,
  verification_token text UNIQUE NOT NULL,
  issued_at timestamptz DEFAULT now(),
  issued_by text,
  pdf_url text,
  status text DEFAULT 'valid',
  created_at timestamptz DEFAULT now()
);

-- Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  department text,
  location text,
  type text,
  description text,
  is_active boolean DEFAULT true,
  experience text,
  requirements text[],
  responsibilities text[],
  duration text,
  created_at timestamptz DEFAULT now()
);

-- Job Applications Table
CREATE TABLE IF NOT EXISTS public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  role_id text NOT NULL,
  role_title text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  linkedin_url text,
  portfolio_url text,
  resume_url text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending',
  gender text,
  gender_role text,
  permanent_address text,
  university_name text,
  semester text,
  program_name text,
  notes text
);

-- =========================================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- =========================================================================
ALTER TABLE public.interns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 4. CREATE TABLE RLS POLICIES
-- =========================================================================

-- Interns Table Policies
CREATE POLICY "Admins have full access to interns"
  ON public.interns TO authenticated USING (true) WITH CHECK (true);

-- Certificates Table Policies
CREATE POLICY "Admins have full access to certificates"
  ON public.certificates TO authenticated USING (true) WITH CHECK (true);

-- Jobs Table Policies
CREATE POLICY "Allow public select to jobs"
  ON public.jobs FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated insert to jobs"
  ON public.jobs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update to jobs"
  ON public.jobs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete to jobs"
  ON public.jobs FOR DELETE TO authenticated USING (true);

-- Job Applications Table Policies
CREATE POLICY "Allow public insert to job_applications"
  ON public.job_applications FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow authenticated select to job_applications"
  ON public.job_applications FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated update to job_applications"
  ON public.job_applications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete to job_applications"
  ON public.job_applications FOR DELETE TO authenticated USING (true);

-- =========================================================================
-- 5. SECURE RPC FUNCTION FOR CERTIFICATE VERIFICATION
-- =========================================================================
-- This is a SECURITY DEFINER function to verify certificates publicly
-- without exposing direct select permissions on interns or certificates.
CREATE OR REPLACE FUNCTION public.verify_certificate(p_token text)
RETURNS TABLE (
  full_name text,
  role text,
  start_date date,
  end_date date,
  certificate_code text,
  issued_at timestamptz,
  status text,
  pdf_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.full_name,
    i.role,
    i.start_date,
    i.end_date,
    c.certificate_code,
    c.issued_at,
    c.status,
    c.pdf_url
  FROM public.certificates c
  JOIN public.interns i ON c.intern_id = i.id
  WHERE c.verification_token = p_token;
END;
$$;

-- =========================================================================
-- 6. STORAGE BUCKETS SETUP
-- =========================================================================

-- Create public 'certificates' bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('certificates', 'certificates', true, null, ARRAY['application/pdf']::text[])
ON CONFLICT (id) DO NOTHING;

-- Create private 'resumes' bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('resumes', 'resumes', false, null, null)
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 7. STORAGE BUCKETS RLS POLICIES
-- =========================================================================

-- Certificates Bucket Policies
CREATE POLICY "Allow authenticated upload of certificates"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'certificates');

CREATE POLICY "Allow authenticated update of certificates"
  ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'certificates') WITH CHECK (bucket_id = 'certificates');

CREATE POLICY "Allow authenticated delete of certificates"
  ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'certificates');

CREATE POLICY "Allow public read of certificates"
  ON storage.objects FOR SELECT TO public USING (bucket_id = 'certificates');

-- Resumes Bucket Policies
CREATE POLICY "Allow anonymous upload to resumes bucket"
  ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Allow authenticated read to resumes bucket"
  ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'resumes');

CREATE POLICY "Allow authenticated delete of resumes"
  ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'resumes');
```

---

## Security Architecture Details

1. **Table-Level Access Control:** Direct tables like `interns` and `certificates` have strict RLS policies only granting access to `authenticated` users (dashboard administrators).
2. **Secure Certificate Lookup:** Public clients look up and verify certificates via the RPC function `verify_certificate(p_token)`. Because it is designated `SECURITY DEFINER`, it executes with the database owner's privileges, but returns *only* the specific verification columns, ensuring that candidates' private information (such as email addresses) is never exposed.
3. **Resumes Storage:** Resumes are uploaded to a private bucket. While public applicants can upload their resume to it, only authenticated administrators can select or download files from it. URLs are generated dynamically as temporary signed links (`1 hour` expiry) via the API.

---

## Codebase Directory Layout

```
.
├── .agents/                 # AI Agent configs and customization rules
├── docs/                    # Architecture and verification specs
├── public/                  # Static assets (logos, template files)
├── src/
│   ├── App.tsx              # Routing and entry wrapper
│   ├── index.css            # Global CSS setup
│   ├── main.tsx             # React DOM entry point
│   ├── lib/
│   │   └── supabase.ts      # Supabase Client Initialization
│   └── admin/
│       ├── auth/            # Authenticated route components
│       ├── components/      # Admin UI layouts & sidebars
│       ├── hooks/           # Supabase data hooks (useJobs, useApplicants, useInterns)
│       ├── pages/           # Dashboard views (AdminDashboard, InternsList, etc.)
│       ├── types/           # TS Interfaces & schemas
│       └── utils/           # Certificate PDF & QR generation engine
└── supabase/
    └── migrations/          # Version-controlled DB schemas & migrations
```

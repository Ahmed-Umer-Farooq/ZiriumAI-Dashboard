# Intern Certificate Verification System — Implementation Guide

**Project:** Zirium AI — Admin Dashboard Certificate Module
**Stack:** Next.js + Supabase (already connected)
**Goal:** Admin generates intern certificates with a QR code. Anyone scanning the QR code can publicly verify the certificate is authentic, without exposing private data.

---

## 1. Overview

We are building 3 pieces:

1. **Interns table** — list of all interns (already registering, may need cleanup/import)
2. **Certificates table** — one record per issued certificate, with a unique secret verification token
3. **Public verification page** (`/verify/[token]`) — anyone who scans the QR lands here and sees a clean "Verified / Not Verified" result

The QR code does **not** contain certificate data. It only contains a link with a random secret token. The real data lives in Supabase and is only shown if the token matches a record.

---

## 2. Database Schema (Supabase)

### `interns` table

| Column       | Type        | Notes                                   |
|--------------|-------------|------------------------------------------|
| id           | uuid (PK)   | default `gen_random_uuid()`             |
| full_name    | text        | required                                |
| email        | text        | required                                |
| role         | text        | e.g. "Frontend Development Intern"      |
| start_date   | date        |                                          |
| end_date     | date        |                                          |
| status       | text        | `active` / `completed` / `terminated`   |
| created_at   | timestamptz | default `now()`                         |

```sql
create table interns (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  role text,
  start_date date,
  end_date date,
  status text default 'active',
  created_at timestamptz default now()
);
```

### `certificates` table

Keep this **separate** from `interns` — a certificate is an issued document, not an intern attribute. This lets us re-issue, revoke, or track history without touching intern records.

| Column              | Type        | Notes                                                       |
|---------------------|-------------|--------------------------------------------------------------|
| id                  | uuid (PK)   |                                                                |
| intern_id           | uuid (FK)   | references `interns(id)`                                     |
| certificate_code    | text        | human-readable, e.g. `ZIR-2026-0001` (shown on the PDF)      |
| verification_token  | text        | **long random string** — this is what the QR code encodes   |
| issued_at           | timestamptz | default `now()`                                              |
| issued_by           | text        | admin username/email who generated it                        |
| pdf_url             | text        | Supabase Storage URL of the generated certificate            |
| status              | text        | `valid` / `revoked`                                          |
| created_at          | timestamptz | default `now()`                                              |

```sql
create table certificates (
  id uuid primary key default gen_random_uuid(),
  intern_id uuid references interns(id),
  certificate_code text unique not null,
  verification_token text unique not null,
  issued_at timestamptz default now(),
  issued_by text,
  pdf_url text,
  status text default 'valid',
  created_at timestamptz default now()
);
```

**Critical rule:** `verification_token` must be a long random string (UUID or nanoid, 20+ characters). Never use sequential numbers or the certificate_code itself — otherwise someone could guess other interns' tokens by incrementing a number in the URL.

---

## 3. Row Level Security (RLS)

Both tables must have RLS **enabled**, with **no public access**:

- `interns` → only accessible by authenticated admin users (via Supabase Auth / your existing admin login).
- `certificates` → same — no direct public read access.

The public verification page must **never** query these tables directly with the anon key. Instead:

- Build a **server-side API route** (Next.js `/api/verify/[token]` or a Supabase Edge Function) using the **service role key** (server-only, never exposed to the browser).
- This route does the lookup and returns only the safe, minimal fields needed for verification (name, role, dates, status). It never returns email, intern_id, or internal record IDs.

This is the #1 security requirement of this feature. Do not skip it.

---

## 4. Admin Panel Flow

### A. Add / Import Interns
- Simple form or bulk import into `interns` table.
- Fields: full_name, email, role, start_date, end_date.
- Default status: `active`.

### B. Mark Intern as Completed
- Admin panel button: update `status` to `completed` once duration ends.

### C. Generate Certificate
When admin clicks "Generate Certificate" for a completed intern:

1. Generate a `verification_token` server-side (use `crypto.randomUUID()` or `nanoid(24)`).
2. Generate a `certificate_code` (sequential is fine here, it's just a display label, e.g. `ZIR-2026-0001`).
3. Build the QR code, encoding this URL:
   ```
   https://yourdomain.com/verify/{verification_token}
   ```
4. Generate the certificate PDF (use existing template), embedding:
   - Intern name, role, duration
   - The QR code image
   - The certificate_code (as human-readable text, in case QR fails)
5. Upload PDF to Supabase Storage → get `pdf_url`.
6. Insert one row into `certificates` with all the above.

### D. Revoke a Certificate (optional but recommended)
- Admin panel button: set `status = 'revoked'` on a certificate row. Verification page must then show "This certificate has been revoked" instead of the valid details.

---

## 5. Public Verification Page (`/verify/[token]`)

This is a **public route**, no login required.

**Logic:**
1. Extract `token` from the URL.
2. Call the server-side API route (not Supabase directly) with the token.
3. API route looks up `certificates` joined with `interns`, filtered by `verification_token = token`.
4. Return one of three states:

   - **Not found** → show: *"No certificate found with this code."* (Don't explain why — no hints for guessing.)
   - **Found, status = revoked** → show: *"This certificate has been revoked and is no longer valid."*
   - **Found, status = valid** → show the verification summary:
     - ✅ Verified Certificate
     - Full name
     - Role / Program title
     - Organization: Zirium AI
     - Duration (start_date → end_date)
     - Certificate ID (certificate_code)
     - Issued date

**What NOT to show, ever:** email, phone, intern_id, any other intern's data, internal notes.

**Nice to have (optional, add later):**
- Company logo + simple branding on the page
- "Download PDF" button (link to `pdf_url`)
- A basic rate limit on the API route (e.g. via middleware) to prevent scraping/brute-force token guessing

---

## 6. Suggested Build Order

1. ✅ Create `interns` + `certificates` tables in Supabase with RLS enabled (admin-only access).
2. ✅ Migrate/import existing interns into `interns` table.
3. Build admin UI: list interns, mark as completed.
4. Build "Generate Certificate" action: token generation, QR generation, PDF generation, Storage upload, insert into `certificates`.
5. Build the server-side verify API route (service role key, minimal safe fields only).
6. Build the public `/verify/[token]` page using that API route.
7. Test:
   - Valid token → shows correct details
   - Random/fake token → shows "not found", nothing else
   - Revoked token → shows "revoked" message
8. (Optional) Add revoke button, download PDF button, branding polish.

---

## 7. Libraries You'll Likely Need

- QR code generation: `qrcode` (npm package) — generates QR as image/base64, easy to embed in PDF.
- PDF generation: whatever you're already using for certificates (or `pdf-lib` / `puppeteer` if generating from an HTML template).
- Token generation: built-in `crypto.randomUUID()` (Node) or `nanoid` package.

---

## 8. Key Principle to Remember

> The QR code is just a locked door with a key printed on it. The key (token) means nothing without the database behind it. Keep the database locked down (RLS + service-role-only access), and the whole system stays secure — even if someone photographs or shares the QR code publicly.

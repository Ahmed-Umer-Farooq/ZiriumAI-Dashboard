# Zirium AI Dashboard

The Zirium AI Dashboard is an internal admin panel built for managing job postings, reviewing applications, managing interns, and generating verifiable internship certificates with secure QR-code verification.

## 🚀 Quick Start & Setup

For full installation guidelines, environment variable parameters, codebase architecture, and the complete copy-pasteable database SQL schema script for Supabase, please refer to:

👉 **[SETUP.md](./SETUP.md)**

## 📂 Core Modules

1. **Job Postings Manager:** Admins can create, edit, activate/deactivate, and delete jobs. Open jobs are readable by the public.
2. **Applicant Tracking System (ATS):** Admins can view and delete applicants, update application statuses, write notes, and download applicant resumes from secure private storage.
3. **Intern Management:** Admins can log new interns and track their status (`active`, `completed`).
4. **Verifiable Certificates:** Admins generate digital PDF certificates for completed interns. PDF files are compressed, stored in public Supabase storage, and embed a unique verification QR code pointing to `/verify/[token]`.

## 🔒 Security Summary

- All database tables use Row Level Security (RLS) to prevent unauthorized access.
- Resumes are stored in a private bucket accessible only through secure temporary signed links.
- Public certificate verification is query-safe and uses a secure PostgreSQL RPC function (`verify_certificate`) to retrieve only non-sensitive candidate fields, completely mitigating enumeration and SQL injection risks.
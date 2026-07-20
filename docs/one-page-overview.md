# Intern Certificate Verification — What We're Building (Simple Overview)

## The Idea
When an intern finishes their internship, we generate a certificate for them with a **QR code** printed on it. If anyone (an employer, college, anyone) scans that QR code, they should instantly see a page confirming: *"Yes, this person really was our intern"* — along with their name, role, and duration.

## How It Works (Plain English)

1. **We already have interns registered** — we'll organize their info (name, role, start date, end date) into a proper list in our database (Supabase).

2. **When an intern finishes**, admin marks them as "Completed" in the dashboard.

3. **Admin clicks "Generate Certificate"** for that intern. The system:
   - Creates a secret random code (like a fingerprint, unguessable)
   - Makes a QR code that contains a link with that secret code inside
   - Creates the certificate file (PDF) with their name, role, dates, and the QR code on it
   - Saves everything in the database

4. **Intern gets their certificate.**

5. **Anyone scans the QR code** → it opens a public webpage on our site → that page checks the database → if the secret code matches, it shows:
   - ✅ Verified — Name, Role, Duration, Certificate ID, Issued Date
   - If it doesn't match anything → "Not verified" — no other details shown

## Why It's Secure
- The secret code in the QR is long and random — nobody can guess someone else's certificate by trying different numbers.
- The public page can only ever show name + role + dates. It can never show emails, private info, or other interns' data.
- Only the admin dashboard (login-protected) can create or edit certificates. The public verification page can only **read**, never edit.

## What We Need to Build (in order)
1. Two tables in Supabase: one for interns, one for certificates (kept separate).
2. Admin dashboard screens: add interns, mark as completed, generate certificate.
3. QR code + PDF generation when a certificate is created.
4. A public page (`/verify/xxxx`) that shows the verification result.
5. Security lock-down: make sure the database tables aren't publicly readable — only a protected backend route can check tokens.

## One-Line Summary
**The QR code doesn't hold the certificate info itself — it just holds a secret key. Our website looks up that key in the database and shows the real details only if it matches. That's what makes it "verifiable."**

---
📄 See `certificate-verification-system.md` for the full technical implementation guide with database schema, security rules, and step-by-step build order.

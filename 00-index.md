# PrepAI — Spec Index

This spec is split into 16 files, numbered in the order you should build them. Work through one file per session — most are sized for a single 1–2 hour block, a few (like the design system and payments) may take two sessions.

**How to use this:** open one file, implement everything in its checklist, check the boxes, then move to the next numbered file. Don't skip ahead — later files assume earlier ones are done (e.g. payments assumes the database schema already exists).

---

## Build order

| # | File | What it produces | Est. sessions |
|---|---|---|---|
| 01 | `01-design-system.md` | Design tokens, fonts, motion rules — reference doc for every UI file after this | 1 |
| 02 | `02-project-setup.md` | Next.js project scaffold, folder structure, dependencies installed | 1 |
| 03 | `03-gemini-api.md` | Working question generation + mock interview AI functions | 1–2 |
| 04 | `04-database-schema.md` | Supabase tables, RLS policies | 1 |
| 05 | `05-auth-rate-limiting.md` | Login, daily free-tier limits, anonymous abuse prevention | 1 |
| 06 | `06-legal-pages.md` | Privacy, Terms, Refund Policy pages (needed before Razorpay KYC) | 1 |
| 07 | `07-payments-razorpay.md` | Recurring subscription billing, webhook handling | 2 |
| 08 | `08-dashboard-mock-interview-ui.md` | Saved sessions dashboard, mock interview chat UI | 2 |
| 09 | `09-ux-features.md` | Readiness score, streaks, bookmarks, countdown, precise model answers | 1–2 |
| 10 | `10-seo-sharing.md` | Open Graph tags, shareable readiness card | 1 |
| 11 | `11-security-observability.md` | Sentry, uptime monitoring, remaining hardening | 1 |
| 12 | `12-deploy-launch.md` | Live on Vercel with a custom domain, analytics wired in | 1 |
| 13 | `13-testing-checklist.md` | Full pre-launch QA pass | 1 |
| 14 | `14-post-launch-ideas.md` | Not for now — read after you've launched | — |
| 15 | `15-guest-landing-page.md` | High-converting guest user landing page specification & animation brief | 1–2 |

---

## Prerequisites (do these before file 01)

- [ ] Node.js 18+ installed
- [ ] GitHub account
- [ ] Google AI Studio account → generate a Gemini API key at https://aistudio.google.com/apikey
- [ ] Supabase account (free tier)
- [ ] Razorpay account — **start business/individual KYC now**, it takes 1–2 business days and you'll need it by file 07
- [ ] Vercel account (free tier)
- [ ] Domain name (can wait until file 12)

## Environment variables (add as you go — noted in each file when introduced)

```
GEMINI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_PLAN_ID=
RAZORPAY_WEBHOOK_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
SENTRY_DSN=
```

## Tech stack (reference — details in the relevant numbered file)

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + custom design tokens (file 01) |
| Motion | Framer Motion |
| Fonts | Fraunces, Inter, IBM Plex Mono |
| AI | Google Gemini API (`gemini-flash-latest` / `gemini-2.0-flash`) |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth |
| Payments | Razorpay Subscriptions |
| Hosting | Vercel |
| Error tracking | Sentry |

## Cost estimate at MVP scale

| Item | Cost |
|---|---|
| Gemini API (Flash + Pro combined) | ~$5–9/mo |
| Supabase | Free tier |
| Vercel | Free tier |
| Razorpay | 2% per transaction only |
| Sentry / UptimeRobot | Free tier |
| Domain | ~₹800/year |

**Total: under $10/month** to run, plus Razorpay's per-transaction cut.

---

Start with `01-design-system.md`.

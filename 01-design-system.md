# 01 — Design System

**Prerequisite:** none — this is your reference doc, no code written yet.
**Produces:** a design token system every later file's UI code will use.
**Next file:** `02-project-setup.md`

---

## Concept
Most interview-prep tools look like generic SaaS dashboards or, worse, a homework app. PrepAI's whole value is turning a wall of anxious, messy job-description text into clear, organized confidence. The design should **perform that transformation visually**, not just describe it.

**Signature element:** the hero is a live split view — a messy, dense job description on the left, mid-transformation into clean, color-tagged, organized question cards on the right, with a soft highlighter-style scan line sweeping left to right as the "parsing" happens. This is the one bold, memorable moment on the page. Everything else stays quiet and disciplined around it.

## Color tokens

| Token | Hex | Use |
|---|---|---|
| `ink` | `#1C2230` | Primary text, headlines |
| `paper` | `#F6F5F1` | Background — warm off-white, not stark white |
| `paper-raised` | `#FFFFFF` | Cards sitting above the paper background |
| `slate` | `#6B7280` | Secondary/body text |
| `focus` (accent) | `#4C5FD5` | Primary interactive accent — buttons, links, active states, the scan line |
| `highlight` | `#FFD166` | Literal "highlighter" accent — JD text mid-parse, category tags, small emphasis only |
| `mint` (success/ready) | `#2FAE85` | Readiness score, success states |
| `coral` (attention) | `#E8604C` | Errors, gaps in knowledge, red-flag callouts |

Map these into `tailwind.config.ts` under `theme.extend.colors` (do this in file 02) — use named tokens (`bg-paper`, `text-ink`, `text-focus`) everywhere, never raw Tailwind grays.

## Typography

| Role | Typeface | Notes |
|---|---|---|
| Display / headlines | **Fraunces** (variable, optical size + soft weight) | Warmth, editorial voice |
| Body / UI | **Inter** | Legible at small sizes, dense question cards |
| Data / tags / categories / code | **IBM Plex Mono** | Category tags, difficulty labels, code in questions |

Import via `next/font/google` — never blocking `<link>` tags.

## Layout principles
- **Hero:** split-view JD → questions transformation. On mobile, stack vertically, scan animation plays top-to-bottom.
- **Question cards:** generous whitespace, one question per card, category tag in Plex Mono top-left, difficulty as a small colored dot (not a badge).
- **No numbered-marker grids (01/02/03)** for marketing/feature sections — not a real sequence. Numbering *is* correct for the actual question list (Q1 of 20).
- **Corners:** `rounded-xl` (~12px) on cards, `rounded-md` on buttons/tags.
- **Shadows:** warm-toned, low-opacity — `shadow-[0_4px_24px_-8px_rgba(28,34,48,0.12)]`, not default Tailwind `shadow-lg`.

## Motion
- **Page load:** hero scan animation plays once (Framer Motion `useAnimation` + `IntersectionObserver`, doesn't replay on scroll).
- **Question generation:** skeleton-load cards in with an 80ms stagger, not a single spinner.
- **Micro-interactions:** buttons `whileTap={{ scale: 0.97 }}`, tags fade in color gently.
- **Respect `prefers-reduced-motion`** — disable scan/stagger, fade content in instantly instead.
- **Discipline:** motion lives in exactly these three places. No hover-lift-everything, no parallax.

## Voice & copy
- Write from the user's side: "Paste the job description," not "Submit JD input."
- Empty states are invitations: *"Paste a job description above and we'll show you exactly what to prepare for."*
- Errors are specific, non-apologetic: *"That job description looks too short to work with — try pasting the full posting."*
- Mock-interview feedback sounds like a senior engineer who wants you to succeed — direct, warm, never corporate.

## Quality floor (check before shipping any UI)
- [ ] Responsive down to 375px width
- [ ] Visible keyboard focus states on every interactive element
- [ ] `prefers-reduced-motion` respected everywhere motion is used
- [ ] Color contrast passes WCAG AA on `paper` and `paper-raised`
- [ ] Loading states for every async action

---

**Done with this file when:** you've read it once and have the token table open in a second tab/note to reference while building. Nothing to check off in code yet — file 02 puts these into `tailwind.config.ts`.

**Next:** `02-project-setup.md`

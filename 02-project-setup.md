# 02 — Project Setup

**Prerequisite:** `01-design-system.md` read.
**Produces:** a running Next.js project with the design tokens wired in.
**Next file:** `03-gemini-api.md`

---

## 1. Scaffold the project

```bash
npx create-next-app@latest prepai --typescript --tailwind --app
cd prepai
npm install @google/genai @supabase/supabase-js razorpay framer-motion
```

## 2. Folder structure to create

```
prepai/
├── app/
│   ├── page.tsx                 # Landing + main tool page
│   ├── api/
│   │   ├── generate/route.ts
│   │   ├── mock-interview/route.ts
│   │   ├── razorpay/
│   │   │   ├── create-subscription/route.ts
│   │   │   ├── verify/route.ts
│   │   │   └── webhook/route.ts
│   ├── dashboard/page.tsx
│   ├── pricing/page.tsx
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   ├── refund-policy/page.tsx
│   └── layout.tsx
├── lib/
│   ├── gemini.ts
│   ├── supabase.ts
│   └── razorpay.ts
├── components/
│   ├── JDInput.tsx
│   ├── QuestionCard.tsx
│   ├── PaywallModal.tsx
│   └── MockInterviewChat.tsx
├── middleware.ts
└── .env.local
```

Create the empty files/folders now — you'll fill them in as you move through later spec files. This gives you a map so nothing feels like it's coming out of nowhere.

## 3. Wire the design tokens into Tailwind

In `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1C2230",
        paper: "#F6F5F1",
        "paper-raised": "#FFFFFF",
        slate: "#6B7280",
        focus: "#4C5FD5",
        highlight: "#FFD166",
        mint: "#2FAE85",
        coral: "#E8604C",
      },
      fontFamily: {
        display: ["var(--font-fraunces)"],
        body: ["var(--font-inter)"],
        mono: ["var(--font-plex-mono)"],
      },
    },
  },
};
export default config;
```

## 4. Add fonts in `app/layout.tsx`

```typescript
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400","500"], variable: "--font-plex-mono" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${plexMono.variable}`}>
      <body className="bg-paper text-ink font-body">{children}</body>
    </html>
  );
}
```

## 5. `.env.local` — add these keys as placeholders now

```
GEMINI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

(Razorpay and Sentry keys get added in files 07 and 11.)

## 6. Run it

```bash
npm run dev
```

You should see a blank page styled with the `paper` background — that's your empty canvas.

---

## Checklist
- [ ] `npx create-next-app` ran successfully
- [ ] Folder structure created (empty files are fine for now)
- [ ] `tailwind.config.ts` has the named color tokens
- [ ] Fonts load in `layout.tsx` with no console errors
- [ ] `npm run dev` shows a `paper`-colored blank page at `localhost:3000`

**Next:** `03-gemini-api.md`

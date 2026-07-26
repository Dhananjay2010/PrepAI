# 10 — SEO & Social Sharing

**Prerequisite:** `09-ux-features.md` done (needs the readiness score to build the shareable card).
**Produces:** proper link previews and a shareable readiness card — your main organic growth loop.
**Next file:** `11-security-observability.md`

---

## Why this matters more than usual here
Your primary growth channel is organic sharing — Reddit posts, LinkedIn shares of the readiness card. If link previews look broken, that free distribution loop breaks with it before it even starts.

## 1. Open Graph metadata — `app/layout.tsx`

```typescript
export const metadata = {
  title: "PrepAI — Get Interview Questions From Any Job Description",
  description: "Paste a job description, get tailored interview questions with model answers in seconds.",
  openGraph: {
    title: "PrepAI — Interview Prep, Tailored to the Actual Job",
    description: "Paste a job description, get tailored interview questions instantly.",
    images: ["/og-default.png"],
  },
};
```

Test with a link preview debugger (e.g. Facebook's Sharing Debugger or LinkedIn's Post Inspector) before launch — previews can look fine locally and break in production due to caching or absolute-URL issues.

## 2. Dynamic OG image for the readiness card — using `@vercel/og`

```bash
npm install @vercel/og
```

```typescript
// app/api/og/route.tsx
import { ImageResponse } from "@vercel/og";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const score = searchParams.get("score") || "0";
  const role = searchParams.get("role") || "Software Engineer";

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#F6F5F1", padding: 60 }}>
        <p style={{ fontSize: 24, color: "#6B7280" }}>PrepAI Readiness Score</p>
        <p style={{ fontSize: 120, color: "#2FAE85", fontWeight: 600 }}>{score}</p>
        <p style={{ fontSize: 28, color: "#1C2230" }}>{role}</p>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

Generate the share URL as `/api/og?score=82&role=Backend%20Engineer` and use it as the `og:image` on a per-user shareable page (e.g. `/share/[sessionId]`), so when someone posts their score link on LinkedIn, the preview image renders their actual score.

## 3. Sitemap and robots.txt

Next.js App Router generates these automatically if you add:

```typescript
// app/sitemap.ts
export default function sitemap() {
  return [
    { url: "https://yourdomain.com", lastModified: new Date() },
    { url: "https://yourdomain.com/pricing", lastModified: new Date() },
  ];
}
```

```typescript
// app/robots.ts
export default function robots() {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: "https://yourdomain.com/sitemap.xml" };
}
```

---

## Checklist
- [ ] Landing page has a descriptive title and meta description (not just "PrepAI")
- [ ] Open Graph tags tested with a link preview debugger, image renders correctly
- [ ] Dynamic OG image endpoint returns a correctly rendered score card for a test URL
- [ ] `sitemap.ts` and `robots.ts` in place

**Next:** `11-security-observability.md`

# 12 — Deploy & Launch

**Prerequisite:** everything through `11-security-observability.md` done.
**Produces:** PrepAI live on a real URL with analytics running.
**Next file:** `13-testing-checklist.md`

---

## 1. Push to GitHub

```bash
git init
git add .
git commit -m "PrepAI MVP ready for deploy"
git remote add origin https://github.com/yourusername/prepai.git
git push -u origin main
```

## 2. Deploy to Vercel

- Import the GitHub repo at vercel.com
- Add **all** environment variables from your `.env.local` into Vercel's project settings (Environment Variables section) — this is the most common "works locally, broken in production" cause
- Deploy

## 3. Connect your custom domain
In Vercel: Project → Settings → Domains → add your domain, update DNS records at your registrar as instructed. Propagation can take up to 24-48 hours, so do this a day or two before your planned public launch.

## 4. Update production URLs
Once your domain is live, update:
- `NEXTAUTH_URL` in Vercel env vars
- Razorpay webhook URL (from file 07) to point to the production domain, not `localhost`
- Google OAuth redirect URI (from file 05) to include the production domain
- `sitemap.ts` / `robots.ts` (from file 10) URLs

## 5. Analytics

```bash
npm install @vercel/analytics posthog-js
```

```typescript
// app/layout.tsx
import { Analytics } from "@vercel/analytics/react";
// add <Analytics /> inside the <body>
```

For PostHog, follow their Next.js quickstart at posthog.com/docs — free tier is generous enough for MVP-scale traffic.

## 6. UptimeRobot monitor
Add the monitor now that you have a real production URL (mentioned in file 11) — do this today, not after launch.

---

## Checklist
- [ ] Repo pushed to GitHub
- [ ] Deployed successfully on Vercel with zero build errors
- [ ] All environment variables present in Vercel (not just `.env.local`)
- [ ] Custom domain connected and resolving
- [ ] Razorpay webhook, Google OAuth redirect, and sitemap URLs updated to production domain
- [ ] Vercel Analytics + PostHog both firing (check their dashboards after a test visit)
- [ ] UptimeRobot monitor active

**Next:** `13-testing-checklist.md`

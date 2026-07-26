# 05 — Auth & Rate Limiting

**Prerequisite:** `04-database-schema.md` done.
**Produces:** Google/email login modal, Sign Out control, per-account daily free limit, and anonymous abuse prevention.
**Next file:** `06-legal-pages.md`

---

## 1. Supabase Auth setup & Login Modal

In Supabase Dashboard: **Authentication → Providers** → enable **Google** and **Email**. For Google OAuth, configure Authorized redirect URI: `https://<your-project>.supabase.co/auth/v1/callback`.

Integrated login modal (`components/LoginButton.tsx`):
- Supports **Google OAuth** (`signInWithOAuth`).
- Supports **Email Magic Link** (`signInWithOtp`) fallback.

Header user session & sign out control (`components/UserNav.tsx`):
```typescript
import { supabase } from "@/lib/supabase";

export function UserNav({ user, profile, onOpenPaywall }) {
  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="flex items-center space-x-3">
      <Link href="/dashboard">Dashboard</Link>
      <div className="text-xs font-mono">{user.email}</div>
      <button onClick={handleSignOut}>Sign out</button>
    </div>
  );
}
```

On first login, `ensureUserProfile(userId)` automatically creates/upserts a row into `profiles`.

## 2. Per-account daily free-tier limit — `lib/supabase.ts`

- `getUserPlan(userId)`: Returns `'free'` or `'paid'`.
- `checkAndIncrementFreeUsage(userId)`: Enforces 1 free generation per day for Free users, resetting daily.

Wired into `app/api/generate/route.ts` — server-side session saving and streak updates run automatically.

## 3. Anonymous / IP-based rate limiting — `middleware.ts`

Prevents anonymous abuse by limiting requests per IP window.

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 d"),
});

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/api/generate") {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: "Too many requests — try again tomorrow" }, { status: 429 });
    }
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/generate" };
```

---

## Checklist
- [x] Google + Email Magic Link login working in `LoginButton.tsx`
- [x] `UserNav.tsx` header component with Sign Out button created
- [x] New user gets a `profiles` row created automatically via `ensureUserProfile`
- [x] `checkAndIncrementFreeUsage` wired into `/api/generate`
- [x] `middleware.ts` rate limiting active
- [x] Confirmed `SUPABASE_SERVICE_ROLE_KEY` is never used in a `"use client"` file

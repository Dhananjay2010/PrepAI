# 11 — Security & Observability Hardening

**Prerequisite:** everything through `10-seo-sharing.md` done. This is your pre-launch hardening pass.
**Produces:** error tracking, uptime monitoring, and a final security review before going live.
**Next file:** `12-deploy-launch.md`

---

## Security review (most of this was built incrementally — this is the checklist to confirm it's actually in place)

- [ ] Prompt injection guard (`<job_description>` tag wrapping) — confirmed in `lib/gemini.ts` from file 03
- [ ] IP-based rate limiting — confirmed in `middleware.ts` from file 05
- [ ] Per-account daily limit — confirmed in file 05
- [ ] `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` — grep your codebase to confirm none of these appear in any `"use client"` file or ever get sent to the browser
- [ ] Webhook signature verification — confirmed in file 07
- [ ] Set a spending cap on your Gemini API key in Google AI Studio / Cloud Console — a bug or abuse spike shouldn't produce a surprise bill

```bash
# quick grep check before deploying
grep -rn "GEMINI_API_KEY\|SERVICE_ROLE_KEY\|RAZORPAY_KEY_SECRET" app/ components/ --include="*.tsx" | grep "use client" -B5
```

## 1. Sentry setup

```bash
npx @sentry/wizard@latest -i nextjs
```

Follow the wizard — it wires Sentry into both frontend and API routes automatically and adds `SENTRY_DSN` to your env. Test it fires correctly:

```typescript
// temporary test route, delete after confirming
export async function GET() {
  throw new Error("Sentry test error — delete this route after confirming it appears in Sentry dashboard");
}
```

## 2. Structured logging for Gemini calls

In `lib/gemini.ts`, wrap calls to log latency and outcome — cheap to add now, invaluable when you're debugging a cost spike or quality regression later:

```typescript
const start = Date.now();
try {
  const response = await ai.models.generateContent({ /* ... */ });
  console.log(JSON.stringify({ event: "gemini_call", model: "gemini-2.5-flash", latency_ms: Date.now() - start, status: "success" }));
  return response;
} catch (err) {
  console.log(JSON.stringify({ event: "gemini_call", model: "gemini-2.5-flash", latency_ms: Date.now() - start, status: "error" }));
  throw err;
}
```

## 3. Uptime monitoring

Sign up at UptimeRobot (free tier), add a monitor pinging your production URL every 5 minutes once file 12 is deployed. Set an alert to your email.

## 4. Alerting
At minimum, wire up email or a free Slack webhook alert for:
- Gemini API failure rate spike (via Sentry alert rules)
- Razorpay webhook signature failures (log these explicitly in file 07's webhook route, alert if any occur — a legitimate webhook should never fail signature check)
- General 500 error rate spike (Sentry alert rules)

---

## Checklist
- [ ] Security review list above fully checked
- [ ] Sentry capturing a deliberate test error in both frontend and an API route
- [ ] Gemini calls logging latency/status
- [ ] UptimeRobot monitor active (can be added right after file 12's deploy)
- [ ] At least one alert channel (email/Slack) configured

**Next:** `12-deploy-launch.md`

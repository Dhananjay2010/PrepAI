# 11 — Security & Observability Hardening

**Prerequisite:** everything through `10-seo-sharing.md` done. This is your pre-launch hardening pass.
**Produces:** error tracking, uptime monitoring, and a final security review before going live.
**Next file:** `12-deploy-launch.md`

---

## Security review (most of this was built incrementally — this is the checklist to confirm it's actually in place)

- [x] Prompt injection guard (`<job_description>` tag wrapping) — confirmed in `lib/gemini.ts`
- [x] IP-based rate limiting — confirmed in `middleware.ts`
- [x] Per-account daily limit — confirmed in `lib/supabase.ts`
- [x] `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` — verified 0 client leaks via grep audit
- [x] Webhook signature verification — confirmed in `app/api/razorpay/webhook/route.ts`

```bash
# quick grep check before deploying
grep -rn "GEMINI_API_KEY\|SUPABASE_SERVICE_ROLE_KEY\|RAZORPAY_KEY_SECRET" prepai/components/ prepai/app/ --include="*.tsx" --include="*.ts"
```

## 1. Structured logging for Gemini calls

In `lib/gemini.ts`, all calls log latency, model alias, and execution outcome in structured JSON:

```typescript
const start = Date.now();
try {
  const response = await ai.models.generateContent({ /* ... */ });
  console.log(JSON.stringify({ event: "gemini_call", function: "generateQuestions", model: "gemini-flash-latest", latency_ms: Date.now() - start, status: "success" }));
  return response;
} catch (err) {
  console.error(JSON.stringify({ event: "gemini_call", function: "generateQuestions", latency_ms: Date.now() - start, status: "error", error: err?.message }));
  throw err;
}
```

## 2. Uptime monitoring
Add a monitor at UptimeRobot (free tier) pinging your production URL every 5 minutes once `12-deploy-launch.md` is complete.

---

## Checklist
- [x] Security review list above fully checked
- [x] Gemini calls logging structured latency/status
- [ ] UptimeRobot monitor active (right after file 12 deploy)

**Next:** `12-deploy-launch.md`

# 07 — Payments (Razorpay Subscriptions)

**Prerequisite:** `04-database-schema.md` and `06-legal-pages.md` done. Razorpay KYC submitted (ideally approved).
**Produces:** working recurring monthly billing with webhook-driven plan upgrades/downgrades.
**Next file:** `08-dashboard-mock-interview-ui.md`

---

## Important: use Subscriptions, not one-time Orders
A "₹299/month" plan needs to actually **recur**. Razorpay's one-time Orders API only charges once, ever — it will never bill again. This file uses the **Subscriptions API** instead, with a webhook handling renewals, failures, and cancellations server-side.

## 1. Create the recurring plan (one-time setup)

```typescript
// run once, e.g. in a setup script or directly via Razorpay dashboard
const plan = await razorpay.plans.create({
  period: "monthly",
  interval: 1,
  item: { name: "PrepAI Pro", amount: 29900, currency: "INR" },
});
// Save plan.id into RAZORPAY_PLAN_ID in .env.local
```

## 2. `lib/razorpay.ts`

```typescript
import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
```

## 3. Create subscription — `app/api/razorpay/create-subscription/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  const { userId } = await req.json();

  const subscription = await razorpay.subscriptions.create({
    plan_id: process.env.RAZORPAY_PLAN_ID!,
    customer_notify: 1,
    total_count: 120, // effectively "until cancelled"
    notes: { userId },
  });

  return NextResponse.json(subscription);
}
```

## 4. Webhook — `app/api/razorpay/webhook/route.ts`

This is the part a one-time-order integration skips, and the part that keeps billing actually correct over time.

```typescript
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature")!;

  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!).update(body).digest("hex");
  if (expected !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);
  const sub = event.payload?.subscription?.entity;
  const userId = sub?.notes?.userId;

  switch (event.event) {
    case "subscription.activated":
      await supabaseAdmin.from("profiles").update({ plan: "paid", subscription_status: "active", razorpay_subscription_id: sub.id }).eq("id", userId);
      break;
    case "subscription.charged":
      await supabaseAdmin.from("payments").insert({ user_id: userId, razorpay_subscription_id: sub.id, amount: 299, status: "success" });
      break;
    case "subscription.cancelled":
    case "subscription.completed":
      await supabaseAdmin.from("profiles").update({ plan: "free", subscription_status: "cancelled" }).eq("id", userId);
      break;
    case "subscription.pending":
      await supabaseAdmin.from("profiles").update({ subscription_status: "failed" }).eq("id", userId);
      break;
  }

  return NextResponse.json({ received: true });
}
```

Register this URL in the Razorpay dashboard (Settings → Webhooks) for `subscription.*` events, and set `RAZORPAY_WEBHOOK_SECRET` from the value Razorpay gives you there. Test with Razorpay's webhook test tool before going live.

## 5. Frontend checkout trigger — `components/PaywallModal.tsx`

```typescript
async function handleUpgrade(userId: string) {
  const res = await fetch("/api/razorpay/create-subscription", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
  const subscription = await res.json();

  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    subscription_id: subscription.id,
    name: "PrepAI",
    description: "Pro Plan — Monthly",
    handler: function () {
      window.location.href = "/dashboard?upgraded=true"; // webhook confirms the real upgrade, this is just UX
    },
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.open();
}
```

Add the checkout script to `app/layout.tsx`:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

## 6. Cancellation flow
Add a "Cancel subscription" button in account settings (build alongside the dashboard in file 08):

```typescript
await razorpay.subscriptions.cancel(subscriptionId);
```

Don't make users email you to cancel — friction here damages word-of-mouth and can increase Razorpay complaint flags on your account.

---

## Checklist
- [ ] Razorpay plan created, `RAZORPAY_PLAN_ID` in `.env.local`
- [ ] Subscription creation endpoint working — test in Razorpay test mode
- [ ] Webhook registered and signature verification passes on a test event
- [ ] Full flow tested: subscribe → webhook activates plan in Supabase → test charge succeeds → cancel → webhook downgrades plan
- [ ] Cancel button works from the UI, no email-to-cancel required

**Next:** `08-dashboard-mock-interview-ui.md`

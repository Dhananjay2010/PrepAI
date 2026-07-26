# 06 — Legal Pages

**Prerequisite:** none technically, but do this before file 07 — Razorpay requires these live during KYC review, which takes 1–2 days, so front-load it.
**Produces:** Privacy Policy, Terms of Service, Refund Policy pages, linked in your footer.
**Next file:** `07-payments-razorpay.md`

---

## Why this file exists before payments
Razorpay's business/individual KYC verification typically checks for a visible Privacy Policy, Terms of Service, and Refund/Cancellation Policy linked from your site — usually in the footer. Missing these is a common rejection reason. Since KYC review takes 1–2 business days, get this live now so it's not blocking you when you reach file 07.

## 1. Pages to create

- `app/privacy/page.tsx`
- `app/terms/page.tsx`
- `app/refund-policy/page.tsx`

You don't need a lawyer for an MVP — a template generator (Termly, or Razorpay's own guidance docs) is enough to start, but the content must be accurate about what PrepAI actually does. Specifically your Privacy Policy should mention:

- What data you collect (email, pasted job description text, payment info via Razorpay)
- That job description text is sent to Google's Gemini API for processing (a third-party subprocessor)
- How long data is retained, and that users can request deletion (ties to the retention note in file 04)
- That payments are processed by Razorpay, not stored directly by you

## 2. Decide your refund stance now

Pick one and state it consistently in both the Refund Policy page and your cancellation flow copy (built in file 07):

- **Option A (recommended for MVP):** No refunds for partial months; cancel anytime, and you won't be billed for the next cycle.
- **Option B:** Pro-rated refund on cancellation.

Whichever you pick, the policy page text and the actual cancellation behavior in your code must match — a mismatch here is both a legal risk and a support headache.

## 3. Add links to the footer

In your shared layout or a `Footer.tsx` component:

```tsx
<footer className="text-sm text-slate">
  <a href="/privacy">Privacy Policy</a> · <a href="/terms">Terms of Service</a> · <a href="/refund-policy">Refund Policy</a>
</footer>
```

---

## Checklist
- [ ] All three pages exist and are live (even on `localhost` — Razorpay reviewers will check your deployed URL, so this really only "counts" once file 12 is done, but write the content now)
- [ ] Footer links to all three, visible on every page
- [ ] Refund stance decided and written consistently
- [ ] Privacy Policy explicitly mentions Gemini as a data subprocessor for pasted JD text

**Next:** `07-payments-razorpay.md`

# 15 — Guest User Landing Page Specification (PM & CRO Optimized)

**Prerequisite:** `10-seo-sharing.md` completed.
**Produces:** a high-converting, animated guest landing experience for unauthenticated visitors.
**Next file:** `16-implementation-and-verification.md`

---

## 1. Executive Summary & Routing Logic

### Objective
Deliver a visually striking, highly interactive landing experience tailored specifically for **unauthenticated (guest) visitors**. The primary goal is conversion — persuading first-time guests to sign up for the free tier or subscribe to Pro before ever reaching the default app dashboard.

### User Context & Routing Architecture
- **Authentication Check**: Middleware and root layout inspect Supabase session token (`guest = true`).
- **Routing Rules**:
  * **Logged-in Users**: Automatically bypass guest landing page and route to `/dashboard` or full interactive app view.
  * **First-Time Guests**: Guided to the full interactive, animated Guest Landing Page experience.

---

## 2. PM & Conversion Rate Optimization (CRO) Elements

To overcome the **Sign-up Friction Wall**, the landing page integrates 5 high-converting PM elements:

1. **Interactive Demo Preview & Sample Unlock**: Allows guests to test sample roles (*Senior Backend*, *Staff Full Stack*, *DevOps Lead*) and preview generated questions and model answers, ending with a low-friction unlock callout.
2. **High-Trust Conversion Badges**:
   * `✓ No Credit Card Required`
   * `✓ 1 Free Session Every Day`
   * `🔒 100% Private & Confidential`
3. **Target Company Logos**: Social proof highlighting candidate preparation for *Google, Meta, Amazon, Microsoft, Uber, Stripe, Swiggy, Razorpay*.
4. **Candidate Accordion FAQ**: Resolves top objections regarding privacy, free tier limits, AI accuracy, and credit card requirements.
5. **Sticky Bottom Conversion Dock**: Persistent floating bar at bottom of viewport allowing 1-click Google Sign-in from anywhere on the page.

---

## 3. Tech & Animation Stack

| Layer | Library / Tool | Implementation Rationale |
|---|---|---|
| **Animation Framework** | **Framer Motion** | Component-level layout animations, staggered scroll reveals, floating micro-interactions, page transitions. |
| **Styling & Tokens** | **Tailwind CSS + Custom CSS Variables** | Paper `#F6F5F1`, Ink `#1C2230`, Focus `#4C5FD5`, Mint `#2FAE85`, Highlight `#F4D068`, Coral `#E05A47`. |
| **Icons & Micro-Graphics** | **Lucide Icons + SVG Motion Paths** | Clean vector iconography with subtle hover scale/glow animations. |
| **Accessibility & Performance** | `useReducedMotion()` from Framer Motion | Automatically disables complex particle/parallax effects when `prefers-reduced-motion: reduce` is enabled. |

---

## 4. Section Structure

1. **Navbar Header**: Brand logo, navigation links (`Benefits`, `Live Preview`, `Pricing`, `FAQ`), and `LoginButton`.
2. **Hero Section**: Value proposition headline, subheadline, primary CTAs (*"Try PrepAI Free →"* and *"View Plans & Pricing"*), and floating 3D-style scanner card with floating badges.
3. **Target Company Social Proof Bar**: Logos of target engineering companies.
4. **Metrics Bar**: 15,000+ Questions Generated • 88% Offer Rate • 4.9/5 Rating • 30 Sec Prep Time.
5. **Interactive Demo Showcase**: Role selector pills with sample question cards and model answer preview.
6. **Core Benefits Grid**: Job-Specific Accuracy, Zero Prep Fatigue, Spoken-Ready Model Answers, and Live AI Mock Practice.
7. **Verified Candidate Testimonials**: Outcomes from senior developers.
8. **Pricing Band**: Comparative cards highlighting **Free Starter** ($0) vs. **Pro Subscription** ($19/mo or ₹499/mo).
9. **FAQ Accordion**: Interactive questions addressing privacy, credit cards, and model quality.
10. **Final Conversion Banner & Sticky Bottom Bar**: Persistent 1-click Google Sign-in trigger.

---

## 5. Verification Checklist

- [x] Unauthenticated guests directed to Guest Landing Page on root route
- [x] Authenticated users bypass guest landing page directly to `/dashboard`
- [x] Hero motion visual renders floating badges & highlighter scan sweep cleanly
- [x] Target company social proof and candidate testimonials present
- [x] FAQ accordion resolves objections regarding privacy and credit cards
- [x] Sticky bottom conversion bar offers persistent 1-click sign in
- [x] Responsive design verified on Mobile, Tablet, and Desktop breakpoints

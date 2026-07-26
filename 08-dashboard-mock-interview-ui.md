# 08 — Dashboard & Mock Interview UI

**Prerequisite:** `03-gemini-api.md`, `05-auth-rate-limiting.md`, `07-payments-razorpay.md` done.
**Produces:** the paid-tier dashboard (saved sessions), session detail view (`/dashboard/[id]`), and the mock interview chat interface.
**Next file:** `09-ux-features.md`

---

## 1. Dashboard — `app/dashboard/page.tsx` & `/dashboard/[id]`

Lists saved sessions for logged-in users and provides navigation to session detail pages.

```tsx
import Link from "next/link";
import { UserNav } from "@/components/UserNav";

export default function Dashboard() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
      {/* Overview & Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="font-display text-3xl font-bold">Your Prep Dashboard</h1>
        <UserNav user={user} profile={profile} />
      </div>

      {/* Saved Sessions Grid */}
      <div className="space-y-3">
        {sessions?.map((s) => (
          <Link key={s.id} href={`/dashboard/${s.id}`} className="block bg-paper-raised rounded-xl p-5 border">
            <p className="font-display text-base font-semibold">{s.role_summary}</p>
            <p className="text-xs text-slate">{new Date(s.created_at).toLocaleDateString()}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

## 2. Session Detail View — `app/dashboard/[id]/page.tsx`

Displays full history of a saved prep session:
- **Past Job Description Input** (expandable drawer).
- **Role Summary & Seniority Level**.
- **All Saved Questions** with model answer outlines, bookmark stars, and `✨ Get Precise Answer from Gemini` button.
- **`➕ Get More Questions from Gemini`** button at the bottom for Pro tier question expansion.
- **"Practice Mock Interview"** trigger button.

## 3. Mock interview API — `app/api/mock-interview/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { mockInterviewTurn } from "@/lib/gemini";
import { getUserPlan } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { userId, roleSummary, currentQuestion, candidateAnswer } = await req.json();

  const plan = await getUserPlan(userId);
  if (plan !== "paid") {
    return NextResponse.json({ error: "Mock interview mode is a Pro feature" }, { status: 403 });
  }

  try {
    const result = await mockInterviewTurn(roleSummary, currentQuestion, candidateAnswer);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Mock interview error:", err);
    return NextResponse.json({ error: "Something went wrong, try again" }, { status: 500 });
  }
}
```

## 4. Mock interview chat UI — `components/MockInterviewChat.tsx`

Chat-style component, one question shown at a time, textarea for the answer, feedback rendered after each turn with score out of 10.

---

## Checklist
- [x] Dashboard lists saved sessions correctly for a logged-in user
- [x] Session detail page (`/dashboard/[id]`) renders full past JD text and saved questions
- [x] `➕ Get More Questions` button attached for Pro plan expansion
- [x] Free users see limited history, paid users see full history
- [x] Mock interview API route rejects non-paid users cleanly
- [x] Mock interview chat flow works end-to-end

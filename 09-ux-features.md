# 09 — UX Features (Readiness Score, Streaks, Bookmarks, Precise Model Answers, Question Expansion)

**Prerequisite:** `08-dashboard-mock-interview-ui.md` done.
**Produces:** retention & value-add features that make candidate prep high-impact and habit-forming.
**Next file:** `10-seo-sharing.md`

---

## 1. Readiness score — `lib/readiness.ts`

Computes a 0–100 preparedness score combining category breadth (up to 50 pts across Technical, System Design, Problem Solving, Behavioral, Domain Knowledge) and mock interview scores (up to 50 pts).

```typescript
export function computeReadinessScore(categoriesCovered: string[], mockScores: number[]) {
  const categoryWeight = Math.min(categoriesCovered.length / 5, 1) * 50;
  const avgMock = mockScores.length ? mockScores.reduce((a, b) => a + b, 0) / mockScores.length : 0;
  const performanceWeight = (avgMock / 10) * 50;
  return Math.round(categoryWeight + performanceWeight);
}
```

## 2. Practice streak — `lib/supabase.ts`

Tracks consecutive daily activity (`last_practice_date`, `current_streak`). Displays a 🔥 streak badge in the header navigation bar.

## 3. Bookmark questions

`bookmarks` table allows candidates to save key questions. Featured with star icon toggle (`★` / `☆`) on `QuestionCard.tsx`.

## 4. "Interview in X days" countdown

`interview_date` in `profiles` powers the target date countdown widget on the dashboard, adapting urgency warnings when $\le 3$ days remain. Saved via `/api/user/interview-date`.

## 5. Precise Model Answers — "Get Precise Answer from Gemini"

Adds a **`✨ Get Precise Answer from Gemini`** button to every `QuestionCard.tsx`:
- **Synthesizes**: 150–200 word concise model answer formatted for verbal delivery in interviews (Executive Summary, Key Talking Points, Sample Spoken Response).
- **Free Tier Limit**: 1 precise model answer allowed per signed-in user (`precise_answers_used` in `profiles`).
- **Pro Tier**: Unlimited precise answers.
- **Persistence & Caching**: Model answers are saved to `sessions.questions` and `bookmarks.question` JSON, as well as `precise_answers` table in Supabase.
- **Pure Local Toggle**: Once loaded, clicking the button toggles visibility locally without making any network requests or consuming quota.

## 6. Question Expansion — "Get More Questions from Gemini"

Adds a **`➕ Get More Questions from Gemini`** button at the bottom of question lists on Home (`/`) and Session Details (`/dashboard/[id]`):
- **Pro Tier Gated**: Generates 5 new non-duplicate targeted questions via `/api/generate/more`.
- **Session Persistence**: Appends new questions to session history in Supabase.
- **Free Tier**: Opens `PaywallModal` prompting user to upgrade.

---

## Checklist
- [x] Readiness score computes and displays on the dashboard
- [x] Practice streak increments correctly on consecutive days
- [x] Question bookmarking works with star toggle
- [x] Interview date countdown persists and updates
- [x] "Get Precise Answer from Gemini" implemented with 1-use free limit and JSON persistence
- [x] "Get More Questions from Gemini" implemented for Pro tier expansion

**Next:** `10-seo-sharing.md`

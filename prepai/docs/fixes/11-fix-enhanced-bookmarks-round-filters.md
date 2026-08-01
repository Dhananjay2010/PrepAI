# Fix Spec 11: Enhanced Bookmarks Vault with Round Filters

- **Issue Type:** FRICTION
- **Target File(s):** [app/dashboard/page.tsx](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/app/dashboard/page.tsx), [app/api/user/bookmarks/route.ts](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/app/api/user/bookmarks/route.ts)
- **Priority:** MEDIUM
- **Affected Route(s):** `/dashboard`

---

## 1. Current State & Root Cause Analysis

In [app/dashboard/page.tsx](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/app/dashboard/page.tsx), bookmarked questions are displayed in a single, un-filtered vertical list under **"Bookmarked Questions"**.

### Limitations & Pain Points:
1. When a candidate bookmarks 20+ questions across multiple sessions, finding specific **System Design** or **Behavioral** questions requires scrolling through the entire list.
2. Bookmarks do not show historical performance badges or saved Gemini answers unless manually expanded one by one.

---

## 2. Proposed Technical Architecture

```mermaid
graph TD
    A[Dashboard Bookmarks Vault] --> B[Filter Toolbar]
    B --> C[1. Round Category Filter Pills: All | Screening | LLD | HLD | Behavioral]
    B --> D[2. Text Search Query Input]
    
    C --> E[Filtered Bookmarked Question Cards]
    D --> E
    E --> F[Render Question Card + Round Badges + Saved Gemini Answer Indicators]
```

### Key Enhancements:
1. **Round Filter Pills:** Add filter controls for:
   - `All Bookmarks`
   - `Round 1: Screening`
   - `Round 2: Technical & LLD`
   - `Round 3: System Design`
   - `Round 4: Behavioral STAR`
2. **Instant Search Bar:** Filter bookmarked questions by keyword.
3. **Saved Status Indicator:** Show a green badge (`"✨ Gemini Model Answer Saved"`) on bookmarked cards that already have precise answers attached.

---

## 3. Step-by-Step Implementation Plan

### Step 3.1: Add Filter State to `app/dashboard/page.tsx`

```tsx
const [bookmarkRoundFilter, setBookmarkRoundFilter] = useState<string>("all");
const [bookmarkSearchQuery, setBookmarkSearchQuery] = useState<string>("");

const filteredBookmarks = bookmarks.filter((b) => {
  const q = b.question;
  const matchesSearch = !bookmarkSearchQuery || 
    q.question?.toLowerCase().includes(bookmarkSearchQuery.toLowerCase()) ||
    q.category?.toLowerCase().includes(bookmarkSearchQuery.toLowerCase());

  if (!matchesSearch) return false;
  if (bookmarkRoundFilter === "all") return true;
  
  const roundInfo = resolveQuestionRound(q);
  return roundInfo.round === bookmarkRoundFilter;
});
```

---

## 4. Regression Prevention & Safety Mitigation

- **Zero Breaking Changes:** Maintains full compatibility with existing bookmark data structure in Supabase `bookmarks` table.
- **Empty State UX:** If no bookmarks match the selected filter, display a helpful message: *"No System Design bookmarks found. Star questions during your sessions to save them here."*

---

## 5. Verification & Acceptance Criteria

1. **Filter Test:** Click *System Design* pill in Bookmarks section. Verify only HLD system design questions are displayed.
2. **Search Test:** Type "Redis" into search bar. Verify list filters instantly to questions containing "Redis".

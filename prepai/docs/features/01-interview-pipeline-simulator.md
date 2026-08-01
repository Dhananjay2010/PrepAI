# Feature Spec 01: Round-Wise Interview Pipeline Simulator

**Feature ID:** FEAT-01  
**Target Goal:** Group generated interview questions into 4 real-world corporate interview rounds (Recruiter Screen, Technical/LLD, System Design/HLD, Behavioral STAR).  
**Priority:** High (Phase 1)  

---

## 1. Overview & Business Value
Currently, PrepAI generates a flat list of interview questions. Real-world IT hiring processes evaluate candidates across specific interview rounds. Categorizing questions into round-based tabs gives candidates clarity on how to prepare for specific upcoming interview stages.

### Candidate User Story
> "As an IT professional, I want to see which questions belong to my Round 1 Recruiter Call vs. Round 3 System Design interview so I can focus my prep on the exact round scheduled for tomorrow."

---

## 2. Round Classification Breakdown

| Round | Name | Key Topics & Question Scope | Target Answer Output |
| :--- | :--- | :--- | :--- |
| **Round 1** | **Recruiter Screening & Fit** | Background pitch, salary alignment, high-level tech stack fit, career motivations. | 60-second elevator pitch, concise summaries. |
| **Round 2** | **Technical Screening & LLD** | Data structures, OOP patterns, code edge cases, SQL query tuning, bug fixing. | Code snippets, time/space complexity, unit test cases. |
| **Round 3** | **System Design & HLD** | Scalability (QPS), caching, database sharding, message queues, microservices resilience. | Architectural flowcharts, trade-off matrices. |
| **Round 4** | **Behavioral & Leadership** | P0 incident handling, conflict resolution, project post-mortems, STAR method alignment. | Situation $\rightarrow$ Task $\rightarrow$ Action $\rightarrow$ Result outline. |

---

## 3. Database Migration Script (`supabase/schema.sql`)

```sql
-- Migration 01: Add round classification to sessions and questions
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS interview_rounds JSONB;

-- Comment: interview_rounds JSON format:
-- {
--   "screening_count": 4,
--   "lld_count": 6,
--   "hld_count": 6,
--   "behavioral_count": 4
-- }
```

---

## 4. API Schema & Gemini Prompt Updates

### File to Modify: `lib/gemini.ts`

Update the JSON response schema in `generateQuestions()` prompt:

```typescript
export interface QuestionData {
  num: number;
  category: string;
  round: "screening" | "lld_coding" | "hld_system_design" | "behavioral";
  round_label: string; // e.g. "Round 1: Recruiter Screen"
  difficulty: "Easy" | "Medium" | "Hard";
  question: string;
  what_they_test: string;
  strong_answer_outline: string;
  red_flags: string;
}
```

#### System Prompt Addition to `lib/gemini.ts`:
```text
For every question generated, explicitly classify it into one of these 4 rounds:
- "screening": Recruiter phone call & high-level fit
- "lld_coding": Low-Level Design, OOP, Data Structures & Code optimization
- "hld_system_design": High-Level System Design, Scalability & Architecture
- "behavioral": STAR method behavioral & leadership experience questions
```

---

## 5. UI/UX Component Design

### File to Create: `components/InterviewPipelineTabs.tsx`

```tsx
"use client";

import React from "react";

export type RoundFilter = "all" | "screening" | "lld_coding" | "hld_system_design" | "behavioral";

interface Props {
  activeRound: RoundFilter;
  onSelectRound: (round: RoundFilter) => void;
  counts: Record<RoundFilter, number>;
}

export function InterviewPipelineTabs({ activeRound, onSelectRound, counts }: Props) {
  const tabs: { id: RoundFilter; label: string; icon: string }[] = [
    { id: "all", label: "All Questions", icon: "📋" },
    { id: "screening", label: "Round 1: Recruiter Fit", icon: "📞" },
    { id: "lld_coding", label: "Round 2: Technical & LLD", icon: "💻" },
    { id: "hld_system_design", label: "Round 3: System Design", icon: "🏗️" },
    { id: "behavioral", label: "Round 4: Behavioral STAR", icon: "🧠" },
  ];

  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate/10">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelectRound(tab.id)}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
            activeRound === tab.id
              ? "bg-focus text-white font-bold shadow-sm"
              : "bg-paper-raised text-slate hover:text-ink hover:bg-paper"
          }`}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
          <span className="bg-slate/20 px-1.5 py-0.5 rounded text-[10px]">
            {counts[tab.id] || 0}
          </span>
        </button>
      ))}
    </div>
  );
}
```

### File to Modify: `app/dashboard/[id]/page.tsx`
* Add tab filter state `activeRound`.
* Filter `session.questions` based on `activeRound` before rendering `<QuestionCard />`.

---

## 6. Verification & Checklist

- [ ] Run `supabase/schema.sql` migration script.
- [ ] Test `/api/generate` with sample JD and verify output questions contain valid `round` field.
- [ ] Confirm UI tab filtering works without page reload.
- [ ] Ensure backward compatibility for existing saved sessions without `round` field.

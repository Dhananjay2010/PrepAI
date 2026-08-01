# Feature Spec 07: Target Interview Countdown & Readiness Gauge

**Feature ID:** FEAT-07  
**Target Goal:** Provide a dynamic interview date countdown, 7-Day Blitz prep curriculum, and an AI "Interview Readiness Score" (0–100%) to drive daily usage and retention.  
**Priority:** High (Phase 1 - Core Retention Metric)  

---

## 1. Overview & Business Value
Without a tangible goal or deadline, candidates drop off after 1–2 sessions. Setting a target interview date creates urgency. The **7-Day Blitz Curriculum** gives candidates actionable daily micro-goals, while the **Readiness Gauge** gamifies progress toward an 85%+ readiness score before interview day.

### Candidate User Story
> "As an applicant with an Amazon Senior DevOps interview in 5 days, I want a daily step-by-step prep curriculum and a 0–100% readiness score so I know exactly what to do each day to feel fully prepared."

---

## 2. Readiness Metric Mathematical Formula

$$\text{Readiness Score} = (0.35 \times \text{Topic Mastery \%}) + (0.35 \times \text{Mock Score \%}) + (0.15 \times \text{SRS Flashcard Retention \%}) + (0.15 \times \text{Streak Metric})$$

* **Target Goal**: Reach $\ge 85\%$ before target interview date.

---

## 3. 7-Day Blitz Daily Curriculum Map

| Day | Focus Area | Actionable Daily Task |
| :--- | :--- | :--- |
| **Day 1** | **Foundations & Fit** | Practice Recruiter Elevator Pitch & review JD competency overview. |
| **Day 2** | **Low-Level Design (LLD)** | Review code snippets, OOP patterns, and edge-case handling. |
| **Day 3** | **System Design (HLD)** | Study architecture flowcharts & trade-off matrices for core tech stack. |
| **Day 4** | **Behavioral STAR Stories** | Write and practice 4 key Situation-Task-Action-Result stories. |
| **Day 5** | **AI Stress Mock Session** | Complete 15-minute voice grilling session with Skeptical Architect persona. |
| **Day 6** | **Weak Topic Remediation** | Complete 10-minute SRS flashcard deck on flagged weak areas. |
| **Day 7** | **Final Copilot Review** | Print PDF cheat sheet & run final 5-minute Copilot teleprompter dry run. |

---

## 4. UI/UX Component Specifications

### File to Create: `components/ReadinessGauge.tsx`

```tsx
"use client";

import React from "react";

interface Props {
  score: number; // 0 to 100
  interviewDate?: string;
  roleSummary?: string;
}

export function ReadinessGauge({ score, interviewDate, roleSummary }: Props) {
  const daysLeft = interviewDate
    ? Math.max(0, Math.ceil((new Date(interviewDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  const color = score >= 85 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444";

  return (
    <div className="bg-paper-raised rounded-2xl p-6 border border-slate/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="space-y-2 text-center sm:text-left">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs font-bold uppercase text-focus bg-focus/10 px-2 py-0.5 rounded">
            AI READINESS INDEX
          </span>
          {daysLeft !== null && (
            <span className="font-mono text-xs font-bold text-coral bg-coral/10 px-2 py-0.5 rounded">
              ⏳ {daysLeft} Days to Interview
            </span>
          )}
        </div>
        <h2 className="font-display text-xl font-bold text-ink leading-tight">
          {roleSummary ? `Target: ${roleSummary}` : "Interview Preparedness"}
        </h2>
        <p className="font-body text-xs text-slate">
          {score >= 85
            ? "Ready for high-stakes interviews! Keep reviewing daily flashcards."
            : "Complete daily 7-Day Blitz goals and mock sessions to reach 85%+ readiness."}
        </p>
      </div>

      {/* Circular Readiness Gauge */}
      <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-slate/10"
            strokeWidth="3.5"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            strokeWidth="3.5"
            strokeDasharray={`${score}, 100`}
            stroke={color}
            strokeLinecap="round"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="font-mono text-xl font-bold text-ink">{score}%</span>
          <span className="font-mono text-[9px] text-slate uppercase">READY</span>
        </div>
      </div>
    </div>
  );
}
```

---

## 5. Verification & Checklist

- [ ] Verify `interview_date` in profiles correctly calculates `daysLeft`.
- [ ] Confirm Readiness Gauge SVG renders dynamically based on candidate score.
- [ ] Test 7-Day Blitz task check-offs update candidate readiness score in real time.
- [ ] Integrate gauge widget into `app/dashboard/page.tsx` header.

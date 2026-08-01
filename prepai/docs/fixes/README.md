# PrepAI Technical Fix Specifications & Improvement Roadmap

This directory contains individual, detailed technical fix specifications for all 14 product improvements identified during the **Microsoft SDE 3 Candidate Experience Audit**. 

Each specification document provides:
- Root cause analysis with source code line references.
- Proposed technical architecture diagrams.
- Step-by-step implementation guide with code interfaces.
- Regression risk mitigation & fallback strategies.
- Concrete verification & acceptance criteria.

---

## 📌 Master Fix Specification Index

| # | Spec Document | Stage | Issue Type | Priority | Affected Files |
| :-: | :--- | :--- | :--- | :-: | :--- |
| **01** | [01-fix-pdf-jd-input-parsing.md](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/docs/fixes/01-fix-pdf-jd-input-parsing.md) | Setup | FRICTION | HIGH | `JDInput.tsx`, `app/api/generate/route.ts` |
| **02** | [02-fix-unified-resume-jd-onboarding.md](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/docs/fixes/02-fix-unified-resume-jd-onboarding.md) | Setup | GAP | **CRITICAL** | `JDInput.tsx`, `app/page.tsx`, `lib/gemini.ts` |
| **03** | [03-fix-real-sandboxed-code-execution.md](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/docs/fixes/03-fix-real-sandboxed-code-execution.md) | Core Loop | BROKEN | **CRITICAL** | `CodeSandboxWidget.tsx`, `lib/codeRunner.ts` |
| **04** | [04-fix-interactive-system-design-canvas.md](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/docs/fixes/04-fix-interactive-system-design-canvas.md) | Core Loop | GAP | HIGH | `SystemDesignDiagram.tsx` |
| **05** | [05-fix-spoken-voice-mock-interview-tts.md](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/docs/fixes/05-fix-spoken-voice-mock-interview-tts.md) | Core Loop | GAP | HIGH | `MockInterviewChat.tsx`, `hooks/useTextToSpeech.ts` |
| **06** | [06-fix-live-whiteboard-code-mock-interview.md](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/docs/fixes/06-fix-live-whiteboard-code-mock-interview.md) | Core Loop | GAP | HIGH | `MockInterviewChat.tsx` |
| **07** | [07-fix-seniority-company-tuned-questions.md](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/docs/fixes/07-fix-seniority-company-tuned-questions.md) | Core Loop | REVAMP | HIGH | `lib/gemini.ts`, `app/api/generate/route.ts` |
| **08** | [08-fix-performance-weighted-readiness-score.md](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/docs/fixes/08-fix-performance-weighted-readiness-score.md) | Feedback | BROKEN | **CRITICAL** | `lib/readiness.ts`, `ReadinessGauge.tsx` |
| **09** | [09-fix-sde3-evaluation-rubrics.md](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/docs/fixes/09-fix-sde3-evaluation-rubrics.md) | Feedback | GAP | HIGH | `lib/gemini.ts`, `app/api/mock-interview/route.ts` |
| **10** | [10-fix-persistent-editable-star-stories.md](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/docs/fixes/10-fix-persistent-editable-star-stories.md) | Feedback | FRICTION | MEDIUM | `ResumeGapVisualizer.tsx` |
| **11** | [11-fix-enhanced-bookmarks-round-filters.md](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/docs/fixes/11-fix-enhanced-bookmarks-round-filters.md) | Review | FRICTION | MEDIUM | `app/dashboard/page.tsx`, `QuestionCard.tsx` |
| **12** | [12-fix-comprehensive-pdf-cheat-sheet.md](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/docs/fixes/12-fix-comprehensive-pdf-cheat-sheet.md) | Review | GAP | HIGH | `CheatSheetPDFDocument.tsx` |
| **13** | [13-fix-dynamic-7day-blitz-curriculum.md](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/docs/fixes/13-fix-dynamic-7day-blitz-curriculum.md) | Secondary | REVAMP | MEDIUM | `CountdownCurriculumWidget.tsx` |
| **14** | [14-fix-interactive-ai-copilot-assistant.md](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/docs/fixes/14-fix-interactive-ai-copilot-assistant.md) | Secondary | GAP | HIGH | `CopilotModal.tsx`, `app/api/copilot/route.ts` |

---

## 🎯 Top 3 Critical Fix Priority Sprint

For immediate release impact, execute the following 3 specifications first:

1. **[03-fix-real-sandboxed-code-execution.md](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/docs/fixes/03-fix-real-sandboxed-code-execution.md)**
   - *Goal:* Replace fake 600ms timer with real sandboxed code evaluation.
2. **[08-fix-performance-weighted-readiness-score.md](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/docs/fixes/08-fix-performance-weighted-readiness-score.md)**
   - *Goal:* Refactor readiness gauge to weight candidate mock scores and question correctness.
3. **[05-fix-spoken-voice-mock-interview-tts.md](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/docs/fixes/05-fix-spoken-voice-mock-interview-tts.md)** & **[06-fix-live-whiteboard-code-mock-interview.md](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/docs/fixes/06-fix-live-whiteboard-code-mock-interview.md)**
   - *Goal:* Turn mock interviews into spoken audio conversations with an integrated code & diagram whiteboard.

---

## 🛡️ General Regression Mitigation Principles

When implementing these fixes:
1. **Never break existing database schemas:** Always use `ADD COLUMN IF NOT EXISTS` and maintain fallbacks for optional fields in Supabase queries.
2. **Preserve offline / dev fallback logic:** Keep fallback generators in [lib/gemini.ts](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/lib/gemini.ts) active if Gemini API or external network services encounter rate limits.
3. **Maintain client-side cache resilience:** Ensure state updates sync seamlessly with `localStorage` fallback caches (`prepai_saved_sessions`).

# Fix Spec 02: Unified Resume + JD Onboarding Flow

- **Issue Type:** GAP
- **Target File(s):** [app/page.tsx](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/app/page.tsx), [components/JDInput.tsx](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/components/JDInput.tsx), [app/api/generate/route.ts](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/app/api/generate/route.ts), [lib/gemini.ts](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/lib/gemini.ts)
- **Priority:** CRITICAL
- **Affected Route(s):** `/`, `/dashboard`

---

## 1. Current State & Root Cause Analysis

Currently, session creation on [app/page.tsx](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/app/page.tsx) ONLY asks for Job Description text. Candidate resume analysis is isolated inside a separate widget ([ResumeGapVisualizer.tsx](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/components/ResumeGapVisualizer.tsx)) that candidates must manually find inside an active session detail page later.

### Limitations & Pain Points:
1. **Generic Question Generation:** Because questions are generated purely from JD text, Gemini cannot tailor questions to the candidate's specific background, past project claims, or skill gaps.
2. **Missing Target Context:** Candidates cannot specify their **Target Company** (e.g., Microsoft, Google, AWS, Startup) or **Exact Target Seniority** (e.g., SDE 1, SDE 2, SDE 3 / Staff).
3. **Delayed Gap Identification:** Resume vs JD gap analysis happens after question generation rather than driving the initial curriculum structure.

---

## 2. Proposed Technical Architecture

```mermaid
graph TD
    A[Onboarding Form] --> B[Job Description Input]
    A --> C[Resume Upload / Paste - Optional]
    A --> D[Target Company Selector: Microsoft, Amazon, Meta, etc.]
    A --> E[Target Seniority Level: SDE 1, SDE 2, SDE 3 / Staff]
    
    B --> F[Unified Onboarding Payload]
    C --> F
    D --> F
    E --> F
    
    F --> G[/api/generate API]
    G --> H[Gemini Contextual Generator]
    H --> I[Resume-Aware Session: Questions + Skill Gap Matrix + Company Tailored Round Checklist]
```

### Key Enhancements:
1. **Target Meta Selector:** Add explicit dropdowns for:
   - **Target Company:** `Microsoft`, `Amazon`, `Google`, `Meta`, `Startups / Scaleups`, `Other Product Co`.
   - **Seniority Level:** `Junior (SDE 1)`, `Mid (SDE 2)`, `Senior (SDE 3 / Lead)`, `Staff / Principal`.
2. **Optional Resume Integration:** Allow uploading or pasting resume text directly into the onboarding card.
3. **Unified Gemini Generation:** Send both `jobDescription`, `resumeText`, `targetCompany`, and `targetSeniority` to `generateQuestions()`.

---

## 3. Step-by-Step Implementation Plan

### Step 3.1: Expand Onboarding Form (`components/JDInput.tsx`)
Update `JDInputProps` to pass structured setup configuration:

```typescript
export interface OnboardingSetupData {
  jobDescription: string;
  resumeText?: string;
  targetCompany?: string;
  targetSeniority?: "SDE 1" | "SDE 2" | "SDE 3" | "Staff / Principal";
  interviewDate?: string;
}

interface JDInputProps {
  onGenerate: (data: OnboardingSetupData) => void;
  loading: boolean;
  disabled?: boolean;
}
```

### Step 3.2: Update `generateQuestions` System Prompt in `lib/gemini.ts`
Modify the system prompt to accept and combine candidate resume + company context:

```typescript
const prompt = `You are PrepAI, preparing a candidate for a ${targetSeniority || "Senior"} position at ${targetCompany || "a top product company"}.

Job Description:
<job_description>${jobDescription}</job_description>

Candidate Resume (Optional):
<candidate_resume>${resumeText || "Not provided"}</candidate_resume>

Tasks:
1. Extract core tech stack & topics required by the JD.
2. If Candidate Resume is provided, compare candidate background vs JD to generate 3 resume-gap interview questions specifically probing weak or missing skills.
3. Align questions strictly to ${targetCompany || "tier-1 tech company"} interview round standards for ${targetSeniority}.`;
```

### Step 3.3: Database Schema Compatibility
Ensure the `sessions` table in Supabase stores `target_company`, `target_seniority`, and `resume_text` fields:
```sql
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS target_company TEXT DEFAULT 'General';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS target_seniority TEXT DEFAULT 'Senior';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS resume_text TEXT;
```

---

## 4. Regression Prevention & Fallback Strategy

- **Backward Compatibility:** If candidate leaves Resume blank or skips target company, `generateQuestions()` cleanly defaults to JD-only analysis using existing behavior.
- **Graceful DB Fallbacks:** If database column updates are pending in legacy environments, fall back to storing `target_company` inside JSON metadata `role_summary`.

---

## 5. Verification & Acceptance Criteria

1. **Setup Test:** Select "Microsoft", "SDE 3", paste JD and Resume text. Click *Generate Interview Questions*.
2. **Resume-Aware Output:** Verify questions include candidate-specific probe items (e.g. "You listed C# on your resume, but this Microsoft role requires Azure Service Bus. How will you bridge this gap?").
3. **Session Persistence:** Confirm `target_company` and `target_seniority` persist accurately to session dashboard.

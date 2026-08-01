# Fix Spec 06: Live Whiteboard & Split-Screen Code Editor in Mock Interview

- **Issue Type:** GAP
- **Target File(s):** [components/MockInterviewChat.tsx](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/components/MockInterviewChat.tsx)
- **Priority:** HIGH
- **Affected Route(s):** `/dashboard/[id]/mock`

---

## 1. Current State & Root Cause Analysis

In [MockInterviewChat.tsx](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/components/MockInterviewChat.tsx), the candidate interface only provides a single `<textarea>` for candidate verbal responses.

### Critical Gap & Impact:
- **Unrealistic Mock Setup:** In real technical screens for Microsoft SDE 3 (both LLD/Coding and System Design rounds), candidates spend 70% of the interview writing code or sketching architectural diagrams on a shared whiteboard *while* talking to the interviewer.
- **Inability to Test Technical Proof:** Candidates cannot paste or demonstrate code snippets or system diagrams alongside their verbal answer during mock evaluation turns.

---

## 2. Proposed Technical Architecture

```mermaid
graph TD
    A[Mock Interview Interface] --> B[Split View Workspace]
    B --> C[Left Panel: AI Interviewer Chat & Spoken Transcript]
    B --> D[Right Panel: Live Coding & Whiteboard Scratchpad]
    
    D --> E[Code Editor: C#, Java, Python, TS, Go]
    D --> F[Whiteboard / Architecture Notes Canvas]
    
    C --> G[Candidate Submits Verbal Answer + Code/Diagram Payload]
    E --> G
    F --> G
    G --> H[/api/mock-interview AI Evaluator]
```

### Key Features:
1. **Split-Screen Layout:** 
   - Left Side: AI Interviewer audio status, question prompt, verbal voice recorder, and conversation transcript.
   - Right Side: Tabbed Code Editor & Architecture Notes Scratchpad.
2. **Unified Evaluation Payload:** Include candidate's written code/diagram notes alongside verbal transcript in `/api/mock-interview` requests so Gemini evaluates both verbal communication *and* technical code correctness.

---

## 3. Step-by-Step Implementation Plan

### Step 3.1: Add Workspace Tabs to `MockInterviewChat.tsx`

```tsx
interface MockTurnPayload {
  userId: string;
  roleSummary: string;
  currentQuestion: string;
  candidateAnswer: string;
  candidateCode?: string;       // Written code snippet
  candidateArchitecture?: string; // Architecture notes
  persona: string;
}
```

### Step 3.2: Render Split-Screen Layout

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Left Panel: AI Interviewer & Voice Input */}
  <div className="space-y-4">
    {/* Question Header & Persona Status */}
    {/* Voice Input & Verbal Response Textarea */}
  </div>

  {/* Right Panel: Live Coding / Diagram Scratchpad */}
  <div className="bg-paper-raised rounded-xl p-4 border border-slate/10 space-y-3">
    <div className="flex items-center justify-between border-b border-slate/10 pb-2">
      <span className="font-mono text-xs font-bold text-focus uppercase">
        💻 Live Interview Scratchpad
      </span>
      <div className="flex space-x-1 font-mono text-[11px]">
        <button onClick={() => setScratchTab("code")} className={`px-2.5 py-1 rounded ${scratchTab === "code" ? "bg-focus text-white font-bold" : "text-slate"}`}>
          Code Editor
        </button>
        <button onClick={() => setScratchTab("notes")} className={`px-2.5 py-1 rounded ${scratchTab === "notes" ? "bg-focus text-white font-bold" : "text-slate"}`}>
          Architecture Notes
        </button>
      </div>
    </div>

    {scratchTab === "code" ? (
      <textarea
        value={candidateCode}
        onChange={(e) => setCandidateCode(e.target.value)}
        placeholder="// Write your C# / Java / Python solution here during the mock interview..."
        className="w-full bg-neutral-950 text-emerald-400 font-mono text-xs p-4 rounded-lg h-72 focus:outline-none"
      />
    ) : (
      <textarea
        value={candidateNotes}
        onChange={(e) => setCandidateNotes(e.target.value)}
        placeholder="Outline your System Design components (API Gateway -> Load Balancer -> Redis Cache -> DB Shards)..."
        className="w-full bg-paper font-mono text-xs p-4 rounded-lg border border-slate/20 h-72 focus:outline-none"
      />
    )}
  </div>
</div>
```

---

## 4. Regression Prevention & Safety Mitigation

- **Responsive Collapse:** On mobile or small screens, automatically stack left and right panels into vertical accordion tabs so small screens remain clean and usable.
- **Optional Code Submission:** Make code/notes optional. If candidate submits verbal-only answer, `candidateCode` cleanly defaults to null without API validation errors.

---

## 5. Verification & Acceptance Criteria

1. **Split-View Test:** Open mock interview page. Confirm AI Chat is rendered on the left and Live Scratchpad on the right.
2. **Joint Submission Test:** Write C# code in the right editor, speak verbal answer, click *Submit Answer*. Verify feedback card evaluates both spoken answer and written code logic.

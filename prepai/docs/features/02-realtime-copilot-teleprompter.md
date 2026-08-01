# Feature Spec 02: Real-Time Interview Copilot & Teleprompter Mode

**Feature ID:** FEAT-02  
**Target Goal:** Provide a live, high-contrast teleprompter overlay and quick-reference keyword deck for candidates during active virtual interviews (Zoom, Teams, Google Meet).  
**Priority:** High (Phase 1)  

---

## 1. Overview & Business Value
During phone screens and video interviews, candidates need quick access to key technical terms, framework names, trade-off notes, and STAR memory triggers without fumbling through dense notes. Copilot Mode turns session data into a sleek, scannable, dark-mode teleprompter HUD.

### Candidate User Story
> "As a candidate in a live Zoom interview, I want to open a compact, high-contrast reference window so I can quickly glance at architectural trade-offs and STAR story bullet points while speaking."

---

## 2. Key Capabilities

1. **High-Contrast Teleprompter HUD**: Full-screen or separate pop-out window with dark background, bold typography, and clean spacing.
2. **Fuzzy Search (`Cmd/Ctrl + K`)**: Instant search bar across all session questions, precise answers, and topic notes.
3. **Quick Trade-Off Matrix Cards**: Side-by-side cards summarizing key technologies (e.g., *Postgres vs Mongo*, *Kafka vs SQS*).
4. **Voice-Activated Assist (Experimental)**: Optional microphone listener using Web Speech API that auto-scrolls to relevant cards when interviewer mentions keywords.

---

## 3. UI/UX Component Design

### File to Create: `components/CopilotModal.tsx`

```tsx
"use client";

import React, { useState, useEffect } from "react";
import { QuestionData } from "./QuestionCard";

interface CopilotProps {
  isOpen: boolean;
  onClose: () => void;
  roleSummary: string;
  questions: QuestionData[];
}

export function CopilotModal({ isOpen, onClose, roleSummary, questions }: CopilotProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("copilot-search")?.focus();
      }
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filtered = questions.filter(
    (q) =>
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.strong_answer_outline.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentQ = filtered[selectedIdx] || filtered[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/95 text-white p-6 font-mono overflow-hidden flex flex-col space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-white/20 pb-4">
        <div className="flex items-center space-x-3">
          <span className="bg-emerald-500 text-black px-2 py-0.5 text-xs font-bold rounded uppercase">
            LIVE COPILOT HUD
          </span>
          <h2 className="text-lg font-bold text-white">{roleSummary}</h2>
        </div>
        <div className="flex items-center space-x-3 text-xs text-neutral-400">
          <span>Shortcut: <kbd className="bg-neutral-800 px-1.5 py-0.5 rounded">Cmd + K</kbd></span>
          <button onClick={onClose} className="text-white hover:text-red-400 font-bold text-sm">
            ✕ Exit Copilot
          </button>
        </div>
      </div>

      {/* Search Input */}
      <input
        id="copilot-search"
        type="text"
        placeholder="Fuzzy search questions, trade-offs, keywords..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-400"
      />

      {/* Main Dual Pane */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Left Side Questions List */}
        <div className="bg-neutral-900 rounded-xl p-3 border border-neutral-800 overflow-y-auto space-y-2">
          {filtered.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              className={`w-full text-left p-3 rounded-lg text-xs transition-colors ${
                selectedIdx === idx ? "bg-emerald-950 border border-emerald-500/50 text-white" : "hover:bg-neutral-800 text-neutral-400"
              }`}
            >
              <div className="text-[10px] text-emerald-400 font-bold uppercase">{q.category}</div>
              <div className="line-clamp-2 font-medium mt-1">{q.question}</div>
            </button>
          ))}
        </div>

        {/* Right Side Large Teleprompter View */}
        <div className="md:col-span-2 bg-neutral-900 rounded-xl p-6 border border-neutral-800 overflow-y-auto space-y-6">
          {currentQ ? (
            <>
              <div>
                <span className="text-xs text-emerald-400 font-bold uppercase">{currentQ.category} • {currentQ.difficulty}</span>
                <h3 className="text-xl font-bold text-white mt-1 leading-relaxed">{currentQ.question}</h3>
              </div>

              <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 space-y-2">
                <span className="text-xs text-neutral-400 font-bold uppercase">Strong Answer Bullet Points</span>
                <div className="text-sm text-neutral-200 whitespace-pre-wrap leading-relaxed">
                  {currentQ.strong_answer_outline}
                </div>
              </div>

              <div className="bg-red-950/40 p-4 rounded-lg border border-red-900/40 space-y-1">
                <span className="text-xs text-red-400 font-bold uppercase">Red Flags to Avoid</span>
                <p className="text-xs text-red-200">{currentQ.red_flags}</p>
              </div>
            </>
          ) : (
            <div className="text-neutral-500 text-center py-20">No matching questions found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 4. Integration into Session Page

### File to Modify: `app/dashboard/[id]/page.tsx`
* Add button `[ 📄 Launch Live Copilot HUD ]` in top toolbar.
* Add state `const [copilotOpen, setCopilotOpen] = useState(false);`.
* Render `<CopilotModal isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} ... />`.

---

## 5. Verification & Checklist

- [ ] Verify HUD modal opens full-screen in high contrast dark mode.
- [ ] Test `Cmd + K` search shortcut to quickly jump to questions.
- [ ] Confirm layout renders cleanly on second monitor or side-by-side split screen.
- [ ] Verify ESC key closes modal cleanly.

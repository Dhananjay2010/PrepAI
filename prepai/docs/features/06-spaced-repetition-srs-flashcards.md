# Feature Spec 06: Spaced Repetition (SRS Flashcards) Engine

**Feature ID:** FEAT-06  
**Target Goal:** Convert weak interview topics and bookmarked questions into Leitner 5-Box SRS flashcards due daily to maximize memory retention.  
**Priority:** Medium (Phase 2 - Primary Retention Loop)  

---

## 1. Overview & Business Value
Without spaced review, candidates forget 70% of studied technical definitions and system design trade-offs within 48 hours. By building a 5-minute daily flashcard review engine based on memory retention curves, candidates build long-term memory while logging in daily, boosting user retention time significantly.

### Candidate User Story
> "As an IT professional preparing over 3 weeks, I want 5-minute daily flashcard reviews of my weak topics every morning so I don't forget early concepts on interview day."

---

## 2. Leitner 5-Box Algorithm Mechanics

```
Box 1 (Daily Review) ──[Correct]──> Box 2 (Review in 2 Days) ──[Correct]──> Box 3 (Review in 5 Days)
   ^                                                                               │
   └──────────────────────────────────[Incorrect]──────────────────────────────────┘
```

* **Box 1**: Reviewed every 1 day.
* **Box 2**: Reviewed every 2 days.
* **Box 3**: Reviewed every 5 days.
* **Box 4**: Reviewed every 10 days.
* **Box 5**: Mastered (Reviewed every 30 days).

---

## 3. Database Migration Script (`supabase/schema.sql`)

```sql
-- Migration 06: Spaced Repetition Flashcards Table
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  box INT DEFAULT 1 CHECK (box BETWEEN 1 AND 5),
  next_review_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own flashcards" ON flashcards FOR ALL USING (auth.uid() = user_id);
```

---

## 4. API Endpoints

### 1. `GET /api/flashcards/due?userId={id}`
Returns all flashcards where `next_review_date <= CURRENT_DATE`.

### 2. `POST /api/flashcards/review`
* **Request Payload**:
  ```json
  {
    "cardId": "uuid-v4",
    "rating": "easy" | "good" | "hard" // "hard" resets to Box 1; "good/easy" increments Box
  }
  ```

---

## 5. UI/UX Component Specifications

### File to Create: `components/FlashcardReviewModal.tsx`

```tsx
"use client";

import React, { useState } from "react";

interface Flashcard {
  id: string;
  question_text: string;
  answer_text: string;
  box: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cards: Flashcard[];
}

export function FlashcardReviewModal({ isOpen, onClose, cards }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!isOpen || cards.length === 0) return null;

  const current = cards[currentIdx];

  async function handleResponse(rating: "hard" | "good" | "easy") {
    try {
      await fetch("/api/flashcards/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: current.id, rating }),
      });
    } catch (err) {
      console.error(err);
    }

    setFlipped(false);
    if (currentIdx + 1 < cards.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-paper-raised w-full max-w-lg rounded-2xl p-6 border border-slate/10 space-y-6">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-focus font-bold uppercase">
            Daily SRS Flashcards ({currentIdx + 1} of {cards.length})
          </span>
          <button onClick={onClose} className="text-slate text-xs font-mono">Close ✕</button>
        </div>

        {/* Card Flip Body */}
        <div
          onClick={() => setFlipped(!flipped)}
          className="min-h-[220px] bg-paper p-6 rounded-xl border border-slate/20 cursor-pointer flex flex-col justify-center items-center text-center space-y-3"
        >
          {!flipped ? (
            <div>
              <span className="text-[10px] font-mono text-slate uppercase">Tap to reveal answer</span>
              <p className="font-display text-base font-bold text-ink mt-2">{current.question_text}</p>
            </div>
          ) : (
            <div>
              <span className="text-[10px] font-mono text-mint font-bold uppercase">Answer & Outline</span>
              <p className="font-body text-sm text-ink leading-relaxed mt-2">{current.answer_text}</p>
            </div>
          )}
        </div>

        {/* Response Action Bar */}
        {flipped && (
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => handleResponse("hard")} className="bg-coral/10 text-coral border border-coral/30 py-2 rounded-lg text-xs font-mono font-bold">
              Again (Hard)
            </button>
            <button onClick={() => handleResponse("good")} className="bg-highlight/20 text-ink border border-highlight/40 py-2 rounded-lg text-xs font-mono font-bold">
              Good
            </button>
            <button onClick={() => handleResponse("easy")} className="bg-mint/15 text-mint border border-mint/30 py-2 rounded-lg text-xs font-mono font-bold">
              Easy (Mastered)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 6. Verification & Checklist

- [ ] Execute `flashcards` table SQL migration.
- [ ] Test adding questions from session details page into flashcard deck.
- [ ] Verify due cards are returned correctly based on `next_review_date`.
- [ ] Verify Box interval increases correctly upon "Good" and "Easy" responses.

"use client";

import React, { useState } from "react";

export interface FlashcardItem {
  id: string;
  question_text: string;
  answer_text: string;
  box: number;
}

interface FlashcardReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: FlashcardItem[];
  onReviewComplete?: () => void;
}

export function FlashcardReviewModal({
  isOpen,
  onClose,
  cards = [],
  onReviewComplete,
}: FlashcardReviewModalProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || cards.length === 0) return null;

  const current = cards[currentIdx];

  async function handleResponse(rating: "hard" | "good" | "easy") {
    if (!current) return;
    try {
      setSubmitting(true);
      await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "review",
          userId: (current as any).user_id,
          cardId: current.id,
          rating,
        }),
      });
    } catch (err) {
      console.error("Flashcard review submission error:", err);
    } finally {
      setSubmitting(false);
      setFlipped(false);
      if (currentIdx + 1 < cards.length) {
        setCurrentIdx(currentIdx + 1);
      } else {
        if (onReviewComplete) onReviewComplete();
        onClose();
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 font-mono animate-in fade-in duration-200">
      <div className="bg-paper-raised w-full max-w-lg rounded-2xl p-6 border border-slate/10 shadow-2xl space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate/10 pb-3">
          <div className="flex items-center space-x-2">
            <span className="bg-focus/15 text-focus font-bold px-2 py-0.5 rounded text-[10px] uppercase">
              ⚡ SRS LEITNER DECK
            </span>
            <span className="text-xs font-bold text-ink">
              Card {currentIdx + 1} of {cards.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate hover:text-ink text-xs font-mono font-bold"
          >
            Close ✕
          </button>
        </div>

        {/* Flip Card Area */}
        <div
          onClick={() => setFlipped(!flipped)}
          className="min-h-[240px] bg-paper p-6 rounded-xl border border-slate/20 hover:border-focus/40 cursor-pointer flex flex-col justify-center items-center text-center space-y-4 transition-all shadow-inner relative group"
        >
          <span className="absolute top-3 right-3 text-[10px] text-slate bg-paper-raised px-2 py-0.5 rounded border border-slate/10">
            Box {current?.box || 1} / 5
          </span>

          {!flipped ? (
            <div className="space-y-2">
              <span className="text-[10px] text-focus font-bold uppercase tracking-wider block">
                Question / Concept (Tap to Reveal Answer)
              </span>
              <h3 className="font-display text-base sm:text-lg font-bold text-ink leading-snug">
                {current?.question_text}
              </h3>
            </div>
          ) : (
            <div className="space-y-2 text-left w-full">
              <span className="text-[10px] text-mint font-bold uppercase tracking-wider block">
                Answer Outline & Talking Points
              </span>
              <div className="text-xs sm:text-sm text-ink leading-relaxed font-body whitespace-pre-wrap">
                {current?.answer_text}
              </div>
            </div>
          )}
        </div>

        {/* Rating Button Bar */}
        {flipped ? (
          <div className="grid grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => handleResponse("hard")}
              disabled={submitting}
              className="bg-coral/10 hover:bg-coral/20 text-coral border border-coral/30 py-2.5 rounded-lg text-xs font-mono font-bold transition-all disabled:opacity-50"
            >
              Again (Hard)
              <span className="block text-[9px] font-normal text-coral/70 mt-0.5">Box 1 • 1 Day</span>
            </button>
            <button
              onClick={() => handleResponse("good")}
              disabled={submitting}
              className="bg-highlight/15 hover:bg-highlight/25 text-ink border border-highlight/40 py-2.5 rounded-lg text-xs font-mono font-bold transition-all disabled:opacity-50"
            >
              Good
              <span className="block text-[9px] font-normal text-slate mt-0.5">+1 Box Interval</span>
            </button>
            <button
              onClick={() => handleResponse("easy")}
              disabled={submitting}
              className="bg-mint/15 hover:bg-mint/25 text-mint border border-mint/30 py-2.5 rounded-lg text-xs font-mono font-bold transition-all disabled:opacity-50"
            >
              Easy (Mastered)
              <span className="block text-[9px] font-normal text-mint/80 mt-0.5">Box 5 • 30 Days</span>
            </button>
          </div>
        ) : (
          <p className="text-center text-[11px] text-slate font-mono">
            Tap the card above to inspect answer outline before rating.
          </p>
        )}
      </div>
    </div>
  );
}

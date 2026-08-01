"use client";

import React, { useState, useEffect } from "react";
import { QuestionData } from "@/components/QuestionCard";
import { resolveQuestionRound } from "@/lib/gemini";

interface CopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleSummary: string;
  seniority?: string;
  questions: QuestionData[];
}

export function CopilotModal({
  isOpen,
  onClose,
  roleSummary,
  seniority,
  questions = [],
}: CopilotModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [fontSize, setFontSize] = useState<"normal" | "large">("normal");

  const filtered = questions.filter((q) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const roundInfo = resolveQuestionRound(q);
    return (
      q.question.toLowerCase().includes(term) ||
      q.category.toLowerCase().includes(term) ||
      q.strong_answer_outline.toLowerCase().includes(term) ||
      (q.what_they_test && q.what_they_test.toLowerCase().includes(term)) ||
      roundInfo.round_label.toLowerCase().includes(term)
    );
  });

  const filteredCount = filtered.length;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("copilot-search-input")?.focus();
        return;
      }
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((prev) => Math.min(filteredCount - 1, prev + 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((prev) => Math.max(0, prev - 1));
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, filteredCount]);

  if (!isOpen) return null;

  const currentQ = filtered[selectedIdx] || filtered[0];
  const roundInfo = currentQ ? resolveQuestionRound(currentQ) : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 text-white p-4 sm:p-6 font-mono overflow-hidden flex flex-col space-y-4 animate-in fade-in duration-200">
      {/* Top Teleprompter Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/20 pb-3">
        <div className="flex items-center space-x-3">
          <span className="bg-emerald-500 text-black px-2.5 py-0.5 text-xs font-bold rounded uppercase tracking-wider animate-pulse">
            ● LIVE COPILOT HUD
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white leading-tight">
              {roleSummary} {seniority ? `(${seniority})` : ""}
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs text-neutral-400">
          <button
            onClick={() => setFontSize(fontSize === "normal" ? "large" : "normal")}
            className="bg-neutral-800 hover:bg-neutral-700 text-white px-2.5 py-1 rounded text-xs transition-colors"
          >
            Font Size: {fontSize === "normal" ? "Standard" : "Large (HUD)"}
          </button>
          <span className="hidden sm:inline">
            Search: <kbd className="bg-neutral-800 px-1.5 py-0.5 rounded text-white">Cmd + K</kbd>
          </span>
          <button
            onClick={onClose}
            className="bg-red-950/80 hover:bg-red-900 border border-red-800/80 text-red-200 px-3 py-1 rounded font-bold transition-all text-xs"
          >
            ✕ Exit Copilot Mode
          </button>
        </div>
      </div>

      {/* Instant Search Bar */}
      <div className="relative">
        <input
          id="copilot-search-input"
          type="text"
          placeholder="Fuzzy search questions, trade-offs, keywords (Cmd+K)..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setSelectedIdx(0);
          }}
          className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-xl p-3.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 placeholder:text-neutral-500 shadow-inner"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-3 text-xs text-neutral-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Main Dual Pane Teleprompter View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-hidden">
        {/* Left List of Questions */}
        <div className="bg-neutral-900 rounded-xl p-3 border border-neutral-800 overflow-y-auto space-y-2 max-h-48 md:max-h-full">
          <div className="text-[10px] uppercase font-bold text-neutral-400 px-1 mb-1">
            Questions ({filtered.length})
          </div>
          {filtered.map((q, idx) => {
            const rInfo = resolveQuestionRound(q);
            const isSelected = selectedIdx === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedIdx(idx)}
                className={`w-full text-left p-3 rounded-lg text-xs transition-all border ${
                  isSelected
                    ? "bg-emerald-950/80 border-emerald-500/60 text-white shadow-md"
                    : "bg-neutral-950/50 hover:bg-neutral-800 border-neutral-800/80 text-neutral-400"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold uppercase mb-1">
                  <span>{rInfo.round_label}</span>
                  <span className="text-neutral-500">{q.difficulty}</span>
                </div>
                <div className="line-clamp-2 font-medium leading-snug">{q.question}</div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-neutral-500 text-center py-8 text-xs">
              No matching questions.
            </div>
          )}
        </div>

        {/* Right Teleprompter Panel */}
        <div className="md:col-span-2 bg-neutral-900 rounded-xl p-5 sm:p-6 border border-neutral-800 overflow-y-auto space-y-6">
          {currentQ && roundInfo ? (
            <>
              {/* Question Banner */}
              <div className="space-y-2 border-b border-neutral-800 pb-4">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded font-bold uppercase">
                    {roundInfo.round_label}
                  </span>
                  <span className="bg-neutral-800 text-neutral-300 px-2.5 py-0.5 rounded uppercase">
                    {currentQ.category}
                  </span>
                  <span className="text-neutral-400 uppercase font-semibold">
                    {currentQ.difficulty}
                  </span>
                </div>

                <h3
                  className={`font-bold text-white leading-relaxed ${
                    fontSize === "large" ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
                  }`}
                >
                  {currentQ.question}
                </h3>
              </div>

              {/* Evaluated Competency */}
              {currentQ.what_they_test && (
                <div className="bg-neutral-950/80 p-3.5 rounded-lg border border-neutral-800 space-y-1">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    Target Evaluated Skill
                  </span>
                  <p className="text-xs text-neutral-300">{currentQ.what_they_test}</p>
                </div>
              )}

              {/* Strong Answer Outline Bullets */}
              <div className="bg-neutral-950 p-4 sm:p-5 rounded-xl border border-neutral-800 space-y-2">
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                  Key Talking Points & Answer Outline
                </span>
                <div
                  className={`text-neutral-200 whitespace-pre-wrap leading-relaxed ${
                    fontSize === "large" ? "text-base" : "text-sm"
                  }`}
                >
                  {currentQ.strong_answer_outline}
                </div>
              </div>

              {/* Red Flags Caution */}
              {currentQ.red_flags && (
                <div className="bg-red-950/30 p-4 rounded-xl border border-red-900/40 space-y-1">
                  <span className="text-xs text-red-400 font-bold uppercase tracking-wider">
                    ⚠️ Red Flags & Pitfalls to Avoid
                  </span>
                  <p className="text-xs text-red-200 leading-relaxed">
                    {currentQ.red_flags}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-neutral-500 text-center py-20">
              Select a question to view teleprompter outline.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

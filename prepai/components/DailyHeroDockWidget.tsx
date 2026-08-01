"use client";

import Link from "next/link";

interface DailyHeroDockWidgetProps {
  streakDays?: number;
  interviewDate?: string;
  dueFlashcardsCount?: number;
  unmasteredTopicsCount?: number;
  recentSessionId?: string;
  recentRoleSummary?: string;
  onStartFlashcardReview?: () => void;
}

export function DailyHeroDockWidget({
  streakDays = 1,
  interviewDate,
  dueFlashcardsCount = 0,
  unmasteredTopicsCount = 0,
  recentSessionId,
  recentRoleSummary,
  onStartFlashcardReview,
}: DailyHeroDockWidgetProps) {
  let daysLeft: number | null = null;
  if (interviewDate) {
    const target = new Date(interviewDate);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    daysLeft = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="bg-paper-raised rounded-2xl p-6 border border-slate/15 shadow-[0_4px_24px_-8px_rgba(28,34,48,0.12)] space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-semibold uppercase bg-mint/15 text-mint px-2.5 py-0.5 rounded-full">
              Session 2 • Returning Candidate
            </span>
            {streakDays > 0 && (
              <span className="font-mono text-xs font-bold bg-highlight/20 text-ink px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                <span>🔥</span>
                <span>{streakDays} Day Streak</span>
              </span>
            )}
          </div>

          <h2 className="font-display text-2xl font-bold text-ink">
            Welcome back to your Google SDE3 Prep
          </h2>
          <p className="text-xs font-body text-slate">
            Pick up right where you left off. Review SRS flashcards, refine System Design trade-offs, and track interview readiness.
          </p>
        </div>

        {daysLeft !== null && (
          <div className="bg-paper p-3 rounded-xl border border-slate/10 text-center font-mono space-y-0.5 min-w-[130px] self-start sm:self-auto">
            <span className="text-[10px] text-slate uppercase font-semibold">Target Interview</span>
            <p className="text-lg font-bold text-focus">{daysLeft} Day{daysLeft > 1 ? "s" : ""} Left</p>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: SRS Memory Flashcards */}
        <div className="bg-paper p-4 rounded-xl border border-slate/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-slate uppercase">SRS Flashcards Due</span>
            <span className="text-xs">⚡</span>
          </div>
          <p className="font-display text-2xl font-bold text-ink">
            {dueFlashcardsCount > 0 ? `${dueFlashcardsCount} Cards` : "All Caught Up!"}
          </p>
          {dueFlashcardsCount > 0 ? (
            <button
              onClick={onStartFlashcardReview}
              className="text-xs font-mono font-bold text-focus hover:underline flex items-center space-x-1"
            >
              <span>Start 5-Min Review &rarr;</span>
            </button>
          ) : (
            <p className="text-[11px] font-mono text-mint">✓ Memory bank synced</p>
          )}
        </div>

        {/* Metric 2: Weak / Unmastered Topics */}
        <div className="bg-paper p-4 rounded-xl border border-slate/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-slate uppercase">Topics to Review</span>
            <span className="text-xs">🎯</span>
          </div>
          <p className="font-display text-2xl font-bold text-ink">
            {unmasteredTopicsCount > 0 ? `${unmasteredTopicsCount} Weak Areas` : "High Mastery"}
          </p>
          <p className="text-[11px] font-mono text-slate">
            System Design & Concurrency
          </p>
        </div>

        {/* Metric 3: Target Role Resume Hook */}
        <div className="bg-paper p-4 rounded-xl border border-slate/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-slate uppercase">Active Target Role</span>
            <span className="text-xs">📌</span>
          </div>
          <p className="font-display text-sm font-bold text-ink truncate">
            {recentRoleSummary || "Google SDE 3 / Senior"}
          </p>
          {recentSessionId ? (
            <Link
              href={`/dashboard/${recentSessionId}`}
              className="text-xs font-mono font-bold text-mint hover:underline inline-block"
            >
              Resume Prep Session &rarr;
            </Link>
          ) : (
            <Link
              href="/"
              className="text-xs font-mono font-bold text-focus hover:underline inline-block"
            >
              + Generate New Session &rarr;
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

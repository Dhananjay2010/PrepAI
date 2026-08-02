"use client";

import { useEffect } from "react";
import Link from "next/link";

interface DailyHeroDockWidgetProps {
  streakDays?: number;
  interviewDate?: string;
  dueFlashcardsCount?: number;
  unmasteredTopicsCount?: number;
  recentSessionId?: string;
  recentRoleSummary?: string;
  targetCompany?: string;
  targetRole?: string;
  readinessScore?: number;
  onStartEmergencySprint?: () => void;
  onStartFlashcardReview?: () => void;
  onLaunchTopicDrill?: (topic: string) => void;
}

export function DailyHeroDockWidget({
  streakDays = 1,
  interviewDate,
  dueFlashcardsCount = 0,
  unmasteredTopicsCount = 2,
  recentSessionId,
  recentRoleSummary,
  targetCompany = "Microsoft",
  targetRole = "SDE4",
  readinessScore = 78,
  onStartEmergencySprint,
  onStartFlashcardReview,
  onLaunchTopicDrill,
}: DailyHeroDockWidgetProps) {
  let daysLeft: number = 3;
  if (interviewDate) {
    const target = new Date(interviewDate);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    daysLeft = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  // Handle keyboard shortcut (Spacebar) on Dashboard to launch sprint
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing inside an input or textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        if (onStartEmergencySprint) {
          onStartEmergencySprint();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onStartEmergencySprint]);

  return (
    <div className="bg-paper-raised rounded-2xl p-6 border border-slate/15 shadow-xl space-y-6">
      {/* Header Banner & Countdown Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate/10 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase bg-mint/15 text-mint px-2.5 py-0.5 rounded-full">
              🎯 Target: {targetCompany} {targetRole}
            </span>
            <span className="font-mono text-xs font-bold bg-focus/15 text-focus px-2.5 py-0.5 rounded-full border border-focus/20">
              ⏱️ {daysLeft} Day{daysLeft > 1 ? "s" : ""} Remaining
            </span>
            {streakDays > 0 && (
              <span className="font-mono text-xs font-bold bg-highlight/20 text-ink px-2 py-0.5 rounded-full flex items-center space-x-1">
                <span>🔥</span>
                <span>{streakDays} Day Velocity</span>
              </span>
            )}
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink pt-1">
            Emergency Prep Cockpit
          </h2>
          <p className="text-xs sm:text-sm font-body text-slate">
            High-yield, 15-minute practice sprints tuned specifically for {targetCompany} {targetRole} interview loops.
          </p>
        </div>

        {/* Readiness Index Meter */}
        <div className="bg-paper p-3 rounded-xl border border-slate/10 text-center font-mono space-y-0.5 min-w-[140px] self-start sm:self-auto shadow-sm">
          <span className="text-[10px] text-slate uppercase font-semibold">Readiness Index</span>
          <p className="text-2xl font-bold text-mint">{readinessScore}%</p>
          <span className="text-[10px] text-slate font-medium">SDE4 Benchmark Bar</span>
        </div>
      </div>

      {/* Dominant Hero CTA Container */}
      <div className="bg-gradient-to-r from-focus/10 via-paper to-mint/10 p-5 rounded-2xl border border-focus/20 space-y-4 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-mono text-xs font-bold text-focus uppercase tracking-wider">
              Recommended 15-Min Sprint
            </span>
            <h3 className="font-display text-xl font-bold text-ink">
              Distributed Caching & System Rate Limiting
            </h3>
            <p className="text-xs text-slate font-body">
              3 High-Yield Questions • 12 Mins • Est. +4% Readiness Gain
            </p>
          </div>

          {/* Massive Primary CTA Button */}
          <button
            onClick={onStartEmergencySprint}
            className="w-full sm:w-auto bg-focus hover:bg-focus/90 text-white font-mono font-bold text-base px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 group whitespace-nowrap"
          >
            <span>▶ START 15-MIN SPRINT (Spacebar)</span>
            <span className="group-hover:translate-x-1 transition-transform">➔</span>
          </button>
        </div>
      </div>

      {/* Secondary 2-Column Zone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Focus Weak Spots */}
        <div className="bg-paper p-4 rounded-xl border border-slate/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-slate uppercase">
              🎯 Focus Weak Spots (Quick Drills)
            </span>
            <span className="font-mono text-[10px] text-focus font-bold">5-Min Each</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-paper-raised border border-slate/10">
              <div className="space-y-0.5">
                <div className="font-mono text-xs font-bold text-ink">Raft Consensus Protocol</div>
                <div className="text-[11px] text-slate">Distributed Systems • Leader Election</div>
              </div>
              <button
                onClick={() => onLaunchTopicDrill && onLaunchTopicDrill("Raft Consensus Protocol")}
                className="font-mono text-xs font-semibold text-focus hover:underline"
              >
                Drill ▶
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-paper-raised border border-slate/10">
              <div className="space-y-0.5">
                <div className="font-mono text-xs font-bold text-ink">STAR Conflict Story</div>
                <div className="text-[11px] text-slate font-body">Behavioral • Senior Leadership</div>
              </div>
              <button
                onClick={() => onLaunchTopicDrill && onLaunchTopicDrill("STAR Conflict Story")}
                className="font-mono text-xs font-semibold text-focus hover:underline"
              >
                Drill ▶
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: 3-Day Sprint Timeline */}
        <div className="bg-paper p-4 rounded-xl border border-slate/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-slate uppercase">
              ⏱️ 3-Day Emergency Sprint Timeline
            </span>
            <span className="font-mono text-[10px] text-mint font-bold">On Schedule</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-mint/10 border border-mint/20 text-ink font-semibold">
              <span>Day 1: Architecture & Trade-offs</span>
              <span className="text-mint font-bold">✓ Completed</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-focus/15 border border-focus/30 text-ink font-bold">
              <span>Day 2: Concurrency & Reliability</span>
              <span className="text-focus font-bold">⚡ Active Today</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate/5 border border-slate/10 text-slate">
              <span>Day 3: Execution & Final Polish</span>
              <span>Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

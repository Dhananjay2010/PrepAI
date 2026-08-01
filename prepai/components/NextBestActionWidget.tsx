"use client";

import { useMemo } from "react";

interface NextBestActionWidgetProps {
  interviewDate?: string;
  roleSummary?: string;
  questions?: any[];
  onSelectAction?: (actionType: "system_design" | "coding" | "behavioral" | "mock") => void;
}

export function NextBestActionWidget({
  interviewDate,
  roleSummary,
  questions = [],
  onSelectAction,
}: NextBestActionWidgetProps) {
  const sprintInfo = useMemo(() => {
    let daysLeft = 3; // Default 3-day sprint focus if date not set
    if (interviewDate) {
      const target = new Date(interviewDate);
      const now = new Date();
      const diffTime = target.getTime() - now.getTime();
      daysLeft = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    let currentDay = 1;
    let totalDays = Math.min(daysLeft, 7);
    if (daysLeft === 1) {
      currentDay = totalDays;
    } else if (daysLeft === 2) {
      currentDay = Math.max(1, totalDays - 1);
    }

    let systemDesignCount = 0;
    let codingCount = 0;
    let behavioralCount = 0;

    questions.forEach((q) => {
      const cat = (q?.category || "").toLowerCase();
      const text = ((q?.question || "") + " " + (q?.what_they_test || "")).toLowerCase();
      if (cat.includes("system design") || cat.includes("architecture") || text.includes("design a")) {
        systemDesignCount++;
      } else if (cat.includes("behavioral") || cat.includes("behavioural") || text.includes("tell me about")) {
        behavioralCount++;
      } else {
        codingCount++;
      }
    });

    let actionTitle = "High-Level System Design & Rate Limiting";
    let actionDesc = "Practice microservices architecture, trade-offs, and scalability questions.";
    let actionType: "system_design" | "coding" | "behavioral" | "mock" = "system_design";
    let ctaText = "Start System Design Review →";

    if (daysLeft === 1) {
      actionTitle = "Final Verbal Mock Practice & High-Yield Cheat Sheet";
      actionDesc = "Run turn-by-turn AI Mock interviews to polish spoken communication before tomorrow.";
      actionType = "mock";
      ctaText = "Start Live AI Mock Practice →";
    } else if (behavioralCount > systemDesignCount && daysLeft <= 2) {
      actionTitle = "Behavioral Leadership & STAR Stories";
      actionDesc = "Review past conflict, mentorship, and system outage stories tailored for senior engineering rounds.";
      actionType = "behavioral";
      ctaText = "Review STAR Stories →";
    } else if (codingCount > systemDesignCount && systemDesignCount === 0) {
      actionTitle = "Low-Level Design & Concurrency Core";
      actionDesc = "Master data structure choices, index optimization, and concurrency primitives.";
      actionType = "coding";
      ctaText = "Start LLD & Coding Practice →";
    }

    return {
      daysLeft,
      currentDay,
      totalDays,
      actionTitle,
      actionDesc,
      actionType,
      ctaText,
      roleName: roleSummary || "Target Software Role",
    };
  }, [interviewDate, questions, roleSummary]);

  return (
    <div className="bg-gradient-to-r from-focus/15 via-paper-raised to-mint/15 rounded-2xl p-6 border-2 border-focus/30 shadow-[0_4px_24px_-8px_rgba(28,34,48,0.15)] relative overflow-hidden space-y-4">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 bg-focus/10 w-32 h-32 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center space-x-2.5">
            <span className="font-mono text-xs font-bold uppercase bg-focus text-white px-2.5 py-1 rounded-full shadow-xs">
              ⚡ NEXT BEST ACTION
            </span>
            <span className="font-mono text-xs text-slate font-semibold">
              Day {sprintInfo.currentDay} of {sprintInfo.totalDays} Sprint • {sprintInfo.daysLeft} Day{sprintInfo.daysLeft > 1 ? "s" : ""} to Interview
            </span>
          </div>

          <h3 className="font-display text-xl sm:text-2xl font-bold text-ink leading-snug">
            {sprintInfo.actionTitle}
          </h3>

          <p className="font-body text-slate text-sm leading-relaxed">
            {sprintInfo.actionDesc}
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto pt-2 md:pt-0">
          <button
            onClick={() => onSelectAction && onSelectAction(sprintInfo.actionType)}
            className="bg-focus text-white font-medium px-6 py-3.5 rounded-xl hover:opacity-95 transition-all text-xs font-mono font-bold shadow-md hover:shadow-lg flex items-center space-x-2 whitespace-nowrap active:scale-95"
          >
            <span>{sprintInfo.ctaText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

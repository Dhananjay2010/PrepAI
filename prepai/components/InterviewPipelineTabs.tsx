"use client";

import React from "react";

export type RoundFilter = "all" | "screening" | "lld_coding" | "hld_system_design" | "behavioral";

interface InterviewPipelineTabsProps {
  activeRound: RoundFilter;
  onSelectRound: (round: RoundFilter) => void;
  counts: Record<RoundFilter, number>;
}

export function InterviewPipelineTabs({
  activeRound,
  onSelectRound,
  counts,
}: InterviewPipelineTabsProps) {
  const tabs: { id: RoundFilter; label: string; icon: string; shortLabel: string }[] = [
    { id: "all", label: "All Questions", shortLabel: "All", icon: "📋" },
    { id: "screening", label: "Round 1: Recruiter Fit", shortLabel: "R1: Screening", icon: "📞" },
    { id: "lld_coding", label: "Round 2: Technical & LLD", shortLabel: "R2: Tech & LLD", icon: "💻" },
    { id: "hld_system_design", label: "Round 3: System Design", shortLabel: "R3: System Design", icon: "🏗️" },
    { id: "behavioral", label: "Round 4: Behavioral STAR", shortLabel: "R4: Behavioral", icon: "🧠" },
  ];

  return (
    <div className="bg-paper-raised rounded-xl p-3 border border-slate/10 shadow-sm space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate">
          Interview Pipeline Stage Filter
        </span>
        <span className="font-mono text-[10px] text-focus bg-focus/10 px-2 py-0.5 rounded uppercase font-semibold">
          Multi-Round Simulator
        </span>
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeRound === tab.id;
          const count = counts[tab.id] || 0;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectRound(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-mono transition-all whitespace-nowrap border ${
                isActive
                  ? "bg-focus text-white font-bold border-focus shadow-sm"
                  : "bg-paper border-slate/15 text-slate hover:text-ink hover:border-slate/30"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-slate/15 text-slate"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

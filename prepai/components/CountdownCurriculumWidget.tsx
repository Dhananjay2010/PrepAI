"use client";

import React, { useState, useEffect } from "react";

interface CurriculumDay {
  day: number;
  title: string;
  focus: string;
  task: string;
  icon: string;
}

const blitzCurriculum: CurriculumDay[] = [
  {
    day: 1,
    title: "Day 1: Foundations & Recruiter Fit",
    focus: "Round 1 Screening",
    task: "Practice 60-second Recruiter Pitch & review JD core competencies.",
    icon: "📞",
  },
  {
    day: 2,
    title: "Day 2: Low-Level Design (LLD)",
    focus: "Round 2 Technical",
    task: "Review OOP design patterns, code snippets, and SQL query tuning.",
    icon: "💻",
  },
  {
    day: 3,
    title: "Day 3: System Design (HLD)",
    focus: "Round 3 Architecture",
    task: "Study Mermaid.js flowcharts & trade-off matrices (Redis vs DB, Kafka vs SQS).",
    icon: "🏗️",
  },
  {
    day: 4,
    title: "Day 4: Behavioral STAR Stories",
    focus: "Round 4 Leadership",
    task: "Write and rehearse 4 core Situation-Task-Action-Result incident stories.",
    icon: "🧠",
  },
  {
    day: 5,
    title: "Day 5: AI Voice Stress Mock Session",
    focus: "Interactive Practice",
    task: "Complete a 15-minute voice grilling session with Skeptical Architect persona.",
    icon: "🎙️",
  },
  {
    day: 6,
    title: "Day 6: Weak Topic Remediation",
    focus: "SRS Retention",
    task: "Complete 10-minute Leitner 5-Box flashcard review deck.",
    icon: "⚡",
  },
  {
    day: 7,
    title: "Day 7: Final Teleprompter Review",
    focus: "Interview Readiness",
    task: "Export PDF Cheat Sheet & run 5-minute Live Copilot HUD dry run.",
    icon: "📄",
  },
];

export function CountdownCurriculumWidget() {
  const [completedDays, setCompletedDays] = useState<number[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("prepai_7day_blitz");
      if (saved) {
        setCompletedDays(JSON.parse(saved));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  function toggleDay(day: number) {
    let next: number[];
    if (completedDays.includes(day)) {
      next = completedDays.filter((d) => d !== day);
    } else {
      next = [...completedDays, day];
    }
    setCompletedDays(next);
    try {
      localStorage.setItem("prepai_7day_blitz", JSON.stringify(next));
    } catch (err) {
      console.error(err);
    }
  }

  const progressPct = Math.round((completedDays.length / 7) * 100);

  return (
    <div className="bg-paper-raised rounded-2xl p-6 border border-slate/10 shadow-[0_4px_24px_-8px_rgba(28,34,48,0.12)] space-y-5 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate/10 pb-4">
        <div>
          <span className="text-xs font-bold uppercase text-focus bg-focus/10 border border-focus/20 px-2.5 py-0.5 rounded">
            ⚡ 7-DAY INTERVIEW BLITZ CURRICULUM
          </span>
          <h3 className="font-display text-lg font-bold text-ink mt-1.5">
            Daily Step-by-Step Prep Goal Tracker
          </h3>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <div className="w-32 bg-paper rounded-full h-3 border border-slate/10 overflow-hidden">
            <div
              className="bg-focus h-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs font-bold text-ink">{completedDays.length}/7 Done ({progressPct}%)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {blitzCurriculum.map((item) => {
          const isDone = completedDays.includes(item.day);
          return (
            <div
              key={item.day}
              onClick={() => toggleDay(item.day)}
              className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                isDone
                  ? "bg-mint/10 border-mint/30 text-ink opacity-90"
                  : "bg-paper hover:bg-paper/80 border-slate/15 text-slate"
              }`}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => {}}
                  className="w-4 h-4 rounded text-focus focus:ring-focus cursor-pointer"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span>{item.icon}</span>
                    <span className={`font-bold ${isDone ? "text-mint line-through" : "text-ink"}`}>
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate bg-paper-raised px-1.5 py-0.5 rounded border border-slate/10">
                      {item.focus}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate font-body mt-0.5">{item.task}</p>
                </div>
              </div>

              <span className={`text-xs font-bold ${isDone ? "text-mint" : "text-slate/40"}`}>
                {isDone ? "✓ Done" : "Mark Done"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

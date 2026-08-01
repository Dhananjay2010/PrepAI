"use client";

import React, { useState } from "react";

interface ReadinessGaugeProps {
  score: number; // 0 to 100
  interviewDate?: string | null;
  roleSummary?: string;
  userId?: string;
  onInterviewDateUpdated?: (newDate: string) => void;
}

export function ReadinessGauge({
  score = 65,
  interviewDate,
  roleSummary,
  userId,
  onInterviewDateUpdated,
}: ReadinessGaugeProps) {
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(interviewDate || "");
  const [saving, setSaving] = useState(false);

  const daysLeft = interviewDate
    ? Math.max(0, Math.ceil((new Date(interviewDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  const color = score >= 85 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444";

  async function handleSaveDate() {
    if (!userId || !selectedDate) return;
    try {
      setSaving(true);
      const res = await fetch("/api/user/interview-date", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, interviewDate: selectedDate }),
      });
      if (res.ok) {
        if (onInterviewDateUpdated) onInterviewDateUpdated(selectedDate);
        setDateModalOpen(false);
      }
    } catch (err) {
      console.error("Save interview date error:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-paper-raised rounded-2xl p-6 border border-slate/10 shadow-[0_4px_24px_-8px_rgba(28,34,48,0.12)] flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="space-y-3 text-center sm:text-left flex-1">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-focus bg-focus/10 border border-focus/20 px-2.5 py-0.5 rounded">
            AI READINESS INDEX
          </span>

          {daysLeft !== null ? (
            <span className="font-mono text-xs font-bold text-coral bg-coral/10 border border-coral/20 px-2.5 py-0.5 rounded flex items-center space-x-1">
              <span>⏳</span>
              <span>{daysLeft} Day{daysLeft === 1 ? "" : "s"} to Target Interview</span>
            </span>
          ) : (
            <button
              onClick={() => setDateModalOpen(true)}
              className="font-mono text-[11px] font-bold text-focus hover:underline bg-focus/5 border border-focus/20 px-2.5 py-0.5 rounded"
            >
              + Set Target Interview Date
            </button>
          )}
        </div>

        <div>
          <h2 className="font-display text-xl font-bold text-ink leading-snug">
            {roleSummary ? `Target Role: ${roleSummary}` : "Interview Preparedness Readiness"}
          </h2>
          <p className="font-body text-xs text-slate mt-1 max-w-lg">
            {score >= 85
              ? "🎯 High Readiness (85%+)! You have covered core architecture topics and completed voice mock sessions."
              : score >= 60
              ? "⚡ Moderate Readiness (60-84%). Complete daily 7-Day Blitz tasks and SRS flashcard reviews to reach 85%+."
              : "⚠️ Needs Preparation (<60%). Focus on Low-Level Design and System Design flowcharts."}
          </p>
        </div>

        {interviewDate && (
          <div className="pt-1">
            <button
              onClick={() => setDateModalOpen(true)}
              className="text-[11px] font-mono text-slate hover:text-ink underline"
            >
              Change Interview Date ({new Date(interviewDate).toLocaleDateString()})
            </button>
          </div>
        )}
      </div>

      {/* Circular Readiness SVG Gauge */}
      <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-slate/15"
            strokeWidth="3.5"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            strokeWidth="3.5"
            strokeDasharray={`${score}, 100`}
            stroke={color}
            strokeLinecap="round"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="font-mono text-xl font-bold text-ink leading-none">{score}%</span>
          <span className="font-mono text-[9px] text-slate font-bold uppercase mt-1">READINESS</span>
        </div>
      </div>

      {/* Date Picker Modal */}
      {dateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 font-mono">
          <div className="bg-paper-raised p-6 rounded-2xl border border-slate/10 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-display text-base font-bold text-ink">Set Target Interview Date</h3>
            <p className="text-xs text-slate font-body">
              PrepAI will generate an adaptive 7-Day Blitz daily curriculum count down to your interview day.
            </p>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-3 bg-paper border border-slate/20 rounded-xl text-xs text-ink focus:outline-none focus:ring-2 focus:ring-focus/30"
            />
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setDateModalOpen(false)}
                className="px-4 py-2 text-xs text-slate hover:text-ink font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDate}
                disabled={saving || !selectedDate}
                className="bg-focus text-white px-4 py-2 rounded-lg text-xs font-bold font-mono disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Interview Date"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

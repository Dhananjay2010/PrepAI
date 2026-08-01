"use client";

import { useState } from "react";
import Link from "next/link";
import { TopicData } from "@/lib/gemini";

interface TopicBreakdownBarProps {
  topics: TopicData[];
  questions?: any[];
  sessionId?: string;
  assessments?: Record<string, "strong" | "weak">;
  onAssessmentToggle?: (topicId: string, status: "strong" | "weak") => void;
}

export function TopicBreakdownBar({
  topics,
  questions = [],
  sessionId,
  assessments = {},
  onAssessmentToggle,
}: TopicBreakdownBarProps) {
  const [localAssessments, setLocalAssessments] = useState<Record<string, "strong" | "weak">>(assessments);

  if (!topics || topics.length === 0) return null;

  const handleToggle = (topicId: string, status: "strong" | "weak") => {
    const current = localAssessments[topicId];
    const newStatus = current === status ? (status === "strong" ? "weak" : "strong") : status;
    const updated = { ...localAssessments, [topicId]: newStatus };
    setLocalAssessments(updated);

    if (onAssessmentToggle) {
      onAssessmentToggle(topicId, newStatus);
    }
  };

  return (
    <div className="bg-paper-raised rounded-2xl p-6 border border-slate/10 shadow-[0_4px_24px_-8px_rgba(28,34,48,0.12)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate/10 pb-3">
        <div>
          <span className="font-mono text-[11px] font-semibold uppercase text-focus bg-focus/10 px-2 py-0.5 rounded">
            Target Competency Breakdown
          </span>
          <h3 className="font-display text-lg font-bold text-ink mt-1">
            Required Topics & Self-Assessment
          </h3>
        </div>
        <p className="text-xs font-mono text-slate">
          Tag your weak topics to prioritize your study focus
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((topic, index) => {
          const status = localAssessments[topic.id];
          const qCount = questions.filter(
            (q) => q.topic_id === topic.id || q.topic_title === topic.title
          ).length;

          const topicSlug = topic.id || topic.title.toLowerCase().replace(/[^a-z0-9]/g, "-");
          const topicUrl = sessionId
            ? `/dashboard/${sessionId}/topic/${topicSlug}`
            : `#topic-${topicSlug}`;

          return (
            <div
              key={topic.id || index}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                status === "weak"
                  ? "bg-coral/5 border-coral/30"
                  : status === "strong"
                  ? "bg-mint/5 border-mint/30"
                  : "bg-paper border-slate/10 hover:border-slate/30"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      topic.importance?.toLowerCase() === "critical"
                        ? "bg-coral/15 text-coral"
                        : "bg-focus/10 text-focus"
                    }`}
                  >
                    {topic.importance || "Core Topic"}
                  </span>
                  <span className="font-mono text-[11px] text-slate">
                    {qCount > 0 ? `${qCount} Qs` : "Study Topic"}
                  </span>
                </div>

                <h4 className="font-display text-sm font-bold text-ink leading-snug">
                  {topic.title}
                </h4>
                <p className="text-xs text-slate line-clamp-2 font-body leading-relaxed">
                  {topic.description}
                </p>
              </div>

              {/* Action Buttons: Self-Assessment & Study Link */}
              <div className="pt-2 border-t border-slate/10 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-1.5 font-mono text-xs">
                  <button
                    onClick={() => handleToggle(topic.id, "strong")}
                    className={`px-2 py-1 rounded transition-colors text-[11px] font-semibold ${
                      status === "strong"
                        ? "bg-mint text-white"
                        : "bg-paper-raised text-slate hover:text-ink border border-slate/10"
                    }`}
                  >
                    💪 Strong
                  </button>
                  <button
                    onClick={() => handleToggle(topic.id, "weak")}
                    className={`px-2 py-1 rounded transition-colors text-[11px] font-semibold ${
                      status === "weak"
                        ? "bg-coral text-white"
                        : "bg-paper-raised text-slate hover:text-ink border border-slate/10"
                    }`}
                  >
                    ⚠️ Weak
                  </button>
                </div>

                {sessionId && (
                  <Link
                    href={topicUrl}
                    className="font-mono text-[11px] text-focus font-semibold hover:underline flex items-center space-x-0.5"
                  >
                    <span>Study</span>
                    <span>&rarr;</span>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

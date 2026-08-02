"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export interface FeedbackDiffCardProps {
  verdict?: "Strong Hire" | "Hire" | "Needs Structure" | "No Hire";
  targetRoleLevel?: string;
  overallScore?: number;
  scores?: {
    architecture?: number;
    tradeoffs?: number;
    communication?: number;
  };
  nailedPoints?: string[];
  missingGaps?: string[];
  userAnswer?: string;
  modelAnswer?: string;
  sayThisTakeaway?: string[];
  onNextQuestion?: () => void;
  onRetryQuestion?: () => void;
  onBookmarkFlashcard?: () => void;
}

export function FeedbackDiffCard({
  verdict = "Strong Hire",
  targetRoleLevel = "Microsoft SDE4",
  overallScore = 84,
  scores = { architecture: 90, tradeoffs: 75, communication: 88 },
  nailedPoints = [
    "Mentioned Redis Cluster sharding with consistent hashing",
    "Applied Token Bucket algorithm for distributed rate limiting",
    "Specified sliding window log fallback for peak traffic spikes",
  ],
  missingGaps = [
    "Omitted multi-region SLA failover & cross-datacenter replication delay",
    "Did not quantify cache invalidation strategy under high concurrency",
  ],
  userAnswer = "I would place a rate limiter API gateway in front of Azure microservices, using Redis clusters for distributed state. If a client exceeds 100 req/min, return 429 Too Many Requests.",
  modelAnswer = "To meet the Microsoft SDE4 bar for 1M QPS: 1) Deploy a globally distributed API Gateway layer with local Envoy proxies. 2) Use Token Bucket rate limiting backed by Redis Enterprise Cluster with Multi-Master active-active replication across Azure regions. 3) Define graceful degradation with fallback queueing when Redis latency exceeds 5ms SLA.",
  sayThisTakeaway = [
    "Always specify multi-region replication SLAs before introducing Redis clusters.",
    "Quantify fallback bounds: 'When cache latency > 5ms, drop to local memory window'.",
  ],
  onNextQuestion,
  onRetryQuestion,
  onBookmarkFlashcard,
}: FeedbackDiffCardProps) {
  const [activeTab, setActiveTab] = useState<"diff" | "model" | "user">("diff");

  const verdictColor =
    verdict === "Strong Hire" || verdict === "Hire"
      ? "bg-mint/15 text-mint border-mint/30"
      : "bg-highlight/20 text-ink border-highlight/40";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-paper-raised rounded-2xl border border-slate/15 p-6 shadow-xl space-y-6"
    >
      {/* Top Verdict Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className={`font-mono text-xs font-bold uppercase px-3 py-1 rounded-full border ${verdictColor}`}>
              {verdict} — {targetRoleLevel} Bar
            </span>
            <span className="font-mono text-xs font-semibold bg-slate/10 text-slate px-2.5 py-0.5 rounded-full">
              Post-Answer Feedback
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold text-ink">
            SDE4 Evaluation Breakdown
          </h2>
        </div>

        {/* Score Ring Gauge */}
        <div className="flex items-center space-x-3 bg-paper p-3 rounded-xl border border-slate/10 self-start sm:self-auto">
          <div className="relative w-12 h-12 flex items-center justify-center font-mono font-bold text-lg text-ink">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate/15"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-mint"
                strokeDasharray={`${overallScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span>{overallScore}</span>
          </div>
          <div className="font-mono text-xs space-y-0.5">
            <div className="text-slate font-semibold">Overall Index</div>
            <div className="text-[11px] text-mint font-bold">+4% Readiness Gain</div>
          </div>
        </div>
      </div>

      {/* Sub-scores Metric Pills */}
      <div className="grid grid-cols-3 gap-3 font-mono text-xs">
        <div className="bg-paper p-3 rounded-xl border border-slate/10 text-center">
          <div className="text-slate text-[10px] uppercase font-semibold">Architecture</div>
          <div className="font-bold text-base text-ink">{scores.architecture}%</div>
        </div>
        <div className="bg-paper p-3 rounded-xl border border-slate/10 text-center">
          <div className="text-slate text-[10px] uppercase font-semibold">Trade-offs</div>
          <div className="font-bold text-base text-ink">{scores.tradeoffs}%</div>
        </div>
        <div className="bg-paper p-3 rounded-xl border border-slate/10 text-center">
          <div className="text-slate text-[10px] uppercase font-semibold">Communication</div>
          <div className="font-bold text-base text-ink">{scores.communication}%</div>
        </div>
      </div>

      {/* Core Breakdown Grid (Hits & Gaps) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Traffic Light Signals */}
        <div className="space-y-3">
          {/* Nailed */}
          <div className="bg-paper p-4 rounded-xl border border-mint/20 space-y-2">
            <span className="font-mono text-xs font-bold text-mint uppercase flex items-center space-x-1">
              <span>✓ Nailed (SDE4 Expectations Hit)</span>
            </span>
            <ul className="space-y-1.5 text-xs text-ink font-body">
              {nailedPoints.map((pt, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-mint font-bold">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Missing Gaps */}
          <div className="bg-paper p-4 rounded-xl border border-highlight/30 space-y-2">
            <span className="font-mono text-xs font-bold text-focus uppercase flex items-center space-x-1">
              <span>⚠️ SDE4 Gaps (Missing Staff Depth)</span>
            </span>
            <ul className="space-y-1.5 text-xs text-ink font-body">
              {missingGaps.map((gap, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-focus font-bold">•</span>
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Model Answer Diff Tabbed Container */}
        <div className="bg-paper p-4 rounded-xl border border-slate/10 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate/10 pb-2">
              <span className="font-mono text-xs font-bold text-slate uppercase">
                Model Response Comparison
              </span>
              <div className="flex space-x-1 font-mono text-[11px]">
                <button
                  onClick={() => setActiveTab("diff")}
                  className={`px-2.5 py-0.5 rounded-md ${
                    activeTab === "diff" ? "bg-focus text-white font-bold" : "text-slate hover:text-ink"
                  }`}
                >
                  Diff
                </button>
                <button
                  onClick={() => setActiveTab("model")}
                  className={`px-2.5 py-0.5 rounded-md ${
                    activeTab === "model" ? "bg-focus text-white font-bold" : "text-slate hover:text-ink"
                  }`}
                >
                  Model Answer
                </button>
              </div>
            </div>

            {activeTab === "diff" && (
              <div className="font-mono text-xs space-y-2 bg-ink/5 p-3 rounded-lg border border-slate/10 leading-relaxed max-h-48 overflow-y-auto">
                <div className="text-mint bg-mint/10 p-2 rounded border border-mint/20">
                  <span className="font-bold">+ [Model Target]:</span> {modelAnswer}
                </div>
                <div className="text-slate/80 p-2 rounded border border-slate/15">
                  <span className="font-bold">- [Your Answer]:</span> {userAnswer}
                </div>
              </div>
            )}

            {activeTab === "model" && (
              <div className="font-body text-xs text-ink bg-paper p-3 rounded-lg border border-slate/10 leading-relaxed max-h-48 overflow-y-auto">
                <p className="font-semibold text-mint font-mono mb-1">Microsoft SDE4 Benchmark Model Answer:</p>
                {modelAnswer}
              </div>
            )}
          </div>

          {/* Say This Instead Takeaway Box */}
          {sayThisTakeaway && sayThisTakeaway.length > 0 && (
            <div className="bg-mint/10 border border-mint/20 p-3 rounded-lg space-y-1">
              <span className="font-mono text-[11px] font-bold text-mint uppercase">
                💡 High-Yield Memorizable Takeaway:
              </span>
              <ul className="text-xs text-ink space-y-0.5">
                {sayThisTakeaway.map((t, i) => (
                  <li key={i}>• {t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sticky Action Dock */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate/10 font-mono text-xs">
        <div className="flex space-x-2 w-full sm:w-auto">
          {onRetryQuestion && (
            <button
              onClick={onRetryQuestion}
              className="flex-1 sm:flex-none px-4 py-2 bg-paper hover:bg-slate/10 text-ink border border-slate/20 rounded-xl font-semibold transition-colors"
            >
              🔄 Retry Question
            </button>
          )}
          {onBookmarkFlashcard && (
            <button
              onClick={onBookmarkFlashcard}
              className="flex-1 sm:flex-none px-4 py-2 bg-paper hover:bg-slate/10 text-mint border border-mint/30 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-1"
            >
              <span>📌 Add to 5m Deck</span>
            </button>
          )}
        </div>

        {onNextQuestion && (
          <button
            onClick={onNextQuestion}
            className="w-full sm:w-auto px-6 py-2.5 bg-focus hover:bg-focus/90 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <span>Next Question (Space)</span>
            <span>➔</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}

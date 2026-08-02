"use client";

import { motion } from "framer-motion";

export interface CompetencyPillar {
  id: string;
  name: string;
  score: number; // 0-100
  trend: number[]; // e.g. [65, 72, 82]
  status: "Mastered" | "High Mastery" | "Needs Focus" | "Critical Gap";
}

export interface WeakSpotItem {
  topic: string;
  pillar: string;
  estMins: number;
  gapDescription: string;
}

export interface CompetencyRadarWidgetProps {
  pillars?: CompetencyPillar[];
  weakSpots?: WeakSpotItem[];
  onLaunchDrill?: (topic: string) => void;
}

const DEFAULT_PILLARS: CompetencyPillar[] = [
  {
    id: "sys_arch",
    name: "System Architecture",
    score: 82,
    trend: [68, 75, 82],
    status: "High Mastery",
  },
  {
    id: "dist_rel",
    name: "Distributed Reliability",
    score: 75,
    trend: [60, 68, 75],
    status: "Needs Focus",
  },
  {
    id: "algo_opt",
    name: "Algorithmic Optimization",
    score: 88,
    trend: [80, 84, 88],
    status: "Mastered",
  },
  {
    id: "star_lead",
    name: "STAR Leadership",
    score: 90,
    trend: [82, 86, 90],
    status: "Mastered",
  },
];

const DEFAULT_WEAK_SPOTS: WeakSpotItem[] = [
  {
    topic: "Consistent Hashing & Dynamic Sharding",
    pillar: "Distributed Reliability",
    estMins: 5,
    gapDescription: "Missing virtual node ring partitioning math under node crash scenarios.",
  },
  {
    topic: "Raft Consensus Protocol & Heartbeats",
    pillar: "System Architecture",
    estMins: 5,
    gapDescription: "Did not specify election timeout bounds and split-brain resolution.",
  },
];

function Sparkline({ data }: { data: number[] }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * 60;
      const y = 20 - ((val - min) / range) * 16;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="w-16 h-6 overflow-visible stroke-mint fill-none stroke-[2.5]" viewBox="0 0 60 20">
      <polyline points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CompetencyRadarWidget({
  pillars = DEFAULT_PILLARS,
  weakSpots = DEFAULT_WEAK_SPOTS,
  onLaunchDrill,
}: CompetencyRadarWidgetProps) {
  return (
    <div className="bg-paper-raised rounded-2xl border border-slate/15 p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold uppercase bg-mint/15 text-mint px-2.5 py-0.5 rounded-full">
              Readiness Trajectory
            </span>
            <span className="font-mono text-xs font-semibold bg-highlight/20 text-ink px-2.5 py-0.5 rounded-full">
              ⏱️ 3-Day Sprint Window
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold text-ink">
            Microsoft SDE4 Pillar Mastery
          </h2>
        </div>
        <div className="font-mono text-xs text-mint font-bold bg-paper px-3 py-1.5 rounded-xl border border-slate/10 self-start sm:self-auto">
          ↑ +14% Readiness Gain (Past 48h)
        </div>
      </div>

      {/* Top 4 Competency Radar Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pillars.map((pillar) => {
          const isHigh = pillar.score >= 80;
          return (
            <motion.div
              key={pillar.id}
              whileHover={{ y: -2 }}
              className="bg-paper p-4 rounded-xl border border-slate/10 space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-slate uppercase truncate pr-2">
                  {pillar.name}
                </span>
                <Sparkline data={pillar.trend} />
              </div>

              <div className="flex items-baseline space-x-2">
                <span className="font-display text-2xl font-bold text-ink">
                  {pillar.score}%
                </span>
                <span
                  className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isHigh ? "bg-mint/15 text-mint" : "bg-highlight/20 text-ink"
                  }`}
                >
                  {pillar.status}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isHigh ? "bg-mint" : "bg-focus"}`}
                  style={{ width: `${pillar.score}%` }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Weak Spot Remediation Deck */}
      <div className="bg-paper p-5 rounded-xl border border-slate/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-ink">
              High-Yield Gaps to Close Before Day 3
            </h3>
            <p className="text-xs text-slate font-body">
              Targeted 5-minute micro-drills to solidify missing staff-level trade-offs.
            </p>
          </div>
          <span className="font-mono text-xs font-bold text-focus bg-focus/10 px-2.5 py-1 rounded-full">
            {weakSpots.length} Action Items
          </span>
        </div>

        <div className="space-y-3">
          {weakSpots.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-paper-raised border border-slate/15 hover:border-slate/30 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-ink">
                    {item.topic}
                  </span>
                  <span className="font-mono text-[10px] bg-slate/10 text-slate px-2 py-0.5 rounded">
                    {item.pillar}
                  </span>
                </div>
                <p className="text-xs text-slate font-body">
                  {item.gapDescription}
                </p>
              </div>

              <button
                onClick={() => onLaunchDrill && onLaunchDrill(item.topic)}
                className="w-full sm:w-auto font-mono text-xs font-bold text-white bg-focus hover:bg-focus/90 px-4 py-2 rounded-lg shadow transition-all whitespace-nowrap flex items-center justify-center space-x-1"
              >
                <span>Quick 5m Drill</span>
                <span>▶</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

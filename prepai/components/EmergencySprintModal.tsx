"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EmergencySprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunch: (preset: { id: string; title: string; duration: number; topics: string[] }) => void;
  targetCompany?: string;
  targetRole?: string;
}

const PRESETS = [
  {
    id: "quick_15m",
    title: "⚡ Quick Sprint (15m)",
    duration: 15,
    qCount: 3,
    description: "Highest-yield System Design & STAR leadership combo for short breaks.",
    topics: ["Distributed Rate Limiting", "CAP Theorem Trade-offs", "Cross-team Conflict Resolution"],
    badge: "Recommended",
  },
  {
    id: "deep_30m",
    title: "🎯 Deep Dive (30m)",
    duration: 30,
    qCount: 5,
    description: "Architecture design, data partitioning, & fault tolerance failure modes.",
    topics: ["Consistent Hashing & Sharding", "Multi-Region Disaster Recovery", "Raft Consensus Protocol"],
    badge: "High Yield",
  },
  {
    id: "mock_45m",
    title: "🔥 Full Mock (45m)",
    duration: 45,
    qCount: 8,
    description: "Live AI Interrogator simulating full Microsoft SDE4 loop.",
    topics: ["End-to-End Azure API Gateway Design", "Concurrency & Lock Free Data Structures", "L64 Leadership Principles"],
    badge: "Full Loop",
  },
];

export function EmergencySprintModal({
  isOpen,
  onClose,
  onLaunch,
  targetCompany = "Microsoft",
  targetRole = "SDE4",
}: EmergencySprintModalProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("quick_15m");
  const [micActive, setMicActive] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Keyboard shortcut trigger: Enter to launch selected preset
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const preset = PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];
        onLaunch(preset);
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedPresetId, onLaunch, onClose]);

  // Mic check via Web Audio API
  useEffect(() => {
    if (!isOpen) return;

    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let stream: MediaStream | null = null;
    let animId: number;

    async function initMic() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 64;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        setMicActive(true);

        const checkAudio = () => {
          if (!analyser) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
          animId = requestAnimationFrame(checkAudio);
        };
        checkAudio();
      } catch (err) {
        console.warn("Mic access optional check warning:", err);
        setMicActive(false);
      }
    }

    initMic();

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (stream) stream.getTracks().forEach((track) => track.stop());
      if (audioCtx && audioCtx.state !== "closed") audioCtx.close();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedPreset = PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-paper-raised w-full max-w-2xl rounded-2xl border border-slate/20 shadow-2xl p-6 space-y-6 overflow-hidden"
        >
          {/* Top Bar Header */}
          <div className="flex items-center justify-between border-b border-slate/10 pb-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold uppercase bg-mint/15 text-mint px-2.5 py-0.5 rounded-full">
                  Emergency Cockpit
                </span>
                <span className="font-mono text-xs font-semibold bg-highlight/20 text-ink px-2.5 py-0.5 rounded-full">
                  🎯 {targetCompany} {targetRole} Bar
                </span>
              </div>
              <h2 className="font-display text-2xl font-bold text-ink">
                Launch High-Yield Practice Sprint
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate hover:text-ink font-mono text-sm p-2 hover:bg-slate/10 rounded-lg transition-colors"
            >
              ✕ Esc
            </button>
          </div>

          {/* Preset Selector Segmented Cards */}
          <div className="space-y-3">
            <label className="font-mono text-xs uppercase text-slate font-semibold tracking-wider">
              Select Sprint Preset
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedPresetId(preset.id)}
                    className={`text-left p-4 rounded-xl border transition-all relative space-y-2 ${
                      isSelected
                        ? "bg-paper border-focus shadow-md ring-2 ring-focus/30"
                        : "bg-paper/50 border-slate/15 hover:border-slate/30"
                    }`}
                  >
                    {preset.badge && (
                      <span
                        className={`absolute top-3 right-3 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected ? "bg-focus text-white" : "bg-slate/10 text-slate"
                        }`}
                      >
                        {preset.badge}
                      </span>
                    )}
                    <h3 className="font-display text-base font-bold text-ink pr-12">
                      {preset.title}
                    </h3>
                    <p className="text-xs text-slate font-body leading-relaxed">
                      {preset.description}
                    </p>
                    <div className="font-mono text-[11px] text-mint font-semibold pt-1">
                      {preset.qCount} Questions • {preset.duration} Mins
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Competencies Preview Card */}
          <div className="bg-paper p-4 rounded-xl border border-slate/10 space-y-2">
            <span className="font-mono text-xs uppercase text-slate font-semibold">
              Competencies Tested in this Sprint:
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedPreset.topics.map((topic, i) => (
                <span
                  key={i}
                  className="font-mono text-xs bg-slate/10 text-ink px-3 py-1 rounded-md border border-slate/15"
                >
                  ✓ {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Pre-Flight & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate/10">
            {/* Audio Hardware Pill */}
            <div className="flex items-center space-x-2 bg-paper px-3 py-1.5 rounded-full border border-slate/15">
              <span className="text-xs">🎙️</span>
              <span className="font-mono text-xs text-slate font-semibold">
                Mic Check:
              </span>
              {micActive ? (
                <div className="flex items-center space-x-1">
                  <div className="w-16 h-2 bg-slate/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-mint transition-all duration-75"
                      style={{ width: `${Math.max(10, audioLevel)}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-mint font-bold">Active</span>
                </div>
              ) : (
                <span className="font-mono text-[10px] text-slate">Text Mode Enabled</span>
              )}
            </div>

            {/* Launch CTA Button */}
            <button
              onClick={() => onLaunch(selectedPreset)}
              className="w-full sm:w-auto bg-focus hover:bg-focus/90 text-white font-mono font-bold text-sm px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 group"
            >
              <span>Launch Session (Enter)</span>
              <span className="group-hover:translate-x-1 transition-transform">➔</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

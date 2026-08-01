"use client";

import React, { useState, useEffect } from "react";

interface Props {
  jobDescription: string;
  sessionId?: string;
}

export interface StarStoryItem {
  id?: string;
  competency: string;
  situation: string;
  suggestedStory: string;
}

export function ResumeGapVisualizer({ jobDescription, sessionId }: Props) {
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [starStories, setStarStories] = useState<StarStoryItem[]>([]);
  const [result, setResult] = useState<{
    matchPercentage: number;
    confirmedSkills: string[];
    criticalGaps: string[];
    highRiskAreas: string[];
    tailoredStarStories: StarStoryItem[];
  } | null>(null);

  // Load cached STAR stories on mount
  useEffect(() => {
    if (typeof window !== "undefined" && sessionId) {
      try {
        const cached = localStorage.getItem(`prepai_star_stories_${sessionId}`);
        if (cached) {
          setStarStories(JSON.parse(cached));
        }
      } catch (err) {
        // silent cache ignore
      }
    }
  }, [sessionId]);

  async function handleAnalyze() {
    if (!resumeText.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/resume-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data);
      if (Array.isArray(data.tailoredStarStories)) {
        setStarStories(data.tailoredStarStories);
        persistStories(data.tailoredStarStories);
      }
    } catch (err: any) {
      console.error("Resume match error:", err);
      setError(err.message || "Failed to analyze resume gap.");
    } finally {
      setLoading(false);
    }
  }

  function persistStories(stories: StarStoryItem[]) {
    setStarStories(stories);
    if (typeof window !== "undefined" && sessionId) {
      try {
        localStorage.setItem(`prepai_star_stories_${sessionId}`, JSON.stringify(stories));
        fetch("/api/user/star-stories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, stories }),
        }).catch(console.error);
      } catch (e) {
        console.warn("STAR stories persistence warning:", e);
      }
    }
  }

  function handleUpdateStory(index: number, updatedText: string) {
    const updated = [...starStories];
    updated[index] = { ...updated[index], suggestedStory: updatedText };
    persistStories(updated);
  }

  function handleAddCustomStory() {
    const newStory: StarStoryItem = {
      competency: "Personal Experience / Project Ownership",
      situation: "High-stress production environment or key technical decision.",
      suggestedStory: "In my previous project, I led the migration of high-throughput services...",
    };
    persistStories([newStory, ...starStories]);
  }

  const scoreColor =
    (result?.matchPercentage || 0) >= 80
      ? "text-mint border-mint/40 bg-mint/10"
      : (result?.matchPercentage || 0) >= 60
      ? "text-highlight border-highlight/40 bg-highlight/10"
      : "text-coral border-coral/40 bg-coral/10";

  return (
    <div className="bg-paper-raised rounded-2xl p-6 border border-slate/10 shadow-[0_4px_24px_-8px_rgba(28,34,48,0.12)] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate/10 pb-4">
        <div>
          <span className="font-mono text-xs font-bold text-focus uppercase tracking-wider">
            Resume Match Matrix
          </span>
          <h3 className="font-display text-xl font-bold text-ink mt-1">
            Resume vs. Target JD Skill-Gap Analyzer
          </h3>
        </div>
        {result && (
          <button
            onClick={() => setResult(null)}
            className="text-xs font-mono text-focus hover:underline self-start sm:self-auto"
          >
            ↺ Paste Different Resume
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-coral/10 border border-coral/20 text-coral text-xs rounded-md font-mono">
          {error}
        </div>
      )}

      {!result ? (
        <div className="space-y-4">
          <p className="text-xs text-slate font-body leading-relaxed">
            Paste the text content from your PDF resume below. PrepAI will analyze your experience
            against the target Job Description to highlight critical tech stack gaps and generate
            tailored STAR stories.
          </p>

          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            disabled={loading}
            placeholder="Paste text from your PDF resume (Work Experience, Skills, Project Bullet Points)..."
            className="w-full h-40 p-4 bg-paper rounded-xl border border-slate/20 text-ink focus:outline-none focus:ring-2 focus:ring-focus/30 text-xs font-mono placeholder:text-slate/40 resize-y"
          />

          <div className="flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={loading || resumeText.trim().length < 20}
              className="bg-focus text-white font-medium px-6 py-2.5 rounded-lg hover:opacity-90 transition-all text-xs font-mono shadow-md disabled:opacity-50"
            >
              {loading ? "Analyzing Technical Gaps..." : "🔍 Analyze Resume Gaps & STAR Stories"}
            </button>
          </div>
        </div>
      ) : (
        /* Results Matrix Display */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Score Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-paper rounded-xl border border-slate/10 gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="font-mono text-[10px] uppercase font-bold text-slate">
                Target JD Match Ratio
              </span>
              <p className="font-body text-xs text-slate">
                {result.matchPercentage >= 80
                  ? "Strong Alignment! Your background matches most core JD requirements."
                  : "Critical Gaps Found! Prepare key talking points for missing technologies."}
              </p>
            </div>
            <div className={`px-5 py-2.5 rounded-xl border font-mono font-bold text-2xl ${scoreColor}`}>
              {result.matchPercentage}%
            </div>
          </div>

          {/* Dual Columns: Confirmed vs Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Confirmed Skills */}
            <div className="bg-mint/5 p-4 rounded-xl border border-mint/20 space-y-3">
              <div className="flex items-center justify-between border-b border-mint/20 pb-2">
                <span className="font-mono text-xs font-bold text-mint uppercase">
                  ✓ Confirmed Safe Skills ({result.confirmedSkills?.length || 0})
                </span>
              </div>
              <ul className="text-xs font-mono space-y-1.5 text-ink">
                {result.confirmedSkills?.map((skill, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <span className="text-mint font-bold">✓</span>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Critical Gaps */}
            <div className="bg-coral/5 p-4 rounded-xl border border-coral/20 space-y-3">
              <div className="flex items-center justify-between border-b border-coral/20 pb-2">
                <span className="font-mono text-xs font-bold text-coral uppercase">
                  ⚠️ Critical Skill Gaps ({result.criticalGaps?.length || 0})
                </span>
              </div>
              <ul className="text-xs font-mono space-y-1.5 text-ink">
                {result.criticalGaps?.map((gap, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <span className="text-coral font-bold">⚠️</span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* High Risk Interview Areas */}
          {result.highRiskAreas && result.highRiskAreas.length > 0 && (
            <div className="bg-paper p-4 rounded-xl border border-slate/10 space-y-2 font-mono text-xs">
              <span className="text-coral font-bold uppercase text-[11px]">
                🔥 High-Risk Interview Probe Areas
              </span>
              <ul className="list-disc pl-5 space-y-1 text-slate font-body">
                {result.highRiskAreas.map((area, idx) => (
                  <li key={idx}>{area}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Persistent & Editable STAR Stories */}
          <div className="space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-focus uppercase">
                ✨ Tailored STAR Stories (Bridging Resume to JD Gaps)
              </span>
              <button
                onClick={handleAddCustomStory}
                className="text-[11px] font-mono text-mint hover:underline font-bold"
              >
                + Add Personal STAR Story
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {starStories.map((story, idx) => (
                <div key={idx} className="bg-paper p-4 rounded-xl border border-slate/10 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-focus">{story.competency}</span>
                    <span className="text-[10px] text-slate uppercase bg-focus/10 text-focus px-2 py-0.5 rounded font-semibold">
                      STAR Bridge Template (Editable)
                    </span>
                  </div>
                  <p className="text-slate font-body text-[11px] leading-relaxed">
                    <strong className="text-ink font-mono font-semibold">Context: </strong>
                    {story.situation}
                  </p>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate uppercase block font-semibold">
                      Suggested Talking Story (Edit text to save):
                    </label>
                    <textarea
                      value={story.suggestedStory}
                      onChange={(e) => handleUpdateStory(idx, e.target.value)}
                      rows={3}
                      className="w-full bg-paper-raised p-3 rounded-lg border border-slate/20 text-ink font-body text-xs focus:outline-none focus:ring-1 focus:ring-focus leading-relaxed resize-y"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

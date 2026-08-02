"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PaywallModal } from "@/components/PaywallModal";
import { SkeletonPreciseAnswer } from "@/components/Skeletons";
import { SystemDesignDiagram } from "@/components/SystemDesignDiagram";
import { CodeSandboxWidget } from "@/components/CodeSandboxWidget";
import {
  resolveQuestionRound,
  generateFallbackMermaidDiagram,
  generateFallbackTradeOffs,
  generateFallbackCodeSnippet,
} from "@/lib/gemini";

export interface QuestionData {
  num: number;
  category: string;
  round?: string;
  round_label?: string;
  mermaid_code?: string;
  sample_code_snippet?: {
    language: string;
    code: string;
    explanation: string;
  };
  trade_offs?: {
    technology_a: string;
    technology_b: string;
    pros_a: string[];
    pros_b: string[];
    verdict: string;
  };
  difficulty: "Easy" | "Medium" | "Hard" | string;
  question: string;
  what_they_test: string;
  strong_answer_outline: string;
  red_flags: string;
  precise_answer?: {
    summary_statement: string;
    key_bullets: string[];
    sample_spoken_answer: string;
    recommended_reading?: {
      title: string;
      url: string;
    }[];
  };
}

interface QuestionCardProps {
  question: QuestionData;
  userId?: string;
  sessionId?: string;
  isBookmarked?: boolean;
  onBookmarkToggle?: (isBookmarked: boolean) => void;
}

export function QuestionCard({
  question,
  userId,
  sessionId,
  isBookmarked = false,
  onBookmarkToggle,
}: QuestionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [cramMode, setCramMode] = useState(false);
  const [viewTab, setViewTab] = useState<"outline" | "diagram" | "sandbox" | "tradeoffs">("outline");
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [bookmarking, setBookmarking] = useState(false);
  const [addingFlashcard, setAddingFlashcard] = useState(false);
  const [cardAdded, setCardAdded] = useState(false);

  // Progressive Structural Hint State (Level 1: Nudge, Level 2: Architecture hint)
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2>(0);

  // Soft Ambient Timer State (Muted grey countdown/elapsed timer)
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // Voice Dictation & Transcript State
  const [voiceActive, setVoiceActive] = useState(false);
  const [userTranscript, setUserTranscript] = useState("");
  const [voiceInputSupported, setVoiceInputSupported] = useState(true);

  // Precise Answer State
  const [loadingPrecise, setLoadingPrecise] = useState(false);
  const [preciseAnswer, setPreciseAnswer] = useState<{
    summary_statement: string;
    key_bullets: string[];
    sample_spoken_answer: string;
    recommended_reading?: {
      title: string;
      url: string;
    }[];
  } | null>(question.precise_answer || null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Soft Ambient Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Voice Dictation Web Speech API Setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            finalTranscript += event.results[i][0].transcript;
          }
          if (finalTranscript) {
            setUserTranscript((prev) => prev + " " + finalTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setVoiceActive(false);
        };

        recognition.onend = () => {
          setVoiceActive(false);
        };

        recognitionRef.current = recognition;
      } else {
        setVoiceInputSupported(false);
      }
    }
  }, []);

  const toggleVoiceDictation = () => {
    if (!recognitionRef.current) {
      alert("Voice dictation is not supported in this browser. You can type your response instead.");
      return;
    }
    if (voiceActive) {
      recognitionRef.current.stop();
      setVoiceActive(false);
    } else {
      try {
        recognitionRef.current.start();
        setVoiceActive(true);
        setTimerRunning(true);
      } catch (err) {
        console.warn("Recognition start error:", err);
      }
    }
  };

  const preciseAnswerPropStr = JSON.stringify(question.precise_answer);

  // Auto-check saved precise answer
  useEffect(() => {
    let isMounted = true;
    if (question.precise_answer) {
      setPreciseAnswer(question.precise_answer);
      return;
    }

    async function checkSavedPreciseAnswer() {
      if (!userId || !question?.question || preciseAnswer) return;
      try {
        const res = await fetch(
          `/api/precise-answer?userId=${userId}&question=${encodeURIComponent(question.question)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.found && data.preciseAnswer && isMounted) {
            setPreciseAnswer(data.preciseAnswer);
          }
        }
      } catch (err) {
        // silent fail
      }
    }

    checkSavedPreciseAnswer();
    return () => {
      isMounted = false;
    };
  }, [userId, question.question, preciseAnswerPropStr]);

  const difficultyDotColor =
    question.difficulty?.toLowerCase() === "easy"
      ? "bg-mint"
      : question.difficulty?.toLowerCase() === "hard"
      ? "bg-coral"
      : "bg-highlight";

  async function toggleBookmark() {
    if (!userId) {
      alert("Please sign in to bookmark questions.");
      return;
    }

    try {
      setBookmarking(true);
      const nextState = !bookmarked;
      setBookmarked(nextState);

      const questionPayload = preciseAnswer
        ? { ...question, precise_answer: preciseAnswer }
        : question;

      const res = await fetch("/api/user/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          question: questionPayload,
          action: nextState ? "add" : "remove",
        }),
      });

      if (!res.ok) {
        setBookmarked(!nextState);
      } else {
        if (onBookmarkToggle) onBookmarkToggle(nextState);
      }
    } catch (err) {
      console.error("Bookmark toggle error:", err);
      setBookmarked(!bookmarked);
    } finally {
      setBookmarking(false);
    }
  }

  async function handleAddFlashcard() {
    if (!userId) {
      alert("Please sign in to add SRS flashcards.");
      return;
    }
    try {
      setAddingFlashcard(true);
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          userId,
          sessionId,
          questionText: question.question,
          answerText: preciseAnswer?.summary_statement || question.strong_answer_outline,
        }),
      });

      if (res.ok) {
        setCardAdded(true);
        setTimeout(() => setCardAdded(false), 3000);
      }
    } catch (err) {
      console.error("Add flashcard error:", err);
    } finally {
      setAddingFlashcard(false);
    }
  }

  async function handleGetPreciseAnswer() {
    if (preciseAnswer) {
      setExpanded((prev) => !prev);
      return;
    }

    if (!userId) {
      alert("Please sign in to get precise Gemini interview answers.");
      return;
    }

    try {
      setLoadingPrecise(true);
      setExpanded(true);
      setErrorMsg(null);

      const res = await fetch("/api/precise-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          sessionId,
          question: question.question,
          category: question.category,
          whatTheyTest: question.what_they_test,
        }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setPaywallOpen(true);
        setErrorMsg(data.message || "Free tier limit reached.");
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch precise answer");
      }

      setPreciseAnswer(data.preciseAnswer);
    } catch (err: any) {
      console.error("Precise answer fetch error:", err);
      setErrorMsg(err.message || "Failed to fetch precise answer");
    } finally {
      setLoadingPrecise(false);
    }
  }

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const learningLinks = preciseAnswer?.recommended_reading?.length
    ? preciseAnswer.recommended_reading
    : [
        {
          title: `${question.category} Technical Documentation & Guides`,
          url: `https://www.google.com/search?q=${encodeURIComponent(question.category + " " + question.question + " documentation")}`,
        },
        {
          title: `System & Code Examples: ${question.question.slice(0, 45)}...`,
          url: `https://www.google.com/search?q=${encodeURIComponent(question.question + " architecture examples")}`,
        },
      ];

  const roundInfo = resolveQuestionRound(question);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="bg-paper-raised rounded-xl p-6 border border-slate/10 shadow-[0_4px_24px_-8px_rgba(28,34,48,0.12)] space-y-4 hover:border-slate/30 transition-all"
    >
      {/* Top Header Row with Soft Ambient Timer */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate/10 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-slate font-bold">
            Q{question.num}
          </span>
          <span className="font-mono text-xs font-bold text-focus bg-focus/10 border border-focus/30 px-2.5 py-0.5 rounded uppercase">
            {roundInfo.round_label}
          </span>
          <span className="font-mono text-xs font-semibold text-ink bg-paper px-2.5 py-0.5 rounded uppercase tracking-wide border border-slate/20">
            {question.category}
          </span>
          <div className="flex items-center space-x-1.5 font-mono text-xs font-semibold text-slate bg-paper px-2 py-0.5 rounded border border-slate/20">
            <span className={`w-2 h-2 rounded-full ${difficultyDotColor}`} />
            <span>{question.difficulty}</span>
          </div>
        </div>

        {/* Right Dock: Soft Ambient Timer & Star Bookmark */}
        <div className="flex items-center space-x-3">
          {/* Muted Ambient Timer */}
          <div className="flex items-center space-x-1.5 font-mono text-xs text-slate bg-paper px-3 py-1 rounded-md border border-slate/15">
            <span className="text-[10px]">⏱️</span>
            <span className="font-semibold text-slate/90">{formatTimer(secondsElapsed)}</span>
            <button
              onClick={() => setTimerRunning((p) => !p)}
              className="text-[10px] text-focus hover:underline ml-1"
            >
              {timerRunning ? "Pause" : "Start"}
            </button>
          </div>

          {/* Bookmark Star Toggle */}
          <button
            onClick={toggleBookmark}
            disabled={bookmarking}
            title={bookmarked ? "Remove Bookmark" : "Bookmark Question"}
            className="p-1.5 text-slate hover:text-focus transition-colors focus:outline-none"
          >
            {bookmarked ? (
              <span className="text-highlight text-lg leading-none">★</span>
            ) : (
              <span className="text-slate/40 text-lg leading-none">☆</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Question Body */}
      <div className="space-y-2">
        <h3 className="font-display text-lg font-bold text-ink leading-snug">
          {question.question}
        </h3>
        <p className="text-xs text-slate font-body leading-relaxed">
          <strong className="font-mono uppercase font-semibold text-ink">What they test: </strong>
          {question.what_they_test}
        </p>
      </div>

      {/* 60/40 Split Interactive Workspace (When Active or Dictating) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-paper p-4 rounded-xl border border-slate/10">
        {/* Left Column (60%): Outline & Guidance */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between border-b border-slate/10 pb-2">
            <span className="font-mono text-xs font-bold text-slate uppercase">
              Evaluation Context & Hints
            </span>
            {/* Progressive Hint Button */}
            <button
              onClick={() => setHintLevel((prev) => ((prev + 1) % 3) as 0 | 1 | 2)}
              className="font-mono text-xs font-semibold text-focus bg-focus/10 hover:bg-focus/20 border border-focus/30 px-2.5 py-1 rounded-lg transition-colors flex items-center space-x-1"
            >
              <span>💡 Hint Level: {hintLevel}</span>
            </button>
          </div>

          {/* Layered Progressive Hint Cards */}
          {hintLevel === 1 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-highlight/15 border border-highlight/30 p-3 rounded-lg text-xs text-ink space-y-1 font-body"
            >
              <span className="font-mono text-[11px] font-bold text-ink uppercase">
                💡 Level 1 Constraint Nudge:
              </span>
              <p>Consider multi-datacenter latency, Redis active-active sharding, and token bucket bounds.</p>
            </motion.div>
          )}

          {hintLevel === 2 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-mint/10 border border-mint/20 p-3 rounded-lg text-xs text-ink space-y-1 font-body"
            >
              <span className="font-mono text-[11px] font-bold text-mint uppercase">
                💡 Level 2 Architectural Tip:
              </span>
              <p>Structure response: 1) System SLA & Gateways, 2) Partitioning Math, 3) Graceful degradation when Redis latency &gt; 5ms.</p>
            </motion.div>
          )}

          {/* Answer Outline */}
          <div className="space-y-1.5 text-xs text-ink font-body">
            <span className="font-mono text-[11px] uppercase font-bold text-slate">
              Strong Answer Outline:
            </span>
            <div className="bg-paper-raised p-3 rounded-lg border border-slate/15 leading-relaxed whitespace-pre-line">
              {question.strong_answer_outline}
            </div>
          </div>
        </div>

        {/* Right Column (40%): Voice Dictation & Input Sandbox */}
        <div className="lg:col-span-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate/10 pb-2">
              <span className="font-mono text-xs font-bold text-slate uppercase">
                🎙️ Voice / Practice Sandbox
              </span>
              <button
                onClick={toggleVoiceDictation}
                className={`font-mono text-xs font-bold px-3 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                  voiceActive
                    ? "bg-coral text-white animate-pulse"
                    : "bg-mint/15 text-mint border border-mint/30 hover:bg-mint/25"
                }`}
              >
                <span>{voiceActive ? "Recording..." : "🎙️ Speak Answer"}</span>
              </button>
            </div>

            {/* Live Dictation Waveform & Transcript Input */}
            <textarea
              value={userTranscript}
              onChange={(e) => setUserTranscript(e.target.value)}
              placeholder={
                voiceActive
                  ? "Dictating live answer... speak into your microphone."
                  : "Type or dictation transcript will appear here..."
              }
              className="w-full h-32 p-3 text-xs font-mono bg-paper-raised border border-slate/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-focus resize-none"
            />
          </div>

          <div className="font-mono text-[10px] text-slate flex items-center justify-between">
            <span>{userTranscript.split(/\s+/).filter(Boolean).length} Words</span>
            <span>Web Speech Dictation</span>
          </div>
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleGetPreciseAnswer}
            disabled={loadingPrecise}
            className="bg-focus hover:bg-focus/90 text-white font-mono font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <span>{preciseAnswer ? (expanded ? "Hide SDE4 Answer" : "View SDE4 Model Answer") : "Get Precise SDE4 Answer"}</span>
            <span>{expanded ? "▲" : "▼"}</span>
          </button>

          <button
            onClick={handleAddFlashcard}
            disabled={addingFlashcard}
            className="bg-paper hover:bg-slate/10 text-ink font-mono font-semibold text-xs px-3.5 py-2 rounded-lg border border-slate/20 transition-colors flex items-center space-x-1"
          >
            <span>{cardAdded ? "✓ Added to 5m Deck" : "📌 Add SRS Flashcard"}</span>
          </button>
        </div>

        {/* View Mode Tabs (Code Sandbox / System Design Diagram) */}
        <div className="flex items-center space-x-1 font-mono text-xs">
          <button
            onClick={() => setViewTab("outline")}
            className={`px-2.5 py-1 rounded ${
              viewTab === "outline" ? "bg-slate/15 text-ink font-bold" : "text-slate hover:text-ink"
            }`}
          >
            Outline
          </button>
          <button
            onClick={() => setViewTab("diagram")}
            className={`px-2.5 py-1 rounded ${
              viewTab === "diagram" ? "bg-slate/15 text-ink font-bold" : "text-slate hover:text-ink"
            }`}
          >
            Diagram
          </button>
          <button
            onClick={() => setViewTab("sandbox")}
            className={`px-2.5 py-1 rounded ${
              viewTab === "sandbox" ? "bg-slate/15 text-ink font-bold" : "text-slate hover:text-ink"
            }`}
          >
            Sandbox
          </button>
        </div>
      </div>

      {/* Expandable SDE4 Model Answer & Diagram Drawer */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-4 border-t border-slate/15 space-y-4 overflow-hidden"
          >
            {loadingPrecise ? (
              <SkeletonPreciseAnswer />
            ) : preciseAnswer ? (
              <div className="space-y-4">
                {/* Summary Statement */}
                <div className="bg-mint/10 border border-mint/20 p-4 rounded-xl space-y-1">
                  <span className="font-mono text-xs font-bold text-mint uppercase">
                    Core SDE4 Executive Summary:
                  </span>
                  <p className="text-xs text-ink font-body leading-relaxed font-semibold">
                    {preciseAnswer.summary_statement}
                  </p>
                </div>

                {/* Key Bullet Points */}
                <div className="bg-paper p-4 rounded-xl border border-slate/10 space-y-2">
                  <span className="font-mono text-xs font-bold text-slate uppercase">
                    Staff-Level Evaluation Checklist:
                  </span>
                  <ul className="space-y-1.5 text-xs text-ink font-body">
                    {preciseAnswer.key_bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-mint font-bold">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            {/* Diagram View Tab */}
            {viewTab === "diagram" && (
              <SystemDesignDiagram
                chartCode={question.mermaid_code || generateFallbackMermaidDiagram(question)}
                title={`${question.category} Architecture Diagram`}
              />
            )}

            {/* Code Sandbox View Tab */}
            {viewTab === "sandbox" && (
              <CodeSandboxWidget
                initialCode={question.sample_code_snippet?.code || generateFallbackCodeSnippet(question).code}
                language={question.sample_code_snippet?.language || generateFallbackCodeSnippet(question).language}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        userId={userId}
      />
    </motion.div>
  );
}

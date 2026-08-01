"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PaywallModal } from "@/components/PaywallModal";
import { SkeletonPreciseAnswer } from "@/components/Skeletons";

export interface QuestionData {
  num: number;
  category: string;
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
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [bookmarking, setBookmarking] = useState(false);

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

  // Auto-check if a saved precise answer exists in database on mount or props change
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
        // silent check failure
      }
    }

    checkSavedPreciseAnswer();

    return () => {
      isMounted = false;
    };
  }, [userId, question.question, question.precise_answer]);

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

      // Include precise_answer in bookmark payload if already loaded
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

  async function handleGetPreciseAnswer() {
    // If precise answer has ALREADY been generated/loaded: ONLY toggle visibility locally!
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
      setExpanded(true); // Auto expand drawer to show skeleton while loading
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

  // Recommended Reading Links (Gemini generated or fallback search links)
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="bg-paper-raised rounded-xl p-6 border border-slate/10 shadow-[0_4px_24px_-8px_rgba(28,34,48,0.12)] space-y-4 hover:border-slate/30 transition-all"
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="font-mono text-xs text-slate font-semibold">
            Q{question.num}
          </span>
          <span className="font-mono text-xs font-medium text-ink bg-paper px-2.5 py-1 rounded uppercase tracking-wide">
            {question.category}
          </span>
          <div className="flex items-center space-x-1.5 font-mono text-xs text-slate">
            <span className={`w-2 h-2 rounded-full ${difficultyDotColor}`} />
            <span>{question.difficulty}</span>
          </div>
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
            <span className="text-slate/40 text-lg leading-none hover:text-highlight">☆</span>
          )}
        </button>
      </div>

      {/* Main Question Text */}
      <h3 className="font-body text-base font-medium text-ink leading-relaxed">
        {question.question}
      </h3>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate/10">
        <button
          onClick={() => setExpanded(!expanded)}
          className="font-mono text-xs text-focus hover:underline flex items-center space-x-1"
        >
          <span>{expanded ? "Hide Details" : "View Details & Outline"}</span>
          <span>{expanded ? "↑" : "↓"}</span>
        </button>

        <button
          onClick={handleGetPreciseAnswer}
          disabled={loadingPrecise}
          className={`${
            preciseAnswer
              ? "bg-mint/15 text-mint border-mint/30"
              : "bg-focus/10 hover:bg-focus/20 text-focus border-focus/20"
          } border font-mono text-xs font-semibold px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1.5 disabled:opacity-50`}
        >
          <span>✨</span>
          <span>
            {loadingPrecise
              ? "Asking Gemini..."
              : preciseAnswer
              ? expanded
                ? "Hide Gemini Answer"
                : "View Saved Gemini Answer"
              : "Get Precise Answer from Gemini"}
          </span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-coral/10 border border-coral/20 text-coral font-mono text-xs rounded-md">
          {errorMsg}
        </div>
      )}

      {/* Expandable Details Drawer */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 space-y-4 font-body text-xs text-slate bg-paper p-5 rounded-xl border border-slate/10 overflow-hidden"
          >
            {/* Loading Precise Answer Skeleton */}
            {loadingPrecise && <SkeletonPreciseAnswer />}

            {/* Gemini Precise Model Answer Section */}
            {preciseAnswer && !loadingPrecise && (
              <div className="bg-paper-raised p-4 rounded-lg border border-mint/30 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-mint/20 pb-2">
                  <span className="font-mono text-xs font-bold text-mint uppercase tracking-wider flex items-center space-x-1">
                    <span>✨</span>
                    <span>Gemini Precise Model Answer (Saved)</span>
                  </span>
                  <span className="font-mono text-[10px] text-slate uppercase bg-mint/10 text-mint px-2 py-0.5 rounded">
                    Spoken Ready
                  </span>
                </div>

                <div>
                  <p className="font-mono text-[11px] font-semibold text-slate uppercase mb-1">
                    Executive Summary
                  </p>
                  <p className="text-ink font-medium leading-relaxed">
                    "{preciseAnswer.summary_statement}"
                  </p>
                </div>

                {preciseAnswer.key_bullets && preciseAnswer.key_bullets.length > 0 && (
                  <div>
                    <p className="font-mono text-[11px] font-semibold text-slate uppercase mb-1">
                      Key Talking Points
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-ink/90">
                      {preciseAnswer.key_bullets.map((bullet, idx) => (
                        <li key={idx}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {preciseAnswer.sample_spoken_answer && (
                  <div>
                    <p className="font-mono text-[11px] font-semibold text-focus uppercase mb-1">
                      Sample Verbal Response (Interview Ready)
                    </p>
                    <p className="text-ink/90 italic bg-paper p-3 rounded border border-slate/10 leading-relaxed">
                      "{preciseAnswer.sample_spoken_answer}"
                    </p>
                  </div>
                )}

                {/* Deep-Dive Web Resources Section */}
                {learningLinks && learningLinks.length > 0 && (
                  <div className="pt-2 border-t border-mint/20 space-y-1.5">
                    <p className="font-mono text-[11px] font-semibold text-slate uppercase flex items-center space-x-1">
                      <span>🌐</span>
                      <span>Recommended Deep-Dive Resources:</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {learningLinks.map((item, idx) => (
                        <a
                          key={idx}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 text-[11px] font-mono bg-paper hover:bg-paper/80 text-focus border border-focus/20 px-2.5 py-1 rounded-md transition-colors shadow-2xs group"
                        >
                          <span>🔗</span>
                          <span className="group-hover:underline">{item.title}</span>
                          <span className="text-[10px] text-slate/60">↗</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <p className="font-mono font-semibold uppercase text-ink text-[11px] mb-1">
                What They Are Testing
              </p>
              <p className="text-slate">{question.what_they_test}</p>
            </div>

            <div>
              <p className="font-mono font-semibold uppercase text-mint text-[11px] mb-1">
                Strong Answer Outline
              </p>
              <p className="text-ink leading-relaxed">{question.strong_answer_outline}</p>
            </div>

            {question.red_flags && (
              <div>
                <p className="font-mono font-semibold uppercase text-coral text-[11px] mb-1">
                  Red Flags To Avoid
                </p>
                <p className="text-coral/90">{question.red_flags}</p>
              </div>
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

"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";
import { QuestionCard } from "@/components/QuestionCard";
import { MockInterviewChat } from "@/components/MockInterviewChat";
import { PaywallModal } from "@/components/PaywallModal";
import { SkeletonSessionDetail } from "@/components/Skeletons";
import { TopicBreakdownBar } from "@/components/TopicBreakdownBar";
import { InterviewPipelineTabs, RoundFilter } from "@/components/InterviewPipelineTabs";
import { CopilotModal } from "@/components/CopilotModal";
import { ResumeGapVisualizer } from "@/components/ResumeGapVisualizer";
import { FlashcardReviewModal, FlashcardItem } from "@/components/FlashcardReviewModal";
import { ReadinessGauge } from "@/components/ReadinessGauge";
import { NextBestActionWidget } from "@/components/NextBestActionWidget";
import { getOrGenerateTopics, resolveQuestionRound } from "@/lib/gemini";
import { computeSessionReadiness } from "@/lib/readiness";

const PrintableCheatSheet = dynamic(
  () => import("@/components/PrintableCheatSheet").then((mod) => mod.PrintableCheatSheet),
  { ssr: false }
);

export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;
  const router = useRouter();

  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [mockMode, setMockMode] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [dueFlashcards, setDueFlashcards] = useState<FlashcardItem[]>([]);
  const [showFlashcardsModal, setShowFlashcardsModal] = useState(false);
  const [activeRound, setActiveRound] = useState<RoundFilter>("all");

  // Get More Questions State
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState<string | null>(null);

  const isPaid = profile?.plan === "paid" || process.env.NODE_ENV === "development";

  useEffect(() => {
    async function loadSession() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          setProfile(prof);

          // Fetch single session by ID
          const { data, error } = await supabase
            .from("sessions")
            .select("*")
            .eq("id", sessionId)
            .single();

          if (error) throw error;

          // Self-healing: Ensure session has topics extracted
          const resolvedTopics = getOrGenerateTopics(data);
          const updatedSession = { ...data, topics: resolvedTopics };
          setSession(updatedSession);

          // Asynchronously persist derived topics if missing in database
          if (!data.topics || data.topics.length === 0) {
            (async () => {
              try {
                await supabase
                  .from("sessions")
                  .update({ topics: resolvedTopics })
                  .eq("id", sessionId);
              } catch (err) {
                console.error("Async topics save warning:", err);
              }
            })();
          }

          // Fetch bookmarks & due flashcards
          const [bRes, fcRes] = await Promise.all([
            fetch(`/api/user/bookmarks?userId=${user.id}`),
            fetch(`/api/flashcards?userId=${user.id}`),
          ]);
          if (bRes.ok) {
            const bData = await bRes.json();
            setBookmarks((bData.bookmarks || []).map((b: any) => b.question?.question));
          }
          if (fcRes.ok) {
            const fcData = await fcRes.json();
            setDueFlashcards(fcData.dueCards || []);
          }
        }
      } catch (err) {
        console.error("Session load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [sessionId]);

  function handleStartMockMode() {
    if (!isPaid) {
      setPaywallOpen(true);
    } else {
      router.push(`/dashboard/${sessionId}/mock`);
    }
  }

  async function handleGetMoreQuestions() {
    if (!isPaid) {
      setPaywallOpen(true);
      return;
    }

    try {
      setLoadingMore(true);
      setMoreError(null);

      const res = await fetch("/api/generate/more", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          sessionId: session?.id,
          jobDescription: session?.job_description,
          existingQuestions: session?.questions || [],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && !isPaid) {
          setPaywallOpen(true);
          return;
        }
        throw new Error(data.message || "Failed to generate more questions");
      }

      setSession((prev: any) => ({
        ...prev,
        questions: data.updatedQuestions,
      }));
    } catch (err: any) {
      console.error("Get more questions error:", err);
      setMoreError(err.message || "Failed to generate additional questions.");
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleAssessmentToggle(topicId: string, status: "strong" | "weak") {
    if (!user?.id || !session?.id) return;
    try {
      const current = session.topic_assessments || {};
      const updated = { ...current, [topicId]: status };
      setSession((prev: any) => ({ ...prev, topic_assessments: updated }));

      await supabase
        .from("sessions")
        .update({ topic_assessments: updated })
        .eq("id", session.id);
    } catch (err) {
      console.error("Save topic assessment error:", err);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-paper text-ink">
        <SkeletonSessionDetail />
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-paper text-ink p-8">
        <div className="max-w-xl mx-auto bg-paper-raised rounded-xl p-8 border border-slate/10 text-center space-y-4">
          <h2 className="font-display text-xl font-bold text-ink">Session Not Found</h2>
          <p className="text-slate text-sm font-body">
            This session may have been deleted or does not belong to your account.
          </p>
          <Link href="/dashboard" className="inline-block font-mono text-xs text-focus hover:underline">
            &larr; Return to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const topicsList = session.topics || [];
  const allQuestions = Array.isArray(session.questions) ? session.questions : [];

  const roundCounts: Record<RoundFilter, number> = {
    all: allQuestions.length,
    screening: 0,
    lld_coding: 0,
    hld_system_design: 0,
    behavioral: 0,
  };

  allQuestions.forEach((q: any) => {
    const info = resolveQuestionRound(q);
    if (roundCounts[info.round] !== undefined) {
      roundCounts[info.round]++;
    }
  });

  const displayedQuestions = allQuestions.filter((q: any) => {
    if (activeRound === "all") return true;
    const info = resolveQuestionRound(q);
    return info.round === activeRound;
  });

  return (
    <main className="min-h-screen bg-paper text-ink py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-xs font-mono text-focus hover:underline flex items-center space-x-1">
            <span>&larr;</span>
            <span>Back to Dashboard</span>
          </Link>

          <span className="font-mono text-xs text-slate">
            Saved on {new Date(session.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>

        {/* Daily SRS Flashcards Banner */}
        {dueFlashcards.length > 0 && (
          <div className="bg-focus/10 border border-focus/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono animate-in fade-in duration-200">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-base">⚡</span>
              <span className="font-bold text-ink">
                {dueFlashcards.length} SRS Memory Flashcard{dueFlashcards.length > 1 ? "s" : ""} Due For Morning Review!
              </span>
            </div>
            <button
              onClick={() => setShowFlashcardsModal(true)}
              className="bg-focus text-white px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap"
            >
              Start 5-Min Morning Flashcard Review &rarr;
            </button>
          </div>
        )}

        {/* Cognitive Load Reduction: Next Best Action Engine */}
        <NextBestActionWidget
          interviewDate={profile?.interview_date}
          roleSummary={session.role_summary}
          questions={allQuestions}
          onSelectAction={(actionType) => {
            if (actionType === "mock") {
              handleStartMockMode();
            } else if (actionType === "system_design") {
              setActiveRound("hld_system_design");
            } else if (actionType === "coding") {
              setActiveRound("lld_coding");
            } else if (actionType === "behavioral") {
              setActiveRound("behavioral");
            }
          }}
        />

        {/* Session Readiness Gauge Widget */}
        <ReadinessGauge
          score={computeSessionReadiness(session, profile?.current_streak || 0)}
          interviewDate={profile?.interview_date}
          roleSummary={session.role_summary}
          userId={user?.id}
          onInterviewDateUpdated={(newDate) => setProfile((prev: any) => ({ ...prev, interview_date: newDate }))}
        />

        {/* Role Overview Banner */}
        <div className="bg-paper-raised rounded-2xl p-6 border border-slate/10 shadow-[0_4px_24px_-8px_rgba(28,34,48,0.12)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate/10 pb-4">
            <div>
              <span className="font-mono text-xs font-semibold text-focus bg-focus/10 px-2.5 py-1 rounded uppercase">
                {session.seniority || "Engineer"}
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-2">
                {session.role_summary || "Software Engineering Prep"}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
              <button
                onClick={() => setCopilotOpen(true)}
                className="bg-black text-emerald-400 border border-emerald-500/50 hover:bg-neutral-900 font-mono font-bold px-3.5 py-2 rounded-md transition-all text-xs flex items-center space-x-1.5 shadow-sm"
              >
                <span>⚡</span>
                <span>Live Copilot HUD</span>
              </button>

              <button
                onClick={() => setShowCheatSheet(true)}
                className="bg-paper border border-slate/20 hover:border-focus text-ink font-medium px-3.5 py-2 rounded-md transition-all text-xs flex items-center space-x-1.5 shadow-xs"
              >
                <span>📄</span>
                <span>Print / Export PDF</span>
              </button>

              <button
                onClick={handleStartMockMode}
                className="bg-mint text-white font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity text-xs shadow-sm flex items-center space-x-1.5"
              >
                <span>🎙️ Practice Mock</span>
              </button>
            </div>
          </div>

          {/* Job Description Dropdown */}
          <details className="text-xs font-body text-slate group">
            <summary className="font-mono cursor-pointer text-focus hover:underline font-semibold list-none flex items-center space-x-1">
              <span>View Past Job Description Input</span>
              <span className="group-open:rotate-180 transition-transform">↓</span>
            </summary>
            <div className="mt-3 p-4 bg-paper rounded-lg border border-slate/10 whitespace-pre-wrap font-mono text-[11px] text-slate leading-relaxed max-h-60 overflow-y-auto">
              {session.job_description}
            </div>
          </details>
        </div>

        {/* Topic Breakdown & Self-Assessment Bar */}
        {topicsList.length > 0 && (
          <TopicBreakdownBar
            topics={topicsList}
            questions={session.questions || []}
            sessionId={session.id}
            assessments={session.topic_assessments || {}}
            onAssessmentToggle={handleAssessmentToggle}
          />
        )}

        {/* Resume vs Target JD Skill-Gap Analyzer */}
        <ResumeGapVisualizer jobDescription={session.job_description} />

        {/* Mock Interview vs Question List */}
        {mockMode && session.questions && session.questions.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <h3 className="font-display text-xl font-bold text-ink">
                Live Practice Session
              </h3>
              <button onClick={() => setMockMode(false)} className="text-xs font-mono text-slate hover:text-ink">
                &larr; Exit Mock Practice
              </button>
            </div>

            <MockInterviewChat
              userId={user?.id}
              roleSummary={session.role_summary || "Target Role"}
              firstQuestion={session.questions[0].question}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="font-display text-xl font-bold text-ink">
                Saved Interview Questions ({allQuestions.length})
              </h2>
              <span className="font-mono text-xs text-slate">
                Showing {displayedQuestions.length} of {allQuestions.length} questions
              </span>
            </div>

            {/* Stage-Aware Interview Pipeline Tabs */}
            <InterviewPipelineTabs
              activeRound={activeRound}
              onSelectRound={setActiveRound}
              counts={roundCounts}
            />

            <div className="grid grid-cols-1 gap-4">
              {displayedQuestions.map((q: any, index: number) => (
                <QuestionCard
                  key={index}
                  question={q}
                  userId={user?.id}
                  sessionId={session.id}
                  isBookmarked={bookmarks.includes(q.question)}
                />
              ))}

              {displayedQuestions.length === 0 && (
                <div className="p-8 text-center bg-paper-raised rounded-xl border border-slate/10 space-y-2">
                  <p className="font-display font-semibold text-ink">No questions found for this round</p>
                  <p className="font-mono text-xs text-slate">
                    Try selecting "All Questions" or click "Get More Questions from Gemini" below.
                  </p>
                </div>
              )}
            </div>

            {moreError && (
              <div className="p-3 bg-coral/10 border border-coral/20 text-coral text-xs rounded-md font-mono">
                {moreError}
              </div>
            )}

            {/* Bottom "Get More Questions" & "Export PDF" Row */}
            <div className="pt-6 border-t border-slate/10 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
              <button
                onClick={handleGetMoreQuestions}
                disabled={loadingMore}
                className="bg-focus text-white font-medium px-6 py-3 rounded-lg hover:opacity-90 transition-all shadow-md inline-flex items-center space-x-2 text-sm disabled:opacity-50"
              >
                <span>➕</span>
                <span>
                  {loadingMore
                    ? "Generating 5 More Questions..."
                    : "Get More Questions from Gemini"}
                </span>
                {!isPaid && (
                  <span className="font-mono text-[10px] bg-highlight text-ink font-bold px-1.5 py-0.5 rounded ml-1 uppercase">
                    PRO
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowCheatSheet(true)}
                className="bg-paper-raised border border-slate/20 text-ink font-medium px-5 py-3 rounded-lg hover:border-focus transition-all shadow-sm inline-flex items-center space-x-2 text-sm"
              >
                <span>📄</span>
                <span>Export Cheat Sheet (PDF)</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Cheat Sheet Modal View */}
      {showCheatSheet && (
        <PrintableCheatSheet
          roleSummary={session.role_summary || "Software Engineering Role"}
          seniority={session.seniority || "Engineer"}
          keySkills={session.key_skills || []}
          questions={session.questions || []}
          prepTips={session.prep_tips || []}
          jobDescription={session.job_description}
          createdDate={new Date(session.created_at).toLocaleDateString()}
          interviewDate={profile?.interview_date}
          onClose={() => setShowCheatSheet(false)}
        />
      )}

      {/* Live Copilot HUD Modal View */}
      <CopilotModal
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        roleSummary={session.role_summary || "Target Role"}
        seniority={session.seniority || "Engineer"}
        questions={allQuestions}
      />

      {/* Flashcard Review Modal View */}
      <FlashcardReviewModal
        isOpen={showFlashcardsModal}
        onClose={() => setShowFlashcardsModal(false)}
        cards={dueFlashcards}
        onReviewComplete={() => setDueFlashcards([])}
      />

      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        userId={user?.id}
      />
    </main>
  );
}

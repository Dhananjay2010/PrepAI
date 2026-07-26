"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { QuestionCard } from "@/components/QuestionCard";
import { MockInterviewChat } from "@/components/MockInterviewChat";
import { PaywallModal } from "@/components/PaywallModal";
import { SkeletonSessionDetail } from "@/components/Skeletons";
import { PrintableCheatSheet } from "@/components/PrintableCheatSheet";

export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;

  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [mockMode, setMockMode] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  // Get More Questions State
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState<string | null>(null);

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
          setSession(data);

          // Fetch bookmarks
          const res = await fetch(`/api/user/bookmarks?userId=${user.id}`);
          if (res.ok) {
            const bData = await res.json();
            setBookmarks((bData.bookmarks || []).map((b: any) => b.question?.question));
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
    if (profile?.plan !== "paid") {
      setPaywallOpen(true);
    } else {
      setMockMode(true);
    }
  }

  async function handleGetMoreQuestions() {
    if (profile?.plan !== "paid") {
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
        if (res.status === 403) {
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
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-ink">
                Saved Interview Questions ({session.questions?.length || 0})
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {Array.isArray(session.questions) &&
                session.questions.map((q: any, index: number) => (
                  <QuestionCard
                    key={index}
                    question={q}
                    userId={user?.id}
                    sessionId={session.id}
                    isBookmarked={bookmarks.includes(q.question)}
                  />
                ))}
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
                {profile?.plan !== "paid" && (
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

      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        userId={user?.id}
      />
    </main>
  );
}

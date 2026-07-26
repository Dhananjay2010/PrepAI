"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { JDInput } from "@/components/JDInput";
import { QuestionCard, QuestionData } from "@/components/QuestionCard";
import { UserNav } from "@/components/UserNav";
import { PaywallModal } from "@/components/PaywallModal";
import { MockInterviewChat } from "@/components/MockInterviewChat";
import { GuestLandingPage } from "@/components/GuestLandingPage";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generation Results State
  const [generationResult, setGenerationResult] = useState<{
    role_summary?: string;
    seniority?: string;
    key_skills?: string[];
    questions?: QuestionData[];
    prep_tips?: string[];
    jobDescription?: string;
  } | null>(null);

  // UI Modes
  const [mockMode, setMockMode] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // Get More Questions State
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setProfile(prof);

        // Load bookmarks
        const res = await fetch(`/api/user/bookmarks?userId=${user.id}`);
        if (res.ok) {
          const bData = await res.json();
          setBookmarks((bData.bookmarks || []).map((b: any) => b.question?.question));
        }
      }
    }
    loadUser();
  }, []);

  async function handleGenerate(jobDescription: string) {
    try {
      setLoading(true);
      setError(null);
      setMockMode(false);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          userId: user?.id,
        }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setPaywallOpen(true);
        setError(data.error || "Daily free limit reached.");
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setGenerationResult({
        ...data,
        jobDescription,
      });
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "Failed to generate interview questions. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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
          jobDescription: generationResult?.jobDescription,
          existingQuestions: generationResult?.questions || [],
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

      setGenerationResult((prev: any) => ({
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

  // Unauthenticated guests see the GuestLandingPage exclusively until signed in!
  if (!user) {
    return <GuestLandingPage />;
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      {/* Navbar Header */}
      <header className="bg-paper-raised border-b border-slate/10 py-4 px-6 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-display text-2xl font-bold text-ink">PrepAI</span>
            <span className="font-mono text-xs font-semibold uppercase bg-highlight/20 text-ink px-2 py-0.5 rounded">
              Beta
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {profile?.current_streak > 0 && (
              <div className="flex items-center space-x-1 font-mono text-xs font-bold bg-highlight/20 text-ink px-2.5 py-1 rounded-full">
                <span>🔥</span>
                <span>{profile.current_streak} Day Streak</span>
              </div>
            )}

            <UserNav
              user={user}
              profile={profile}
              onOpenPaywall={() => setPaywallOpen(true)}
            />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        {/* Signature Split Hero View */}
        {!generationResult && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start py-6">
            {/* Left Hero Column */}
            <div className="space-y-6">
              <div className="space-y-3">
                <span className="font-mono text-xs font-semibold uppercase text-focus bg-focus/10 px-2.5 py-1 rounded">
                  Readiness, Made Visible
                </span>
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink leading-tight">
                  Walk into your interview feeling ready, not anxious.
                </h1>
                <p className="font-body text-slate text-base leading-relaxed">
                  Paste any job description. PrepAI analyzes the exact tech stack and seniority level to generate the targeted questions, model answers, and red flags you will face.
                </p>
              </div>

              <JDInput onGenerate={handleGenerate} loading={loading} />
            </div>

            {/* Right Signature Hero Graphic: Transformation Preview */}
            <div className="relative bg-paper-raised rounded-2xl p-6 border border-slate/10 shadow-[0_4px_24px_-8px_rgba(28,34,48,0.12)] space-y-4 overflow-hidden min-h-[420px] flex flex-col justify-between">
              {/* Animated Scan Line */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-highlight/30 to-transparent pointer-events-none"
              />

              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between border-b border-slate/10 pb-3">
                  <span className="font-mono text-xs text-slate uppercase">Live Parsing Preview</span>
                  <span className="font-mono text-xs font-semibold text-mint">Senior Backend Role</span>
                </div>

                <div className="space-y-3 opacity-90">
                  <div className="bg-paper p-3.5 rounded-lg border border-slate/10 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-focus font-semibold uppercase">SYSTEM DESIGN</span>
                      <span className="w-2 h-2 rounded-full bg-highlight" />
                    </div>
                    <p className="font-body text-xs font-medium text-ink">
                      How would you architect a rate-limiting middleware for microservices handling 50k req/sec?
                    </p>
                  </div>

                  <div className="bg-paper p-3.5 rounded-lg border border-slate/10 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-focus font-semibold uppercase">TECHNICAL</span>
                      <span className="w-2 h-2 rounded-full bg-mint" />
                    </div>
                    <p className="font-body text-xs font-medium text-ink">
                      Explain PostgreSQL index types and when you choose B-Tree over GIN for JSONB payloads.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate/10 relative z-10">
                <p className="font-mono text-xs text-slate text-center">
                  ✨ Instant question extraction powered by Google Gemini API
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading Stagger Skeletons */}
        {loading && (
          <div className="max-w-3xl mx-auto py-12 space-y-6 text-center">
            <div className="space-y-2">
              <span className="font-mono text-xs text-focus uppercase tracking-wider font-semibold animate-pulse">
                Parsing Tech Stack & Seniority...
              </span>
              <h2 className="font-display text-2xl font-bold text-ink">
                Generating Tailored Questions
              </h2>
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-paper-raised rounded-xl p-6 border border-slate/10 space-y-3 text-left"
                >
                  <div className="h-4 bg-slate/10 rounded w-1/4 animate-pulse" />
                  <div className="h-5 bg-slate/10 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-slate/10 rounded w-1/2 animate-pulse" />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && !loading && (
          <div className="max-w-3xl mx-auto p-4 bg-coral/10 border border-coral/20 text-coral text-sm rounded-xl font-body">
            {error}
          </div>
        )}

        {/* Generation Results View */}
        {generationResult && !loading && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Role Header Banner */}
            <div className="bg-paper-raised rounded-2xl p-6 border border-slate/10 shadow-[0_4px_24px_-8px_rgba(28,34,48,0.12)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate/10 pb-4">
                <div>
                  <span className="font-mono text-xs font-semibold text-focus bg-focus/10 px-2.5 py-1 rounded uppercase">
                    {generationResult.seniority || "Software Engineer"}
                  </span>
                  <h2 className="font-display text-2xl font-bold text-ink mt-2">
                    {generationResult.role_summary || "Target Role Questions"}
                  </h2>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleStartMockMode}
                    className="bg-mint text-white font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity text-sm shadow-sm flex items-center space-x-1.5"
                  >
                    <span>🎙️ Practice Mock Interview</span>
                  </button>
                  <button
                    onClick={() => setGenerationResult(null)}
                    className="text-xs font-mono text-slate hover:text-ink"
                  >
                    Start New JD &rarr;
                  </button>
                </div>
              </div>

              {/* Key Skills Tags */}
              {generationResult.key_skills && generationResult.key_skills.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-slate">Key Technologies:</span>
                  {generationResult.key_skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="font-mono text-xs bg-paper text-ink px-2.5 py-1 rounded border border-slate/10"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Mock Interview View Mode vs Question Cards List */}
            {mockMode && generationResult.questions && generationResult.questions.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                  <h3 className="font-display text-xl font-bold text-ink">
                    Live Mock Practice Session
                  </h3>
                  <button
                    onClick={() => setMockMode(false)}
                    className="text-xs font-mono text-slate hover:text-ink"
                  >
                    &larr; Exit Mock Mode
                  </button>
                </div>

                <MockInterviewChat
                  userId={user?.id}
                  roleSummary={generationResult.role_summary || "Target Role"}
                  firstQuestion={generationResult.questions[0].question}
                />
              </div>
            ) : (
              /* Question List */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-bold text-ink">
                    Generated Interview Questions ({generationResult.questions?.length || 0})
                  </h3>
                  {profile?.plan !== "paid" && (
                    <span className="font-mono text-xs text-slate">
                      Showing Free Questions (Upgrade Pro for Unlimited Expansion)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {generationResult.questions?.map((q, index) => (
                    <QuestionCard
                      key={index}
                      question={q}
                      userId={user?.id}
                      isBookmarked={bookmarks.includes(q.question)}
                    />
                  ))}
                </div>

                {moreError && (
                  <div className="p-3 bg-coral/10 border border-coral/20 text-coral text-xs rounded-md font-mono">
                    {moreError}
                  </div>
                )}

                {/* Bottom "Get More Questions" Button */}
                <div className="pt-6 border-t border-slate/10 text-center">
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
                  <p className="text-xs text-slate font-mono mt-2">
                    {profile?.plan === "paid"
                      ? "Pro Plan Active — Generate unlimited additional questions for this role"
                      : "Upgrade to Pro for unlimited question expansion"}
                  </p>
                </div>

                {/* Prep Tips */}
                {generationResult.prep_tips && generationResult.prep_tips.length > 0 && (
                  <div className="bg-paper-raised rounded-xl p-6 border border-slate/10 space-y-3 mt-8">
                    <h4 className="font-mono text-xs font-semibold uppercase text-focus">
                      Senior Preparation Recommendations
                    </h4>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-slate font-body">
                      {generationResult.prep_tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        userId={user?.id}
      />
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { PaywallModal } from "@/components/PaywallModal";
import { computeReadinessScore } from "@/lib/readiness";
import { QuestionCard } from "@/components/QuestionCard";
import { UserNav } from "@/components/UserNav";
import { SkeletonDashboard } from "@/components/Skeletons";
import { ReadinessGauge } from "@/components/ReadinessGauge";
import { CountdownCurriculumWidget } from "@/components/CountdownCurriculumWidget";
import { DailyHeroDockWidget } from "@/components/DailyHeroDockWidget";
import { NextBestActionWidget } from "@/components/NextBestActionWidget";
import { FlashcardReviewModal, FlashcardItem } from "@/components/FlashcardReviewModal";
import { EmergencySprintModal } from "@/components/EmergencySprintModal";
import { CompetencyRadarWidget } from "@/components/CompetencyRadarWidget";
import { FeedbackDiffCard } from "@/components/FeedbackDiffCard";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Emergency Sprint Launch Modal state
  const [showSprintModal, setShowSprintModal] = useState(false);

  // Bookmarks Filter state
  const [activeBookmarkRound, setActiveBookmarkRound] = useState<string>("all");
  const [bookmarkSearch, setBookmarkSearch] = useState<string>("");

  // Interview Date state
  const [interviewDate, setInterviewDate] = useState<string>("");
  const [savingDate, setSavingDate] = useState(false);

  // SRS Flashcard Review state
  const [dueFlashcards, setDueFlashcards] = useState<FlashcardItem[]>([]);
  const [showFlashcardsModal, setShowFlashcardsModal] = useState(false);
  const [isMorningWarmup, setIsMorningWarmup] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          // Fetch user profile
          const { data: prof } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          setProfile(prof);
          if (prof?.interview_date) {
            setInterviewDate(prof.interview_date);
          }

          // Fetch sessions via robust server API route with fallback
          let fetchedSessions: any[] = [];
          try {
            const sessRes = await fetch(`/api/user/sessions?userId=${user.id}`);
            if (sessRes.ok) {
              const sessJson = await sessRes.json();
              fetchedSessions = sessJson.sessions || [];
            }
          } catch (fetchErr) {
            console.warn("Server API fetch warning, trying client fallback:", fetchErr);
          }

          if (fetchedSessions.length === 0) {
            const { data: sessData } = await supabase
              .from("sessions")
              .select("*")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false });
            fetchedSessions = sessData || [];
          }

          // Check localStorage client cache as additional safety fallback
          if (typeof window !== "undefined") {
            try {
              const localCacheStr = localStorage.getItem("prepai_saved_sessions");
              if (localCacheStr) {
                const localCache = JSON.parse(localCacheStr);
                const existingIds = new Set(fetchedSessions.map((s) => s.id));
                localCache.forEach((localSess: any) => {
                  if (localSess.id && !existingIds.has(localSess.id)) {
                    fetchedSessions.push(localSess);
                  }
                });
              }
            } catch (cacheErr) {
              // silent local cache parse ignore
            }
          }

          setSessions(fetchedSessions);

          // Fetch bookmarks & due flashcards in parallel
          const [bRes, fcRes] = await Promise.all([
            fetch(`/api/user/bookmarks?userId=${user.id}`),
            fetch(`/api/flashcards?userId=${user.id}`),
          ]);
          if (bRes.ok) {
            const bData = await bRes.json();
            setBookmarks(bData.bookmarks || []);
          }
          if (fcRes.ok) {
            const fcData = await fcRes.json();
            const cards = fcData.dueCards || [];
            setDueFlashcards(cards);
            if (cards.length > 0) {
              // Trigger morning warmup re-entry modal automatically if cards exist
              setIsMorningWarmup(true);
              setShowFlashcardsModal(true);
            }
          }
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, []);

  async function handleSaveInterviewDate(newDate: string) {
    setInterviewDate(newDate);
    if (!user?.id) return;

    try {
      setSavingDate(true);
      const res = await fetch("/api/user/interview-date", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, interviewDate: newDate }),
      });

      if (res.ok) {
        setProfile((prev: any) => ({ ...prev, interview_date: newDate }));
        setActionMessage("Target interview date saved.");
      }
    } catch (err) {
      console.error("Save interview date error:", err);
    } finally {
      setSavingDate(false);
    }
  }

  async function handleCancelSubscription() {
    if (!user?.id || !profile?.razorpay_subscription_id) return;
    if (!confirm("Are you sure you want to cancel your Pro subscription?")) return;

    try {
      const res = await fetch("/api/razorpay/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          subscriptionId: profile.razorpay_subscription_id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cancellation failed");

      setActionMessage("Subscription cancelled successfully.");
      setProfile((prev: any) => ({ ...prev, plan: "free", subscription_status: "cancelled" }));
    } catch (err: any) {
      alert(err.message || "Failed to cancel subscription.");
    }
  }

  async function handleDeleteData() {
    if (!user?.id) return;
    if (!confirm("Are you sure you want to delete all your saved prep sessions? This action cannot be undone.")) return;

    try {
      const res = await fetch("/api/user/delete-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!res.ok) throw new Error("Deletion failed");

      setSessions([]);
      setBookmarks([]);
      setActionMessage("All your saved prep sessions have been deleted.");
    } catch (err: any) {
      alert(err.message || "Failed to delete data.");
    }
  }

  const handleLaunchSprintPreset = (preset: any) => {
    setShowSprintModal(false);
    if (sessions[0]?.id) {
      window.location.href = `/dashboard/${sessions[0].id}`;
    } else {
      window.location.href = "/";
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-paper text-ink">
        <SkeletonDashboard />
      </main>
    );
  }

  const isPaid = profile?.plan === "paid" || process.env.NODE_ENV === "development";
  const displayedSessions = isPaid ? sessions : sessions.slice(0, 1);

  // Calculate Readiness Score across sessions
  const allCategories = sessions.flatMap((s) =>
    Array.isArray(s.questions) ? s.questions.map((q: any) => q.category) : []
  );
  const readinessScore = computeReadinessScore(allCategories, []);

  return (
    <main className="min-h-screen bg-paper text-ink py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Top Header Row with Streak & Nav */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate/10 pb-6">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="font-display text-3xl font-bold text-ink">
                Emergency Prep Cockpit
              </h1>
              {profile?.current_streak > 0 && (
                <div
                  title={`${profile.current_streak} Day Practice Streak`}
                  className="flex items-center space-x-1 font-mono text-xs font-bold bg-highlight/20 text-ink px-2.5 py-1 rounded-full border border-highlight/40"
                >
                  <span>🔥</span>
                  <span>{profile.current_streak} Day Streak</span>
                </div>
              )}
            </div>
            <p className="text-slate text-sm mt-1 font-body">
              Microsoft SDE4 Targeted Sprint Platform • 3-Day Countdown Window.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSprintModal(true)}
              className="inline-flex items-center justify-center bg-focus text-white font-mono font-bold px-4 py-2.5 rounded-xl hover:bg-focus/90 transition-all text-sm shadow-md"
            >
              ⚡ Launch Sprint (Space)
            </button>
            <UserNav
              user={user}
              profile={profile}
              onOpenPaywall={() => setPaywallOpen(true)}
            />
          </div>
        </div>

        {actionMessage && (
          <div className="p-4 bg-mint/10 border border-mint/20 text-mint font-mono text-xs rounded-xl flex items-center justify-between">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="text-slate hover:text-ink">
              &times;
            </button>
          </div>
        )}

        {/* Emergency Hero Dock Widget */}
        <DailyHeroDockWidget
          streakDays={profile?.current_streak || 1}
          interviewDate={interviewDate}
          dueFlashcardsCount={dueFlashcards.length}
          unmasteredTopicsCount={allCategories.length > 0 ? 3 : 0}
          recentSessionId={sessions[0]?.id}
          recentRoleSummary={sessions[0]?.role_summary}
          targetCompany="Microsoft"
          targetRole="SDE4"
          readinessScore={readinessScore}
          onStartEmergencySprint={() => setShowSprintModal(true)}
          onStartFlashcardReview={() => {
            setIsMorningWarmup(false);
            setShowFlashcardsModal(true);
          }}
          onLaunchTopicDrill={(topic) => setShowSprintModal(true)}
        />

        {/* Competency Radar Widget: Trajectory & Sparklines */}
        <CompetencyRadarWidget
          onLaunchDrill={(topic) => setShowSprintModal(true)}
        />

        {/* Cognitive Load Reduction: Next Best Action Engine */}
        <NextBestActionWidget
          interviewDate={interviewDate}
          roleSummary={sessions[0]?.role_summary}
          questions={sessions.flatMap((s) => s.questions || [])}
          onSelectAction={(actionType) => setShowSprintModal(true)}
        />

        {/* SDE4 Evaluation Benchmark Sample Feedback Card */}
        {sessions.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-ink">
              Latest Question Benchmark Feedback
            </h2>
            <FeedbackDiffCard
              verdict="Strong Hire"
              targetRoleLevel="Microsoft SDE4"
              overallScore={84}
              onNextQuestion={() => setShowSprintModal(true)}
            />
          </div>
        )}

        {/* AI Readiness Gauge & Target Countdown */}
        <ReadinessGauge
          score={readinessScore}
          interviewDate={interviewDate}
          roleSummary={sessions[0]?.role_summary}
          userId={user?.id}
          onInterviewDateUpdated={(newDate) => setInterviewDate(newDate)}
        />

        {/* 7-Day Blitz Daily Curriculum Checklist */}
        <CountdownCurriculumWidget />

        {/* Bookmarked Questions Tab Section */}
        {bookmarks && bookmarks.length > 0 && (() => {
          const resolveRound = (q: any) => {
            const cat = (q?.category || "").toLowerCase();
            const text = ((q?.question || "") + " " + (q?.what_they_test || "")).toLowerCase();
            if (cat.includes("behavioural") || cat.includes("behavioral") || text.includes("tell me about a time")) return "behavioral";
            if (cat.includes("system design") || cat.includes("architecture") || text.includes("design a")) return "hld_system_design";
            if (cat.includes("screening") || text.includes("elevator pitch")) return "screening";
            return "lld_coding";
          };

          const filtered = bookmarks.filter((b: any) => {
            const q = b.question || {};
            const round = resolveRound(q);
            if (activeBookmarkRound !== "all" && round !== activeBookmarkRound) return false;
            if (bookmarkSearch.trim()) {
              const query = bookmarkSearch.toLowerCase();
              const matchQ = q.question?.toLowerCase().includes(query);
              const matchCat = q.category?.toLowerCase().includes(query);
              if (!matchQ && !matchCat) return false;
            }
            return true;
          });

          return (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="font-display text-xl font-bold text-ink flex items-center space-x-2">
                  <span className="text-highlight">★</span>
                  <span>Bookmarked Questions ({bookmarks.length})</span>
                </h2>
                <span className="font-mono text-xs text-slate">
                  Quick Revision Vault
                </span>
              </div>

              {/* Round Category Filter Pills & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-paper-raised p-3 rounded-xl border border-slate/10 font-mono text-xs">
                <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
                  {[
                    { id: "all", label: "All Bookmarks" },
                    { id: "screening", label: "Round 1: Screening" },
                    { id: "lld_coding", label: "Round 2: LLD & Coding" },
                    { id: "hld_system_design", label: "Round 3: System Design" },
                    { id: "behavioral", label: "Round 4: Behavioral" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveBookmarkRound(tab.id)}
                      className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                        activeBookmarkRound === tab.id
                          ? "bg-focus text-white font-bold"
                          : "bg-paper text-slate hover:text-ink"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={bookmarkSearch}
                  onChange={(e) => setBookmarkSearch(e.target.value)}
                  placeholder="🔍 Search bookmarks..."
                  className="bg-paper border border-slate/20 rounded-lg px-3 py-1 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-focus max-w-xs"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filtered.map((b: any, index: number) => (
                  <QuestionCard
                    key={index}
                    question={b.question}
                    userId={user?.id}
                    isBookmarked={true}
                    onBookmarkToggle={() => {
                      setBookmarks((prev) => prev.filter((item) => item.id !== b.id));
                    }}
                  />
                ))}

                {filtered.length === 0 && (
                  <div className="p-6 text-center bg-paper-raised rounded-xl border border-slate/10 space-y-1 font-mono text-xs text-slate">
                    <p>No bookmarked questions found matching this filter.</p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Sessions History List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-ink">
              Your Saved Prep Sessions ({sessions.length})
            </h2>
            <span className="font-mono text-xs text-slate">
              History
            </span>
          </div>

          {sessions.length === 0 ? (
            <div className="bg-paper-raised rounded-xl p-8 border border-slate/10 text-center space-y-3">
              <p className="text-slate text-sm font-body">
                You haven't generated any interview sessions yet.
              </p>
              <Link
                href="/"
                className="inline-block bg-focus text-white font-mono text-xs px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
              >
                + Generate First Session
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {displayedSessions.map((s) => (
                <Link
                  key={s.id}
                  href={`/dashboard/${s.id}`}
                  className="block bg-paper-raised hover:bg-paper-raised/80 rounded-xl p-5 border border-slate/10 hover:border-slate/30 transition-all shadow-xs group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-semibold uppercase bg-focus/10 text-focus px-2 py-0.5 rounded">
                          {s.seniority || "Engineer"}
                        </span>
                        <span className="font-mono text-xs text-slate">
                          {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      <h3 className="font-display text-base font-bold text-ink group-hover:text-focus transition-colors">
                        {s.role_summary || "Software Engineering Role"}
                      </h3>
                      <p className="text-xs font-mono text-slate">
                        {Array.isArray(s.questions) ? `${s.questions.length} Questions Generated` : "Saved Session"}
                      </p>
                    </div>

                    <span className="font-mono text-xs text-focus font-semibold group-hover:translate-x-1 transition-transform self-end sm:self-auto">
                      View Session &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Account Settings Section */}
        <div className="bg-paper-raised rounded-xl p-6 border border-slate/10 shadow-[0_4px_24px_-8px_rgba(28,34,48,0.12)] space-y-6">
          <h2 className="font-display text-xl font-semibold text-ink border-b border-slate/10 pb-3">
            Account Settings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-body">
            <div>
              <p className="text-xs font-mono text-slate uppercase">Account Email</p>
              <p className="font-medium text-ink mt-0.5">{user?.email || "Guest User"}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-slate uppercase">Subscription Plan</p>
              <div className="flex items-center space-x-2 mt-0.5">
                <span
                  className={`font-mono text-xs font-semibold px-2.5 py-0.5 rounded ${
                    isPaid ? "bg-mint/15 text-mint" : "bg-slate/10 text-slate"
                  }`}
                >
                  {isPaid ? (process.env.NODE_ENV === "development" ? "PRO PLAN — ACTIVE (DEV)" : "PRO PLAN — ACTIVE") : "FREE TIER"}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate/10 flex flex-wrap items-center justify-between gap-4">
            {!isPaid ? (
              <button
                onClick={() => setPaywallOpen(true)}
                className="bg-focus text-white font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity text-sm shadow-sm"
              >
                Upgrade to Pro (₹299/mo)
              </button>
            ) : (
              <button
                onClick={handleCancelSubscription}
                className="text-xs font-mono text-coral hover:underline"
              >
                Cancel Subscription
              </button>
            )}

            <button
              onClick={handleDeleteData}
              className="text-xs font-mono text-coral hover:underline"
            >
              Delete All My Data
            </button>
          </div>
        </div>
      </motion.div>

      {/* Emergency Sprint Launch Preset Modal */}
      <EmergencySprintModal
        isOpen={showSprintModal}
        onClose={() => setShowSprintModal(false)}
        onLaunch={handleLaunchSprintPreset}
        targetCompany="Microsoft"
        targetRole="SDE4"
      />

      {/* Flashcard Review SRS Modal */}
      <FlashcardReviewModal
        isOpen={showFlashcardsModal}
        onClose={() => setShowFlashcardsModal(false)}
        cards={dueFlashcards}
        onReviewComplete={() => setDueFlashcards([])}
        isMorningWarmup={isMorningWarmup}
      />

      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        userId={user?.id}
      />
    </main>
  );
}

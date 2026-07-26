"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { PaywallModal } from "@/components/PaywallModal";
import { computeReadinessScore } from "@/lib/readiness";
import { QuestionCard } from "@/components/QuestionCard";
import { UserNav } from "@/components/UserNav";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Interview Date state
  const [interviewDate, setInterviewDate] = useState<string>("");
  const [savingDate, setSavingDate] = useState(false);

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

          // Fetch sessions
          const { data: sessData } = await supabase
            .from("sessions")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          setSessions(sessData || []);

          // Fetch bookmarks
          const res = await fetch(`/api/user/bookmarks?userId=${user.id}`);
          if (res.ok) {
            const bData = await res.json();
            setBookmarks(bData.bookmarks || []);
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
    if (!profile?.razorpay_subscription_id || !user?.id) return;
    if (!confirm("Are you sure you want to cancel your Pro subscription? You will retain access until the end of your billing period.")) return;

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

  const isPaid = profile?.plan === "paid";
  const displayedSessions = isPaid ? sessions : sessions.slice(0, 1);

  // 1. Calculate Readiness Score across sessions
  const allCategories = sessions.flatMap((s) =>
    Array.isArray(s.questions) ? s.questions.map((q: any) => q.category) : []
  );
  const readinessScore = computeReadinessScore(allCategories, []);

  // 2. Countdown Calculation
  let daysLeft: number | null = null;
  if (interviewDate) {
    const target = new Date(interviewDate);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return (
    <main className="min-h-screen bg-paper text-ink py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header Row with Streak & Nav */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate/10 pb-6">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="font-display text-3xl font-bold text-ink">
                Your Prep Dashboard
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
              Track readiness, review saved questions, and manage target dates.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-focus text-white font-medium px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity text-sm shadow-sm"
            >
              + New Prep Session
            </Link>
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

        {/* Top Metrics Row: Readiness Score & Interview Countdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Readiness Score Card */}
          <div className="bg-paper-raised rounded-xl p-6 border border-slate/10 shadow-[0_4px_24px_-8px_rgba(28,34,48,0.12)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-slate uppercase">
                Overall Readiness Score
              </span>
              <span className="font-mono text-xs text-mint font-bold">
                {readinessScore >= 80 ? "High Preparedness" : readinessScore >= 50 ? "Moderate" : "Building Foundation"}
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="font-display text-5xl font-bold text-mint">
                {readinessScore}
              </span>
              <span className="font-mono text-slate text-sm">/ 100</span>
            </div>
            <div className="w-full bg-paper rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-mint h-2.5 transition-all duration-500 rounded-full"
                style={{ width: `${readinessScore}%` }}
              />
            </div>
            <p className="text-xs text-slate font-body">
              Calculated across {allCategories.length} questions in {new Set(allCategories).size} technical categories.
            </p>
          </div>

          {/* Interview Countdown Card */}
          <div className="bg-paper-raised rounded-xl p-6 border border-slate/10 shadow-[0_4px_24px_-8px_rgba(28,34,48,0.12)] space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs font-semibold text-slate uppercase">
                  Target Interview Countdown
                </span>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => handleSaveInterviewDate(e.target.value)}
                  className="font-mono text-xs bg-paper border border-slate/20 rounded px-2 py-1 text-ink focus:outline-none focus:ring-1 focus:ring-focus"
                />
              </div>

              {daysLeft !== null ? (
                <div>
                  <div className="flex items-baseline space-x-2 mt-2">
                    <span className="font-display text-4xl font-bold text-ink">
                      {daysLeft > 0 ? daysLeft : 0}
                    </span>
                    <span className="font-mono text-slate text-sm">
                      Days Remaining
                    </span>
                  </div>
                  {daysLeft <= 3 && daysLeft >= 0 && (
                    <p className="text-xs font-mono font-semibold text-coral mt-2">
                      ⚠️ {daysLeft} days left — focus on your weakest categories!
                    </p>
                  )}
                  {daysLeft < 0 && (
                    <p className="text-xs font-mono text-slate mt-2">
                      Interview target date passed. Set a new date above.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate font-body mt-2">
                  Select your upcoming interview date to enable personalized urgency countdown messaging.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bookmarked Questions Section */}
        {bookmarks.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-ink">
                Bookmarked Questions ({bookmarks.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {bookmarks.map((bm, index) => (
                <QuestionCard
                  key={bm.id || index}
                  question={bm.question}
                  userId={user?.id}
                  isBookmarked={true}
                  onBookmarkToggle={(isBm) => {
                    if (!isBm) {
                      setBookmarks((prev) => prev.filter((b) => b.id !== bm.id));
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Saved Sessions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-ink">
              Saved Sessions History
            </h2>
            <span className="font-mono text-xs text-slate">
              {sessions.length} Session{sessions.length === 1 ? "" : "s"} Total
            </span>
          </div>

          {loading ? (
            <div className="bg-paper-raised rounded-xl p-8 text-center text-slate font-mono text-xs border border-slate/10">
              Loading session history...
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-paper-raised rounded-xl p-8 text-center space-y-3 border border-slate/10 shadow-[0_4px_24px_-8px_rgba(28,34,48,0.12)]">
              <p className="text-slate font-body text-sm">
                No prep sessions saved yet — paste a job description on the home page to get started.
              </p>
              <Link
                href="/"
                className="inline-block font-mono text-xs text-focus hover:underline"
              >
                Paste a Job Description &rarr;
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/dashboard/${session.id}`}
                  className="block bg-paper-raised rounded-xl p-5 border border-slate/10 shadow-[0_4px_24px_-8px_rgba(28,34,48,0.12)] hover:border-focus/50 hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[11px] font-semibold text-focus bg-focus/10 px-2 py-0.5 rounded uppercase">
                          {session.seniority || "Engineer"}
                        </span>
                        <span className="font-mono text-xs text-slate">
                          {new Date(session.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="font-display text-base font-semibold text-ink group-hover:text-focus transition-colors">
                        {session.role_summary || "Software Engineering Role"}
                      </p>
                      <p className="text-xs text-slate line-clamp-1 font-body">
                        {session.job_description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3 text-xs font-mono text-focus font-medium">
                      <span>
                        {Array.isArray(session.questions) ? session.questions.length : 0} Questions
                      </span>
                      <span>&rarr;</span>
                    </div>
                  </div>
                </Link>
              ))}

              {!isPaid && sessions.length > 1 && (
                <div className="bg-paper-raised/80 rounded-xl p-5 border border-dashed border-focus/30 text-center space-y-2">
                  <p className="text-xs font-mono text-slate">
                    + {sessions.length - 1} older session{sessions.length - 1 === 1 ? "" : "s"} hidden on Free plan.
                  </p>
                  <button
                    onClick={() => setPaywallOpen(true)}
                    className="font-mono text-xs text-focus font-semibold hover:underline"
                  >
                    Upgrade to Pro to view full history &rarr;
                  </button>
                </div>
              )}
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
                  {isPaid ? "PRO PLAN — ACTIVE" : "FREE TIER"}
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
              className="text-xs font-mono text-slate hover:text-coral transition-colors"
            >
              Delete My Saved Data
            </button>
          </div>
        </div>
      </div>

      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        userId={user?.id}
      />
    </main>
  );
}

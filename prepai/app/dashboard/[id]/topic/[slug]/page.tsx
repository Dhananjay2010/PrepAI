"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { QuestionCard } from "@/components/QuestionCard";
import { TopicData, getOrGenerateTopics } from "@/lib/gemini";
import { SkeletonSessionDetail } from "@/components/Skeletons";

export default function TopicDetailPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;
  const topicSlug = resolvedParams.slug;

  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [topic, setTopic] = useState<TopicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<"strong" | "weak" | null>(null);

  useEffect(() => {
    async function loadTopicData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          const { data, error } = await supabase
            .from("sessions")
            .select("*")
            .eq("id", sessionId)
            .single();

          if (error) throw error;
          setSession(data);

          // Find topic matching slug using robust getOrGenerateTopics
          const topicsList: TopicData[] = getOrGenerateTopics(data);
          const found = topicsList.find(
            (t) => t.id === topicSlug || t.title.toLowerCase().replace(/[^a-z0-9]/g, "-") === topicSlug
          );

          if (found) {
            setTopic(found);
          } else {
            const fallbackTitle = topicSlug.replace(/-/g, " ");
            setTopic({
              id: topicSlug,
              title: fallbackTitle.toUpperCase(),
              description: `Deep-dive study module for ${fallbackTitle}.`,
              importance: "High",
              core_concepts: ["Core Architecture & Fundamentals", "Performance Trade-offs", "Production Resilience"],
              learning_resources: [
                {
                  title: `${fallbackTitle} Official Docs & Guides`,
                  url: `https://www.google.com/search?q=${encodeURIComponent(fallbackTitle + " documentation")}`,
                },
              ],
            });
          }

          // Load assessment status
          const savedAssessments = data.topic_assessments || {};
          if (savedAssessments[topicSlug]) {
            setAssessment(savedAssessments[topicSlug]);
          }
        }
      } catch (err) {
        console.error("Topic load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTopicData();
  }, [sessionId, topicSlug]);

  async function handleToggleAssessment(newStatus: "strong" | "weak") {
    const updated = assessment === newStatus ? null : newStatus;
    setAssessment(updated);

    if (!user?.id || !session?.id) return;

    try {
      const currentAssessments = session.topic_assessments || {};
      const updatedAssessments = { ...currentAssessments, [topicSlug]: updated };

      await supabase
        .from("sessions")
        .update({ topic_assessments: updatedAssessments })
        .eq("id", session.id);
    } catch (err) {
      console.error("Save assessment error:", err);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-paper text-ink">
        <SkeletonSessionDetail />
      </main>
    );
  }

  if (!session || !topic) {
    return (
      <main className="min-h-screen bg-paper text-ink p-8">
        <div className="max-w-xl mx-auto bg-paper-raised rounded-xl p-8 border border-slate/10 text-center space-y-4">
          <h2 className="font-display text-xl font-bold text-ink">Topic Module Not Found</h2>
          <Link href={`/dashboard/${sessionId}`} className="inline-block font-mono text-xs text-focus hover:underline">
            &larr; Return to Session Questions
          </Link>
        </div>
      </main>
    );
  }

  // Filter questions for this topic
  const allQuestions = Array.isArray(session.questions) ? session.questions : [];
  const topicQuestions = allQuestions.filter(
    (q: any) =>
      q.topic_id === topicSlug ||
      q.topic_title?.toLowerCase().replace(/[^a-z0-9]/g, "-") === topicSlug ||
      q.category?.toLowerCase().includes(topicSlug.split("-")[0])
  );

  const displayQuestions = topicQuestions.length > 0 ? topicQuestions : allQuestions.slice(0, 3);

  return (
    <main className="min-h-screen bg-paper text-ink py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Navigation Link */}
        <div className="flex items-center justify-between">
          <Link
            href={`/dashboard/${sessionId}`}
            className="text-xs font-mono text-focus hover:underline flex items-center space-x-1"
          >
            <span>&larr;</span>
            <span>Back to Full Prep Session</span>
          </Link>

          <span className="font-mono text-xs text-slate">
            Role: {session.role_summary}
          </span>
        </div>

        {/* Topic Header Banner */}
        <div className="bg-paper-raised rounded-2xl p-6 border border-slate/10 shadow-[0_4px_24px_-8px_rgba(28,34,48,0.12)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate/10 pb-4">
            <div>
              <span className="font-mono text-xs font-semibold text-focus bg-focus/10 px-2.5 py-1 rounded uppercase">
                {topic.importance || "Core Topic"} Module
              </span>
              <h1 className="font-display text-3xl font-bold text-ink mt-2">
                {topic.title}
              </h1>
              <p className="text-sm text-slate font-body mt-1 leading-relaxed">
                {topic.description}
              </p>
            </div>

            {/* Self-Assessment Controls */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => handleToggleAssessment("strong")}
                className={`px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                  assessment === "strong"
                    ? "bg-mint text-white shadow-sm"
                    : "bg-paper text-slate hover:text-ink border border-slate/20"
                }`}
              >
                💪 Strong Topic
              </button>
              <button
                onClick={() => handleToggleAssessment("weak")}
                className={`px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                  assessment === "weak"
                    ? "bg-coral text-white shadow-sm"
                    : "bg-paper text-slate hover:text-ink border border-slate/20"
                }`}
              >
                ⚠️ Needs Practice
              </button>
            </div>
          </div>

          {/* Core Concepts Checklist */}
          {topic.core_concepts && topic.core_concepts.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-mono text-xs font-bold text-ink uppercase tracking-wider">
                Must-Know Architectural Concepts:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {topic.core_concepts.map((concept, idx) => (
                  <div
                    key={idx}
                    className="bg-paper p-3 rounded-lg border border-slate/10 text-xs font-mono text-ink font-semibold flex items-center space-x-2"
                  >
                    <span className="text-mint font-bold">✓</span>
                    <span>{concept}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filtered Topic Questions Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate/10 pb-3">
            <h2 className="font-display text-xl font-bold text-ink">
              Topic Questions ({displayQuestions.length})
            </h2>
            <span className="font-mono text-xs text-slate">
              Filtered for {topic.title}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {displayQuestions.map((q: any, index: number) => (
              <QuestionCard
                key={index}
                question={q}
                userId={user?.id}
                sessionId={session.id}
              />
            ))}
          </div>
        </div>

        {/* Recommended Deep-Dive Resources Section */}
        {topic.learning_resources && topic.learning_resources.length > 0 && (
          <div className="bg-paper-raised rounded-xl p-6 border border-slate/10 space-y-3">
            <h3 className="font-mono text-xs font-bold uppercase text-focus tracking-wider flex items-center space-x-1">
              <span>📚</span>
              <span>Curated Documentation & Deep-Dive Guides:</span>
            </h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {topic.learning_resources.map((res, idx) => (
                <a
                  key={idx}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs font-mono bg-paper hover:bg-paper/80 text-focus border border-focus/20 px-3 py-1.5 rounded-lg transition-colors shadow-2xs group"
                >
                  <span>🔗</span>
                  <span className="group-hover:underline">{res.title}</span>
                  <span className="text-[10px] text-slate/60">↗</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </main>
  );
}

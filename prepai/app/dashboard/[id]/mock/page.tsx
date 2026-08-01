"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { SkeletonSessionDetail } from "@/components/Skeletons";

export default function MockInterviewRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;

  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Answer & Evaluation State
  const [candidateAnswer, setCandidateAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<{
    score: number;
    strengths: string[];
    gaps: string[];
    strong_answer: string;
    next_question?: string;
  } | null>(null);

  // Speech Recognition Hook
  const {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    setTranscript,
  } = useSpeechToText();

  // Sync transcript into text area live
  useEffect(() => {
    if (transcript) {
      setCandidateAnswer(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    async function loadData() {
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
        }
      } catch (err) {
        console.error("Mock room load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [sessionId]);

  const questions = Array.isArray(session?.questions) ? session.questions : [];
  const currentQuestion = questions[currentQIndex];

  async function handleSubmitAnswer() {
    if (!candidateAnswer.trim() || submitting || !currentQuestion) return;

    try {
      setSubmitting(true);
      if (isListening) stopListening();

      const res = await fetch("/api/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || session?.user_id,
          roleSummary: session.role_summary || "Software Engineering Role",
          currentQuestion: currentQuestion.question,
          candidateAnswer: candidateAnswer.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Evaluation failed");

      setEvaluation(data);
    } catch (err: any) {
      console.error("Answer submission error:", err);
      alert(err.message || "Failed to evaluate answer");
    } finally {
      setSubmitting(false);
    }
  }

  function handleNextQuestion() {
    setEvaluation(null);
    setCandidateAnswer("");
    setTranscript("");
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-paper text-ink">
        <SkeletonSessionDetail />
      </main>
    );
  }

  if (!session || !currentQuestion) {
    return (
      <main className="min-h-screen bg-paper text-ink p-8">
        <div className="max-w-xl mx-auto bg-paper-raised rounded-2xl p-8 border border-slate/10 text-center space-y-4">
          <h2 className="font-display text-xl font-bold text-ink">Session Not Found</h2>
          <Link href="/dashboard" className="inline-block font-mono text-xs text-focus hover:underline">
            &larr; Return to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper text-ink py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-slate/10 pb-4">
          <Link
            href={`/dashboard/${sessionId}`}
            className="text-xs font-mono text-focus hover:underline flex items-center space-x-1"
          >
            <span>&larr;</span>
            <span>Exit Mock Room</span>
          </Link>

          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-semibold uppercase bg-focus/10 text-focus px-2.5 py-1 rounded">
              Question {currentQIndex + 1} of {questions.length}
            </span>
            <span className="font-mono text-xs text-slate">
              Role: {session.role_summary}
            </span>
          </div>
        </div>

        {/* AI Interviewer Stage */}
        <div className="bg-paper-raised rounded-2xl p-6 border border-slate/10 shadow-[0_4px_24px_-8px_rgba(28,34,48,0.12)] space-y-6">
          <div className="flex items-center space-x-4">
            {/* AI Avatar with Sound Waveform Pulse */}
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-focus text-white font-display font-bold text-lg flex items-center justify-center shadow-md">
                AI
              </div>
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.2, 0.6] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 rounded-full border-2 border-focus pointer-events-none"
              />
            </div>

            <div>
              <span className="font-mono text-[11px] font-semibold text-mint uppercase tracking-wider">
                Senior Technical Interviewer
              </span>
              <h2 className="font-display text-xl font-bold text-ink mt-0.5">
                Live Technical Question
              </h2>
            </div>
          </div>

          <div className="bg-paper p-5 rounded-xl border border-slate/10 space-y-2">
            <div className="flex items-center justify-between font-mono text-xs text-slate">
              <span className="uppercase text-focus font-semibold">{currentQuestion.category}</span>
              <span>Difficulty: {currentQuestion.difficulty}</span>
            </div>
            <p className="font-body text-base sm:text-lg font-medium text-ink leading-relaxed">
              "{currentQuestion.question}"
            </p>
          </div>
        </div>

        {/* Candidate Response Stage */}
        <div className="bg-paper-raised rounded-2xl p-6 border border-slate/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate/10 pb-3">
            <h3 className="font-display text-lg font-bold text-ink flex items-center space-x-2">
              <span>Your Response</span>
              {isListening && (
                <span className="font-mono text-xs text-coral animate-pulse flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-coral inline-block" />
                  <span>Recording Voice...</span>
                </span>
              )}
            </h3>

            {/* Voice-to-Text Speech Recognition Control Button */}
            {isSupported && (
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`font-mono text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center space-x-2 ${
                  isListening
                    ? "bg-coral text-white animate-pulse"
                    : "bg-focus/10 hover:bg-focus/20 text-focus border border-focus/30"
                }`}
              >
                <span>🎙️</span>
                <span>{isListening ? "Stop & Transcribe" : "Speak Answer (Voice-to-Text)"}</span>
              </button>
            )}
          </div>

          <textarea
            value={candidateAnswer}
            onChange={(e) => setCandidateAnswer(e.target.value)}
            placeholder={
              isSupported
                ? "Type your response here or click 'Speak Answer' to speak using your microphone..."
                : "Type your structured interview response here..."
            }
            rows={5}
            className="w-full bg-paper border border-slate/20 rounded-xl p-4 text-sm font-body text-ink focus:outline-none focus:border-focus transition-all leading-relaxed"
          />

          <div className="flex items-center justify-between pt-2">
            <span className="font-mono text-xs text-slate">
              {candidateAnswer.trim().split(/\s+/).filter(Boolean).length} words
            </span>

            <button
              onClick={handleSubmitAnswer}
              disabled={submitting || !candidateAnswer.trim()}
              className="bg-mint text-white font-mono text-xs font-bold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-md disabled:opacity-50 flex items-center space-x-1.5"
            >
              <span>{submitting ? "Evaluating Answer..." : "Submit Answer & Get Feedback"}</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>

        {/* Structured Feedback Modal / Section */}
        <AnimatePresence>
          {evaluation && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.3 }}
              className="bg-paper-raised rounded-2xl p-6 border border-mint/30 shadow-[0_4px_24px_-8px_rgba(16,185,129,0.15)] space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-mint/20 pb-4">
                <div>
                  <span className="font-mono text-xs font-bold text-mint uppercase tracking-wider">
                    ✨ Gemini Interview Feedback
                  </span>
                  <h3 className="font-display text-2xl font-bold text-ink mt-1">
                    Evaluation Breakdown
                  </h3>
                </div>

                <div className="flex items-center space-x-2 bg-paper px-4 py-2 rounded-xl border border-mint/30">
                  <span className="font-mono text-xs text-slate">Score:</span>
                  <span className="font-display text-2xl font-bold text-mint">
                    {evaluation.score}
                  </span>
                  <span className="font-mono text-xs text-slate">/ 10</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="bg-paper p-4 rounded-xl border border-mint/20 space-y-2">
                  <h4 className="font-mono text-xs font-bold uppercase text-mint flex items-center space-x-1">
                    <span>💪</span>
                    <span>Key Strengths:</span>
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-ink font-body">
                    {evaluation.strengths?.map((str, idx) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                </div>

                {/* Gaps */}
                <div className="bg-paper p-4 rounded-xl border border-coral/20 space-y-2">
                  <h4 className="font-mono text-xs font-bold uppercase text-coral flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>Areas to Improve:</span>
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-ink font-body">
                    {evaluation.gaps?.map((gap, idx) => (
                      <li key={idx}>{gap}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Model Verbal Answer */}
              {evaluation.strong_answer && (
                <div className="bg-paper p-4 rounded-xl border border-focus/20 space-y-2">
                  <h4 className="font-mono text-xs font-bold uppercase text-focus">
                    ✨ Model Verbal Answer (Interview Ready):
                  </h4>
                  <p className="text-xs text-ink italic font-body leading-relaxed">
                    "{evaluation.strong_answer}"
                  </p>
                </div>
              )}

              {/* Next Question Control */}
              <div className="pt-2 flex justify-end">
                {currentQIndex < questions.length - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    className="bg-focus text-white font-mono text-xs font-bold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-md flex items-center space-x-1.5"
                  >
                    <span>Next Question ({currentQIndex + 2}/{questions.length})</span>
                    <span>&rarr;</span>
                  </button>
                ) : (
                  <Link
                    href={`/dashboard/${sessionId}`}
                    className="bg-mint text-white font-mono text-xs font-bold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-md"
                  >
                    Complete Practice Session &rarr;
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}

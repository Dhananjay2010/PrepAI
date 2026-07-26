"use client";

import { useState } from "react";

interface MockInterviewChatProps {
  userId: string;
  roleSummary: string;
  firstQuestion: string;
}

export function MockInterviewChat({
  userId,
  roleSummary,
  firstQuestion,
}: MockInterviewChatProps) {
  const [question, setQuestion] = useState(firstQuestion);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<{
    score: number;
    strengths: string[];
    gaps: string[];
    strong_answer: string;
    next_question: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitAnswer() {
    if (!answer.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          roleSummary,
          currentQuestion: question,
          candidateAnswer: answer,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Evaluation failed");
      }

      setFeedback(data);
    } catch (err: any) {
      console.error("Answer submission error:", err);
      setError(err.message || "Failed to evaluate answer. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function nextQuestion() {
    if (feedback?.next_question) {
      setQuestion(feedback.next_question);
      setAnswer("");
      setFeedback(null);
      setError(null);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Question Card */}
      <div className="bg-paper-raised rounded-xl p-6 border border-slate/10 shadow-[0_4px_24px_-8px_rgba(28,34,48,0.12)]">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xs font-semibold text-focus bg-focus/10 px-2 py-0.5 rounded uppercase">
            Current Practice Question
          </span>
          <span className="font-mono text-xs text-slate">{roleSummary}</span>
        </div>
        <h3 className="font-display text-lg font-semibold text-ink leading-snug">
          {question}
        </h3>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-coral/10 border border-coral/20 text-coral text-sm rounded-xl font-body">
          {error}
        </div>
      )}

      {/* Answer Form vs Feedback */}
      {!feedback ? (
        <div className="space-y-3">
          <label className="block text-xs font-mono text-slate uppercase">
            Your Candidate Answer
          </label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-slate/20 p-4 min-h-[140px] bg-paper-raised text-ink focus:outline-none focus:ring-2 focus:ring-focus/30 font-body text-sm placeholder:text-slate/50 resize-y"
            placeholder="Type your response as if you were in the actual interview..."
          />
          <div className="flex items-center justify-end">
            <button
              onClick={submitAnswer}
              disabled={loading || answer.trim().length < 5}
              className="bg-focus text-white font-medium px-6 py-2.5 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 text-sm shadow-md"
            >
              {loading ? "Evaluating Answer..." : "Submit Answer"}
            </button>
          </div>
        </div>
      ) : (
        /* Feedback Card */
        <div className="bg-paper-raised rounded-xl p-6 border border-slate/10 shadow-[0_4px_24px_-8px_rgba(28,34,48,0.12)] space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate/10 pb-3">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate">
              AI Coach Evaluation
            </span>
            <div className="flex items-center space-x-1.5 font-mono text-sm font-bold bg-mint/15 text-mint px-3 py-1 rounded-full">
              <span>Score:</span>
              <span className="text-base">{feedback.score}/10</span>
            </div>
          </div>

          {/* Strengths */}
          {feedback.strengths?.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-mono font-semibold uppercase text-mint">
                Key Strengths
              </p>
              <ul className="list-disc pl-5 text-sm text-ink space-y-1">
                {feedback.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Gaps */}
          {feedback.gaps?.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-mono font-semibold uppercase text-coral">
                Gaps & Missing Areas
              </p>
              <ul className="list-disc pl-5 text-sm text-ink space-y-1">
                {feedback.gaps.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Model Answer */}
          {feedback.strong_answer && (
            <div className="space-y-1 bg-paper p-4 rounded-lg border border-slate/10">
              <p className="text-xs font-mono font-semibold uppercase text-slate">
                Sample Strong Answer Outline
              </p>
              <p className="text-sm text-ink leading-relaxed font-body">
                {feedback.strong_answer}
              </p>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={nextQuestion}
              className="bg-focus text-white font-medium px-6 py-2.5 rounded-md hover:opacity-90 transition-opacity text-sm shadow-md"
            >
              Continue to Next Question &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

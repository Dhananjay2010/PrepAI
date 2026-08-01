"use client";

import { useState, useEffect } from "react";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { InterviewerPersona } from "@/lib/gemini";

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
  const [persona, setPersona] = useState<InterviewerPersona>("skeptical_architect");
  const [question, setQuestion] = useState(firstQuestion);
  const [answer, setAnswer] = useState("");
  const [history, setHistory] = useState<Array<{ role: "interviewer" | "candidate"; content: string }>>([
    { role: "interviewer", content: firstQuestion }
  ]);
  const [feedback, setFeedback] = useState<{
    score: number;
    persona_title?: string;
    strengths: string[];
    gaps: string[];
    strong_answer: string;
    next_question: string;
  } | null>(null);

  const [scoresHistory, setScoresHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Speech to Text hook
  const { isListening, transcript, isSupported, startListening, stopListening, resetTranscript } = useSpeechToText();

  // Sync voice transcript with answer state
  useEffect(() => {
    if (transcript) {
      setAnswer(transcript);
    }
  }, [transcript]);

  const personas: { id: InterviewerPersona; label: string; icon: string; desc: string }[] = [
    {
      id: "skeptical_architect",
      label: "Skeptical Principal Architect",
      icon: "🕵️‍♂️",
      desc: "Deep technical trade-off grilling, edge-case probing & scaling limits",
    },
    {
      id: "time_constrained_manager",
      label: "Engineering Director",
      icon: "⏱️",
      desc: "Fast-paced 60s answers, STAR stories & business ROI metrics",
    },
    {
      id: "friendly_peer",
      label: "Senior Peer Engineer",
      icon: "🤝",
      desc: "Clean code, testing strategies, API interfaces & collaboration",
    },
  ];

  async function submitAnswer() {
    if (!answer.trim()) return;

    if (isListening) stopListening();
    resetTranscript();

    try {
      setLoading(true);
      setError(null);

      const updatedHistory = [...history, { role: "candidate" as const, content: answer }];
      setHistory(updatedHistory);

      const res = await fetch("/api/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          roleSummary,
          currentQuestion: question,
          candidateAnswer: answer,
          persona,
          history: updatedHistory,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Evaluation failed");
      }

      setFeedback(data);
      if (typeof data.score === "number") {
        setScoresHistory((prev) => [...prev, data.score]);
      }
    } catch (err: any) {
      console.error("Answer submission error:", err);
      setError(err.message || "Failed to evaluate answer. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function nextQuestion() {
    if (feedback?.next_question) {
      const nextQ = feedback.next_question;
      setQuestion(nextQ);
      setHistory((prev) => [...prev, { role: "interviewer" as const, content: nextQ }]);
      setAnswer("");
      resetTranscript();
      setFeedback(null);
      setError(null);
    }
  }

  const averageScore =
    scoresHistory.length > 0
      ? (scoresHistory.reduce((a, b) => a + b, 0) / scoresHistory.length).toFixed(1)
      : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Persona Selector Bar */}
      <div className="bg-paper-raised p-4 rounded-xl border border-slate/10 shadow-xs space-y-3 font-mono">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-slate">Select AI Interviewer Persona</span>
          {averageScore && (
            <span className="text-xs font-bold text-mint bg-mint/10 px-2.5 py-0.5 rounded">
              Average Score: {averageScore}/10 ({scoresHistory.length} turns)
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {personas.map((p) => {
            const isSelected = persona === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPersona(p.id)}
                className={`p-3 rounded-lg border text-left text-xs transition-all ${
                  isSelected
                    ? "bg-focus/10 border-focus text-ink font-bold shadow-xs"
                    : "bg-paper border-slate/15 text-slate hover:text-ink hover:border-slate/30"
                }`}
              >
                <div className="flex items-center space-x-1.5 font-bold mb-1">
                  <span>{p.icon}</span>
                  <span className="truncate">{p.label}</span>
                </div>
                <p className="text-[10px] text-slate font-normal leading-normal">{p.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Question Banner */}
      <div className="bg-paper-raised rounded-xl p-6 border border-slate/10 shadow-[0_4px_24px_-8px_rgba(28,34,48,0.12)] space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-semibold text-focus bg-focus/10 px-2.5 py-0.5 rounded uppercase">
            {feedback?.persona_title || personas.find((p) => p.id === persona)?.label || "AI Interviewer"}
          </span>
          <span className="font-mono text-xs text-slate">{roleSummary}</span>
        </div>
        <h3 className="font-display text-lg font-bold text-ink leading-snug">{question}</h3>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-coral/10 border border-coral/20 text-coral text-xs rounded-xl font-mono">
          {error}
        </div>
      )}

      {/* Answer Input vs Feedback Card */}
      {!feedback ? (
        <div className="bg-paper-raised p-5 rounded-xl border border-slate/10 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold text-slate uppercase">
              Your Candidate Verbal Response
            </label>

            {isSupported && (
              <button
                onClick={isListening ? stopListening : startListening}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-mono transition-all ${
                  isListening
                    ? "bg-red-500 text-white font-bold animate-pulse"
                    : "bg-paper text-ink border border-slate/20 hover:border-focus"
                }`}
              >
                <span>🎙️</span>
                <span>{isListening ? "Stop Voice Input" : "Speak Answer (Voice)"}</span>
              </button>
            )}
          </div>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-slate/20 p-4 min-h-[140px] bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-focus/30 font-body text-sm placeholder:text-slate/50 resize-y"
            placeholder="Speak or type your candidate response as if you were in the actual interview..."
          />

          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={submitAnswer}
              disabled={loading || answer.trim().length < 5}
              className="bg-focus text-white font-medium px-6 py-2.5 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 text-sm shadow-md"
            >
              {loading ? "AI Interviewer Evaluates..." : "Submit Candidate Answer"}
            </button>
          </div>
        </div>
      ) : (
        /* Dynamic Feedback Card */
        <div className="bg-paper-raised rounded-xl p-6 border border-slate/10 shadow-[0_4px_24px_-8px_rgba(28,34,48,0.12)] space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate/10 pb-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate">
              {feedback.persona_title || "AI Coach Evaluation"}
            </span>
            <div className="flex items-center space-x-1.5 font-mono text-sm font-bold bg-mint/15 text-mint px-3 py-1 rounded-full">
              <span>Turn Score:</span>
              <span className="text-base">{feedback.score}/10</span>
            </div>
          </div>

          {/* Strengths */}
          {feedback.strengths?.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-mono font-bold uppercase text-mint">Key Strengths Demonstrated</p>
              <ul className="list-disc pl-5 text-xs text-ink space-y-1 font-body">
                {feedback.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Gaps */}
          {feedback.gaps?.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-mono font-bold uppercase text-coral">Gaps & Missing Edge Cases</p>
              <ul className="list-disc pl-5 text-xs text-ink space-y-1 font-body">
                {feedback.gaps.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Model Answer */}
          {feedback.strong_answer && (
            <div className="space-y-1 bg-paper p-4 rounded-lg border border-slate/10">
              <p className="text-xs font-mono font-bold uppercase text-slate">Sample Strong Answer Outline</p>
              <p className="text-xs text-ink leading-relaxed font-body">{feedback.strong_answer}</p>
            </div>
          )}

          {/* Next Dynamic Question Follow-up */}
          {feedback.next_question && (
            <div className="bg-focus/10 p-4 rounded-lg border border-focus/20 space-y-1">
              <p className="text-xs font-mono font-bold uppercase text-focus">Next Dynamic Follow-Up Question</p>
              <p className="text-sm font-display font-semibold text-ink leading-snug">{feedback.next_question}</p>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={nextQuestion}
              className="bg-focus text-white font-medium px-6 py-2.5 rounded-md hover:opacity-90 transition-opacity text-sm shadow-md"
            >
              Continue to Follow-Up Question &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { QuestionData } from "./QuestionCard";

interface PrintableCheatSheetProps {
  roleSummary: string;
  seniority: string;
  keySkills: string[];
  questions: QuestionData[];
  prepTips?: string[];
  jobDescription?: string;
  createdDate?: string;
  interviewDate?: string;
  onClose: () => void;
}

export function PrintableCheatSheet({
  roleSummary,
  seniority,
  keySkills,
  questions,
  prepTips = [],
  createdDate,
  interviewDate,
  onClose,
}: PrintableCheatSheetProps) {
  const handlePrint = () => {
    window.print();
  };

  // Group important technical terms from key skills & questions
  const importantTerms = keySkills && keySkills.length > 0
    ? keySkills
    : ["System Design", "Scalability", "Concurrency", "Database Indexing", "API Security"];

  return (
    <div className="fixed inset-0 z-[99999] bg-ink/80 backdrop-blur-md overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-start print:p-0 print:bg-white print:static print:inset-auto">
      {/* Non-Printable Top Action Bar */}
      <div className="w-full max-w-4xl bg-paper-raised border border-slate/20 rounded-xl p-4 mb-6 flex items-center justify-between shadow-xl print:hidden sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <span className="text-xl">📄</span>
          <div>
            <h3 className="font-display font-bold text-ink text-base">
              Interview Readiness Cheat Sheet
            </h3>
            <p className="font-mono text-xs text-slate">
              Formatted for 1-Click PDF Export / Printing
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="bg-focus text-white font-medium text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity shadow-md flex items-center space-x-2"
          >
            <span>🖨️</span>
            <span>Save as PDF / Print</span>
          </button>
          <button
            onClick={onClose}
            className="text-slate hover:text-ink text-2xl font-mono p-1 leading-none"
          >
            &times;
          </button>
        </div>
      </div>

      {/* Printable Paper Document Container */}
      <div className="w-full max-w-4xl bg-white text-slate-900 rounded-2xl p-8 sm:p-12 shadow-2xl border border-slate-200 space-y-8 font-body print:shadow-none print:border-none print:p-0 print:m-0 print:w-full print:max-w-none print:rounded-none">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-display text-2xl font-bold tracking-tight text-slate-900">
                PrepAI
              </span>
              <span className="font-mono text-[10px] uppercase bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-300">
                Executive Cheat Sheet
              </span>
            </div>
            <span className="font-mono text-xs text-slate-500">
              Generated: {createdDate || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-2 pt-2">
            <div>
              <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded uppercase tracking-wider border border-blue-200">
                {seniority || "Software Engineer"}
              </span>
              <h1 className="font-display text-3xl font-bold text-slate-900 mt-2">
                {roleSummary || "Interview Preparation Outline"}
              </h1>
            </div>

            {interviewDate && (
              <div className="font-mono text-xs text-slate-700 bg-amber-50 px-3 py-1.5 rounded border border-amber-200 text-right">
                <span className="font-bold">Target Date:</span> {new Date(interviewDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 1: QUICK REVISION SHEET */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3 print:break-inside-avoid">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
            <span>⚡</span>
            <span>1. Quick Revision Sheet (Key Takeaways)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <p className="font-bold text-slate-900">Core Focus Areas:</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-700">
                {prepTips && prepTips.length > 0 ? (
                  prepTips.map((tip, i) => <li key={i}>{tip}</li>)
                ) : (
                  <>
                    <li>Master architectural trade-offs specific to this role.</li>
                    <li>Always state time/space complexity before writing code.</li>
                    <li>Highlight production resilience & monitoring capabilities.</li>
                  </>
                )}
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-slate-900">Interview Strategy:</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-700">
                <li>Structure answers using STAR (Situation, Task, Action, Result).</li>
                <li>State assumptions early before proposing system architecture.</li>
                <li>Address scaling limits and failure modes proactively.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* SECTION 2: IMPORTANT TERMS TO REMEMBER */}
        <div className="space-y-3 print:break-inside-avoid">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2 border-b border-slate-200 pb-2">
            <span>🔑</span>
            <span>2. Important Terms & Glossary To Remember</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {importantTerms.map((term, idx) => (
              <span
                key={idx}
                className="font-mono text-xs bg-slate-100 text-slate-800 font-semibold px-3 py-1.5 rounded-md border border-slate-300"
              >
                {term}
              </span>
            ))}
          </div>
        </div>

        {/* SECTION 3: IMPORTANT INTERVIEW QUESTIONS & MODEL OUTLINES */}
        <div className="space-y-6">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2 border-b border-slate-200 pb-2">
            <span>❓</span>
            <span>3. Important Interview Questions & Answer Outlines ({questions.length})</span>
          </h2>

          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-slate-200 bg-white space-y-3 print:break-inside-avoid shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      Q{q.num || idx + 1}
                    </span>
                    <span className="font-mono text-xs font-semibold text-blue-700 uppercase">
                      {q.category}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500 font-semibold">
                    {q.difficulty}
                  </span>
                </div>

                <h3 className="font-body text-sm font-bold text-slate-900 leading-snug">
                  {q.question}
                </h3>

                {/* What They Test */}
                <div className="text-xs text-slate-700">
                  <span className="font-mono font-bold text-slate-900 uppercase text-[10px]">Testing Focus: </span>
                  <span>{q.what_they_test}</span>
                </div>

                {/* Precise Answer if available */}
                {q.precise_answer ? (
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg space-y-2 text-xs">
                    <p className="font-mono font-bold text-emerald-800 uppercase text-[10px]">
                      ✨ Precise Spoken Answer:
                    </p>
                    <p className="font-medium text-emerald-950 italic">
                      "{q.precise_answer.summary_statement}"
                    </p>
                    {q.precise_answer.sample_spoken_answer && (
                      <p className="text-emerald-900 bg-white p-2 rounded border border-emerald-200">
                        "{q.precise_answer.sample_spoken_answer}"
                      </p>
                    )}
                  </div>
                ) : (
                  /* Standard Outline */
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-1 text-xs">
                    <p className="font-mono font-bold text-slate-900 uppercase text-[10px]">
                      Strong Answer Outline:
                    </p>
                    <p className="text-slate-800 leading-relaxed">
                      {q.strong_answer_outline}
                    </p>
                  </div>
                )}

                {/* Red Flags */}
                {q.red_flags && (
                  <div className="text-xs text-rose-700 bg-rose-50 p-2 rounded border border-rose-200 font-mono text-[11px]">
                    <span className="font-bold">⚠️ Avoid Red Flag: </span>
                    <span>{q.red_flags}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-xs text-slate-500 font-mono print:mt-8">
          <span>Prepared with PrepAI Technical Coach</span>
          <span>https://prepai.com</span>
        </div>
      </div>
    </div>
  );
}

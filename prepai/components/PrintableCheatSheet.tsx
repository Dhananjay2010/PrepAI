"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    const element = document.getElementById("pdf-cheat-sheet-content");
    if (!element) return;

    try {
      setDownloading(true);
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${(roleSummary || "interview")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")}-cheatsheet.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("PDF export failed, falling back to window.print:", err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  // Important Terms & Glossary to Remember
  const importantTerms =
    keySkills && keySkills.length > 0
      ? keySkills
      : ["System Design", "Scalability", "Concurrency", "Database Indexing", "API Security"];

  return (
    <div className="fixed inset-0 z-[99999] bg-ink/80 backdrop-blur-md overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-start print:p-0 print:bg-white print:static print:inset-auto">
      {/* Non-Printable Action Bar */}
      <div className="w-full max-w-4xl bg-paper-raised border border-slate/20 rounded-xl p-4 mb-6 flex items-center justify-between shadow-xl print:hidden sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <span className="text-xl">📄</span>
          <div>
            <h3 className="font-display font-bold text-ink text-base">
              Interview Cheat Sheet & Question Bank
            </h3>
            <p className="font-mono text-xs text-slate">
              Clean, unpolluted PDF summary with Questions & Answers
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="bg-focus text-white font-medium text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity shadow-md flex items-center space-x-2 disabled:opacity-50"
          >
            <span>📥</span>
            <span>{downloading ? "Generating PDF..." : "Download PDF"}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="bg-paper border border-slate/20 text-ink font-medium text-sm px-4 py-2.5 rounded-lg hover:border-slate/40 transition-colors shadow-xs"
          >
            🖨️ Print
          </button>

          <button
            onClick={onClose}
            className="text-slate hover:text-ink text-2xl font-mono p-1 leading-none"
          >
            &times;
          </button>
        </div>
      </div>

      {/* Printable / Renderable Container */}
      <div
        id="pdf-cheat-sheet-content"
        className="w-full max-w-4xl bg-white text-slate-900 rounded-2xl p-8 sm:p-12 shadow-2xl border border-slate-200 space-y-8 font-body print:shadow-none print:border-none print:p-0 print:m-0 print:w-full print:max-w-none print:rounded-none"
      >
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-display text-2xl font-bold tracking-tight text-slate-900">
                PrepAI
              </span>
              <span className="font-mono text-[10px] uppercase bg-slate-900 text-white font-bold px-2 py-0.5 rounded">
                Interview Cheat Sheet
              </span>
            </div>
            <span className="font-mono text-xs text-slate-500">
              {createdDate || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-2">
            <div>
              <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded uppercase tracking-wider border border-blue-200">
                {seniority || "Engineer"}
              </span>
              <h1 className="font-display text-2xl font-bold text-slate-900 mt-1">
                {roleSummary || "Software Engineering Role"}
              </h1>
            </div>

            {interviewDate && (
              <span className="font-mono text-xs text-slate-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 font-semibold">
                Target Date: {new Date(interviewDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* SECTION 1: QUICK REVISION SHEET */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2.5">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5 border-b border-slate-200 pb-1.5">
            <span>⚡</span>
            <span>1. Quick Revision Sheet</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-800">
            <div className="space-y-1">
              <p className="font-bold text-slate-900">Preparation Takeaways:</p>
              <ul className="list-disc pl-4 space-y-1">
                {prepTips && prepTips.length > 0 ? (
                  prepTips.slice(0, 3).map((tip, i) => <li key={i}>{tip}</li>)
                ) : (
                  <>
                    <li>State time & space complexity before presenting code.</li>
                    <li>Address trade-offs between performance and memory early.</li>
                  </>
                )}
              </ul>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-slate-900">Spoken Answer Strategy:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Structure answers: Core Answer &rarr; Trade-off &rarr; Production Result.</li>
                <li>Keep verbal model responses between 90 and 150 seconds.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* SECTION 2: TERMS TO REMEMBER */}
        <div className="space-y-2">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5 border-b border-slate-200 pb-1.5">
            <span>🔑</span>
            <span>2. Terms To Remember</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {importantTerms.map((term, idx) => (
              <span
                key={idx}
                className="font-mono text-xs bg-slate-100 text-slate-900 font-semibold px-2.5 py-1 rounded border border-slate-300"
              >
                {term}
              </span>
            ))}
          </div>
        </div>

        {/* SECTION 3: QUESTIONS & ANSWERS (UNPOLLUTED & CLEAN) */}
        <div className="space-y-4">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5 border-b border-slate-200 pb-1.5">
            <span>❓</span>
            <span>3. Questions & Model Answers ({questions.length})</span>
          </h2>

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-xs"
              >
                {/* Question Line */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-baseline space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      Q{q.num || idx + 1}
                    </span>
                    <h3 className="font-body text-sm font-bold text-slate-900 leading-snug">
                      {q.question}
                    </h3>
                  </div>
                  <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold shrink-0">
                    {q.category}
                  </span>
                </div>

                {/* Clean Answer Box Only */}
                {q.precise_answer ? (
                  <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-lg space-y-1.5 text-xs">
                    <p className="font-mono font-bold text-emerald-800 text-[10px] uppercase">
                      ✨ Precise Verbal Model Answer:
                    </p>
                    <p className="font-medium text-emerald-950 italic leading-relaxed">
                      "{q.precise_answer.summary_statement}"
                    </p>
                    {q.precise_answer.sample_spoken_answer && (
                      <p className="text-emerald-900 bg-white p-2 rounded border border-emerald-200 leading-relaxed">
                        "{q.precise_answer.sample_spoken_answer}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs space-y-1">
                    <p className="font-mono font-bold text-slate-700 text-[10px] uppercase">
                      Answer Outline:
                    </p>
                    <p className="text-slate-800 leading-relaxed font-body">
                      {q.strong_answer_outline}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Prepared with PrepAI Technical Interview Coach</span>
          <span>https://prepai.com</span>
        </div>
      </div>
    </div>
  );
}

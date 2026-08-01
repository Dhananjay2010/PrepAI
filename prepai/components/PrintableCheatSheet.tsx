"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { QuestionData } from "./QuestionCard";
import { CheatSheetPDFDocument } from "./CheatSheetPDFDocument";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false }
);

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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const pdfDoc = (
    <CheatSheetPDFDocument
      roleSummary={roleSummary}
      seniority={seniority}
      keySkills={keySkills}
      questions={questions}
      prepTips={prepTips}
      createdDate={createdDate}
      interviewDate={interviewDate}
    />
  );

  const fileName = `${(roleSummary || "interview")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")}-cheatsheet.pdf`;

  return (
    <div className="fixed inset-0 z-[99999] bg-ink/80 backdrop-blur-md overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-start">
      {/* Top Action Bar */}
      <div className="w-full max-w-5xl bg-paper-raised border border-slate/20 rounded-xl p-4 mb-4 flex items-center justify-between shadow-xl sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <span className="text-xl">📄</span>
          <div>
            <h3 className="font-display font-bold text-ink text-base">
              ReactPDF Vector Cheat Sheet
            </h3>
            <p className="font-mono text-xs text-slate">
              Pure vector PDF export with Questions & Answers
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <PDFDownloadLink
            document={pdfDoc}
            fileName={fileName}
            className="bg-focus text-white font-medium text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity shadow-md flex items-center space-x-2"
          >
            {({ loading }) => (
              <>
                <span>📥</span>
                <span>{loading ? "Generating PDF..." : "Download PDF File"}</span>
              </>
            )}
          </PDFDownloadLink>

          <button
            onClick={onClose}
            className="text-slate hover:text-ink text-2xl font-mono p-1 leading-none"
          >
            &times;
          </button>
        </div>
      </div>

      {/* PDF Interactive Preview Container */}
      <div className="w-full max-w-5xl h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <PDFViewer width="100%" height="100%" className="w-full h-full border-none">
          {pdfDoc}
        </PDFViewer>
      </div>
    </div>
  );
}

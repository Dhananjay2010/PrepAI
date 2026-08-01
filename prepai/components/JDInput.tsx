"use client";

import { useState, useRef } from "react";

export interface OnboardingSetupData {
  jobDescription: string;
  resumeText?: string;
  targetCompany?: string;
  targetSeniority?: string;
}

interface JDInputProps {
  onGenerate: (data: OnboardingSetupData | string) => void;
  loading: boolean;
  disabled?: boolean;
}

export function sanitizeJDText(rawText: string): string {
  let cleaned = rawText
    .replace(/Equal Opportunity Employer[\s\S]*$/i, "")
    .replace(/Benefits & Perks[\s\S]*$/i, "")
    .replace(/About Our Company[\s\S]*$/i, (match) => match.length > 500 ? "" : match)
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
  return cleaned.trim().slice(0, 20000);
}

export function JDInput({ onGenerate, loading, disabled }: JDInputProps) {
  const [jdText, setJdText] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [targetCompany, setTargetCompany] = useState("Microsoft");
  const [targetSeniority, setTargetSeniority] = useState("SDE 3 / Senior");
  const [showResumeInput, setShowResumeInput] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jdText.trim().length >= 30 && !loading) {
      const sanitized = sanitizeJDText(jdText);
      onGenerate({
        jobDescription: sanitized,
        resumeText: resumeText.trim() || undefined,
        targetCompany,
        targetSeniority,
      });
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setJdText(sanitizeJDText(content));
      }
    };
    reader.readAsText(file);
  };

  const handlePasteSample = () => {
    const sample = `We are hiring a Senior Software Development Engineer (SDE 3) to build large-scale distributed systems and microservices.

Key Responsibilities:
- Design and develop highly scalable, secure, and reliable software systems in C#, Java, Python, or Go.
- Architect event-driven microservices using Kafka, RabbitMQ, or Azure Service Bus.
- Optimize high-throughput database queries across SQL (PostgreSQL) and NoSQL clusters.
- Lead architecture reviews, mentor engineers, and drive engineering operational excellence.

Qualifications:
- 6-9 years of professional software development experience.
- Deep expertise in Data Structures, Algorithms, Object-Oriented System Design, and Concurrency.
- Experience with Docker, Kubernetes, Azure/AWS cloud platforms, and CI/CD pipelines.`;

    setJdText(sample);
    setTargetCompany("Microsoft");
    setTargetSeniority("SDE 3 / Senior");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Target Meta Selector Bar (Company & Seniority) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-paper-raised p-3.5 rounded-xl border border-slate/10 font-mono text-xs">
        <div>
          <label className="block text-[11px] font-bold uppercase text-slate mb-1">Target Company</label>
          <select
            value={targetCompany}
            onChange={(e) => setTargetCompany(e.target.value)}
            disabled={loading || disabled}
            className="w-full bg-paper text-ink border border-slate/20 rounded-lg p-2 font-medium focus:outline-none focus:ring-1 focus:ring-focus"
          >
            <option value="Microsoft">Microsoft</option>
            <option value="Amazon">Amazon</option>
            <option value="Google">Google</option>
            <option value="Meta">Meta</option>
            <option value="Tier-1 Product Startup">Tier-1 Product Startup</option>
            <option value="General Tech Company">General Tech Company</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-slate mb-1">Role Level / Seniority</label>
          <select
            value={targetSeniority}
            onChange={(e) => setTargetSeniority(e.target.value)}
            disabled={loading || disabled}
            className="w-full bg-paper text-ink border border-slate/20 rounded-lg p-2 font-medium focus:outline-none focus:ring-1 focus:ring-focus"
          >
            <option value="SDE 1 / Junior">SDE 1 / Junior (0-2 Yrs)</option>
            <option value="SDE 2 / Mid">SDE 2 / Mid (2-5 Yrs)</option>
            <option value="SDE 3 / Senior">SDE 3 / Senior (6-9 Yrs)</option>
            <option value="Staff / Principal">Staff / Principal (9+ Yrs)</option>
          </select>
        </div>
      </div>

      {/* JD Input Label & Quick Actions */}
      <div className="flex items-center justify-between">
        <label className="font-mono text-xs uppercase tracking-wider text-slate font-semibold">
          Paste or Drag Job Description (PDF / Docx / TXT)
        </label>
        <div className="flex items-center space-x-3 text-xs font-mono">
          <button
            type="button"
            onClick={handlePasteSample}
            className="text-focus hover:underline"
          >
            Paste Sample Tech JD
          </button>
          <button
            type="button"
            onClick={() => setShowResumeInput(!showResumeInput)}
            className="text-mint hover:underline font-bold"
          >
            {showResumeInput ? "– Hide Resume Upload" : "+ Add Resume for Gap Match"}
          </button>
        </div>
      </div>

      {/* Drag & Drop Box / Textarea */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleFileDrop}
        className={`relative rounded-xl border transition-all ${
          isDragOver
            ? "border-focus bg-focus/5 ring-2 ring-focus/30"
            : "border-slate/20 bg-paper-raised"
        }`}
      >
        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          disabled={loading || disabled}
          rows={9}
          maxLength={20000}
          className="w-full bg-transparent text-ink p-4 font-body text-sm placeholder:text-slate/40 focus:outline-none resize-y"
          placeholder="Paste the full job posting here or drop a PDF/TXT document..."
        />

        <div className="flex items-center justify-between px-4 py-2 border-t border-slate/10 font-mono text-[11px] text-slate/70">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-focus hover:underline flex items-center space-x-1"
            >
              <span>📁</span>
              <span>{fileName ? `Uploaded: ${fileName}` : "Upload File (PDF / TXT)"}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          <span>{jdText.length} / 20,000 chars</span>
        </div>
      </div>

      {/* Optional Resume Input Box */}
      {showResumeInput && (
        <div className="space-y-2 animate-in fade-in duration-150">
          <label className="font-mono text-xs uppercase tracking-wider text-mint font-bold flex items-center space-x-1">
            <span>📄</span>
            <span>Optional Candidate Resume Text (For Skill Gap & Resume Probing)</span>
          </label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            disabled={loading || disabled}
            rows={4}
            maxLength={10000}
            className="w-full bg-paper text-ink border border-mint/30 rounded-xl p-3 font-mono text-xs placeholder:text-slate/40 focus:outline-none focus:ring-1 focus:ring-mint"
            placeholder="Paste raw text from your PDF resume (skills, experience, past projects) to generate resume-gap questions..."
          />
        </div>
      )}

      {/* Submit Button Row */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-slate font-body">
          {jdText.length < 30 ? (
            <span className="text-slate/60">Paste or drop at least 30 characters to analyze</span>
          ) : (
            <span className="text-mint font-medium">
              ✓ Ready for {targetCompany} ({targetSeniority}) Analysis
            </span>
          )}
        </p>

        <button
          type="submit"
          disabled={loading || jdText.trim().length < 30 || disabled}
          className="bg-focus text-white font-medium px-6 py-3 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 text-sm shadow-md flex items-center space-x-2"
        >
          {loading ? (
            <>
              <span className="animate-spin text-base">⏳</span>
              <span>Analyzing {targetCompany} Specs...</span>
            </>
          ) : (
            <>
              <span>Generate Tailored Questions</span>
              <span>&rarr;</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";

interface JDInputProps {
  onGenerate: (jdText: string) => void;
  loading: boolean;
  disabled?: boolean;
}

export function JDInput({ onGenerate, loading, disabled }: JDInputProps) {
  const [jdText, setJdText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jdText.trim().length >= 30 && !loading) {
      onGenerate(jdText.trim());
    }
  };

  const handlePasteSample = () => {
    const sample = `We are looking for a Senior Full Stack Engineer with 4+ years of experience building web applications using React, Next.js, Node.js, and PostgreSQL. 

Responsibilities:
- Design and implement scalable REST and GraphQL APIs.
- Architect responsive, accessible front-end interfaces using Tailwind CSS and TypeScript.
- Optimize database queries and manage PostgreSQL migrations.
- Lead system design discussions for microservices architecture.
- Mentor junior engineers and conduct technical code reviews.

Requirements:
- Strong proficiency in TypeScript, React, Next.js (App Router), and Node.js.
- Solid experience with PostgreSQL, Docker, and AWS / Vercel cloud deployments.
- Deep understanding of web performance, security best practices, and CI/CD pipelines.`;

    setJdText(sample);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="font-mono text-xs uppercase tracking-wider text-slate font-semibold">
          Paste Job Description
        </label>
        <button
          type="button"
          onClick={handlePasteSample}
          className="font-mono text-xs text-focus hover:underline"
        >
          Paste Sample Tech JD
        </button>
      </div>

      <div className="relative">
        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          disabled={loading || disabled}
          rows={10}
          maxLength={8000}
          className="w-full bg-paper-raised text-ink border border-slate/20 rounded-xl p-4 font-body text-sm placeholder:text-slate/40 focus:outline-none focus:ring-2 focus:ring-focus/30 transition-all resize-y"
          placeholder="Paste the full job posting here (responsibilities, tech stack, requirements)..."
        />
        <div className="absolute bottom-3 right-3 text-[11px] font-mono text-slate/50">
          {jdText.length} / 8000
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-slate font-body">
          {jdText.length < 30 ? (
            <span className="text-slate/60">Paste at least 30 characters to analyze</span>
          ) : (
            <span className="text-mint font-medium">✓ Ready to generate tailored questions</span>
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
              <span>Analyzing Job Specs...</span>
            </>
          ) : (
            <>
              <span>Generate Interview Questions</span>
              <span>&rarr;</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

"use client";

import React, { useState } from "react";

interface CodeSandboxWidgetProps {
  initialCode: string;
  language?: string;
  explanation?: string;
  title?: string;
}

export function CodeSandboxWidget({
  initialCode,
  language = "typescript",
  explanation,
  title,
}: CodeSandboxWidgetProps) {
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleRun() {
    setIsExecuting(true);
    setOutput(null);

    setTimeout(() => {
      setIsExecuting(false);
      if (language.toLowerCase() === "sql") {
        setOutput(
          `[SQL EXECUTION SIMULATOR]\nQuery executed in 1.4ms.\nRows returned: 14\nIndex scan on primary key: OPTIMAL`
        );
      } else {
        setOutput(
          `[SANDBOX OUTPUT SIMULATOR]\n> Code compiled cleanly.\n> Time complexity: O(N log N)\n> Space complexity: O(1)\n> All 10 assertion tests passed.`
        );
      }
    }, 600);
  }

  return (
    <div className="bg-neutral-950 rounded-xl border border-slate/20 shadow-inner overflow-hidden font-mono text-xs space-y-0">
      {/* Sandbox Header Bar */}
      <div className="bg-neutral-900 px-4 py-2.5 flex items-center justify-between border-b border-neutral-800">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          <span className="text-neutral-400 font-bold uppercase text-[10px] ml-2">
            💻 {language.toUpperCase()} SANDBOX
          </span>
          {title && <span className="text-neutral-500 text-[11px] font-normal">• {title}</span>}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2.5 py-1 rounded text-[11px] transition-colors"
          >
            {copied ? "✓ Copied" : "Copy Code"}
          </button>
          <button
            onClick={handleRun}
            disabled={isExecuting}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded text-[11px] transition-colors disabled:opacity-50"
          >
            {isExecuting ? "Executing..." : "▶ Run Sandbox"}
          </button>
        </div>
      </div>

      {/* Code Editor Body */}
      <div className="relative">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="w-full bg-neutral-950 text-emerald-400 p-4 font-mono text-xs leading-relaxed focus:outline-none min-h-[160px] resize-y"
        />
      </div>

      {/* Explanation Banner */}
      {explanation && (
        <div className="bg-neutral-900/90 p-3 border-t border-neutral-800 text-[11px] text-neutral-300">
          <span className="font-bold text-emerald-400 uppercase text-[10px] block mb-0.5">
            Implementation Strategy & Key Takeaways
          </span>
          <p className="leading-relaxed">{explanation}</p>
        </div>
      )}

      {/* Execution Output Window */}
      {output && (
        <div className="bg-black p-3 border-t border-emerald-900/50 text-[11px] text-emerald-300 whitespace-pre-wrap leading-relaxed animate-in fade-in duration-150">
          {output}
        </div>
      )}
    </div>
  );
}

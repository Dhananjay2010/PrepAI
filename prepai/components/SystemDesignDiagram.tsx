"use client";

import React, { useEffect, useState } from "react";

interface SystemDesignDiagramProps {
  chartCode: string;
  title?: string;
}

export function SystemDesignDiagram({ chartCode, title }: SystemDesignDiagramProps) {
  const [code, setCode] = useState(chartCode);
  const [activeMode, setActiveMode] = useState<"preview" | "editor">("preview");
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<boolean>(false);

  // Sync internal state if prop changes
  useEffect(() => {
    setCode(chartCode);
  }, [chartCode]);

  useEffect(() => {
    let isMounted = true;

    async function renderMermaid() {
      if (!code) return;
      try {
        setRenderError(false);
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
          fontFamily: "monospace",
        });

        const id = `mermaid-svg-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(id, code);
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err) {
        console.warn("Mermaid SVG render fallback:", err);
        if (isMounted) setRenderError(true);
      }
    }

    renderMermaid();

    return () => {
      isMounted = false;
    };
  }, [code]);

  const addComponent = (snippet: string) => {
    setCode((prev) => `${prev.trim()}\n    ${snippet}`);
  };

  return (
    <div className="bg-neutral-950 p-4 sm:p-5 rounded-xl border border-slate/20 shadow-inner space-y-3 font-mono text-xs">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate/10 pb-2.5 gap-2">
        <div className="flex items-center space-x-2">
          <span className="bg-focus/20 text-focus px-2 py-0.5 rounded font-bold uppercase text-[10px]">
            🏗️ Interactive Architecture Canvas
          </span>
          {title && <span className="text-slate text-[11px] truncate max-w-xs">{title}</span>}
        </div>

        <div className="flex items-center space-x-1.5 text-[11px]">
          <button
            onClick={() => setActiveMode("preview")}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeMode === "preview" ? "bg-focus text-white font-bold" : "bg-neutral-900 text-slate hover:text-ink"
            }`}
          >
            👁️ View Diagram
          </button>
          <button
            onClick={() => setActiveMode("editor")}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeMode === "editor" ? "bg-focus text-white font-bold" : "bg-neutral-900 text-slate hover:text-ink"
            }`}
          >
            ✏️ Edit Mermaid Code
          </button>
        </div>
      </div>

      {/* Quick Component Insertion Toolbar (Visible in Editor Mode) */}
      {activeMode === "editor" && (
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-neutral-900 rounded-lg text-[10px]">
          <span className="text-slate uppercase font-bold mr-1">Quick Add:</span>
          <button
            type="button"
            onClick={() => addComponent("Service --> Cache[(Redis Cache Cluster)]")}
            className="bg-neutral-800 hover:bg-neutral-700 text-emerald-400 px-2 py-1 rounded border border-neutral-700"
          >
            + Redis Cache
          </button>
          <button
            type="button"
            onClick={() => addComponent("Service --> Queue[[Apache Kafka Broker]]")}
            className="bg-neutral-800 hover:bg-neutral-700 text-amber-400 px-2 py-1 rounded border border-neutral-700"
          >
            + Kafka Queue
          </button>
          <button
            type="button"
            onClick={() => addComponent("Gateway[API Gateway] --> LB[Load Balancer]")}
            className="bg-neutral-800 hover:bg-neutral-700 text-sky-400 px-2 py-1 rounded border border-neutral-700"
          >
            + API Gateway & LB
          </button>
          <button
            type="button"
            onClick={() => addComponent("Service --> DB[(PostgreSQL Primary DB)]")}
            className="bg-neutral-800 hover:bg-neutral-700 text-purple-400 px-2 py-1 rounded border border-neutral-700"
          >
            + Postgres DB
          </button>
          <button
            type="button"
            onClick={() => setCode(chartCode)}
            className="bg-neutral-800 hover:bg-neutral-700 text-slate px-2 py-1 rounded ml-auto"
          >
            ↺ Reset
          </button>
        </div>
      )}

      {/* Live Editor Pane */}
      {activeMode === "editor" && (
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="w-full bg-neutral-950 text-emerald-400 p-4 font-mono text-xs rounded-xl border border-neutral-800 h-40 focus:outline-none resize-y leading-relaxed"
        />
      )}

      {/* Diagram Rendering View */}
      {!renderError && svgContent ? (
        <div
          dangerouslySetInnerHTML={{ __html: svgContent }}
          className="flex justify-center items-center min-h-[180px] overflow-x-auto py-2 [&>svg]:max-w-full [&>svg]:h-auto"
        />
      ) : !renderError ? (
        <div className="flex flex-col items-center justify-center min-h-[160px] text-slate space-y-2">
          <div className="w-5 h-5 border-2 border-focus border-t-transparent rounded-full animate-spin" />
          <span className="text-[11px]">Rendering Mermaid.js Architecture Diagram...</span>
        </div>
      ) : (
        /* Fallback Visual Component if Mermaid render fails */
        <div className="p-4 bg-paper rounded-lg border border-slate/10 space-y-3">
          <span className="text-[10px] font-bold text-highlight uppercase">
            Architecture Blueprint Code (Syntax Notice)
          </span>
          <pre className="p-3 bg-neutral-900 text-emerald-400 rounded text-[11px] overflow-x-auto whitespace-pre leading-relaxed">
            {code}
          </pre>
        </div>
      )}
    </div>
  );
}

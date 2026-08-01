"use client";

import React, { useEffect, useRef, useState } from "react";

interface SystemDesignDiagramProps {
  chartCode: string;
  title?: string;
}

export function SystemDesignDiagram({ chartCode, title }: SystemDesignDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function renderMermaid() {
      if (!chartCode) return;
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
        const { svg } = await mermaid.render(id, chartCode);
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
  }, [chartCode]);

  return (
    <div className="bg-neutral-950 p-4 sm:p-5 rounded-xl border border-slate/20 shadow-inner space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate/10 pb-2">
        <div className="flex items-center space-x-2">
          <span className="bg-focus/20 text-focus px-2 py-0.5 rounded font-bold uppercase text-[10px]">
            🏗️ System Architecture Flowchart
          </span>
          {title && <span className="text-slate text-[11px] truncate max-w-xs">{title}</span>}
        </div>
        <span className="text-[10px] text-slate">Client-Side Rendered</span>
      </div>

      {!renderError && svgContent ? (
        <div
          ref={containerRef}
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
            Architecture Blueprint Code
          </span>
          <pre className="p-3 bg-neutral-900 text-emerald-400 rounded text-[11px] overflow-x-auto whitespace-pre leading-relaxed">
            {chartCode}
          </pre>
        </div>
      )}
    </div>
  );
}

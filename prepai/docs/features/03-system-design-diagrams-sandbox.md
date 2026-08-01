# Feature Spec 03: Interactive System Design Visualizer & Code Sandbox

**Feature ID:** FEAT-03  
**Target Goal:** Enhance System Design and Low-Level Design (LLD) questions with dynamic Mermaid.js flowcharts, interactive code sandboxes, and trade-off comparison tables.  
**Priority:** Medium (Phase 2)  

---

## 1. Overview & Business Value
System Design and LLD interviews for Senior IT roles demand visual understanding and trade-off evaluation. Text-only outlines fail to capture architecture flows. By embedding client-rendered Mermaid.js diagrams and code snippet playgrounds directly inside question cards, candidates can visually study complex systems.

### Candidate User Story
> "As a Senior DevOps/System Architect candidate, I want to see a flowchart diagram of the system design answer outline so I can draw and explain the architecture during my whiteboard interview."

---

## 2. Component Deliverables

1. **Mermaid.js Flowchart Generator (`components/SystemDesignDiagram.tsx`)**: Converts structured JSON diagram definitions or Mermaid markup strings into clean client-side rendered architecture diagrams.
2. **Code & SQL Sandbox (`components/CodeSandboxWidget.tsx`)**: Embedded syntax-highlighted code editor supporting TypeScript, Python, Java, and SQL for LLD and database tuning questions.
3. **Trade-Off Matrix Card**: Render structured side-by-side matrices (e.g. *PostgreSQL vs DynamoDB*, *REST vs gRPC*, *Single Primary vs Multi-Region Master*).

---

## 3. Data Schema & Gemini Prompt Updates

### File to Modify: `lib/gemini.ts`
Extend `QuestionData` interface and prompt:

```typescript
export interface SystemDesignDiagramData {
  mermaid_code?: string; // e.g. "graph TD\n A[Client] --> B[API Gateway]..."
  trade_offs?: {
    technology_a: string;
    technology_b: string;
    pros_a: string[];
    pros_b: string[];
    verdict: string;
  };
  sample_code_snippet?: {
    language: string;
    code: string;
    explanation: string;
  };
}
```

#### System Prompt Addition to `lib/gemini.ts`:
```text
For System Design (HLD) questions, include a valid mermaid_code string visualizing the architecture flow (Client -> Gateway -> Microservice -> DB).
For Low-Level Design (LLD) or Coding questions, include a sample_code_snippet with language and code.
```

---

## 4. UI/UX Component Specifications

### File to Create: `components/SystemDesignDiagram.tsx`

```tsx
"use client";

import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
});

interface Props {
  chartCode: string;
}

export function SystemDesignDiagram({ chartCode }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && chartCode) {
      containerRef.current.innerHTML = "";
      const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
      mermaid.render(id, chartCode).then(({ svg }) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      }).catch((err) => {
        console.error("Mermaid render error:", err);
      });
    }
  }, [chartCode]);

  return (
    <div className="bg-paper p-4 rounded-xl border border-slate/10 overflow-x-auto my-3">
      <h4 className="text-xs font-mono font-semibold uppercase text-focus mb-2">
        Architecture Flowchart (Mermaid.js)
      </h4>
      <div ref={containerRef} className="flex justify-center items-center min-h-[160px]" />
    </div>
  );
}
```

### File to Modify: `components/QuestionCard.tsx`
Add a view toggle bar inside the question card:
`[ 📄 Outline | 🏗️ Architecture Diagram | 💻 Code Sandbox | ⚖️ Trade-off Matrix ]`

---

## 5. Verification & Checklist

- [ ] Install `mermaid` package: `npm install mermaid`.
- [ ] Test dynamic rendering of Mermaid flowcharts across sample System Design questions.
- [ ] Verify Code Sandbox allows editing code snippets cleanly.
- [ ] Ensure SVG diagrams scale responsively on mobile and desktop viewports.

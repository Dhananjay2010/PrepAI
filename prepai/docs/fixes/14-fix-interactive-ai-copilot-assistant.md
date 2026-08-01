# Fix Spec 14: Interactive Realtime AI Copilot Assistant

- **Issue Type:** GAP
- **Target File(s):** [components/CopilotModal.tsx](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/components/CopilotModal.tsx), `app/api/copilot/route.ts` (New)
- **Priority:** HIGH
- **Affected Route(s):** Floating HUD on `/dashboard/[id]`

---

## 1. Current State & Root Cause Analysis

In [CopilotModal.tsx](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/components/CopilotModal.tsx), candidate clicks **"⚡ Live Copilot HUD"** expecting an on-demand AI assistant to answer technical questions during practice.

### Deficiencies & Pain Points:
1. **Static Search Filter:** The current modal only searches through existing questions generated in the active session.
2. **No Active Generative AI:** If a candidate wants to ask a custom technical question (e.g. *"What is the difference between ValueTask and Task in C# high-throughput microservices?"*), the Copilot cannot answer.

---

## 2. Proposed Technical Architecture

```mermaid
graph TD
    A[Candidate Opens Live Copilot HUD] --> B[Interactive Chat Workspace]
    B --> C[Candidate Inputs Technical Question / Topic Query]
    C --> D[/api/copilot API Endpoint]
    D --> E[Gemini Flash Generative Response Engine]
    E --> F[Render Concise Spoken-Ready AI Explanation + Code Example]
    F --> G[Quick Buttons: Add to Flashcards | Copy Answer]
```

### Key Enhancements:
1. **Interactive Conversational UI:** Full chat interface inside the floating Copilot modal HUD.
2. **Context-Aware Prompts:** Inject session `role_summary`, `seniority`, and `key_skills` into the Copilot context so answers match the target role.
3. **Quick Presets:** Provide 1-click prompt buttons:
   - *"Explain top 3 trade-offs for [Topic]"*
   - *"Give me a 60-second verbal answer outline"*
   - *"Show a production C# / SQL code example"*

---

## 3. Step-by-Step Implementation Plan

### Step 3.1: Create Endpoint `app/api/copilot/route.ts`

```typescript
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { prompt, roleSummary, seniority } = await req.json();
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const systemPrompt = `You are PrepAI Copilot, an elite technical assistant for a candidate preparing for a ${seniority || "Senior"} role (${roleSummary}).
Provide concise, highly accurate, interview-ready technical explanations in 150 words or less. Include code snippets or trade-off points where applicable.`;

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [
        { role: "user", parts: [{ text: `${systemPrompt}\n\nCandidate Question: ${prompt}` }] }
      ],
    });

    return NextResponse.json({ text: response.text });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

### Step 3.2: Update `CopilotModal.tsx` Component
Replace static search filtering with an interactive chat message list calling `/api/copilot`.

---

## 4. Regression Prevention & Safety Mitigation

- **Streaming Response:** Use fast `gemini-flash-latest` model to ensure sub-1 second latency for real-time responsiveness.
- **Error Fallback:** If API fails or offline, display clear message: *"Copilot is offline. You can search session questions below."* with automatic fallback to static search mode.

---

## 5. Verification & Acceptance Criteria

1. **Interactive Query Test:** Open Copilot HUD, type *"Explain B-Tree vs LSM Tree indexing"*. Confirm Gemini returns concise model explanation within 1.5 seconds.
2. **Preset Button Test:** Click *"Explain top 3 trade-offs"*. Confirm query populates and sends automatically.

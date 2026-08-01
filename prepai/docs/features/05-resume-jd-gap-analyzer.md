# Feature Spec 05: Resume vs. JD Skill-Gap Analyzer

**Feature ID:** FEAT-05  
**Target Goal:** Compare candidate's PDF resume against target Job Description (JD) to highlight high-risk technical gaps and generate tailored STAR stories.  
**Priority:** High (Phase 1)  

---

## 1. Overview & Business Value
Candidates often apply for jobs where the JD requires technologies they haven't listed on their resume, or where their experience needs to be re-framed to match the target seniority level. Comparing the candidate's resume with the JD highlights critical gap areas so they are not caught unprepared during technical screens.

### Candidate User Story
> "As a Full-Stack Developer applying for a Cloud Architect role, I want to upload my PDF resume alongside the target JD so I can identify missing cloud skills and get tailored STAR stories bridging my past projects to their requirements."

---

## 2. Key Matrix Outputs

1. **Skill Overlap Score (0–100%)**: Quantitative match ratio based on key tech stack requirements.
2. **Confirmed Safe Skills (Green)**: Technologies present in both resume and JD.
3. **Critical Skill Gaps (Red)**: Key tech stack required by JD but missing from resume.
4. **Tailored STAR Story Suggestions**: AI-generated stories framing past projects to satisfy target JD competency requirements.

---

## 3. API Contract & Implementation Details

### File to Create: `app/api/resume-match/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobDescription } = await req.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json({ error: "Missing resume or job description" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const prompt = `Analyze this candidate's Resume against the target Job Description.
    
RESUME:
${resumeText.slice(0, 4000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 4000)}

Return JSON with:
1. matchPercentage (number 0-100)
2. confirmedSkills (string array)
3. criticalGaps (string array of technologies in JD missing from resume)
4. tailoredStarStories (array of { competency: string, suggestedStory: string })`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const data = JSON.parse(response.text || "{}");
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Match analysis failed" }, { status: 500 });
  }
}
```

---

## 4. UI/UX Component Specifications

### File to Create: `components/ResumeGapVisualizer.tsx`

```tsx
"use client";

import React, { useState } from "react";

export function ResumeGapVisualizer() {
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleAnalyze() {
    if (!resumeText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/resume-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription: "Target JD string..." }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-paper-raised rounded-xl p-6 border border-slate/10 space-y-4">
      <h3 className="font-display text-lg font-bold text-ink">Resume vs. JD Skill-Gap Analyzer</h3>

      {!result ? (
        <div className="space-y-3">
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste text from your PDF resume here..."
            className="w-full h-32 p-3 bg-paper border border-slate/20 rounded-lg text-xs font-mono"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !resumeText.trim()}
            className="bg-focus text-white px-4 py-2 rounded-md text-xs font-medium"
          >
            {loading ? "Analyzing Skill Gaps..." : "Compare Resume with JD"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-paper p-4 rounded-lg border border-slate/10">
            <span className="text-xs font-mono font-bold text-slate">Skill Match Score</span>
            <span className="text-2xl font-bold text-mint">{result.matchPercentage}%</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-mint/10 p-3 rounded-lg border border-mint/20">
              <span className="text-xs font-mono font-bold text-mint">Confirmed Safe Skills</span>
              <ul className="text-xs space-y-1 mt-2">
                {result.confirmedSkills?.map((s: string, i: number) => (
                  <li key={i}>✓ {s}</li>
                ))}
              </ul>
            </div>

            <div className="bg-coral/10 p-3 rounded-lg border border-coral/20">
              <span className="text-xs font-mono font-bold text-coral">Critical Skill Gaps</span>
              <ul className="text-xs space-y-1 mt-2">
                {result.criticalGaps?.map((g: string, i: number) => (
                  <li key={i}>⚠️ {g}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 5. Verification & Checklist

- [ ] Test API endpoint `/api/resume-match` with sample resume and JD inputs.
- [ ] Verify gap analyzer highlights missing tech stack clearly.
- [ ] Confirm tailored STAR story suggestions bridge past experience to target JD requirements.

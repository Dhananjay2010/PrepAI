import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { prompt, roleSummary, seniority } = await req.json();

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: "Empty prompt provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are PrepAI Copilot, an elite technical interview assistant for a candidate preparing for a ${seniority || "Senior"} position (${roleSummary || "Software Engineering Role"}).
Provide concise, highly accurate, interview-ready technical explanations in 150 words or less. Include code snippets or trade-off points where applicable. Keep the answer structured for speaking out loud in an interview.`;

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nCandidate Question: ${prompt}` }],
        },
      ],
      config: { temperature: 0.6 },
    });

    return NextResponse.json({
      text: response.text || "No response received from Copilot AI.",
    });
  } catch (err: any) {
    console.error("Copilot API error:", err);
    return NextResponse.json(
      { error: err?.message || "Copilot query failed" },
      { status: 500 }
    );
  }
}

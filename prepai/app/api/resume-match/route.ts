import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }
  return new GoogleGenAI({ apiKey });
}

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobDescription } = await req.json();

    if (!resumeText || resumeText.trim().length < 20) {
      return NextResponse.json(
        { error: "Please paste a fuller text from your resume." },
        { status: 400 }
      );
    }

    if (!jobDescription || jobDescription.trim().length < 20) {
      return NextResponse.json(
        { error: "Missing job description context for resume matching." },
        { status: 400 }
      );
    }

    const ai = getAIClient();

    const prompt = `You are PrepAI, an expert technical recruiter and resume strategist.
Analyze this candidate's Resume against the target Job Description.

RESUME:
${resumeText.slice(0, 5000)}

TARGET JOB DESCRIPTION:
${jobDescription.slice(0, 5000)}

Output rules:
- Respond in valid JSON only. No markdown fences.
- Extract overlapping tech stack skills and missing required competencies.
- Generate tailored STAR story outlines bridging the candidate's actual background to target JD requirements.

JSON format:
{
  "matchPercentage": 75,
  "confirmedSkills": ["PostgreSQL", "Node.js", "Docker"],
  "criticalGaps": ["Kubernetes (K8s)", "Kafka Event Streaming", "gRPC"],
  "highRiskAreas": [
    "JD requires distributed systems scale at 100k QPS, but resume only highlights monolithic architecture."
  ],
  "tailoredStarStories": [
    {
      "competency": "Kafka / Event Streaming Gap",
      "situation": "Target JD requires Kafka, candidate has heavy RabbitMQ pub/sub experience.",
      "suggestedStory": "Explain how you designed async queue pipelines in RabbitMQ and frame key concepts (partitions, retention, ordering) as directly transferable to Apache Kafka architecture."
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { temperature: 0.7, responseMimeType: "application/json" },
    });

    const responseText = response.text || "{}";
    const data = JSON.parse(responseText);

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Resume match error:", err);
    return NextResponse.json(
      { error: err?.message || "Resume gap analysis failed. Please try again." },
      { status: 500 }
    );
  }
}

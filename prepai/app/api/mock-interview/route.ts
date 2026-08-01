import { NextRequest, NextResponse } from "next/server";
import { mockInterviewTurn } from "@/lib/gemini";
import { getUserPlan } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { userId, roleSummary, currentQuestion, candidateAnswer } = await req.json();

    const effectiveUserId = userId || "guest_dev_user";

    if (!userId && process.env.NODE_ENV !== "development") {
      return NextResponse.json({ error: "Sign in required to access Mock Interview mode" }, { status: 401 });
    }

    if (!currentQuestion || !candidateAnswer || candidateAnswer.trim().length < 5) {
      return NextResponse.json(
        { error: "Please provide a more detailed answer to evaluate" },
        { status: 400 }
      );
    }

    const plan = await getUserPlan(effectiveUserId);
    if (plan !== "paid" && process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        { error: "Mock interview mode is a Pro feature — upgrade to unlock interactive AI practice" },
        { status: 403 }
      );
    }

    const result = await mockInterviewTurn(
      roleSummary || "Software Engineer",
      currentQuestion,
      candidateAnswer
    );

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Mock interview error:", err);
    return NextResponse.json(
      { error: err.message || "Evaluation failed. Please try again." },
      { status: 500 }
    );
  }
}

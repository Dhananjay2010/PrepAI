import { NextRequest, NextResponse } from "next/server";
import { generateMoreQuestions } from "@/lib/gemini";
import { getUserPlan, supabaseAdmin, ensureUserProfile } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { userId, sessionId, jobDescription, existingQuestions } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "auth_required", message: "Please sign in to generate more questions." },
        { status: 401 }
      );
    }

    await ensureUserProfile(userId);

    const plan = await getUserPlan(userId);

    if (plan !== "paid") {
      return NextResponse.json(
        {
          error: "upgrade_required",
          message: "Generating additional interview questions requires a Pro Subscription plan.",
        },
        { status: 403 }
      );
    }

    const currentQs: any[] = Array.isArray(existingQuestions) ? existingQuestions : [];
    const questionTexts = currentQs.map((q) => q.question || "");
    const startNum = currentQs.length + 1;

    // Call Gemini to generate 5 more targeted questions
    const newQuestions = await generateMoreQuestions(
      jobDescription || "",
      questionTexts,
      startNum,
      5
    );

    const combinedQuestions = [...currentQs, ...newQuestions];

    // Persist updated questions array into session record if sessionId provided
    if (sessionId) {
      await supabaseAdmin
        .from("sessions")
        .update({ questions: combinedQuestions })
        .eq("id", sessionId);
    }

    return NextResponse.json({
      success: true,
      newQuestions,
      updatedQuestions: combinedQuestions,
    });
  } catch (err: any) {
    console.error("Generate more questions error:", err);
    return NextResponse.json(
      { error: "generation_failed", message: err?.message || "Failed to generate additional questions" },
      { status: 500 }
    );
  }
}

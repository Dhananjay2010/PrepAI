import { NextRequest, NextResponse } from "next/server";
import { generateQuestions } from "@/lib/gemini";
import {
  getUserPlan,
  checkAndIncrementFreeUsage,
  ensureUserProfile,
  updateStreak,
  supabaseAdmin,
} from "@/lib/supabase";

const MAX_JD_LENGTH = 8000;

export async function POST(req: NextRequest) {
  try {
    const { jobDescription, userId } = await req.json();

    if (!jobDescription || jobDescription.trim().length < 30) {
      return NextResponse.json(
        { error: "Please paste a fuller job description" },
        { status: 400 }
      );
    }

    if (jobDescription.length > MAX_JD_LENGTH) {
      return NextResponse.json(
        { error: "That's too long — try pasting just the role description" },
        { status: 400 }
      );
    }

    let plan: "free" | "paid" = "free";
    if (userId) {
      await ensureUserProfile(userId);
      const [usageCheck, userPlan] = await Promise.all([
        checkAndIncrementFreeUsage(userId),
        getUserPlan(userId),
      ]);

      if (!usageCheck.allowed) {
        return NextResponse.json(
          { error: usageCheck.reason || "Daily free limit reached — upgrade to Pro for unlimited prep sessions" },
          { status: 429 }
        );
      }
      plan = userPlan;
    }

    const questionCount = plan === "paid" ? 20 : 5;

    const result = await generateQuestions(jobDescription, questionCount);

    if (result.error === "not_a_job_description") {
      return NextResponse.json(
        { error: "That doesn't look like a job description — try pasting the full posting" },
        { status: 400 }
      );
    }

    let savedSessionId: string | undefined = undefined;

    // Save session server-side for logged in users and return sessionId
    if (userId) {
      try {
        const { data: sessData } = await supabaseAdmin
          .from("sessions")
          .insert({
            user_id: userId,
            job_description: jobDescription,
            role_summary: result.role_summary,
            seniority: result.seniority,
            topics: result.topics,
            questions: result.questions,
          })
          .select("id")
          .single();

        if (sessData?.id) {
          savedSessionId = sessData.id;
        }

        updateStreak(userId).catch(console.error);
      } catch (saveErr) {
        console.error("Server-side session save warning:", saveErr);
      }
    }

    return NextResponse.json({
      ...result,
      sessionId: savedSessionId,
    });
  } catch (err: any) {
    console.error("Gemini generation error:", err);
    return NextResponse.json(
      { error: err?.message || "Generation failed, please try again" },
      { status: 500 }
    );
  }
}

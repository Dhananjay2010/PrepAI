import { NextRequest, NextResponse } from "next/server";
import { generatePreciseAnswer } from "@/lib/gemini";
import { supabaseAdmin, getUserPlan, ensureUserProfile } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const question = searchParams.get("question");

    if (!userId || !question) {
      return NextResponse.json({ found: false });
    }

    // 1. Try precise_answers table if present
    try {
      const { data: existingAnswer } = await supabaseAdmin
        .from("precise_answers")
        .select("precise_answer")
        .eq("user_id", userId)
        .eq("question_text", question)
        .single();

      if (existingAnswer?.precise_answer) {
        return NextResponse.json({
          found: true,
          preciseAnswer: existingAnswer.precise_answer,
        });
      }
    } catch {
      // Table might not exist yet in Supabase schema
    }

    // 2. Check bookmarks table
    try {
      const { data: bData } = await supabaseAdmin
        .from("bookmarks")
        .select("question")
        .eq("user_id", userId);

      if (bData) {
        for (const item of bData) {
          if (item.question?.question === question && item.question?.precise_answer) {
            return NextResponse.json({
              found: true,
              preciseAnswer: item.question.precise_answer,
            });
          }
        }
      }
    } catch {}

    // 3. Check sessions table
    try {
      const { data: sData } = await supabaseAdmin
        .from("sessions")
        .select("questions")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (sData) {
        for (const s of sData) {
          if (Array.isArray(s.questions)) {
            for (const q of s.questions) {
              if (q.question === question && q.precise_answer) {
                return NextResponse.json({
                  found: true,
                  preciseAnswer: q.precise_answer,
                });
              }
            }
          }
        }
      }
    } catch {}

    return NextResponse.json({ found: false });
  } catch (err) {
    return NextResponse.json({ found: false });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, sessionId, question, category, whatTheyTest } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "auth_required", message: "Please sign in to get precise AI model answers." },
        { status: 401 }
      );
    }

    if (!question) {
      return NextResponse.json(
        { error: "Question text is required" },
        { status: 400 }
      );
    }

    await ensureUserProfile(userId);

    // 1. Check if precise answer is already saved in precise_answers, bookmarks, or sessions
    try {
      const { data: existingAnswer } = await supabaseAdmin
        .from("precise_answers")
        .select("precise_answer")
        .eq("user_id", userId)
        .eq("question_text", question)
        .single();

      if (existingAnswer?.precise_answer) {
        return NextResponse.json({
          success: true,
          preciseAnswer: existingAnswer.precise_answer,
          cached: true,
        });
      }
    } catch {}

    // 2. Check Free tier usage limit
    const plan = await getUserPlan(userId);
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("precise_answers_used")
      .eq("id", userId)
      .single();

    const usedCount = profile?.precise_answers_used || 0;

    if (plan === "free" && usedCount >= 1) {
      return NextResponse.json(
        {
          error: "limit_reached",
          message: "Free tier limit reached (1 precise model answer). Upgrade to Pro for unlimited precise AI answers.",
        },
        { status: 429 }
      );
    }

    // 3. Generate precise answer with Gemini
    const result = await generatePreciseAnswer(
      question,
      category || "General Technical",
      whatTheyTest || "Technical expertise"
    );

    // 4. Save to precise_answers table if available
    try {
      await supabaseAdmin.from("precise_answers").upsert(
        {
          user_id: userId,
          question_text: question,
          precise_answer: result,
        },
        { onConflict: "user_id,question_text" }
      );
    } catch {}

    // 5. Update question in sessions table if sessionId is provided or in recent sessions
    try {
      if (sessionId) {
        const { data: s } = await supabaseAdmin
          .from("sessions")
          .select("questions")
          .eq("id", sessionId)
          .single();

        if (s && Array.isArray(s.questions)) {
          const updatedQs = s.questions.map((q: any) => {
            if (q.question === question) {
              return { ...q, precise_answer: result };
            }
            return q;
          });

          await supabaseAdmin
            .from("sessions")
            .update({ questions: updatedQs })
            .eq("id", sessionId);
        }
      } else {
        // Update most recent session containing this question
        const { data: sData } = await supabaseAdmin
          .from("sessions")
          .select("id, questions")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5);

        if (sData) {
          for (const s of sData) {
            if (Array.isArray(s.questions)) {
              let matched = false;
              const updatedQs = s.questions.map((q: any) => {
                if (q.question === question) {
                  matched = true;
                  return { ...q, precise_answer: result };
                }
                return q;
              });

              if (matched) {
                await supabaseAdmin
                  .from("sessions")
                  .update({ questions: updatedQs })
                  .eq("id", s.id);
                break;
              }
            }
          }
        }
      }
    } catch (saveErr) {
      console.error("Session update error:", saveErr);
    }

    // 6. Update question in bookmarks table if bookmarked
    try {
      const { data: bData } = await supabaseAdmin
        .from("bookmarks")
        .select("id, question")
        .eq("user_id", userId);

      if (bData) {
        for (const item of bData) {
          if (item.question?.question === question) {
            const updatedBmQ = { ...item.question, precise_answer: result };
            await supabaseAdmin
              .from("bookmarks")
              .update({ question: updatedBmQ })
              .eq("id", item.id);
          }
        }
      }
    } catch {}

    // 7. Increment count for free tier users
    if (plan === "free") {
      await supabaseAdmin
        .from("profiles")
        .update({ precise_answers_used: usedCount + 1 })
        .eq("id", userId);
    }

    return NextResponse.json({
      success: true,
      preciseAnswer: result,
      cached: false,
      remainingFreeUses: plan === "free" ? Math.max(0, 1 - (usedCount + 1)) : "unlimited",
    });
  } catch (err: any) {
    console.error("Precise answer generation error:", err);
    return NextResponse.json(
      { error: "generation_failed", message: err?.message || "Failed to generate precise answer" },
      { status: 500 }
    );
  }
}

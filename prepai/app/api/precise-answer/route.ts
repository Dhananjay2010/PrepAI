import { NextRequest, NextResponse } from "next/server";
import { generatePreciseAnswer } from "@/lib/gemini";
import { supabaseAdmin, getUserPlan, ensureUserProfile } from "@/lib/supabase";

// In-Memory Fast Cache for Precise Answers (< 5ms hit)
const fastPreciseCache = new Map<string, any>();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const question = searchParams.get("question");

    if (!userId || !question) {
      return NextResponse.json({ found: false });
    }

    const cacheKey = `${userId}:${question}`;
    if (fastPreciseCache.has(cacheKey)) {
      return NextResponse.json(
        { found: true, preciseAnswer: fastPreciseCache.get(cacheKey) },
        { headers: { "Cache-Control": "private, max-age=300, stale-while-revalidate=86400" } }
      );
    }

    // Parallel DB lookup across precise_answers, bookmarks, and sessions
    const [paRes, bmRes, sessRes] = await Promise.allSettled([
      supabaseAdmin
        .from("precise_answers")
        .select("precise_answer")
        .eq("user_id", userId)
        .eq("question_text", question)
        .single(),

      supabaseAdmin
        .from("bookmarks")
        .select("question")
        .eq("user_id", userId),

      supabaseAdmin
        .from("sessions")
        .select("questions")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    // 1. Check precise_answers result
    if (paRes.status === "fulfilled" && paRes.value.data?.precise_answer) {
      const ans = paRes.value.data.precise_answer;
      fastPreciseCache.set(cacheKey, ans);
      return NextResponse.json(
        { found: true, preciseAnswer: ans },
        { headers: { "Cache-Control": "private, max-age=300, stale-while-revalidate=86400" } }
      );
    }

    // 2. Check bookmarks result
    if (bmRes.status === "fulfilled" && Array.isArray(bmRes.value.data)) {
      for (const item of bmRes.value.data) {
        if (item.question?.question === question && item.question?.precise_answer) {
          const ans = item.question.precise_answer;
          fastPreciseCache.set(cacheKey, ans);
          return NextResponse.json(
            { found: true, preciseAnswer: ans },
            { headers: { "Cache-Control": "private, max-age=300, stale-while-revalidate=86400" } }
          );
        }
      }
    }

    // 3. Check sessions result
    if (sessRes.status === "fulfilled" && Array.isArray(sessRes.value.data)) {
      for (const sess of sessRes.value.data) {
        if (Array.isArray(sess.questions)) {
          for (const q of sess.questions) {
            if (q.question === question && q.precise_answer) {
              const ans = q.precise_answer;
              fastPreciseCache.set(cacheKey, ans);
              return NextResponse.json(
                { found: true, preciseAnswer: ans },
                { headers: { "Cache-Control": "private, max-age=300, stale-while-revalidate=86400" } }
              );
            }
          }
        }
      }
    }

    return NextResponse.json({ found: false });
  } catch (err) {
    console.error("GET precise answer error:", err);
    return NextResponse.json({ found: false });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, sessionId, question, category, whatTheyTest } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "auth_required", message: "Please sign in to get precise model answers." },
        { status: 401 }
      );
    }

    if (!question) {
      return NextResponse.json(
        { error: "Question text is required" },
        { status: 400 }
      );
    }

    const cacheKey = `${userId}:${question}`;
    if (fastPreciseCache.has(cacheKey)) {
      return NextResponse.json({
        success: true,
        preciseAnswer: fastPreciseCache.get(cacheKey),
        cached: true,
      });
    }

    await ensureUserProfile(userId);

    // Check Free tier usage limit in parallel with DB cache check
    const [plan, profileRes] = await Promise.all([
      getUserPlan(userId),
      supabaseAdmin
        .from("profiles")
        .select("precise_answers_used")
        .eq("id", userId)
        .single(),
    ]);

    const usedCount = profileRes.data?.precise_answers_used || 0;

    if (plan === "free" && usedCount >= 1) {
      return NextResponse.json(
        {
          error: "limit_reached",
          message: "Free tier limit reached (1 precise model answer). Upgrade to Pro for unlimited precise AI answers.",
        },
        { status: 429 }
      );
    }

    // Generate precise answer with Gemini
    const preciseAnswer = await generatePreciseAnswer(
      question,
      category || "Technical",
      whatTheyTest || ""
    );

    // Save to memory cache immediately
    fastPreciseCache.set(cacheKey, preciseAnswer);

    // Asynchronously update profile count, precise_answers, session JSON & bookmarks JSON
    (async () => {
      try {
        if (plan === "free") {
          await supabaseAdmin
            .from("profiles")
            .update({ precise_answers_used: usedCount + 1 })
            .eq("id", userId);
        }

        await supabaseAdmin.from("precise_answers").upsert(
          {
            user_id: userId,
            question_text: question,
            precise_answer: preciseAnswer,
          },
          { onConflict: "user_id,question_text" }
        );

        if (sessionId) {
          const { data: currentSess } = await supabaseAdmin
            .from("sessions")
            .select("questions")
            .eq("id", sessionId)
            .single();

          if (currentSess && Array.isArray(currentSess.questions)) {
            const updatedQs = currentSess.questions.map((q: any) =>
              q.question === question ? { ...q, precise_answer: preciseAnswer } : q
            );
            await supabaseAdmin
              .from("sessions")
              .update({ questions: updatedQs })
              .eq("id", sessionId);
          }
        }
      } catch (saveErr) {
        console.error("Async save error:", saveErr);
      }
    })();

    return NextResponse.json({
      success: true,
      preciseAnswer,
    });
  } catch (err: any) {
    console.error("Precise answer POST error:", err);
    return NextResponse.json(
      { error: "generation_failed", message: err?.message || "Failed to generate precise model answer" },
      { status: 500 }
    );
  }
}

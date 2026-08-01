import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("flashcards")
      .select("*")
      .eq("user_id", userId)
      .lte("next_review_date", new Date().toISOString().split("T")[0])
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ dueCards: data || [], dueCount: (data || []).length });
  } catch (err: any) {
    console.error("Fetch due flashcards error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch due flashcards" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, userId, sessionId, questionText, answerText, cardId, rating } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Action 1: Add new flashcard to deck
    if (action === "add") {
      if (!questionText || !answerText) {
        return NextResponse.json({ error: "Missing question or answer text" }, { status: 400 });
      }

      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabaseAdmin
        .from("flashcards")
        .upsert(
          {
            user_id: userId,
            session_id: sessionId || null,
            question_text: questionText,
            answer_text: answerText,
            box: 1,
            next_review_date: today,
          },
          { onConflict: "user_id,question_text" }
        )
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, card: data });
    }

    // Action 2: Process card review rating (Leitner 5-Box SRS Engine)
    if (action === "review") {
      if (!cardId || !rating) {
        return NextResponse.json({ error: "Missing cardId or rating" }, { status: 400 });
      }

      // Fetch current card state
      const { data: card, error: fetchErr } = await supabaseAdmin
        .from("flashcards")
        .select("*")
        .eq("id", cardId)
        .single();

      if (fetchErr || !card) {
        return NextResponse.json({ error: "Flashcard not found" }, { status: 404 });
      }

      let newBox = card.box || 1;
      let daysToAdd = 1;

      if (rating === "hard") {
        newBox = 1;
        daysToAdd = 1;
      } else if (rating === "good") {
        newBox = Math.min(5, newBox + 1);
        daysToAdd = newBox === 1 ? 1 : newBox === 2 ? 2 : newBox === 3 ? 5 : newBox === 4 ? 10 : 30;
      } else if (rating === "easy") {
        newBox = 5;
        daysToAdd = 30;
      }

      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + daysToAdd);
      const nextReviewDateStr = nextDate.toISOString().split("T")[0];

      const { data: updatedCard, error: updateErr } = await supabaseAdmin
        .from("flashcards")
        .update({
          box: newBox,
          next_review_date: nextReviewDateStr,
        })
        .eq("id", cardId)
        .select()
        .single();

      if (updateErr) throw updateErr;

      return NextResponse.json({ success: true, card: updatedCard });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Flashcard API error:", err);
    return NextResponse.json({ error: err.message || "Flashcard request failed" }, { status: 500 });
  }
}

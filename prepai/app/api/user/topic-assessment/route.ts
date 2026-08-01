import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, topicId, status } = await req.json();

    if (!sessionId || !topicId) {
      return NextResponse.json({ error: "Missing sessionId or topicId" }, { status: 400 });
    }

    // Fetch existing session topic_assessments
    const { data: sessionData, error: fetchErr } = await supabaseAdmin
      .from("sessions")
      .select("topic_assessments")
      .eq("id", sessionId)
      .single();

    if (fetchErr) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const currentAssessments = sessionData.topic_assessments || {};
    const updatedAssessments = {
      ...currentAssessments,
      [topicId]: status, // "strong" | "weak" | null
    };

    // Update in database
    const { error: updateErr } = await supabaseAdmin
      .from("sessions")
      .update({ topic_assessments: updatedAssessments })
      .eq("id", sessionId);

    if (updateErr) {
      throw updateErr;
    }

    return NextResponse.json({ success: true, topic_assessments: updatedAssessments });
  } catch (err: any) {
    console.error("Topic assessment save error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to update topic assessment" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, stories } = await req.json();

    if (!sessionId || !Array.isArray(stories)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("sessions")
      .update({ star_stories: stories })
      .eq("id", sessionId);

    if (error) {
      console.warn("STAR stories save error (db schema fallback):", error.message);
    }

    return NextResponse.json({ success: true, count: stories.length });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save STAR stories" }, { status: 500 });
  }
}

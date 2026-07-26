import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, ensureUserProfile } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { userId, interviewDate } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    await ensureUserProfile(userId);

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ interview_date: interviewDate || null })
      .eq("id", userId);

    if (error) throw error;

    return NextResponse.json({ success: true, interviewDate });
  } catch (err: any) {
    console.error("Set interview date error:", err);
    return NextResponse.json({ error: err.message || "Failed to update interview date" }, { status: 500 });
  }
}

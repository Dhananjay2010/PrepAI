import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId parameter is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch sessions DB error:", error);
      throw error;
    }

    return NextResponse.json(
      { sessions: data || [] },
      { headers: { "Cache-Control": "private, max-age=10, stale-while-revalidate=60" } }
    );
  } catch (err: any) {
    console.error("Fetch sessions error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch sessions" }, { status: 500 });
  }
}

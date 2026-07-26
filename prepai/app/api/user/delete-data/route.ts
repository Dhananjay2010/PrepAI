import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Delete saved sessions
    await supabaseAdmin.from("sessions").delete().eq("user_id", userId);

    // Reset profile session counters
    await supabaseAdmin
      .from("profiles")
      .update({ free_generations_today: 0, last_generation_date: null })
      .eq("id", userId);

    return NextResponse.json({ success: true, message: "User data deleted successfully" });
  } catch (err: any) {
    console.error("Data deletion error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete user data" },
      { status: 500 }
    );
  }
}

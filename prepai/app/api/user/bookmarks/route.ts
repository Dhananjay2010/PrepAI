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
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ bookmarks: data || [] });
  } catch (err: any) {
    console.error("Fetch bookmarks error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch bookmarks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, question, action } = await req.json();

    if (!userId || !question) {
      return NextResponse.json({ error: "userId and question required" }, { status: 400 });
    }

    if (action === "remove") {
      await supabaseAdmin
        .from("bookmarks")
        .delete()
        .eq("user_id", userId)
        .filter("question->>question", "eq", question.question);

      return NextResponse.json({ success: true, action: "removed" });
    } else {
      await supabaseAdmin.from("bookmarks").insert({
        user_id: userId,
        question,
      });

      return NextResponse.json({ success: true, action: "added" });
    }
  } catch (err: any) {
    console.error("Bookmark toggle error:", err);
    return NextResponse.json({ error: err.message || "Failed to update bookmark" }, { status: 500 });
  }
}

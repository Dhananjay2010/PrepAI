import { NextRequest, NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/razorpay";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { userId, subscriptionId } = await req.json();

    if (!userId || !subscriptionId) {
      return NextResponse.json({ error: "Missing userId or subscriptionId" }, { status: 400 });
    }

    const razorpay = getRazorpayClient();
    await razorpay.subscriptions.cancel(subscriptionId, false);

    // Update profile status locally as well
    await supabaseAdmin
      .from("profiles")
      .update({ plan: "free", subscription_status: "cancelled" })
      .eq("id", userId);

    return NextResponse.json({ success: true, message: "Subscription cancelled successfully" });
  } catch (err: any) {
    console.error("Razorpay cancellation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}

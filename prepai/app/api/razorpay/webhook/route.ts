import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret || !signature) {
      return NextResponse.json({ error: "Missing webhook secret or signature" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.warn("Invalid Razorpay webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    const sub = event.payload?.subscription?.entity;
    const userId = sub?.notes?.userId;

    if (!userId) {
      console.log("Razorpay event received without userId in notes:", event.event);
      return NextResponse.json({ received: true });
    }

    switch (event.event) {
      case "subscription.activated":
        await supabaseAdmin
          .from("profiles")
          .update({
            plan: "paid",
            subscription_status: "active",
            razorpay_subscription_id: sub.id,
          })
          .eq("id", userId);
        break;

      case "subscription.charged":
        await supabaseAdmin.from("payments").insert({
          user_id: userId,
          razorpay_subscription_id: sub.id,
          amount: 299,
          status: "success",
        });
        break;

      case "subscription.cancelled":
      case "subscription.completed":
        await supabaseAdmin
          .from("profiles")
          .update({ plan: "free", subscription_status: "cancelled" })
          .eq("id", userId);
        break;

      case "subscription.pending":
        await supabaseAdmin
          .from("profiles")
          .update({ subscription_status: "failed" })
          .eq("id", userId);
        break;

      default:
        console.log("Unhandled Razorpay event:", event.event);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Razorpay webhook error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

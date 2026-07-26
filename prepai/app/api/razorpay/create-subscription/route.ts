import { NextRequest, NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const planId = process.env.RAZORPAY_PLAN_ID;
    if (!planId) {
      return NextResponse.json(
        { error: "RAZORPAY_PLAN_ID is not configured in server environment" },
        { status: 500 }
      );
    }

    const razorpay = getRazorpayClient();

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 120, // max billing cycles (10 years)
      notes: { userId },
    });

    return NextResponse.json(subscription);
  } catch (err: any) {
    console.error("Razorpay subscription creation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create subscription" },
      { status: 500 }
    );
  }
}

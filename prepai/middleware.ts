import { NextRequest, NextResponse } from "next/server";

// Simple in-memory IP rate limiter fallback (resets on worker restart / edge container lifecycle)
const ipRateMap = new Map<string, { count: number; date: string }>();
const MAX_IP_REQUESTS_PER_DAY = 10;

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/api/generate") {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown-ip";

    const today = new Date().toISOString().split("T")[0];
    const record = ipRateMap.get(ip);

    if (!record || record.date !== today) {
      ipRateMap.set(ip, { count: 1, date: today });
    } else {
      if (record.count >= MAX_IP_REQUESTS_PER_DAY) {
        return NextResponse.json(
          { error: "Too many requests from this IP — try again tomorrow" },
          { status: 429 }
        );
      }
      record.count += 1;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/generate",
};

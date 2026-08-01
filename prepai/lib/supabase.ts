import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// server-only client with elevated privileges — never import this in a "use client" file
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// In-Memory Fast Caching Layers for Sub-150ms Execution
const verifiedUserSet = new Set<string>();
const planCache = new Map<string, { plan: "free" | "paid"; expiresAt: number }>();

export async function ensureUserProfile(userId: string) {
  // Ultra-fast memory hit: 0ms execution for active sessions
  if (verifiedUserSet.has(userId)) return;

  try {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (!profile) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
      const email = userData?.user?.email || `user_${userId.substring(0, 8)}@prepai.com`;

      await supabaseAdmin.from("profiles").upsert({
        id: userId,
        email,
        plan: process.env.NODE_ENV === "development" ? "paid" : "free",
        free_generations_today: 0,
      });
    }

    verifiedUserSet.add(userId);
  } catch (err) {
    console.error("ensureUserProfile error:", err);
  }
}

export async function getUserPlan(userId: string): Promise<"free" | "paid"> {
  // Local Development Override: Always grant PRO status in dev environment for full feature testing!
  if (process.env.NODE_ENV === "development") {
    return "paid";
  }

  const now = Date.now();
  const cached = planCache.get(userId);
  if (cached && cached.expiresAt > now) {
    return cached.plan; // 0.1ms memory hit
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("plan")
      .eq("id", userId)
      .single();

    const plan = (error || !data ? "free" : data.plan as "free" | "paid") || "free";
    planCache.set(userId, { plan, expiresAt: now + 60000 }); // Cache for 60 seconds
    return plan;
  } catch {
    return "free";
  }
}

export async function checkAndIncrementFreeUsage(userId: string) {
  // Local Development Override: Unlimited generations in dev environment
  if (process.env.NODE_ENV === "development") {
    return { allowed: true };
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) {
    await ensureUserProfile(userId);
    return { allowed: true };
  }

  const today = new Date().toISOString().split("T")[0];

  if (profile.last_generation_date !== today) {
    await supabaseAdmin
      .from("profiles")
      .update({ free_generations_today: 1, last_generation_date: today })
      .eq("id", userId);
    return { allowed: true };
  }

  if (profile.plan === "free" && profile.free_generations_today >= 1) {
    return { allowed: false, reason: "Daily free limit reached" };
  }

  await supabaseAdmin
    .from("profiles")
    .update({ free_generations_today: (profile.free_generations_today || 0) + 1 })
    .eq("id", userId);

  return { allowed: true };
}

export async function updateStreak(userId: string) {
  try {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("last_practice_date, current_streak")
      .eq("id", userId)
      .single();

    if (!profile) return 0;

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    let newStreak = 1;
    if (profile.last_practice_date === yesterday) {
      newStreak = (profile.current_streak || 0) + 1;
    } else if (profile.last_practice_date === today) {
      newStreak = profile.current_streak || 1;
    }

    await supabaseAdmin
      .from("profiles")
      .update({ last_practice_date: today, current_streak: newStreak })
      .eq("id", userId);

    return newStreak;
  } catch (err) {
    console.error("Update streak error:", err);
    return 0;
  }
}

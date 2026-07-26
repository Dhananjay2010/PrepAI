# 04 — Database Schema (Supabase)

**Prerequisite:** Supabase project created, `03-gemini-api.md` done.
**Produces:** the tables everything else in this app reads and writes.
**Next file:** `05-auth-rate-limiting.md`

---

## 1. Run this SQL in the Supabase SQL editor

```sql
-- profiles table (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users primary key,
  email text unique not null,
  plan text default 'free' check (plan in ('free', 'paid')),
  free_generations_today int default 0,
  last_generation_date date default current_date,
  last_practice_date date,
  current_streak int default 0,
  interview_date date,
  precise_answers_used int default 0,
  razorpay_subscription_id text,
  subscription_status text default 'none' check (subscription_status in ('none','active','paused','cancelled','failed')),
  created_at timestamp default now()
);

-- saved prep sessions
create table if not exists sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  job_description text not null,
  role_summary text,
  seniority text,
  questions jsonb not null,
  created_at timestamp default now()
);

-- payment records
create table if not exists payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  razorpay_payment_id text,
  razorpay_subscription_id text,
  amount int,
  status text default 'pending' check (status in ('pending', 'success', 'failed')),
  created_at timestamp default now()
);

-- bookmarked questions
create table if not exists bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  question jsonb not null,
  created_at timestamp default now()
);

-- cached precise answers per user
create table if not exists precise_answers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  question_text text not null,
  precise_answer jsonb not null,
  created_at timestamp default now(),
  unique(user_id, question_text)
);
```

## 2. Enable Row-Level Security

```sql
alter table profiles enable row level security;
alter table sessions enable row level security;
alter table payments enable row level security;
alter table bookmarks enable row level security;
alter table precise_answers enable row level security;

create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Users can view own sessions" on sessions for select using (auth.uid() = user_id);
create policy "Users can insert own sessions" on sessions for insert with check (auth.uid() = user_id);
create policy "Users can delete own sessions" on sessions for delete using (auth.uid() = user_id);

create policy "Users can view own payments" on payments for select using (auth.uid() = user_id);

create policy "Users can view own bookmarks" on bookmarks for select using (auth.uid() = user_id);
create policy "Users can insert own bookmarks" on bookmarks for insert with check (auth.uid() = user_id);
create policy "Users can delete own bookmarks" on bookmarks for delete using (auth.uid() = user_id);

create policy "Users can view own precise answers" on precise_answers for select using (auth.uid() = user_id);
create policy "Users can insert own precise answers" on precise_answers for insert with check (auth.uid() = user_id);
```

## 3. `lib/supabase.ts` — client setup & helpers

```typescript
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// server-only client with elevated privileges — never import this in a "use client" file
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Auto-provisions profile row for signed-in OAuth/Magic Link users
export async function ensureUserProfile(userId: string) {
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
        plan: "free",
        free_generations_today: 0,
      });
    }
  } catch (err) {
    console.error("ensureUserProfile error:", err);
  }
}
```

---

## Checklist
- [x] All 5 tables created in Supabase (`profiles`, `sessions`, `payments`, `bookmarks`, `precise_answers`)
- [x] RLS enabled and policies applied
- [x] `lib/supabase.ts` created with public and admin clients and `ensureUserProfile` helper
- [x] `.env.local` has credentials configured

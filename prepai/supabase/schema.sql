-- ========================================================
-- PrepAI — Supabase Database Schema & Row-Level Security
-- Run this script in your Supabase SQL Editor
-- ========================================================

-- 1. Profiles Table (extending auth.users)
create table if not exists profiles (
  id uuid references auth.users primary key,
  email text unique not null,
  plan text default 'free' check (plan in ('free', 'paid')),
  free_generations_today int default 0,
  last_generation_date date default current_date,
  last_practice_date date,
  current_streak int default 0,
  interview_date date,
  razorpay_subscription_id text,
  subscription_status text default 'none' check (subscription_status in ('none','active','paused','cancelled','failed')),
  created_at timestamp default now()
);

-- Add columns if profiles table already exists
alter table profiles add column if not exists last_practice_date date;
alter table profiles add column if not exists current_streak int default 0;
alter table profiles add column if not exists interview_date date;
alter table profiles add column if not exists precise_answers_used int default 0;

-- 2. Sessions Table (saved prep sessions)
create table if not exists sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  job_description text not null,
  role_summary text,
  seniority text,
  questions jsonb not null,
  interview_rounds jsonb,
  created_at timestamp default now()
);

alter table sessions add column if not exists interview_rounds jsonb;

-- 3. Payments Table (Razorpay subscription payment log)
create table if not exists payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  razorpay_payment_id text,
  razorpay_subscription_id text,
  amount int,
  status text default 'pending' check (status in ('pending', 'success', 'failed')),
  created_at timestamp default now()
);

-- 4. Bookmarks Table (bookmarked questions)
create table if not exists bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  question jsonb not null,
  created_at timestamp default now()
);

-- 5. Precise Answers Table (cached saved model answers per user)
create table if not exists precise_answers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  question_text text not null,
  precise_answer jsonb not null,
  created_at timestamp default now(),
  unique(user_id, question_text)
);

-- ========================================================
-- Row-Level Security (RLS) Policies
-- ========================================================

alter table profiles enable row level security;
alter table sessions enable row level security;
alter table payments enable row level security;
alter table bookmarks enable row level security;

-- Profiles Policies
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Sessions Policies
create policy "Users can view own sessions" on sessions
  for select using (auth.uid() = user_id);

create policy "Users can insert own sessions" on sessions
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own sessions" on sessions
  for delete using (auth.uid() = user_id);

-- Payments Policies
create policy "Users can view own payments" on payments
  for select using (auth.uid() = user_id);

-- Bookmarks Policies
create policy "Users can view own bookmarks" on bookmarks
  for select using (auth.uid() = user_id);

create policy "Users can insert own bookmarks" on bookmarks
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own bookmarks" on bookmarks
  for delete using (auth.uid() = user_id);

-- 6. Mock Conversations Table (multi-turn voice practice log)
create table if not exists mock_conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  session_id uuid references sessions(id) on delete cascade,
  persona text default 'skeptical_architect',
  messages jsonb not null,
  overall_score int,
  feedback_summary jsonb,
  created_at timestamp default now()
);

alter table mock_conversations enable row level security;
create policy "Users can view own mock conversations" on mock_conversations for select using (auth.uid() = user_id);
create policy "Users can insert own mock conversations" on mock_conversations for insert with check (auth.uid() = user_id);

-- 7. Spaced Repetition (SRS Flashcards) Table
create table if not exists flashcards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  session_id uuid references sessions(id) on delete cascade,
  question_text text not null,
  answer_text text not null,
  box int default 1 check (box between 1 and 5),
  next_review_date date default current_date,
  created_at timestamp default now(),
  unique(user_id, question_text)
);

alter table flashcards enable row level security;
create policy "Users can manage own flashcards" on flashcards for all using (auth.uid() = user_id);

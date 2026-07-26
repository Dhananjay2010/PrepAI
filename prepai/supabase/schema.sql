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
  created_at timestamp default now()
);

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

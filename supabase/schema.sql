-- ============================================================================
-- ZenSpace / Serene Scholar Wellness — Supabase schema
-- Run this in the Supabase SQL Editor (or `supabase db push`) once per project.
-- Row Level Security is ON for every table: a user can only ever see their own
-- rows. This is the core security boundary of the app.
-- ============================================================================

-- ---------- profiles --------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  age         integer check (age is null or (age >= 10 and age <= 99)),
  exams       text[] not null default '{}',
  onboarded   boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ---------- mood_logs -------------------------------------------------------
create table if not exists public.mood_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  intensity    integer not null check (intensity between 1 and 5),
  moods        text[] not null default '{}',
  symptoms     text[] not null default '{}',
  triggers     text[] not null default '{}',
  sleep_hours  numeric(3,1) check (sleep_hours is null or (sleep_hours >= 0 and sleep_hours <= 24)),
  reflection   text check (reflection is null or char_length(reflection) <= 2000),
  created_at   timestamptz not null default now()
);

create index if not exists mood_logs_user_created_idx
  on public.mood_logs (user_id, created_at desc);

alter table public.mood_logs enable row level security;

drop policy if exists "mood_logs_select_own" on public.mood_logs;
create policy "mood_logs_select_own" on public.mood_logs
  for select using (auth.uid() = user_id);

drop policy if exists "mood_logs_insert_own" on public.mood_logs;
create policy "mood_logs_insert_own" on public.mood_logs
  for insert with check (auth.uid() = user_id);

drop policy if exists "mood_logs_delete_own" on public.mood_logs;
create policy "mood_logs_delete_own" on public.mood_logs
  for delete using (auth.uid() = user_id);

-- ---------- auto-provision a profile row on signup --------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

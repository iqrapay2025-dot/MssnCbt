-- 5. quiz_attempts table — stores every exam attempt per user
create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null,
  total integer not null,
  time_used integer not null,          -- seconds spent
  mode text not null default 'exam',   -- 'exam' | 'practice'
  subject text,                        -- null if mixed-subject exam
  subject_breakdown jsonb,             -- e.g. {"Mathematics":{"correct":8,"total":10},"English":{"correct":6,"total":10}}
  created_at timestamp with time zone default now()
);

-- Index for fast per-user lookups
create index idx_quiz_attempts_user_id on public.quiz_attempts(user_id);
create index idx_quiz_attempts_created_at on public.quiz_attempts(created_at desc);

-- 5a. RLS on quiz_attempts
alter table public.quiz_attempts enable row level security;

-- Users can read their own attempts
create policy "Users can view their own attempts"
on public.quiz_attempts
for select
using (auth.uid() = user_id);

-- Users can insert their own attempts
create policy "Users can insert their own attempts"
on public.quiz_attempts
for insert
with check (auth.uid() = user_id);

-- Admins can read all attempts
create policy "Admins can view all attempts"
on public.quiz_attempts
for select
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- Enable real-time replication for profiles (so admin panel updates live)
alter publication supabase_realtime add table public.profiles;
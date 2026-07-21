-- 6. notification_reads table — tracks per-user read state for notifications
-- This replaces the array-based read_by approach, giving reliable persistence.
create table public.notification_reads (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references public.notifications(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamp with time zone default now(),
  unique (notification_id, user_id)
);

-- Index for fast unread queries per user
create index idx_notification_reads_user on public.notification_reads(user_id, read_at desc);

-- 6a. RLS on notification_reads
alter table public.notification_reads enable row level security;

-- Users can read their own read marks
create policy "Users can read their own read marks"
on public.notification_reads
for select
using (auth.uid() = user_id);

-- Users can insert/upsert their own read marks
create policy "Users can upsert their own read marks"
on public.notification_reads
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own read marks"
on public.notification_reads
for update
using (auth.uid() = user_id);

-- Enable real-time replication for questions table (so question updates reflect globally)
alter publication supabase_realtime add table public.questions;
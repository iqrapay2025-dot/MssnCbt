-- 3. notifications table
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  type text not null check (type in ('questions', 'broadcast', 'system')),
  created_at timestamp with time zone default now(),
  read_by uuid[] default array[]::uuid[]
);

-- 3a. Index for efficient unread queries
create index idx_notifications_created_at on public.notifications(created_at desc);

-- 3b. RLS on notifications
alter table public.notifications enable row level security;

-- Anyone authenticated can read all notifications
create policy "Authenticated users can read notifications"
on public.notifications
for select
using (auth.role() = 'authenticated');

-- Only admins can insert notifications
create policy "Admins can insert notifications"
on public.notifications
for insert
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- Users can mark notifications as read by adding their id to read_by
create policy "Users can mark notifications as read"
on public.notifications
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

-- Enable real-time replication for the notifications table
alter publication supabase_realtime add table public.notifications;

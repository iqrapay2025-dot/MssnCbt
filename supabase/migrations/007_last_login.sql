-- 7. Add last_logged_in_at column to profiles for tracking login timestamps
alter table public.profiles
add column if not exists last_logged_in_at timestamp with time zone;
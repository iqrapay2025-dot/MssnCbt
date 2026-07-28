-- 8. Enable real-time replication for the questions table
-- Without this, subscribeToQuestionsRealtime() in the frontend will never fire,
-- and users won't see newly uploaded questions until they hard-refresh.

-- Add the questions table to the supabase_realtime publication
-- This is PostgreSQL-specific syntax for Supabase's realtime functionality
alter publication supabase_realtime add table only public.questions;

-- Ensure the table has replica identity set to full for complete change tracking
-- This is required for Realtime to capture all column changes
alter table public.questions replica identity full;

-- Verify the table has a primary key (required for Realtime to work)
-- The questions table already has a primary key (id uuid), so this is a safety check
do $$
begin
  if not exists (
    select 1
    from pg_class c
    join pg_index i on i.indrelid = c.oid
    where c.relname = 'questions'
      and i.indisprimary
  ) then
    raise notice 'questions table has no primary key - Realtime may not work';
  end if;
end;
$$;
-- 8. Enable real-time replication for the questions table
-- Without this, subscribeToQuestionsRealtime() in the frontend will never fire,
-- and users won't see newly uploaded questions until they hard-refresh.
alter publication supabase_realtime add table public.questions;
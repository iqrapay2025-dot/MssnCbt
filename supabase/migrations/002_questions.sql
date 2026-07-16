-- 2. questions table
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct text not null check (correct in ('A', 'B', 'C', 'D')),
  subject text not null,
  topic text,
  difficulty text default 'Medium' check (difficulty in ('Easy', 'Medium', 'Hard')),
  explanation text,
  created_at timestamp with time zone default now()
);

-- 2a. RLS on questions
alter table public.questions enable row level security;

-- Anyone (including anonymous users) can read questions
create policy "Public can read questions"
on public.questions
for select
using (true);

-- Only admins can insert
create policy "Admins can insert questions"
on public.questions
for insert
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- Only admins can update
create policy "Admins can update questions"
on public.questions
for update
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- Only admins can delete
create policy "Admins can delete questions"
on public.questions
for delete
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);
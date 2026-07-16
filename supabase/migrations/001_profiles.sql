-- 1. profiles table
create table public.profiles (
  id uuid references auth.users(id) primary key,
  name text,
  email text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default now()
);

-- 1a. Auto-create a profile row on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.email,
    'user'
  );
  return new;
end;
$$ language plpgsql security definer
set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Lock down direct API access to this function (it should only run via the trigger)
revoke execute on function public.handle_new_user() from anon, authenticated;

-- 1b. Backfill profiles for users who signed up before this trigger existed
insert into public.profiles (id, name, email, role)
select
  id,
  raw_user_meta_data->>'name',
  email,
  'user'
from auth.users
on conflict (id) do nothing;

-- 1c. RLS on profiles
alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "Users can view their own profile"
on public.profiles
for select
using (auth.uid() = id);

-- Users can update their own profile, but cannot change their own role
create policy "Users can update their own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (
  auth.uid() = id
  and role = (select role from public.profiles where id = auth.uid())
);

-- Admins can view all profiles
create policy "Admins can view all profiles"
on public.profiles
for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.role = 'admin'
  )
);

-- Admins can update any profile (e.g. to promote/demote roles)
create policy "Admins can update any profile"
on public.profiles
for update
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.role = 'admin'
  )
);
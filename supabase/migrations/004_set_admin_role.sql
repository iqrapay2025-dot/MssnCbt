-- Set admin role for the known admin user
-- Run this in Supabase SQL editor if the user already exists:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'abuaasiya08@gmail.com';

-- Or if the profile row doesn't exist yet (user signed up before trigger was added):
-- INSERT INTO public.profiles (id, name, email, role)
-- SELECT id, raw_user_meta_data->>'name', email, 'admin'
-- FROM auth.users
-- WHERE email = 'abuaasiya08@gmail.com'
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';

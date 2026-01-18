-- TEMPORARY: Disable RLS completely for testing
-- This will help us confirm if RLS is the issue

ALTER TABLE public.daily_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships DISABLE ROW LEVEL SECURITY;

-- Note: This is ONLY for testing. We'll re-enable it once we confirm it works.

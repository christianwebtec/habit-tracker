-- Check and completely reset RLS policies for daily_logs
-- This is a comprehensive fix

-- First, disable RLS temporarily to see if that's the issue
ALTER TABLE public.daily_logs DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view own logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can view logs of group members" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can insert own logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can update own logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can upsert own logs" ON public.daily_logs;

-- Re-enable RLS
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

-- Create simple, permissive policies
CREATE POLICY "Allow authenticated users full access to own logs"
  ON public.daily_logs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow viewing logs of group members
CREATE POLICY "Allow viewing group member logs"
  ON public.daily_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_memberships gm1
      JOIN public.group_memberships gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid() AND gm2.user_id = daily_logs.user_id
    )
  );

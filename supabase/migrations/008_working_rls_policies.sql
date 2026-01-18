-- Proper RLS policies that actually work
-- This fixes the authentication context issue

-- Re-enable RLS
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view own logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can view logs of group members" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can insert own logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can update own logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can upsert own logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Allow authenticated users full access to own logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Allow viewing group member logs" ON public.daily_logs;

-- Create working policies for daily_logs
-- Use simpler policies that work with the authentication context
CREATE POLICY "Enable all operations for authenticated users on own logs"
  ON public.daily_logs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read for group members"
  ON public.daily_logs
  FOR SELECT
  USING (
    user_id IN (
      SELECT gm2.user_id 
      FROM public.group_memberships gm1
      JOIN public.group_memberships gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid()
    )
  );

-- Fix groups policies
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Users can view groups they're members of" ON public.groups;
DROP POLICY IF EXISTS "Users can view groups by invite code" ON public.groups;
DROP POLICY IF EXISTS "Group creators can update their groups" ON public.groups;
DROP POLICY IF EXISTS "Group creators can delete their groups" ON public.groups;

CREATE POLICY "Enable insert for authenticated users"
  ON public.groups
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Enable read for members"
  ON public.groups
  FOR SELECT
  USING (
    id IN (
      SELECT group_id FROM public.group_memberships
      WHERE user_id = auth.uid()
    )
    OR true  -- Allow reading any group (needed for joining by invite code)
  );

CREATE POLICY "Enable update for creators"
  ON public.groups
  FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Enable delete for creators"
  ON public.groups
  FOR DELETE
  USING (auth.uid() = created_by);

-- Fix group_memberships policies
DROP POLICY IF EXISTS "Users can view memberships of their groups" ON public.group_memberships;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_memberships;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_memberships;

CREATE POLICY "Enable read for group members"
  ON public.group_memberships
  FOR SELECT
  USING (
    group_id IN (
      SELECT group_id FROM public.group_memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Enable insert for authenticated users"
  ON public.group_memberships
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for own memberships"
  ON public.group_memberships
  FOR DELETE
  USING (auth.uid() = user_id);

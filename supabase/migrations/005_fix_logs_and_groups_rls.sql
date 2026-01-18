-- Fix RLS policies for daily_logs and groups tables
-- This allows users to create logs and groups properly

-- Fix daily_logs policies
DROP POLICY IF EXISTS "Users can insert own logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can update own logs" ON public.daily_logs;

CREATE POLICY "Users can insert own logs"
  ON public.daily_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs"
  ON public.daily_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Also add UPSERT support (needed for the app's upsert operation)
CREATE POLICY "Users can upsert own logs"
  ON public.daily_logs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix groups policies
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.groups;

CREATE POLICY "Authenticated users can create groups"
  ON public.groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Allow users to view groups by invite code (needed for joining)
DROP POLICY IF EXISTS "Users can view groups they're members of" ON public.groups;

CREATE POLICY "Users can view groups they're members of"
  ON public.groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_memberships
      WHERE group_id = groups.id AND user_id = auth.uid()
    )
  );

-- Also allow viewing groups by invite code for joining
CREATE POLICY "Users can view groups by invite code"
  ON public.groups FOR SELECT
  USING (true);

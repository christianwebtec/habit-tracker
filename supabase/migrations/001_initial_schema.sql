-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create daily_logs table
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  worked_out BOOLEAN DEFAULT FALSE,
  drank_alcohol BOOLEAN DEFAULT FALSE,
  net_points INTEGER GENERATED ALWAYS AS (
    CASE WHEN worked_out THEN 1 ELSE 0 END +
    CASE WHEN drank_alcohol THEN -1 ELSE 0 END
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create groups table
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create group_memberships table
CREATE TABLE IF NOT EXISTS public.group_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_id ON public.daily_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON public.daily_logs(date);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON public.daily_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_groups_invite_code ON public.groups(invite_code);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group_id ON public.group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user_id ON public.group_memberships(user_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all profiles"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for daily_logs table
CREATE POLICY "Users can view own logs"
  ON public.daily_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view logs of group members"
  ON public.daily_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_memberships gm1
      JOIN public.group_memberships gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid() AND gm2.user_id = daily_logs.user_id
    )
  );

CREATE POLICY "Users can insert own logs"
  ON public.daily_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs"
  ON public.daily_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for groups table
CREATE POLICY "Users can view groups they're members of"
  ON public.groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_memberships
      WHERE group_id = groups.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create groups"
  ON public.groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups"
  ON public.groups FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Group creators can delete their groups"
  ON public.groups FOR DELETE
  USING (auth.uid() = created_by);

-- RLS Policies for group_memberships table
CREATE POLICY "Users can view memberships of their groups"
  ON public.group_memberships FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_memberships gm
      WHERE gm.group_id = group_memberships.group_id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join groups"
  ON public.group_memberships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON public.group_memberships FOR DELETE
  USING (auth.uid() = user_id);

-- Function to generate random invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

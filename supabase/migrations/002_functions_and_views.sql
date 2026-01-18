-- Function to calculate user stats
CREATE OR REPLACE FUNCTION get_user_stats(target_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  total_points BIGINT,
  weekly_points BIGINT,
  monthly_points BIGINT,
  workout_streak INTEGER,
  clean_streak INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.username,
    u.avatar_url,
    COALESCE(SUM(dl.net_points), 0)::BIGINT as total_points,
    COALESCE(SUM(CASE 
      WHEN dl.date >= DATE_TRUNC('week', CURRENT_DATE) 
      THEN dl.net_points 
      ELSE 0 
    END), 0)::BIGINT as weekly_points,
    COALESCE(SUM(CASE 
      WHEN dl.date >= DATE_TRUNC('month', CURRENT_DATE) 
      THEN dl.net_points 
      ELSE 0 
    END), 0)::BIGINT as monthly_points,
    0 as workout_streak, -- Calculated client-side for accuracy
    0 as clean_streak    -- Calculated client-side for accuracy
  FROM public.users u
  LEFT JOIN public.daily_logs dl ON u.id = dl.user_id
  WHERE u.id = target_user_id
  GROUP BY u.id, u.username, u.avatar_url;
END;
$$ LANGUAGE plpgsql;

-- Function to get group leaderboard
CREATE OR REPLACE FUNCTION get_group_leaderboard(
  target_group_id UUID,
  timeframe TEXT DEFAULT 'all-time'
)
RETURNS TABLE (
  rank BIGINT,
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  points BIGINT,
  workout_streak INTEGER,
  clean_streak INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH user_points AS (
    SELECT
      u.id as user_id,
      u.username,
      u.avatar_url,
      CASE
        WHEN timeframe = 'weekly' THEN
          COALESCE(SUM(CASE 
            WHEN dl.date >= DATE_TRUNC('week', CURRENT_DATE) 
            THEN dl.net_points 
            ELSE 0 
          END), 0)
        WHEN timeframe = 'monthly' THEN
          COALESCE(SUM(CASE 
            WHEN dl.date >= DATE_TRUNC('month', CURRENT_DATE) 
            THEN dl.net_points 
            ELSE 0 
          END), 0)
        ELSE
          COALESCE(SUM(dl.net_points), 0)
      END as total_points
    FROM public.users u
    INNER JOIN public.group_memberships gm ON u.id = gm.user_id
    LEFT JOIN public.daily_logs dl ON u.id = dl.user_id
    WHERE gm.group_id = target_group_id
    GROUP BY u.id, u.username, u.avatar_url
  )
  SELECT
    ROW_NUMBER() OVER (ORDER BY up.total_points DESC, up.username ASC) as rank,
    up.user_id,
    up.username,
    up.avatar_url,
    up.total_points,
    0 as workout_streak, -- Calculated client-side
    0 as clean_streak    -- Calculated client-side
  FROM user_points up
  ORDER BY rank;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically add creator to group on creation
CREATE OR REPLACE FUNCTION add_creator_to_group()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.group_memberships (group_id, user_id)
  VALUES (NEW.id, NEW.created_by);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_group_insert
  AFTER INSERT ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION add_creator_to_group();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_daily_logs_updated_at
  BEFORE UPDATE ON public.daily_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

export interface User {
  id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  date: string;
  worked_out: boolean;
  drank_alcohol: boolean;
  net_points: number;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

export interface GroupMembership {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
}

export interface UserStats {
  user_id: string;
  username: string;
  avatar_url?: string;
  total_points: number;
  weekly_points: number;
  monthly_points: number;
  workout_streak: number;
  clean_streak: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url?: string;
  points: number;
  workout_streak: number;
  clean_streak: number;
}

export type TimeFrame = 'weekly' | 'monthly' | 'all-time';

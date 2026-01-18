-- Add smoked_weed column to daily_logs table
ALTER TABLE public.daily_logs 
ADD COLUMN IF NOT EXISTS smoked_weed BOOLEAN DEFAULT FALSE;

-- Update the net_points generated column to include weed
ALTER TABLE public.daily_logs 
DROP COLUMN IF EXISTS net_points;

ALTER TABLE public.daily_logs 
ADD COLUMN net_points INTEGER GENERATED ALWAYS AS (
  CASE WHEN worked_out THEN 1 ELSE 0 END +
  CASE WHEN drank_alcohol THEN -1 ELSE 0 END +
  CASE WHEN smoked_weed THEN -1 ELSE 0 END
) STORED;

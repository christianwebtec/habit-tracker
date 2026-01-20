-- Enable REPLICA IDENTITY FULL to allow accessing old values in Realtime updates
ALTER TABLE public.daily_logs REPLICA IDENTITY FULL;

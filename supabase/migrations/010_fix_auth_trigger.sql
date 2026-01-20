-- Redefine the handle_new_user function to handle username collisions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  new_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- Get the base username from metadata or email
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username', 
    split_part(NEW.email, '@', 1)
  );
  
  -- Initialize new_username
  new_username := base_username;
  
  -- Loop until we find a unique username
  WHILE EXISTS (SELECT 1 FROM public.users WHERE username = new_username) LOOP
    counter := counter + 1;
    -- Append a random suffix to make it unique
    -- We use a combination of counter and random characters to ensure uniqueness
    new_username := base_username || '_' || 
                    substr(md5(random()::text), 1, 4);
  END LOOP;

  INSERT INTO public.users (id, username, created_at)
  VALUES (
    NEW.id,
    new_username,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

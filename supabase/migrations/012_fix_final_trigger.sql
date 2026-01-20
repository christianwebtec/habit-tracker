-- DATA INTEGRITY CHECK (Optional but good)
-- Remove any definitions of the old trigger/function to be absolutely safe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a V2 Function with a NEW NAME to avoid any caching or update issues
CREATE OR REPLACE FUNCTION public.handle_new_user_v2()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  new_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- 1. Determine base username
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username', 
    split_part(NEW.email, '@', 1)
  );
  
  -- 2. Initialize
  new_username := base_username;
  
  -- 3. Collision Loop
  WHILE EXISTS (SELECT 1 FROM public.users WHERE username = new_username) LOOP
    counter := counter + 1;
    -- Create unique name: "john_a1b2"
    new_username := base_username || '_' || substr(md5(random()::text), 1, 4);
    
    -- Emergency break loop
    IF counter > 20 THEN
       new_username := base_username || '_' || extract(epoch from now())::text;
       EXIT; 
    END IF;
  END LOOP;

  -- 4. Insert
  INSERT INTO public.users (id, username, created_at)
  VALUES (
    NEW.id,
    new_username,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Handle potential ID overlaps gracefully
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but allow auth user creation to proceed (prevent blocking sign-up)
  RAISE WARNING 'User Profile Creation Failed: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the NEW Trigger
CREATE TRIGGER on_auth_user_created_v2
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_v2();

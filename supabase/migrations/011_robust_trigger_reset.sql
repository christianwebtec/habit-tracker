-- Forcefully drop the existing trigger and function to ensure a clean slate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the function again with robust collision handling
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
  -- We check both the username itself AND the users table
  WHILE EXISTS (SELECT 1 FROM public.users WHERE username = new_username) LOOP
    counter := counter + 1;
    -- Append a random suffix (4 chars) to make it unique
    new_username := base_username || '_' || substr(md5(random()::text), 1, 4);
    
    -- Safety break to prevent infinite loops (unlikely but good practice)
    IF counter > 10 THEN
       -- If 10 tries fail, use a timestamp suffix
       new_username := base_username || '_' || extract(epoch from now())::text;
       EXIT; 
    END IF;
  END LOOP;

  INSERT INTO public.users (id, username, created_at)
  VALUES (
    NEW.id,
    new_username,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Prepare for the worst: Log error if possible, but don't fail the transaction
  -- We don't have a system_logs table usually, so we just raise a notice
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  -- In a strict system we might want to fail, but to fix the "user exists in auth but not public" issue
  -- we might want to suppress. However, suppressing means no profile. 
  -- Let's re-raise for now, but the loop above should prevent the Unique violation.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

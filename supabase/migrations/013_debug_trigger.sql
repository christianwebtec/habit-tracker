-- Replace the V2 function with a debug version
DROP FUNCTION IF EXISTS public.handle_new_user_v2() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user_v2()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  new_username TEXT;
  counter INTEGER := 0;
BEGIN
  RAISE NOTICE 'Trigger started for user: %', NEW.email;
  
  -- 1. Determine base username
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username', 
    split_part(NEW.email, '@', 1)
  );
  
  RAISE NOTICE 'Base username: %', base_username;
  
  -- 2. Initialize
  new_username := base_username;
  
  -- 3. Collision Loop
  WHILE EXISTS (SELECT 1 FROM public.users WHERE username = new_username) LOOP
    counter := counter + 1;
    RAISE NOTICE 'Username collision detected, attempt: %', counter;
    
    new_username := base_username || '_' || substr(md5(random()::text), 1, 4);
    
    IF counter > 20 THEN
       RAISE NOTICE 'Hit max retries, using timestamp';
       new_username := base_username || '_' || extract(epoch from now())::text;
       EXIT; 
    END IF;
  END LOOP;

  RAISE NOTICE 'Final username: %', new_username;

  -- 4. Insert
  INSERT INTO public.users (id, username, created_at)
  VALUES (
    NEW.id,
    new_username,
    NOW()
  );
  
  RAISE NOTICE 'User profile created successfully';
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'ERROR in trigger: % - SQLSTATE: %', SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

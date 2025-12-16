-- Improve handle_new_user trigger function with better error handling
-- This prevents trigger failures from blocking user creation

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create profile (ON CONFLICT prevents duplicate if trigger fires twice)
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Initialize virtue scores (ON CONFLICT prevents duplicates)
  INSERT INTO public.virtue_scores (profile_id, virtue, score)
  SELECT NEW.id, v.virtue, 50
  FROM (VALUES ('courage'), ('temperance'), ('justice'), ('wisdom')) AS v(virtue)
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    -- This allows users to sign up even if profile creation fails
    -- They can recover using ensure_profile_exists() function
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Note: The trigger on_auth_user_created already exists from the initial migration
-- This just updates the function with better error handling

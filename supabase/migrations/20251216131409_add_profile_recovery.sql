-- Profile Recovery Function
-- This function ensures a user has a profile, virtue scores, and subscription
-- even if the trigger failed or profile was deleted

CREATE OR REPLACE FUNCTION public.ensure_profile_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_id UUID;
  user_email TEXT;
  user_display_name TEXT;
BEGIN
  -- Get current user ID
  user_id := auth.uid();
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Get user email and display name from auth.users
  SELECT 
    email, 
    COALESCE(raw_user_meta_data ->> 'display_name', split_part(email, '@', 1))
  INTO user_email, user_display_name
  FROM auth.users
  WHERE id = user_id;
  
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'User not found in auth.users';
  END IF;
  
  -- Create profile if missing (ON CONFLICT prevents duplicate errors)
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (user_id, user_email, user_display_name)
  ON CONFLICT (id) DO NOTHING;
  
  -- Initialize virtue scores if missing
  INSERT INTO public.virtue_scores (profile_id, virtue, score)
  SELECT user_id, v.virtue, 50
  FROM (VALUES ('courage'), ('temperance'), ('justice'), ('wisdom')) AS v(virtue)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.virtue_scores 
    WHERE profile_id = user_id AND virtue = v.virtue
  );
  
  -- Ensure subscription exists (ON CONFLICT prevents duplicate errors)
  INSERT INTO public.subscriptions (profile_id, plan, status)
  VALUES (user_id, 'free', 'active')
  ON CONFLICT (profile_id) DO NOTHING;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.ensure_profile_exists() TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.ensure_profile_exists() IS 
  'Recovers missing profile, virtue scores, and subscription for the current authenticated user. Safe to call multiple times.';

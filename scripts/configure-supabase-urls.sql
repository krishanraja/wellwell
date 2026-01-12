-- WellWell - Configure Supabase Auth URLs
-- 
-- ⚠️  IMPORTANT: This SQL script will NOT work because Supabase stores
--    Auth URLs in a configuration system that's not accessible via SQL.
-- 
-- ✅ SOLUTION: Use the Dashboard UI instead (see instructions below)
-- 
-- This script checks if auth.config exists and provides instructions if it doesn't.

-- Check if auth.config table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'auth' 
    AND table_name = 'config'
  ) THEN
    RAISE NOTICE '✅ auth.config table exists - attempting to update...';
    
    -- Update Site URL
    UPDATE auth.config
    SET value = 'https://wellwell.ai'
    WHERE key = 'SITE_URL';
    
    -- Insert if doesn't exist
    INSERT INTO auth.config (key, value)
    VALUES ('SITE_URL', 'https://wellwell.ai')
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
    
    -- Update Redirect URLs
    UPDATE auth.config
    SET value = 'https://wellwell.ai/**,http://localhost:5173/**'
    WHERE key = 'URI_ALLOW_LIST';
    
    INSERT INTO auth.config (key, value)
    VALUES ('URI_ALLOW_LIST', 'https://wellwell.ai/**,http://localhost:5173/**')
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
    
    RAISE NOTICE '✅ Configuration updated via SQL';
  ELSE
    RAISE NOTICE '❌ auth.config table does not exist';
    RAISE NOTICE '';
    RAISE NOTICE 'This is expected - Supabase Auth URLs are NOT stored in SQL tables.';
    RAISE NOTICE 'You MUST use the Dashboard UI to configure these settings.';
    RAISE NOTICE '';
    RAISE NOTICE '📋 INSTRUCTIONS:';
    RAISE NOTICE '1. Go to: https://supabase.com/dashboard/project/zioacippbtcbctexywgc/auth/url-configuration';
    RAISE NOTICE '2. Set Site URL: https://wellwell.ai';
    RAISE NOTICE '3. Add Redirect URLs:';
    RAISE NOTICE '   - https://wellwell.ai/**';
    RAISE NOTICE '   - http://localhost:5173/**';
    RAISE NOTICE '4. Click "Save"';
  END IF;
END $$;

-- Show current status
SELECT 
  '⚠️  SQL configuration not available' as status,
  'Use Dashboard UI instead' as solution,
  'https://supabase.com/dashboard/project/zioacippbtcbctexywgc/auth/url-configuration' as dashboard_url;

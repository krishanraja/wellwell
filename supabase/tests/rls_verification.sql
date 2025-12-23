-- RLS Policy Verification Tests
-- Run this in Supabase SQL Editor to verify Row Level Security is working correctly
-- 
-- These tests verify that users can only access their own data and cannot
-- access other users' data, even if they know the IDs.

-- ============================================================================
-- SETUP: Create test users (run as service role)
-- ============================================================================

-- Note: In production, these would be created via auth.signUp()
-- For testing, we'll assume test users exist with IDs:
-- test_user_1: UUID
-- test_user_2: UUID

-- ============================================================================
-- TEST 1: Profiles RLS - Users can only see their own profile
-- ============================================================================

-- As test_user_1, try to select own profile (should succeed)
-- SET LOCAL ROLE authenticated;
-- SET LOCAL request.jwt.claim.sub = 'test_user_1_id';
-- SELECT * FROM profiles WHERE id = 'test_user_1_id';

-- As test_user_1, try to select other user's profile (should return 0 rows)
-- SELECT * FROM profiles WHERE id = 'test_user_2_id';

-- ============================================================================
-- TEST 2: Events RLS - Users can only see their own events
-- ============================================================================

-- As test_user_1, try to select own events (should succeed)
-- SELECT * FROM events WHERE profile_id = 'test_user_1_id';

-- As test_user_1, try to select other user's events (should return 0 rows)
-- SELECT * FROM events WHERE profile_id = 'test_user_2_id';

-- ============================================================================
-- TEST 3: Sessions RLS - Users can only see their own sessions
-- ============================================================================

-- As test_user_1, try to select own sessions (should succeed)
-- SELECT * FROM sessions WHERE profile_id = 'test_user_1_id';

-- As test_user_1, try to select other user's sessions (should return 0 rows)
-- SELECT * FROM sessions WHERE profile_id = 'test_user_2_id';

-- ============================================================================
-- TEST 4: Insights RLS - Users can only see their own insights
-- ============================================================================

-- As test_user_1, try to select own insights (should succeed)
-- SELECT * FROM insights WHERE profile_id = 'test_user_1_id';

-- As test_user_1, try to select other user's insights (should return 0 rows)
-- SELECT * FROM insights WHERE profile_id = 'test_user_2_id';

-- ============================================================================
-- TEST 5: Virtue Scores RLS - Users can only see their own scores
-- ============================================================================

-- As test_user_1, try to select own virtue scores (should succeed)
-- SELECT * FROM virtue_scores WHERE profile_id = 'test_user_1_id';

-- As test_user_1, try to select other user's virtue scores (should return 0 rows)
-- SELECT * FROM virtue_scores WHERE profile_id = 'test_user_2_id';

-- ============================================================================
-- TEST 6: INSERT Policies - Users can only insert their own data
-- ============================================================================

-- As test_user_1, try to insert event with own profile_id (should succeed)
-- INSERT INTO events (profile_id, tool_name, raw_input)
-- VALUES ('test_user_1_id', 'pulse', 'Test input');

-- As test_user_1, try to insert event with other user's profile_id (should fail)
-- INSERT INTO events (profile_id, tool_name, raw_input)
-- VALUES ('test_user_2_id', 'pulse', 'Test input');
-- -- Expected: Error due to RLS policy WITH CHECK constraint

-- ============================================================================
-- TEST 7: UPDATE Policies - Users can only update their own data
-- ============================================================================

-- As test_user_1, try to update own profile (should succeed)
-- UPDATE profiles SET display_name = 'Updated Name' WHERE id = 'test_user_1_id';

-- As test_user_1, try to update other user's profile (should fail - 0 rows updated)
-- UPDATE profiles SET display_name = 'Hacked' WHERE id = 'test_user_2_id';
-- -- Expected: 0 rows updated due to RLS policy

-- ============================================================================
-- VERIFICATION QUERIES (Run as service role to check RLS is enabled)
-- ============================================================================

-- Check that RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'sessions', 'events', 'insights', 'virtue_scores')
ORDER BY tablename;

-- Expected: rowsecurity = true for all tables

-- Check that policies exist for all tables
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'sessions', 'events', 'insights', 'virtue_scores')
ORDER BY tablename, policyname;

-- Expected: At least SELECT and INSERT policies for all tables
-- Expected: UPDATE policy for profiles and virtue_scores

-- ============================================================================
-- MANUAL TESTING INSTRUCTIONS
-- ============================================================================

-- To manually test RLS:
-- 1. Sign in as User A in browser
-- 2. Open browser console
-- 3. Try to query User B's data:
--    supabase.from('profiles').select('*').eq('id', 'user_b_id').single()
-- 4. Should return null or empty (not User B's data)
-- 5. Try to insert event with User B's profile_id:
--    supabase.from('events').insert({ profile_id: 'user_b_id', tool_name: 'pulse', raw_input: 'test' })
-- 6. Should fail with RLS policy error



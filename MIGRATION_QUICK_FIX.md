# Quick Fix: After Supabase Project Migration

If you just migrated to a new Supabase project and the Journey button shows infinite loading, you need to run the database migrations.

## Quick Steps

### 1. Run Required Migrations

Go to your Supabase Dashboard → SQL Editor and run these migrations **in order**:

1. **Initial Schema** (if not already run):
   - File: `supabase/migrations/20251212021713_25d9bac3-d0eb-41f3-8ee4-d554e8ce7ea1.sql`
   - Creates: profiles, events, virtue_scores tables

2. **Subscriptions** (if not already run):
   - File: `supabase/migrations/20251212042606_67410d84-5210-46c4-877c-3135b41632bb.sql`
   - Creates: subscriptions, usage_tracking tables

3. **Check-in Times** (if not already run):
   - File: `supabase/migrations/20251215120000_add_checkin_times.sql`
   - Adds: morning_pulse_time, evening_debrief_time to profiles

4. **Profile Recovery** ⚠️ **REQUIRED**:
   - File: `supabase/migrations/20251216131409_add_profile_recovery.sql`
   - Creates: `ensure_profile_exists()` function
   - **This is critical for fixing the infinite loading issue**

5. **Improved Trigger** ⚠️ **REQUIRED**:
   - File: `supabase/migrations/20251216131410_improve_handle_new_user.sql`
   - Updates: `handle_new_user()` trigger with better error handling

### 2. Verify Function Exists

1. Go to Supabase Dashboard → Database → Functions
2. Look for: `ensure_profile_exists`
3. If it's missing, run migration #4 above

### 3. Test the Fix

1. Refresh your app
2. Click the Journey button
3. It should load within 5 seconds (even if data is missing)

## Using Supabase CLI (Faster)

If you have Supabase CLI installed:

```bash
# Link to your new project
supabase link --project-ref zioacippbtcbctexywgc

# Push all migrations
supabase db push
```

## What This Fixes

- ✅ Profile recovery when profile is missing
- ✅ Prevents infinite loading (5-second timeout)
- ✅ Better error handling for missing functions
- ✅ Graceful degradation if migrations aren't run

## Still Having Issues?

If the Journey button still shows infinite loading after running migrations:

1. Check browser console for errors
2. Verify your `.env` file has the correct project URL:
   ```
   VITE_SUPABASE_URL=https://zioacippbtcbctexywgc.supabase.co
   ```
3. Make sure you're logged in with a user that exists in the new project

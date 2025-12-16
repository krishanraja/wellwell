# Supabase Migration Rebuild - Summary

## What Was Broken

After migrating from a shared Supabase project to a dedicated project, several critical issues were identified:

1. **Profile Creation Failures**: No recovery mechanism if the `handle_new_user()` trigger failed
2. **Delete Account Broken**: Used `supabase.auth.admin.deleteUser()` from client, which doesn't work
3. **Missing Error Handling**: No graceful degradation for missing profiles or failed operations
4. **Onboarding Assumptions**: Assumed profile always exists, causing failures if trigger didn't run
5. **Edge Function Validation**: No checks for required environment variables
6. **Hardcoded Project IDs**: Scripts and docs contained hardcoded project IDs

## Fixes Applied

### 1. Hardened Supabase Client ✅

**File**: `src/integrations/supabase/client.ts`

- Added URL format validation (must match `https://*.supabase.co`)
- Improved error messages with actionable steps
- Removed hardcoded project ID from error messages
- Better validation for publishable key format

### 2. Profile Recovery System ✅

**Files**:
- `supabase/migrations/20251216131409_add_profile_recovery.sql` - New RPC function
- `src/hooks/useProfile.tsx` - Recovery logic

**What it does**:
- Creates `ensure_profile_exists()` RPC function that:
  - Creates missing profile from auth.users data
  - Initializes missing virtue scores
  - Ensures subscription exists
- `useProfile` hook automatically calls recovery if profile is missing
- Safe to call multiple times (uses `ON CONFLICT DO NOTHING`)

### 3. Improved Database Trigger ✅

**File**: `supabase/migrations/20251216131410_improve_handle_new_user.sql`

- Updated `handle_new_user()` trigger function with:
  - `ON CONFLICT DO NOTHING` to prevent duplicate errors
  - Exception handling that logs but doesn't fail user creation
  - Allows users to sign up even if profile creation fails (recovery handles it)

### 4. Delete Account Edge Function ✅

**Files**:
- `supabase/functions/delete-account/index.ts` - New edge function
- `src/hooks/useAuth.tsx` - Updated to use edge function
- `supabase/config.toml` - Added function configuration

**What it does**:
- Edge function uses service role key to delete user via admin API
- Client calls edge function with JWT token
- Properly handles authentication and errors
- Signs out user locally after successful deletion

### 5. Edge Function Validation ✅

**Files**:
- `supabase/functions/check-subscription/index.ts`
- `supabase/functions/create-checkout/index.ts`
- `supabase/functions/customer-portal/index.ts`

**What it does**:
- Validates required environment variables at function start
- Returns clear error messages if env vars are missing
- Prevents runtime failures from misconfiguration

### 6. Hardened Onboarding ✅

**File**: `src/pages/Onboarding.tsx`

- Added profile loading state
- Added error state if profile cannot be loaded
- Checks profile exists before allowing completion
- Shows user-friendly error messages

### 7. Removed Hardcoded Project IDs ✅

**Files**:
- `scripts/setup-supabase-env.js`
- `scripts/add-edge-function-secrets.js`
- `scripts/auto-setup-supabase.ps1`
- `scripts/setup-supabase-env.ps1`

**What it does**:
- Scripts now read from environment variables
- Fall back to placeholders if env vars not set
- Makes scripts reusable across projects

### 8. Production Checklist ✅

**File**: `PRODUCTION_DEPLOY_CHECKLIST.md`

- Comprehensive checklist for deployment
- Environment variable validation
- Database migration verification
- Edge function deployment steps
- Security validation
- Testing procedures

## SQL Migrations to Run

Run these migrations in order in your new Supabase project:

1. **Existing migrations** (if not already run):
   - `20251212021713_25d9bac3-d0eb-41f3-8ee4-d554e8ce7ea1.sql` - Initial schema
   - `20251212042606_67410d84-5210-46c4-877c-3135b41632bb.sql` - Subscriptions
   - `20251215120000_add_checkin_times.sql` - Check-in times

2. **New migrations** (must run):
   - `20251216131409_add_profile_recovery.sql` - Profile recovery function
   - `20251216131410_improve_handle_new_user.sql` - Improved trigger

## Edge Functions to Deploy

Deploy all edge functions to your Supabase project:

```bash
supabase functions deploy check-subscription
supabase functions deploy create-checkout
supabase functions deploy customer-portal
supabase functions deploy delete-account
supabase functions deploy stoic-analyzer
```

## Environment Variables Required

### Client-Side (Vercel)

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Your anon/public key (JWT format)

### Edge Functions (Supabase Dashboard)

- `SUPABASE_URL` - Auto-provided by Supabase
- `SUPABASE_ANON_KEY` - Auto-provided by Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-provided by Supabase
- `STRIPE_SECRET_KEY` - Manual (if using payments)

## Testing Recommendations

1. **Test profile recovery**:
   - Sign up a new user
   - Manually delete their profile row
   - Sign in again - profile should be automatically recovered

2. **Test delete account**:
   - Create a test account
   - Delete it via settings
   - Verify all data is cascade deleted

3. **Test onboarding**:
   - Sign up and complete onboarding
   - Verify profile is created before onboarding starts
   - Verify onboarding data saves correctly

4. **Test edge functions**:
   - Verify all functions return proper errors if env vars missing
   - Test with valid authentication
   - Test with invalid/missing authentication

## Next Steps

1. **Run SQL migrations** in your Supabase project
2. **Deploy edge functions** to Supabase
3. **Set environment variables** in Vercel
4. **Test all flows** using the production checklist
5. **Monitor** for any errors in Supabase dashboard

## Files Modified

### New Files
- `supabase/migrations/20251216131409_add_profile_recovery.sql`
- `supabase/migrations/20251216131410_improve_handle_new_user.sql`
- `supabase/functions/delete-account/index.ts`
- `PRODUCTION_DEPLOY_CHECKLIST.md`
- `MIGRATION_REBUILD_SUMMARY.md`

### Modified Files
- `src/integrations/supabase/client.ts`
- `src/hooks/useProfile.tsx`
- `src/hooks/useAuth.tsx`
- `src/pages/Onboarding.tsx`
- `supabase/functions/check-subscription/index.ts`
- `supabase/functions/create-checkout/index.ts`
- `supabase/functions/customer-portal/index.ts`
- `supabase/config.toml`
- `scripts/setup-supabase-env.js`
- `scripts/add-edge-function-secrets.js`
- `scripts/auto-setup-supabase.ps1`
- `scripts/setup-supabase-env.ps1`

---

**Status**: ✅ Complete - Ready for deployment  
**Date**: 2025-12-16

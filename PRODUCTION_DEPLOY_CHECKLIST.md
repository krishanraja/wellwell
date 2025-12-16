# Production Deployment Checklist

Use this checklist to validate your WellWell Supabase setup before deploying to production.

## Pre-Deployment: Environment Variables

### Client-Side (Vercel Environment Variables)

- [ ] `VITE_SUPABASE_URL` - Set to your Supabase project URL
  - Format: `https://YOUR_PROJECT_ID.supabase.co`
  - Get from: Supabase Dashboard > Settings > API

- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` - Set to your anon/public key
  - Must be a JWT token starting with `eyJ...`
  - Get from: Supabase Dashboard > Settings > API > "anon public" key
  - ⚠️ **NOT** the service_role key

- [ ] `VITE_SUPABASE_PROJECT_ID` (Optional) - For validation
  - Extracted automatically from URL if not provided

**Vercel Setup:**
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the variables above for:
   - Production
   - Preview (optional, can use same values)
   - Development (optional, can use same values)

### Edge Functions (Supabase Dashboard)

Supabase automatically provides these, but verify they're available:

- [ ] `SUPABASE_URL` - Auto-provided by Supabase
- [ ] `SUPABASE_ANON_KEY` - Auto-provided by Supabase
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Auto-provided by Supabase

**Manual Setup (if needed):**
1. Go to: Supabase Dashboard > Project Settings > Edge Functions > Secrets
2. Verify these are set (they should be automatic)

**Payment Functions (if using Stripe):**

- [ ] `STRIPE_SECRET_KEY` - Your Stripe secret key
  - Get from: Stripe Dashboard > Developers > API keys
  - Format: `sk_test_...` (test) or `sk_live_...` (production)
  - Required for: `check-subscription`, `create-checkout`, `customer-portal`

## Database: Schema & Migrations

### Run Migrations

- [ ] **Initial Schema** (`20251212021713_25d9bac3-d0eb-41f3-8ee4-d554e8ce7ea1.sql`)
  - Creates: `profiles`, `sessions`, `events`, `insights`, `virtue_scores`
  - Creates: RLS policies for all tables
  - Creates: `handle_new_user()` trigger function
  - Creates: `update_updated_at_column()` function

- [ ] **Subscriptions** (`20251212042606_67410d84-5210-46c4-877c-3135b41632bb.sql`)
  - Creates: `subscriptions`, `usage_tracking` tables
  - Creates: `subscription_plan`, `subscription_status` enums
  - Creates: RLS policies
  - Creates: `handle_new_profile_subscription()` trigger

- [ ] **Check-in Times** (`20251215120000_add_checkin_times.sql`)
  - Adds: `morning_pulse_time`, `evening_debrief_time` to profiles

- [ ] **Profile Recovery** (`20251216131409_add_profile_recovery.sql`)
  - Creates: `ensure_profile_exists()` RPC function
  - Grants: Execute permission to authenticated users

- [ ] **Improved Trigger** (`20251216131410_improve_handle_new_user.sql`)
  - Updates: `handle_new_user()` with better error handling
  - Adds: `ON CONFLICT DO NOTHING` to prevent duplicate errors

**How to Run:**
```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase Dashboard:
# SQL Editor > Run each migration file in order
```

### Verify Database Objects

- [ ] **Tables exist:**
  - `profiles`
  - `sessions`
  - `events`
  - `insights`
  - `virtue_scores`
  - `subscriptions`
  - `usage_tracking`

- [ ] **Functions exist:**
  - `handle_new_user()`
  - `handle_new_profile_subscription()`
  - `update_updated_at_column()`
  - `ensure_profile_exists()`

- [ ] **Triggers exist:**
  - `on_auth_user_created` (on `auth.users`)
  - `on_profile_created_subscription` (on `profiles`)
  - `update_profiles_updated_at` (on `profiles`)
  - `update_subscriptions_updated_at` (on `subscriptions`)

- [ ] **RLS Policies enabled:**
  - All tables have RLS enabled
  - Users can only access their own data (`auth.uid() = profile_id` or `auth.uid() = id`)

## Edge Functions: Deployment

### Deploy Functions

- [ ] **check-subscription** - Deployed and accessible
- [ ] **create-checkout** - Deployed and accessible
- [ ] **customer-portal** - Deployed and accessible
- [ ] **delete-account** - Deployed and accessible
- [ ] **stoic-analyzer** - Deployed and accessible

**How to Deploy:**
```bash
# Using Supabase CLI
supabase functions deploy check-subscription
supabase functions deploy create-checkout
supabase functions deploy customer-portal
supabase functions deploy delete-account
supabase functions deploy stoic-analyzer
```

### Verify Function Configuration

- [ ] All functions have `verify_jwt = false` in `supabase/config.toml`
  - This allows manual JWT validation in functions

- [ ] Edge function secrets are set (if using Stripe):
  - `STRIPE_SECRET_KEY` is configured

## Testing Checklist

### Authentication Flow

- [ ] **Sign Up:**
  - User can create account
  - Profile is automatically created
  - Virtue scores are initialized (all at 50)
  - Subscription is created (free plan)

- [ ] **Sign In:**
  - User can sign in with email/password
  - Session persists across page reloads
  - Profile loads correctly

- [ ] **Profile Recovery:**
  - If profile is missing, `ensure_profile_exists()` recovers it
  - Test by manually deleting profile row, then signing in

- [ ] **Delete Account:**
  - User can delete account via edge function
  - All related data is cascade deleted

### Onboarding Flow

- [ ] **New User:**
  - After sign up, user is redirected to `/onboarding`
  - Profile exists before onboarding starts
  - Onboarding data saves correctly
  - User is redirected to home after completion

- [ ] **Existing User:**
  - User with profile can skip onboarding
  - Profile data loads correctly

### Data Operations

- [ ] **Profile:**
  - Can read own profile
  - Can update own profile
  - Cannot access other users' profiles

- [ ] **Events:**
  - Can create events
  - Can read own events
  - Cannot access other users' events

- [ ] **Virtue Scores:**
  - Can read own virtue scores
  - Can update own virtue scores
  - Initial scores are set to 50 for all virtues

- [ ] **Subscriptions:**
  - Subscription is created on profile creation
  - Can read own subscription
  - Cannot access other users' subscriptions

## Security Validation

### Row Level Security (RLS)

- [ ] **Test unauthorized access:**
  - Try to read another user's profile (should fail)
  - Try to update another user's profile (should fail)
  - Try to create events for another user (should fail)

### Edge Functions

- [ ] **Authentication required:**
  - All functions require valid JWT token
  - Functions reject requests without Authorization header
  - Functions validate user exists before processing

- [ ] **Environment variables:**
  - Functions validate required env vars on startup
  - Functions return clear errors if env vars missing

## Performance & Monitoring

### Database

- [ ] **Indexes exist:**
  - `idx_usage_tracking_profile_tool_date` on `usage_tracking`

- [ ] **Query performance:**
  - Profile queries are fast (< 100ms)
  - Event queries are fast (< 200ms)
  - No N+1 query issues

### Error Handling

- [ ] **Client-side:**
  - Missing env vars show clear error messages
  - Invalid key format shows diagnostic message
  - Profile loading errors are handled gracefully

- [ ] **Server-side:**
  - Edge functions return clear error messages
  - Database errors are logged appropriately
  - No sensitive data in error messages

## Post-Deployment Verification

### Smoke Tests

1. **Create test account:**
   - Sign up with test email
   - Complete onboarding
   - Verify profile exists
   - Verify virtue scores initialized

2. **Test core flows:**
   - Create a pulse event
   - Create an intervene event
   - Create a debrief event
   - Verify events are saved

3. **Test edge functions:**
   - Check subscription status
   - Create checkout session (if Stripe configured)
   - Delete account (cleanup test user)

### Monitoring

- [ ] **Supabase Dashboard:**
  - Check for any error logs
  - Monitor database performance
  - Verify edge function invocations

- [ ] **Vercel Dashboard:**
  - Check for build errors
  - Monitor deployment status
  - Verify environment variables are set

## Rollback Plan

If issues are discovered:

1. **Database:**
   - Migrations can be rolled back manually
   - Backup database before major changes

2. **Edge Functions:**
   - Previous versions can be redeployed
   - Functions are versioned in Supabase

3. **Client:**
   - Vercel allows instant rollback to previous deployment
   - Environment variables can be updated without redeploy

## Support Resources

- **Supabase Docs:** https://supabase.com/docs
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Vercel Docs:** https://vercel.com/docs
- **Project Issues:** Check GitHub issues or contact team

---

**Last Updated:** 2025-12-16  
**Version:** 1.0.0

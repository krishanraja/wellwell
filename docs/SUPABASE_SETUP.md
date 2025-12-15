# WellWell Supabase Configuration Guide

## Database Configuration

**Project**: WellWell  
**Project ID**: `zioacippbtcbctexywgc`  
**Supabase URL**: `https://zioacippbtcbctexywgc.supabase.co`  
**Publishable Key**: `sb_publishable_PzNwPfmzOwwJpdh2A6_ufw_liFByjVO`

## Local Development Setup

### 1. Environment Variables

Ensure your `.env` file contains:

```env
VITE_SUPABASE_URL=https://zioacippbtcbctexywgc.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_PzNwPfmzOwwJpdh2A6_ufw_liFByjVO
```

### 2. Verify Configuration

The app will automatically validate the configuration on startup. If you see errors about missing environment variables, check your `.env` file.

## Edge Functions Configuration

Edge functions use environment variables configured in the Supabase dashboard. Ensure the following are set:

### Required Environment Variables (in Supabase Dashboard)

1. **SUPABASE_URL**: `https://zioacippbtcbctexywgc.supabase.co`
2. **SUPABASE_ANON_KEY**: Your WellWell project's anon/public key
3. **SUPABASE_SERVICE_ROLE_KEY**: Your WellWell project's service role key (for functions that need elevated permissions)
4. **STRIPE_SECRET_KEY**: Your Stripe secret key (for payment functions)

### Edge Functions Using Supabase

- `check-subscription`: Uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- `create-checkout`: Uses `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- `customer-portal`: Uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- `stoic-analyzer`: Does not use Supabase directly (uses Lovable AI Gateway)

## Verification Checklist

- [ ] `.env` file exists with correct `VITE_SUPABASE_URL`
- [ ] `.env` file contains correct `VITE_SUPABASE_PUBLISHABLE_KEY`
- [ ] `supabase/config.toml` has `project_id = "zioacippbtcbctexywgc"`
- [ ] Edge function environment variables are set in Supabase dashboard
- [ ] App starts without Supabase connection errors
- [ ] Database operations work correctly (profile, events, insights, etc.)

## Troubleshooting

### "Missing VITE_SUPABASE_URL" Error

1. Check that `.env` file exists in the project root
2. Verify the file contains `VITE_SUPABASE_URL=https://zioacippbtcbctexywgc.supabase.co`
3. Restart the development server after creating/updating `.env`

### "Warning: Supabase URL does not match WellWell project ID"

This warning appears if the URL doesn't contain the project ID. Ensure you're using:
- `https://zioacippbtcbctexywgc.supabase.co`

### Edge Functions Not Working

1. Verify environment variables are set in Supabase dashboard
2. Check that you're using the correct project (WellWell, ID: zioacippbtcbctexywgc)
3. Ensure service role key has proper permissions

## Data Pipeline

All database operations flow through the centralized Supabase client:

```
Components → Hooks → Supabase Client → WellWell Database
```

The client is located at: `src/integrations/supabase/client.ts`

All hooks import from this single source:
- `useProfile`
- `useEvents`
- `useVirtueScores`
- `useSubscription`
- `useStoicAnalyzer`
- `useCrossSessionMemory`
- `usePatterns`
- `useVirtueHistory`
- `useStreak`
- `useUsageLimit`

This ensures all operations connect to the same WellWell Supabase project.


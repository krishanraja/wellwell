# Quick Setup: Edge Function Environment Variables

## Option 1: Manual Setup (Fastest - 2 minutes)

1. **Sign in to Supabase**: https://supabase.com/dashboard/sign-in
2. **Go to Secrets page**: https://supabase.com/dashboard/project/zioacippbtcbctexywgc/functions/secrets
3. **Click "Add new secret"** for each variable:

   | Secret Name | Value |
   |------------|-------|
   | `SUPABASE_URL` | `https://zioacippbtcbctexywgc.supabase.co` |
   | `SUPABASE_ANON_KEY` | Get from [API Settings](https://supabase.com/dashboard/project/zioacippbtcbctexywgc/settings/api) (anon/public key) |
   | `SUPABASE_SERVICE_ROLE_KEY` | Get from [API Settings](https://supabase.com/dashboard/project/zioacippbtcbctexywgc/settings/api) (service_role key) |
   | `STRIPE_SECRET_KEY` | Your Stripe secret key (if using payments) |

## Option 2: Automated Script

If you have your API keys ready:

```powershell
# Set your API keys
$env:SUPABASE_ACCESS_TOKEN="your-access-token"  # Get from: https://supabase.com/dashboard/account/tokens
$env:SUPABASE_ANON_KEY="your-anon-key"         # From API settings
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"  # From API settings

# Run the script
node scripts/add-edge-function-secrets.js
```

## Get Your API Keys

1. Go to: https://supabase.com/dashboard/project/zioacippbtcbctexywgc/settings/api
2. Copy:
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Verification

After adding the secrets, your edge functions will automatically have access to these environment variables.


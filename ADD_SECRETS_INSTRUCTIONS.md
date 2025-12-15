# Step-by-Step: Adding Edge Function Secrets

I've opened the Supabase dashboard for you. Here's what to do:

## Steps:

1. **Sign in** (if not already signed in)
   - Use GitHub, SSO, or email/password

2. **Once on the Secrets page**, you'll see:
   - A heading "Edge Function Secrets"
   - A button to "Add new secret" or similar

3. **Add each secret** by clicking "Add new secret" and entering:

   ### Secret 1: SUPABASE_URL
   - **Name**: `SUPABASE_URL`
   - **Value**: `https://zioacippbtcbctexywgc.supabase.co`

   ### Secret 2: SUPABASE_ANON_KEY
   - **Name**: `SUPABASE_ANON_KEY`
   - **Value**: Get from https://supabase.com/dashboard/project/zioacippbtcbctexywgc/settings/api
     - Look for "anon public" key
     - Copy the entire key

   ### Secret 3: SUPABASE_SERVICE_ROLE_KEY
   - **Name**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: Get from https://supabase.com/dashboard/project/zioacippbtcbctexywgc/settings/api
     - Look for "service_role" key (⚠️ Keep this secret!)
     - Copy the entire key

   ### Secret 4: STRIPE_SECRET_KEY (Optional - if using payments)
   - **Name**: `STRIPE_SECRET_KEY`
   - **Value**: Your Stripe secret key (starts with `sk_`)

4. **Save each secret** after entering it

## Quick Links:

- **Secrets Page**: https://supabase.com/dashboard/project/zioacippbtcbctexywgc/functions/secrets
- **API Settings** (to get keys): https://supabase.com/dashboard/project/zioacippbtcbctexywgc/settings/api

## Once Complete:

After adding all secrets, your edge functions will have access to these environment variables automatically. No restart needed!


# Environment Variables Verification Checklist

## Vercel Environment Variables ✅

Based on your provided credentials, verify these are set in Vercel:

### Required Variables:

1. **VITE_SUPABASE_URL**
   - ✅ Expected: `https://zioacippbtcbctexywgc.supabase.co`
   - ✅ Your value: `https://zioacippbtcbctexywgc.supabase.co` ✓
   - Status: **CORRECT**

2. **VITE_SUPABASE_PUBLISHABLE_KEY**
   - ✅ Expected: JWT token starting with `eyJ...`
   - ✅ Your value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` ✓
   - Status: **CORRECT**

### How to Verify in Vercel:

1. Go to: https://vercel.com/dashboard
2. Select your WellWell project
3. Go to Settings → Environment Variables
4. Verify both variables are set for:
   - Production
   - Preview (optional but recommended)
   - Development (optional)

## Supabase Edge Function Secrets ✅

Verify these secrets are configured in Supabase:

### Required Secrets:

1. **GOOGLE_AI_API_KEY**
   - Status: ✅ Should be configured (visible in your secrets dashboard)
   - Purpose: Powers AI analysis in `stoic-analyzer`
   - Verify: Check Supabase dashboard → Functions → Secrets

2. **OPENAI_API_KEY**
   - Status: ✅ Should be configured (visible in your secrets dashboard)
   - Purpose: Powers voice transcription in `whisper-transcribe`
   - Verify: Check Supabase dashboard → Functions → Secrets

3. **STRIPE_SECRET_KEY**
   - Status: ✅ Should be configured (visible in your secrets dashboard)
   - Purpose: Powers payment processing
   - Verify: Check Supabase dashboard → Functions → Secrets

4. **SUPABASE_URL**
   - Status: ✅ Automatically provided by Supabase
   - Value: `https://zioacippbtcbctexywgc.supabase.co`

5. **SUPABASE_ANON_KEY**
   - Status: ✅ Automatically provided by Supabase
   - Value: Your anon key (same as VITE_SUPABASE_PUBLISHABLE_KEY)

6. **SUPABASE_SERVICE_ROLE_KEY**
   - Status: ✅ Automatically provided by Supabase
   - Value: Your service role key

### How to Verify in Supabase:

1. Go to: https://supabase.com/dashboard/project/zioacippbtcbctexywgc/functions/secrets
2. Verify all secrets listed above are present
3. If any are missing, add them using the "Add secret" button

## Quick Test

After deployment, test the frontend:

1. Open your Vercel deployment URL
2. Check browser console (F12) for any errors
3. Try signing up/logging in
4. Test AI analysis (Pulse, Intervene, Debrief)
5. Test voice input
6. Test subscription flow

## Common Issues

### Issue: "Missing VITE_SUPABASE_URL"
- **Solution**: Add the variable in Vercel project settings
- **Value**: `https://zioacippbtcbctexywgc.supabase.co`

### Issue: "Invalid Supabase publishable key format"
- **Solution**: Ensure the key starts with `eyJ` (JWT format)
- **Note**: Use the "anon public" key, NOT the service_role key

### Issue: Edge function returns "AI service not configured"
- **Solution**: Add `GOOGLE_AI_API_KEY` to Supabase secrets
- **Location**: Supabase dashboard → Functions → Secrets














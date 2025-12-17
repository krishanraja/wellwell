# Edge Functions Environment Variables - Setup Complete ✅

## ✅ Good News!

**Supabase automatically provides these environment variables to all edge functions:**
- `SUPABASE_URL` - Automatically available
- `SUPABASE_ANON_KEY` - Automatically available  
- `SUPABASE_SERVICE_ROLE_KEY` - Automatically available

**You don't need to manually set these!** They're injected by Supabase automatically.

## ⚠️ Required: STRIPE_SECRET_KEY

If you're using Stripe for payments (which your `check-subscription`, `create-checkout`, and `customer-portal` functions do), you'll need to add:

**Secret Name**: `STRIPE_SECRET_KEY`  
**Value**: Your Stripe secret key (starts with `sk_`)

### To Add STRIPE_SECRET_KEY:

1. Go to: https://supabase.com/dashboard/project/zioacippbtcbctexywgc/functions/secrets
2. Click in the "Name" field and type: `STRIPE_SECRET_KEY`
3. Click in the "Value" field and paste your Stripe secret key
4. Click "Save"

## ✅ Verification

Your edge functions are now configured! They have access to:
- ✅ `SUPABASE_URL` (automatic)
- ✅ `SUPABASE_ANON_KEY` (automatic)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (automatic)
- ⚠️ `GOOGLE_AI_API_KEY` (required for AI analysis)
- ⚠️ `OPENAI_API_KEY` (required for voice transcription)
- ⚠️ `STRIPE_SECRET_KEY` (required for payments)

## ⚠️ Required: GOOGLE_AI_API_KEY

The `stoic-analyzer` function requires a Google AI API key for AI-powered Stoic analysis:

**Secret Name**: `GOOGLE_AI_API_KEY`  
**Value**: Your Google AI API key

### To Add GOOGLE_AI_API_KEY:

1. Go to: https://supabase.com/dashboard/project/zioacippbtcbctexywgc/functions/secrets
2. Click in the "Name" field and type: `GOOGLE_AI_API_KEY`
3. Click in the "Value" field and paste your Google AI API key
4. Click "Save"

## ⚠️ Required: OPENAI_API_KEY

The `whisper-transcribe` function requires an OpenAI API key for voice transcription:

**Secret Name**: `OPENAI_API_KEY`  
**Value**: Your OpenAI API key (starts with `sk-`)

### To Add OPENAI_API_KEY:

1. Go to: https://supabase.com/dashboard/project/zioacippbtcbctexywgc/functions/secrets
2. Click in the "Name" field and type: `OPENAI_API_KEY`
3. Click in the "Value" field and paste your OpenAI API key
4. Click "Save"

## Edge Functions Status

All your edge functions should work correctly:
- ✅ `stoic-analyzer` - Needs GOOGLE_AI_API_KEY for AI analysis
- ✅ `whisper-transcribe` - Needs OPENAI_API_KEY for voice transcription
- ✅ `check-subscription` - Needs STRIPE_SECRET_KEY for payments
- ✅ `create-checkout` - Needs STRIPE_SECRET_KEY for payments
- ✅ `customer-portal` - Needs STRIPE_SECRET_KEY for payments
- ✅ `delete-account` - Uses automatic Supabase keys only

## Summary

**No action needed** for Supabase variables - they're automatic!  
**Action needed** for:
- AI analysis: Add `GOOGLE_AI_API_KEY`
- Voice transcription: Add `OPENAI_API_KEY`
- Payments: Add `STRIPE_SECRET_KEY`


# WellWell Deployment Guide

## Prerequisites

1. Supabase project: `zioacippbtcbctexywgc`
2. Vercel project configured
3. All required API keys

## Step 1: Deploy Supabase Edge Functions

Deploy the updated `stoic-analyzer` function:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref zioacippbtcbctexywgc

# Deploy the stoic-analyzer function
supabase functions deploy stoic-analyzer --project-ref zioacippbtcbctexywgc
```

Or deploy all functions:

```bash
supabase functions deploy --project-ref zioacippbtcbctexywgc
```

## Step 2: Verify Supabase Secrets

Ensure all required secrets are configured in Supabase:

1. Go to: https://supabase.com/dashboard/project/zioacippbtcbctexywgc/functions/secrets
2. Verify these secrets exist:
   - ✅ `GOOGLE_AI_API_KEY` - Required for AI analysis
   - ✅ `OPENAI_API_KEY` - Required for voice transcription
   - ✅ `STRIPE_SECRET_KEY` - Required for payments
   - ✅ `SUPABASE_URL` - Automatically provided
   - ✅ `SUPABASE_ANON_KEY` - Automatically provided
   - ✅ `SUPABASE_SERVICE_ROLE_KEY` - Automatically provided

## Step 3: Verify Vercel Environment Variables

Ensure these environment variables are set in Vercel:

1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Verify these are set:
   - ✅ `VITE_SUPABASE_URL` = `https://zioacippbtcbctexywgc.supabase.co`
   - ✅ `VITE_SUPABASE_PUBLISHABLE_KEY` = Your anon key (JWT starting with `eyJ...`)

## Step 4: Test Edge Functions

Test each edge function after deployment:

### Test stoic-analyzer:
```bash
curl -X POST https://zioacippbtcbctexywgc.supabase.co/functions/v1/stoic-analyzer \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "pulse",
    "challenge": "Test challenge"
  }'
```

### Test whisper-transcribe:
```bash
curl -X POST https://zioacippbtcbctexywgc.supabase.co/functions/v1/whisper-transcribe \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -F "audio=@test-audio.webm"
```

## Step 5: Verify Frontend

1. Deploy to Vercel (or push to main branch if auto-deploy is enabled)
2. Test the following features:
   - ✅ User authentication (sign up/login)
   - ✅ Morning Pulse (AI analysis)
   - ✅ Intervene (real-time recalibration)
   - ✅ Evening Debrief
   - ✅ Voice input (transcription)
   - ✅ Subscription management
   - ✅ Account deletion

## Troubleshooting

### Edge function returns 500 error
- Check Supabase function logs: https://supabase.com/dashboard/project/zioacippbtcbctexywgc/functions
- Verify all required secrets are set
- Check API key quotas

### Frontend can't connect to Supabase
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel
- Check browser console for CORS errors
- Verify Supabase project is active

### AI analysis not working
- Verify `GOOGLE_AI_API_KEY` is set in Supabase secrets
- Check Google AI API quota
- Review edge function logs for specific errors












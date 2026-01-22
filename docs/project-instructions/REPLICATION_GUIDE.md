# WellWell Replication Guide

## Overview

Step-by-step instructions to rebuild WellWell from scratch, including setup, configuration, and verification checklist.

---

## Prerequisites

### Required Accounts
- **Supabase:** https://supabase.com (free tier sufficient)
- **Vercel:** https://vercel.com (free tier sufficient)
- **Google AI:** https://makersuite.google.com/app/apikey (for Gemini API)

### Required Software
- **Node.js:** v18+ (https://nodejs.org)
- **Git:** Latest version (https://git-scm.com)
- **Supabase CLI:** `npm install -g supabase` (optional but recommended)

### Required Knowledge
- Basic React/TypeScript
- Command line usage
- Git basics

---

## Step 1: Clone Repository

```bash
# Clone the repository
git clone <repository-url>
cd wellwell

# Install dependencies
npm install
```

---

## Step 2: Supabase Setup

### 2.1 Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Enter project name: `wellwell`
4. Set database password (save this!)
5. Select region closest to you
6. Wait for project to be created (2-3 minutes)

### 2.2 Run Database Migrations
1. Go to Supabase Dashboard → SQL Editor
2. Click "New query"
3. Run migrations in order:

**Migration 1: Initial Schema**
```sql
-- Copy contents of: supabase/migrations/20251212021713_25d9bac3-d0eb-41f3-8ee4-d554e8ce7ea1.sql
-- Paste and run
```

**Migration 2: Subscriptions**
```sql
-- Copy contents of: supabase/migrations/20251212042606_67410d84-5210-46c4-877c-3135b41632bb.sql
-- Paste and run
```

**Migration 3: Check-in Times**
```sql
-- Copy contents of: supabase/migrations/20251215120000_add_checkin_times.sql
-- Paste and run
```

**Migration 4: Profile Recovery** ⚠️ **CRITICAL**
```sql
-- Copy contents of: supabase/migrations/20251216131409_add_profile_recovery.sql
-- Paste and run
```

**Migration 5: Improved Trigger** ⚠️ **CRITICAL**
```sql
-- Copy contents of: supabase/migrations/20251216131410_improve_handle_new_user.sql
-- Paste and run
```

**Migration 6: Daily Check-ins** (if exists)
```sql
-- Copy contents of: supabase/migrations/20251231000000_daily_checkins_and_scoring.sql
-- Paste and run
```

### 2.3 Verify Database Setup
1. Go to Supabase Dashboard → Database → Tables
2. Verify these tables exist:
   - ✅ `profiles`
   - ✅ `sessions`
   - ✅ `events`
   - ✅ `insights`
   - ✅ `virtue_scores`
   - ✅ `subscriptions`
   - ✅ `usage_tracking`

3. Go to Database → Functions
4. Verify this function exists:
   - ✅ `ensure_profile_exists`

---

## Step 3: Environment Variables

### 3.1 Create `.env` File
Create `.env` in project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here

# Get these from: Supabase Dashboard → Settings → API
```

### 3.2 Get Supabase Credentials
1. Go to Supabase Dashboard → Settings → API
2. Copy "Project URL" → `VITE_SUPABASE_URL`
3. Copy "anon public" key → `VITE_SUPABASE_PUBLISHABLE_KEY`

---

## Step 4: Deploy Edge Functions

### 4.1 Install Supabase CLI
```bash
npm install -g supabase
```

### 4.2 Login to Supabase
```bash
supabase login
```

### 4.3 Link Project
```bash
supabase link --project-ref YOUR_PROJECT_ID
```

### 4.4 Set Edge Function Secrets
1. Go to Supabase Dashboard → Edge Functions → Secrets
2. Add these secrets:

**Required:**
- `GOOGLE_AI_API_KEY` - Get from https://makersuite.google.com/app/apikey
- `OPENAI_API_KEY` - Get from https://platform.openai.com/api-keys (for voice transcription)

**Optional (for payments):**
- `STRIPE_SECRET_KEY` - Get from https://dashboard.stripe.com/apikeys

### 4.5 Deploy Edge Functions
```bash
# Deploy all functions
supabase functions deploy

# Or deploy individually
supabase functions deploy stoic-analyzer
supabase functions deploy whisper-transcribe
supabase functions deploy delete-account
```

### 4.6 Verify Edge Functions
1. Go to Supabase Dashboard → Edge Functions
2. Verify functions are deployed:
   - ✅ `stoic-analyzer`
   - ✅ `whisper-transcribe` (if using voice)
   - ✅ `delete-account`

---

## Step 5: Configure Supabase Auth

### 5.1 Email Auth Settings
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable "Email" provider
3. Configure email templates (optional):
   - Go to Authentication → Email Templates
   - Customize confirmation, reset password, etc.

### 5.2 URL Configuration
1. Go to Authentication → URL Configuration
2. Set "Site URL": `http://localhost:5173` (for dev) or `https://yourdomain.com` (for prod)
3. Add "Redirect URLs":
   - `http://localhost:5173/**`
   - `https://yourdomain.com/**`

### 5.3 Auto-Confirm (Optional for Dev)
1. Go to Authentication → Settings
2. Enable "Enable email confirmations" (disable for dev, enable for prod)

---

## Step 6: Run Development Server

```bash
# Start dev server
npm run dev

# App should open at http://localhost:5173
```

### 6.1 Test Basic Functionality
1. **Sign Up:**
   - Go to `/auth`
   - Create test account
   - Should redirect to `/onboarding`

2. **Onboarding:**
   - Complete onboarding flow
   - Select persona, challenges, goals
   - Should redirect to `/home`

3. **Core Tools:**
   - Test Morning Pulse (should call AI)
   - Test Intervene (should call AI)
   - Test Evening Debrief (should call AI)

---

## Step 7: Production Deployment

### 7.1 Deploy to Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Import your Git repository
4. Configure build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

### 7.2 Set Vercel Environment Variables
1. Go to Vercel Project → Settings → Environment Variables
2. Add:
   - `VITE_SUPABASE_URL` = Your Supabase URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = Your anon key

### 7.3 Update Supabase Auth URLs
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Update "Site URL" to your Vercel domain
3. Add Vercel domain to "Redirect URLs"

### 7.4 Deploy
1. Push to main branch (or trigger manual deploy)
2. Wait for deployment to complete
3. Test production URL

---

## Verification Checklist

### Database ✅
- [ ] All tables created (profiles, events, insights, virtue_scores, etc.)
- [ ] `ensure_profile_exists` function exists
- [ ] RLS policies enabled on all tables
- [ ] Test user can sign up and profile is created

### Edge Functions ✅
- [ ] `stoic-analyzer` deployed and accessible
- [ ] `whisper-transcribe` deployed (if using voice)
- [ ] `delete-account` deployed
- [ ] All secrets configured (GOOGLE_AI_API_KEY, etc.)
- [ ] Test AI analysis works (create Pulse, check response)

### Authentication ✅
- [ ] Email auth enabled
- [ ] Site URL configured
- [ ] Redirect URLs whitelisted
- [ ] Test sign up works
- [ ] Test login works
- [ ] Test password reset works (if enabled)

### Frontend ✅
- [ ] Dev server runs without errors
- [ ] Can sign up new user
- [ ] Onboarding flow works
- [ ] Home page loads
- [ ] Morning Pulse works (AI responds)
- [ ] Intervene works (AI responds)
- [ ] Evening Debrief works (AI responds)
- [ ] Profile page loads
- [ ] Virtue scores display

### Production ✅
- [ ] Vercel deployment successful
- [ ] Environment variables set
- [ ] Production URL works
- [ ] Can sign up on production
- [ ] AI analysis works on production
- [ ] No console errors

---

## Common Issues & Solutions

### Issue: "Configuration Problem" Error
**Solution:** Check `.env` file has correct Supabase URL and key

### Issue: Profile Not Created on Sign Up
**Solution:** Run migration `20251216131409_add_profile_recovery.sql` and verify `ensure_profile_exists` function exists

### Issue: AI Analysis Returns Error
**Solution:** 
1. Check `GOOGLE_AI_API_KEY` is set in Supabase secrets
2. Verify edge function is deployed
3. Check edge function logs in Supabase dashboard

### Issue: Can't Sign Up
**Solution:**
1. Check Supabase Auth → Providers → Email is enabled
2. Verify Site URL is configured
3. Check browser console for errors

### Issue: RLS Policy Errors
**Solution:**
1. Verify RLS is enabled on all tables
2. Check policies allow user to read/write their own data
3. Verify `auth.uid()` is used in policies

---

## File Structure Reference

```
wellwell/
├── src/
│   ├── components/wellwell/  # App-specific components
│   ├── hooks/                # Custom React hooks
│   ├── pages/                # Route components
│   ├── lib/                  # Utilities
│   └── assets/               # Images, logos
├── supabase/
│   ├── functions/            # Edge functions
│   │   ├── stoic-analyzer/
│   │   ├── whisper-transcribe/
│   │   └── delete-account/
│   └── migrations/           # Database migrations
├── public/                   # Static assets
├── .env                      # Environment variables (create this)
└── package.json              # Dependencies
```

---

## Next Steps After Setup

1. **Customize Branding:**
   - Update logo files in `src/assets/`
   - Customize colors in `tailwind.config.ts`
   - Update copy in components

2. **Configure AI:**
   - Adjust prompts in `supabase/functions/stoic-analyzer/index.ts`
   - Test AI responses for quality
   - Monitor API usage and costs

3. **Set Up Analytics:**
   - Add analytics tracking (optional)
   - Monitor user behavior
   - Track key metrics

4. **Test Thoroughly:**
   - Test all features on mobile
   - Test error states
   - Test edge cases

---

## Additional Resources

- **Architecture:** See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Features:** See [FEATURES.md](./FEATURES.md)
- **Common Issues:** See [COMMON_ISSUES.md](./COMMON_ISSUES.md)
- **Deployment:** See [../DEPLOYMENT.md](../DEPLOYMENT.md)

---

*Last Updated: January 16, 2026*

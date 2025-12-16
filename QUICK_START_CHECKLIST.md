# Quick Start Checklist ✅

Copy this checklist and check off each item as you complete it.

## Part 1: Database Setup (5 minutes)

- [ ] **Step 1.1:** Open https://supabase.com/dashboard
- [ ] **Step 1.2:** Click on your WellWell project
- [ ] **Step 1.3:** Click "SQL Editor" in left sidebar
- [ ] **Step 1.4:** Click "New query"
- [ ] **Step 1.5:** Open file: `supabase/migrations/20251216131409_add_profile_recovery.sql`
- [ ] **Step 1.6:** Copy ALL the text from that file
- [ ] **Step 1.7:** Paste into SQL Editor
- [ ] **Step 1.8:** Click "Run" button
- [ ] **Step 1.9:** See "Success" message ✅
- [ ] **Step 1.10:** Click "New query" again
- [ ] **Step 1.11:** Open file: `supabase/migrations/20251216131410_improve_handle_new_user.sql`
- [ ] **Step 1.12:** Copy ALL the text from that file
- [ ] **Step 1.13:** Paste into SQL Editor
- [ ] **Step 1.14:** Click "Run" button
- [ ] **Step 1.15:** See "Success" message ✅

## Part 2: Deploy Edge Function (2 minutes)

**Option A: Using Command Line**

- [ ] **Step 2.1:** Open terminal/command prompt
- [ ] **Step 2.2:** Type: `cd` then space, then drag your project folder into terminal, press Enter
- [ ] **Step 2.3:** Type: `supabase functions deploy delete-account`
- [ ] **Step 2.4:** Press Enter
- [ ] **Step 2.5:** See "Deployed" message ✅

**Option B: Using Dashboard (if command line doesn't work)**

- [ ] **Step 2.1:** Go to: https://supabase.com/dashboard/project/zioacippbtcbctexywgc/functions
- [ ] **Step 2.2:** Click "Create a new function"
- [ ] **Step 2.3:** Name it: `delete-account`
- [ ] **Step 2.4:** Open file: `supabase/functions/delete-account/index.ts`
- [ ] **Step 2.5:** Copy ALL the text
- [ ] **Step 2.6:** Paste into function editor
- [ ] **Step 2.7:** Click "Deploy"
- [ ] **Step 2.8:** See function in the list ✅

## Part 3: Test It Works (3 minutes)

- [ ] **Step 3.1:** Open your app in browser (http://localhost:5173 or wherever it's running)
- [ ] **Step 3.2:** Go to `/auth` page
- [ ] **Step 3.3:** Click "Sign up"
- [ ] **Step 3.4:** Enter test email (like `test123@example.com`)
- [ ] **Step 3.5:** Enter password (at least 6 characters)
- [ ] **Step 3.6:** Click "Sign up" button
- [ ] **Step 3.7:** Should redirect to `/onboarding` page ✅
- [ ] **Step 3.8:** If you see onboarding, everything works! 🎉

## Part 4: Production (When Ready)

- [ ] **Step 4.1:** Go to: https://vercel.com/dashboard
- [ ] **Step 4.2:** Click on your WellWell project
- [ ] **Step 4.3:** Click "Settings" → "Environment Variables"
- [ ] **Step 4.4:** Add: `VITE_SUPABASE_URL` = `https://zioacippbtcbctexywgc.supabase.co`
- [ ] **Step 4.5:** Add: `VITE_SUPABASE_PUBLISHABLE_KEY` = (your anon key from Supabase)
- [ ] **Step 4.6:** Click "Save"
- [ ] **Step 4.7:** Go to "Deployments" tab
- [ ] **Step 4.8:** Click "..." on latest deployment → "Redeploy"
- [ ] **Step 4.9:** Wait for deployment to finish ✅

---

## 🎯 You're Done When:

- ✅ Both SQL migrations show "Success"
- ✅ `delete-account` function appears in Supabase functions list
- ✅ You can sign up a new user
- ✅ You see the onboarding page after sign up

**That's it!** Your app is now fully set up. 🚀

---

## ⚠️ If Something Breaks:

1. **Check browser console** (Press F12, look for red errors)
2. **Check Supabase logs** (Dashboard → Logs)
3. **Make sure you ran BOTH migrations** (not just one)
4. **Verify your `.env` file** has the correct values

Need more help? See `NEXT_STEPS_IDIOT_PROOF.md` for detailed instructions.

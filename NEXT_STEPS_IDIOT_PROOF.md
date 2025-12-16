# Next Steps - Idiot Proof Guide 🚀

Follow these steps **in order**. Don't skip any steps!

## Step 1: Run SQL Migrations in Supabase

You need to run 2 new SQL files in your Supabase database.

### 1.1: Open Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Sign in if needed
3. Click on your **WellWell** project (project ID: `zioacippbtcbctexywgc`)

### 1.2: Open SQL Editor

1. In the left sidebar, click **"SQL Editor"**
2. Click the **"New query"** button (top right)

### 1.3: Run First Migration

1. Copy the **entire contents** of this file:
   - `supabase/migrations/20251216131409_add_profile_recovery.sql`
   
2. Paste it into the SQL Editor

3. Click the **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)

4. You should see: ✅ **"Success. No rows returned"**

### 1.4: Run Second Migration

1. Click **"New query"** again (or clear the editor)

2. Copy the **entire contents** of this file:
   - `supabase/migrations/20251216131410_improve_handle_new_user.sql`

3. Paste it into the SQL Editor

4. Click **"Run"**

5. You should see: ✅ **"Success. No rows returned"**

### ✅ Check: Verify Functions Exist

1. In the left sidebar, click **"Database"** → **"Functions"**
2. You should see: `ensure_profile_exists` in the list
3. If you see it, you're good! ✅

---

## Step 2: Deploy Delete Account Edge Function

### 2.1: Open Supabase CLI (or use Dashboard)

**Option A: Using Supabase CLI (Recommended)**

1. Open your terminal/command prompt
2. Navigate to your project folder:
   ```bash
   cd c:\Users\krish\OneDrive\Documents\WellWell\wellwell
   ```

3. Make sure you're logged in:
   ```bash
   supabase login
   ```

4. Link to your project (if not already linked):
   ```bash
   supabase link --project-ref zioacippbtcbctexywgc
   ```

5. Deploy the function:
   ```bash
   supabase functions deploy delete-account
   ```

6. You should see: ✅ **"Deployed Function delete-account"**

**Option B: Using Supabase Dashboard (If CLI doesn't work)**

1. Go to: https://supabase.com/dashboard/project/zioacippbtcbctexywgc/functions
2. Click **"Create a new function"**
3. Name it: `delete-account`
4. Copy the entire contents of: `supabase/functions/delete-account/index.ts`
5. Paste it into the function editor
6. Click **"Deploy"**

### ✅ Check: Verify Function Exists

1. Go to: https://supabase.com/dashboard/project/zioacippbtcbctexywgc/functions
2. You should see `delete-account` in the list ✅

---

## Step 3: Test Everything Works

### 3.1: Test Profile Recovery

1. **Start your dev server** (if not running):
   ```bash
   npm run dev
   ```

2. **Sign up a new test account**:
   - Go to `/auth`
   - Click "Sign up"
   - Use a test email (like `test@example.com`)
   - Create a password

3. **Verify profile was created**:
   - After sign up, you should be redirected to `/onboarding`
   - If you see the onboarding page, profile exists! ✅

4. **Test recovery** (optional but recommended):
   - Go to Supabase Dashboard → SQL Editor
   - Run this query (replace `YOUR_USER_ID` with the actual user ID):
     ```sql
     DELETE FROM public.profiles WHERE id = 'YOUR_USER_ID';
     ```
   - Sign out and sign back in
   - Profile should be automatically recovered! ✅

### 3.2: Test Delete Account

1. **Create a test account** (or use the one above)

2. **Try to delete it**:
   - Go to Settings page
   - Click "Delete Account" (if you have this button)
   - OR call the function manually (see below)

3. **Verify it works**:
   - Account should be deleted
   - You should be signed out
   - User should be removed from Supabase

**Manual Test (if you don't have UI button):**

1. Open browser console (F12)
2. Run this (while logged in):
   ```javascript
   // Get your session token
   const session = await window.supabase.auth.getSession();
   const token = session.data.session?.access_token;
   
   // Call the function
   fetch('https://zioacippbtcbctexywgc.supabase.co/functions/v1/delete-account', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     }
   }).then(r => r.json()).then(console.log);
   ```

---

## Step 4: Deploy to Production (When Ready)

### 4.1: Set Environment Variables in Vercel

1. Go to: https://vercel.com/dashboard
2. Select your **WellWell** project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

   **For Production:**
   - Name: `VITE_SUPABASE_URL`
     Value: `https://zioacippbtcbctexywgc.supabase.co`
   
   - Name: `VITE_SUPABASE_PUBLISHABLE_KEY`
     Value: Your anon key (get from Supabase Dashboard → Settings → API → "anon public" key)

5. Click **"Save"**

### 4.2: Redeploy

1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Wait for it to finish ✅

---

## Troubleshooting

### ❌ "Function not found" error

**Fix:** Make sure you deployed the `delete-account` function (Step 2)

### ❌ "Profile missing" error

**Fix:** 
1. Make sure you ran both SQL migrations (Step 1)
2. Try signing out and signing back in (recovery should trigger)

### ❌ "Permission denied" error

**Fix:**
1. Check that RLS policies are enabled on all tables
2. Verify you're using the correct anon key (not service_role key)

### ❌ Edge function returns 500 error

**Fix:**
1. Check Supabase Dashboard → Edge Functions → Logs
2. Look for error messages
3. Make sure `STRIPE_SECRET_KEY` is set (if using payments)

---

## Quick Checklist

Before you consider this done, verify:

- [ ] Both SQL migrations ran successfully
- [ ] `ensure_profile_exists` function exists in Supabase
- [ ] `delete-account` edge function is deployed
- [ ] Can sign up a new user
- [ ] Profile is created automatically
- [ ] Can sign in and see profile
- [ ] Delete account works (if you have UI for it)

---

## Need Help?

If something doesn't work:

1. **Check the logs:**
   - Browser console (F12) for client errors
   - Supabase Dashboard → Logs for server errors

2. **Verify your setup:**
   - `.env` file has correct values
   - Supabase project ID matches everywhere
   - All migrations ran successfully

3. **Common mistakes:**
   - Forgot to run migrations
   - Using wrong Supabase project
   - Environment variables not set in Vercel
   - Using service_role key instead of anon key

---

**That's it!** Once all steps are done, your app should be fully functional. 🎉

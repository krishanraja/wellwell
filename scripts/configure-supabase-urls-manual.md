# Configure Supabase Auth URLs - Manual Instructions

## Quick Method (Recommended)

Supabase Auth URLs (Site URL and Redirect URLs) are **not stored in database tables** that can be easily updated via SQL. They're managed through the Supabase Dashboard or Management API.

## Option 1: Dashboard UI (Easiest - 2 minutes)

1. **Open Supabase Dashboard**:
   - Go to: https://supabase.com/dashboard/project/zioacippbtcbctexywgc/auth/url-configuration

2. **Configure Site URL**:
   - In the "Site URL" field, enter: `https://wellwell.ai`
   - (Your production domain)

3. **Add Redirect URLs**:
   - Click "Add URL" or use the redirect URLs field
   - Add each URL:
     - `https://wellwell.ai/**`
     - `http://localhost:5173/**`
   - (The `/**` wildcard allows all paths)

4. **Save**:
   - Click "Save" button
   - Wait for confirmation

5. **Verify**:
   - The URLs should appear in the list
   - Test by triggering a signup email

## Option 2: Supabase CLI (If you have it installed)

```bash
# Install Supabase CLI if needed
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref zioacippbtcbctexywgc

# Update auth config (if CLI supports it)
# Note: CLI may not have direct auth URL configuration
```

## Option 3: Management API (Advanced)

If you have a Supabase Access Token:

```bash
# Set your access token
export SUPABASE_ACCESS_TOKEN=your_token_here

# Use the Management API
curl -X PATCH \
  "https://api.supabase.com/v1/projects/zioacippbtcbctexywgc" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "site_url": "https://wellwell.ai",
    "redirect_urls": [
      "https://wellwell.ai/**",
      "http://localhost:5173/**"
    ]
  }'
```

**Note**: The Management API endpoint and payload structure may vary. Check Supabase API docs for exact format.

## Why SQL Doesn't Work

Supabase stores Auth configuration (Site URL, Redirect URLs) in:
- Internal configuration system (not directly accessible via SQL)
- Managed through Dashboard UI or Management API
- Not in `auth.config` table (that's for other settings)

## Verification

After configuring, test by:

1. **Trigger a test signup**:
   - Go to your app
   - Sign up with a test email
   - Check the confirmation email

2. **Verify in email**:
   - ✅ Logo displays correctly
   - ✅ Links work (not showing `{{ .ConfirmationURL }}`)
   - ✅ Clicking link redirects to your app

3. **Check Dashboard**:
   - Go back to URL Configuration page
   - Verify URLs are saved

## Troubleshooting

**If `{{ .ConfirmationURL }}` still appears in emails:**

1. ✅ Templates uploaded to Supabase Dashboard
2. ✅ Site URL is set correctly
3. ✅ Redirect URLs are whitelisted
4. ✅ Templates saved (not just previewed)
5. ✅ Hard refresh browser cache

**If links don't work:**

1. Check Redirect URLs include `/**` wildcard
2. Verify Site URL matches your domain
3. Check email template has correct variable: `{{ .ConfirmationURL }}`
4. Ensure no extra whitespace in template variables

---

**Recommended**: Use Option 1 (Dashboard UI) - it's the fastest and most reliable method.

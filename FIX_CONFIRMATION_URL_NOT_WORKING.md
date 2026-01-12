# Fix: {{ .ConfirmationURL }} Showing as Literal Text

## Problem
The Supabase Go template variable `{{ .ConfirmationURL }}` appears as literal text instead of being replaced with an actual URL.

## Root Cause
Supabase requires **three things** to process template variables:
1. ✅ Templates uploaded to Dashboard (syntax is correct)
2. ❌ **Site URL configured** (CRITICAL - without this, variables can't be replaced)
3. ❌ **Redirect URLs whitelisted** (CRITICAL - without this, template processing fails)

## Immediate Fix (5 minutes)

### Step 1: Verify Templates Are Saved in Supabase
1. Go to: **Supabase Dashboard > Authentication > Email Templates**
2. For each template type, verify:
   - Template HTML is pasted and saved (not just previewed)
   - Click "Save" button if you see "Unsaved changes"
   - Wait for "Saved successfully" confirmation

### Step 2: Configure Site URL (REQUIRED)
1. Go to: **Supabase Dashboard > Authentication > URL Configuration**
2. In "Site URL" field, enter: `https://wellwell.ai`
3. Click "Save"
4. **This is CRITICAL** - without Site URL, Supabase cannot generate confirmation URLs

### Step 3: Whitelist Redirect URLs (REQUIRED)
1. On the same page (URL Configuration)
2. In "Redirect URLs" section, add:
   - `https://wellwell.ai/**`
   - `http://localhost:5173/**` (for local dev)
3. Click "Save"
4. **This is CRITICAL** - unlisted URLs cause template processing to fail

### Step 4: Clear Cache and Test
1. **Hard refresh** the Supabase Dashboard (Ctrl+Shift+R or Cmd+Shift+R)
2. Go back to Email Templates
3. Click "Preview" on a template - you should see a real URL, not `{{ .ConfirmationURL }}`
4. If preview still shows literal text, wait 30 seconds and refresh again (Supabase may cache)

### Step 5: Send Test Email
1. Trigger a test signup/reset password from your app
2. Check the actual email (not just preview)
3. The email should have:
   - ✅ Working clickable links (not `{{ .ConfirmationURL }}`)
   - ✅ Logo displaying correctly

## Why This Happens

Supabase's email template system works like this:

```
User Action → Supabase Auth → Email Template System
                                    ↓
                            [Checks Site URL exists?]
                                    ↓ NO → Variables not replaced
                                    ↓ YES
                            [Checks Redirect URL whitelisted?]
                                    ↓ NO → Variables not replaced
                                    ↓ YES
                            [Replaces {{ .ConfirmationURL }} with actual URL]
                                    ↓
                            [Sends email]
```

**If Site URL or Redirect URLs are missing, Supabase cannot generate the confirmation URL, so it leaves the template variable as-is.**

## Verification Checklist

Before reporting this as fixed, verify:

- [ ] Templates are saved in Supabase Dashboard (not just previewed)
- [ ] Site URL is set to `https://wellwell.ai`
- [ ] Redirect URLs include `https://wellwell.ai/**`
- [ ] Dashboard shows "Saved successfully" for both settings
- [ ] Template preview shows actual URL (not `{{ .ConfirmationURL }}`)
- [ ] Test email has working links

## If Still Not Working

If after completing all steps above, `{{ .ConfirmationURL }}` still appears:

1. **Check template syntax** (should already be correct):
   - Must be: `{{ .ConfirmationURL }}` (with space after `{` and before `.`)
   - NOT: `{{.ConfirmationURL}}` or `{{ ConfirmationURL }}`

2. **Check Supabase project**:
   - Make sure you're editing the correct Supabase project
   - Verify project ID matches your app's Supabase client

3. **Wait and retry**:
   - Supabase may cache template/config changes
   - Wait 1-2 minutes after saving
   - Hard refresh dashboard
   - Send another test email

4. **Check email client**:
   - Some email clients may show raw HTML
   - View email source to see if URL is actually replaced
   - Try a different email client (Gmail, Outlook, etc.)

## Quick Reference URLs

- **Email Templates**: https://supabase.com/dashboard/project/zioacippbtcbctexywgc/auth/templates
- **URL Configuration**: https://supabase.com/dashboard/project/zioacippbtcbctexywgc/auth/url-configuration

---

**Most Common Issue**: Site URL not configured. This is the #1 reason template variables don't work.

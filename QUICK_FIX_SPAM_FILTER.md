# Quick Fix: Email Spam Filter Warning

## Problem
**Warning**: "URI hostname has long non-vowel sequence, so it will be marked spam"

**Affected Templates**: ALL email templates (confirm-signup, magic-link, change-email, reset-password, invite-user)

The Supabase Storage URL hostname `zioacippbtcbctexywgc.supabase.co` contains a long consonant sequence ("ppbtcbct") that spam filters flag.

## Quick Solution: Host Logo on Your Domain

Since you have `wellwell.ai`, host the logo there:

### Step 1: Upload Logo to Your Web Server

1. **Upload the logo file**:
   - File: `src/assets/wellwell-logo.png`
   - Upload to your web server at: `https://wellwell.ai/images/wellwell-logo.png`
   - (Or any public path like `/assets/`, `/public/`, etc.)

2. **Verify it's accessible**:
   - Open: `https://wellwell.ai/images/wellwell-logo.png` in browser
   - Should display the logo

### Step 2: Update ALL Email Templates

Run this command to replace the Supabase URL in **all templates** (confirm-signup, magic-link, change-email, reset-password, invite-user):

```bash
node scripts/replace-logo-url.js https://wellwell.ai/images/wellwell-logo.png
```

This will automatically update all 5 email templates at once.

### Step 3: Verify

```bash
node scripts/validate-email-templates.js
```

### Step 4: Re-upload to Supabase

1. Go to: https://supabase.com/dashboard/project/zioacippbtcbctexywgc/auth/templates
2. Copy updated HTML from each template file
3. Paste into Supabase Dashboard
4. Save each template

### Step 5: Test

Send a test invite email and verify:
- ✅ Logo displays correctly
- ✅ No spam filter warnings
- ✅ Email looks professional

---

**Alternative**: If you can't host on your domain, use a CDN service like Cloudinary or Imgix.

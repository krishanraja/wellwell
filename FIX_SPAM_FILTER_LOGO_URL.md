# Fix: Email Spam Filter Warning - Logo URL

## Problem

**Warning**: "URI hostname has long non-vowel sequence, so it will be marked spam"

**Root Cause**: The Supabase Storage URL hostname `zioacippbtcbctexywgc.supabase.co` contains a long consonant sequence ("ppbtcbct") that spam filters flag.

**Affected Templates**: ALL 5 email templates
- `confirm-signup.html`
- `magic-link.html`
- `change-email.html`
- `reset-password.html` ⚠️
- `invite-user.html` ⚠️

**Affected URL** (used in all templates): 
```
https://zioacippbtcbctexywgc.supabase.co/storage/v1/object/public/Public/well%20well%20full%20logo.png
```

## Solutions

### Option 1: Use Custom Domain (Recommended)

If you have a custom domain for Supabase Storage:

1. **Set up custom domain in Supabase**:
   - Go to: Supabase Dashboard > Storage > Settings
   - Configure custom domain (e.g., `cdn.wellwell.ai` or `assets.wellwell.ai`)
   - Update CNAME records in your DNS

2. **Update logo URL in templates**:
   ```bash
   node scripts/replace-logo-url.js https://cdn.wellwell.ai/wellwell-logo.png
   ```

### Option 2: Host Logo on Your Own Domain

1. **Upload logo to your web server**:
   - Upload `src/assets/wellwell-logo.png` to your web server
   - Place in a public directory (e.g., `/public/images/` or `/assets/`)

2. **Update logo URL**:
   ```bash
   node scripts/replace-logo-url.js https://wellwell.ai/images/wellwell-logo.png
   ```

### Option 3: Use Image CDN Service

Use a service like Cloudinary, Imgix, or ImageKit:

1. **Upload logo to CDN**:
   - Sign up for service
   - Upload `src/assets/wellwell-logo.png`
   - Get optimized URL

2. **Update logo URL**:
   ```bash
   node scripts/replace-logo-url.js https://res.cloudinary.com/your-account/image/upload/wellwell-logo.png
   ```

### Option 4: Use URL Shortener (Not Recommended)

⚠️ **Warning**: URL shorteners may break in emails or be blocked.

If you must use one:
1. Create short URL for logo
2. Update templates with shortened URL
3. Test thoroughly in multiple email clients

## Recommended: Option 2 (Host on Your Domain)

Since you already have `wellwell.ai`, this is the simplest solution:

1. **Upload logo to your domain**:
   - Upload `src/assets/wellwell-logo.png` to your web server
   - Accessible at: `https://wellwell.ai/images/wellwell-logo.png` (or similar)

2. **Update ALL templates** (one command fixes all 5):
   ```bash
   node scripts/replace-logo-url.js https://wellwell.ai/images/wellwell-logo.png
   ```
   
   This will update:
   - confirm-signup.html
   - magic-link.html
   - change-email.html
   - reset-password.html
   - invite-user.html

3. **Regenerate templates** (if needed):
   ```bash
   node scripts/generate-email-templates.js
   ```

4. **Validate**:
   ```bash
   node scripts/validate-email-templates.js
   ```

5. **Re-upload to Supabase**:
   - Copy updated templates to Supabase Dashboard
   - Test email delivery

## Verification

After updating:

1. ✅ Logo URL has vowels in hostname (no long consonant sequences)
2. ✅ Logo accessible via new URL
3. ✅ Templates validated
4. ✅ Test email sent and logo displays correctly
5. ✅ No spam filter warnings

---

**Next Action**: Choose a solution and update the logo URL in all templates.

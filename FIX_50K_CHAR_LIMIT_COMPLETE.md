# Fix: Supabase 50,000 Character Limit - COMPLETE

## Problem

Templates were **82,234 characters** (exceeded Supabase's 50,000 character limit) due to base64 logo embedding.

## Root Cause

Base64-encoded logo adds ~54,000 characters to each template, pushing total size to 82k+ characters.

## Solution Implemented

### 1. Changed Default Behavior
- **Before**: Auto-embedded logo as base64 (82k+ chars) ❌
- **After**: Uses `LOGO_URL` placeholder (~5k chars) ✅
- **Result**: All templates now under 5,000 characters (10x under limit)

### 2. Updated Generation Script
- Default: `node scripts/generate-email-templates.js` → Uses `LOGO_URL` placeholder
- Optional: `node scripts/generate-email-templates.js --embed-logo` → Base64 (with warning)
- Character count validation added
- Exits with error if templates exceed 50k limit

### 3. Updated Validation Script
- Checks character count (must be ≤ 50,000)
- Accepts `LOGO_URL` placeholder as valid
- Shows character count for each template

### 4. Updated Deployment Script
- Validates character count before deployment
- Provides clear instructions for logo URL replacement
- Warns about 50k limit

### 5. Created Logo URL Replacer Script
- New: `scripts/replace-logo-url.js`
- Automatically replaces `LOGO_URL` with hosted URL
- Validates final character count
- Ensures templates stay under limit

## Verification

✅ **All templates validated:**
- `confirm-signup.html`: 4,878 chars
- `magic-link.html`: 4,805 chars
- `change-email.html`: 4,818 chars
- `reset-password.html`: 4,853 chars
- `invite-user.html`: 4,860 chars

✅ **All under 50,000 character limit** (largest is 4,878, which is 9.8% of limit)

## Workflow

### Recommended Workflow

1. **Generate templates**:
   ```bash
   node scripts/generate-email-templates.js
   ```
   → Creates templates with `LOGO_URL` placeholder (~5k chars each)

2. **Upload logo to Supabase Storage**:
   - Dashboard > Storage > Create public bucket
   - Upload `src/assets/wellwell-logo.png`
   - Copy public URL

3. **Replace LOGO_URL**:
   ```bash
   node scripts/replace-logo-url.js <YOUR_LOGO_URL>
   ```
   → Replaces placeholder with hosted URL

4. **Validate**:
   ```bash
   node scripts/validate-email-templates.js
   ```
   → Confirms all templates under 50k limit

5. **Deploy**:
   ```bash
   node scripts/deploy-email-templates.js
   ```
   → Get deployment instructions

## Files Modified

- `scripts/generate-email-templates.js` - Default to placeholder, validate char count
- `scripts/validate-email-templates.js` - Check 50k limit, accept placeholder
- `scripts/deploy-email-templates.js` - Validate char count, updated instructions
- `scripts/replace-logo-url.js` - NEW: Helper to replace placeholder with URL
- `email-templates/README.md` - Updated workflow
- `email-templates/*.html` - Regenerated with placeholder (~5k chars each)

## Success Criteria

✅ Templates under 50,000 characters
✅ Validation passes
✅ Deployment script confirms readiness
✅ Clear workflow for logo URL replacement

---

**Status**: ✅ FIXED - All templates under 50k limit, ready for Supabase deployment.

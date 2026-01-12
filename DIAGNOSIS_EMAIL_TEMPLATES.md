# Email Templates Failure - Complete Diagnostic

## Problem Statement

**Two Critical Issues:**
1. Logo does not display in email templates
2. Template variables (`{{ .ConfirmationURL }}`) appear as literal text instead of being replaced

**User Impact:** 
- Unprofessional email appearance (broken logo)
- Non-functional email links (users cannot click to confirm/reset)
- Security/UX failure (exposed backend template syntax)

**Severity:** CRITICAL - Blocks user authentication flows

---

## PHASE 1: Complete Problem Scope

### Issue 1: Logo Not Displaying

**Observed Symptoms:**
- Logo placeholder `LOGO_URL` may still be in templates
- OR logo URL was replaced but image doesn't load
- OR base64 embedded logo doesn't display

**Possible Root Causes (ALL must be checked):**

#### A. Template Generation Issues
1. **LOGO_URL placeholder not replaced**
   - Location: All `email-templates/*.html` files
   - Check: `grep -r "LOGO_URL" email-templates/`
   - Impact: Image src points to literal "LOGO_URL" string

2. **Logo URL incorrectly formatted**
   - If replaced manually, URL might be:
     - Missing `https://` protocol
     - Broken/expired URL
     - Private bucket (not public)
     - CORS issues blocking image load

3. **Base64 embedding failed**
   - Script didn't run
   - Logo file missing at `src/assets/wellwell-logo.png`
   - Base64 encoding corrupted

#### B. Supabase Configuration Issues
4. **Template not loaded into Supabase**
   - Templates exist locally but not in Supabase Dashboard
   - Wrong template type selected
   - Template saved but not activated

5. **Supabase Storage bucket misconfiguration**
   - Bucket not public
   - CORS not configured
   - URL path incorrect

#### C. Email Client Issues
6. **Email client blocking images**
   - Some clients block external images by default
   - Base64 images blocked by security policies
   - Image format not supported

### Issue 2: Template Variables Not Replaced

**Observed Symptoms:**
- `{{ .ConfirmationURL }}` appears as literal text in emails
- Links are non-functional
- Users see backend template syntax

**Possible Root Causes (ALL must be checked):**

#### A. Supabase Template Processing Failure
1. **Template not saved in Supabase Dashboard**
   - Templates exist locally but never uploaded
   - Upload failed silently
   - Wrong Supabase project selected

2. **Supabase email templates feature disabled**
   - Feature not enabled in project settings
   - Free tier limitations
   - Project configuration issue

3. **Template format incorrect**
   - Supabase expects specific Go template syntax
   - Extra whitespace/characters breaking parser
   - HTML encoding issues (entities vs raw)

4. **Template saved but wrong type**
   - Confirmation template saved to Magic Link slot
   - Template type mismatch
   - Multiple templates conflicting

#### B. Supabase Configuration Issues
5. **Site URL not configured**
   - Supabase needs Site URL to generate confirmation links
   - Location: Dashboard > Authentication > URL Configuration
   - Missing or incorrect Site URL breaks variable replacement

6. **Redirect URLs not whitelisted**
   - `emailRedirectTo` URLs must be in allowed list
   - Location: Dashboard > Authentication > URL Configuration > Redirect URLs
   - Unlisted URLs cause template processing to fail

7. **Email service provider misconfiguration**
   - Supabase email service not properly configured
   - SMTP settings incorrect
   - Email provider API keys missing

#### C. Code/Integration Issues
8. **emailRedirectTo not passed correctly**
   - `useAuth.tsx` line 125: `emailRedirectTo: redirectUrl`
   - `redirectUrl` might be incorrect format
   - Missing or malformed redirect URL breaks template processing

9. **Template variable syntax error**
   - Go template syntax is case-sensitive
   - Extra spaces: `{{ .ConfirmationURL }}` vs `{{.ConfirmationURL}}`
   - Wrong variable name (typo)

#### D. Deployment/Environment Issues
10. **Templates loaded to wrong environment**
    - Dev templates in production
    - Production templates in dev
    - Environment mismatch

11. **Template caching**
    - Supabase cached old template version
    - Browser/email client cached old version
    - CDN caching issues

---

## PHASE 2: Architecture Map

### Email Template Flow

```
User Action (Sign Up/Reset Password)
  ↓
useAuth.tsx: signUp() / signInWithOAuth()
  ↓
supabase.auth.signUp({ emailRedirectTo: redirectUrl })
  ↓
Supabase Auth Service
  ↓
[CRITICAL CHECKPOINT] Supabase Email Template System
  ├─ Loads template from Dashboard > Authentication > Email Templates
  ├─ Processes Go template variables: {{ .ConfirmationURL }}
  ├─ Replaces variables with actual URLs
  └─ Sends email via configured email provider
  ↓
Email Delivered to User
  ├─ Logo should load from URL or base64
  └─ Links should be functional (not literal {{ .ConfirmationURL }})
```

### Critical Failure Points

1. **Template Upload Point**
   - Location: Supabase Dashboard > Authentication > Email Templates
   - Failure: Template not uploaded = variables never processed

2. **Template Processing Point**
   - Location: Supabase backend email service
   - Failure: Variables not replaced = literal text in email

3. **Site URL Configuration Point**
   - Location: Dashboard > Authentication > URL Configuration
   - Failure: Missing Site URL = cannot generate confirmation URLs

4. **Redirect URL Whitelist Point**
   - Location: Dashboard > Authentication > URL Configuration > Redirect URLs
   - Failure: URL not whitelisted = template processing may fail

5. **Logo Asset Point**
   - Location: Supabase Storage OR base64 in template
   - Failure: Broken URL or missing asset = no logo display

---

## PHASE 3: Root Cause Investigation Checklist

### Immediate Verification Steps (Do These First)

#### Step 1: Verify Templates Are in Supabase Dashboard
**Action:** 
1. Go to: https://supabase.com/dashboard/project/zioacippbtcbctexywgc/auth/templates
2. Check each template type:
   - Confirmation Email
   - Magic Link
   - Change Email Address
   - Reset Password
   - Invite User

**Expected:** Each template shows custom HTML (not default Supabase template)

**If FAIL:** Templates were never uploaded. This is root cause #1.

#### Step 2: Verify Site URL Configuration
**Action:**
1. Go to: https://supabase.com/dashboard/project/zioacippbtcbctexywgc/auth/url-configuration
2. Check "Site URL" field

**Expected:** 
- Site URL = `https://wellwell.ai` (or your production domain)
- OR `http://localhost:5173` for development

**If MISSING/INCORRECT:** This breaks `{{ .ConfirmationURL }}` generation. Root cause #2.

#### Step 3: Verify Redirect URLs Whitelist
**Action:**
1. Same page: URL Configuration
2. Check "Redirect URLs" section

**Expected:**
- Contains: `https://wellwell.ai/**` (production)
- Contains: `http://localhost:5173/**` (development)
- Contains: `http://localhost:3000/**` (if using different port)

**If MISSING:** Supabase may reject email redirects. Root cause #3.

#### Step 4: Check Logo in Generated Templates
**Action:**
```bash
# Check if LOGO_URL placeholder exists
grep -r "LOGO_URL" email-templates/

# Check if base64 data URL exists
grep -r "data:image/png;base64" email-templates/
```

**Expected:**
- Either: All `LOGO_URL` replaced with actual URL
- OR: All `LOGO_URL` replaced with base64 data URL
- NOT: Any files still contain literal `LOGO_URL`

**If FOUND:** Logo placeholder not replaced. Root cause #4.

#### Step 5: Verify Logo URL Accessibility
**Action:**
1. If using hosted URL, test in browser:
   - Open logo URL directly in browser
   - Should display image
   - Check browser console for CORS errors

2. If using base64:
   - Check template file size (should be ~80KB+)
   - Verify base64 string is complete

**Expected:** Logo URL loads successfully OR base64 is valid

**If FAILS:** Logo asset issue. Root cause #5.

#### Step 6: Test Email Template Processing
**Action:**
1. Trigger a test email (sign up with test account)
2. Check received email source (View Source in email client)
3. Search for `{{ .ConfirmationURL }}`

**Expected:**
- NOT found: Variables were replaced
- FOUND: Variables not processed (root cause #6)

#### Step 7: Verify emailRedirectTo in Code
**Action:**
Check `src/hooks/useAuth.tsx` lines 119-125:
```typescript
const redirectUrl = `${window.location.origin}/`;
// ...
emailRedirectTo: redirectUrl,
```

**Expected:**
- `redirectUrl` is valid URL format
- Matches whitelisted redirect URLs in Supabase
- Not `undefined` or empty

**If INVALID:** Code issue. Root cause #7.

---

## PHASE 4: Systematic Fix Protocol

### Fix Priority Order

**P0 (Blocking):** Template variables not replaced
**P1 (Critical):** Logo not displaying
**P2 (Important):** Template workflow improvements

### Fix Strategy

#### Fix 1: Ensure Templates Are Uploaded to Supabase
**Why:** If templates aren't in Supabase, variables will never be processed.

**Action:**
1. Verify each template is in Supabase Dashboard
2. If missing, upload from `email-templates/` directory
3. Save each template
4. Test by triggering email

**Verification:**
- Email received shows replaced URLs (not `{{ .ConfirmationURL }}`)
- Links are clickable and functional

#### Fix 2: Configure Supabase Site URL and Redirect URLs
**Why:** Supabase needs these to generate confirmation links.

**Action:**
1. Set Site URL: `https://wellwell.ai` (or your domain)
2. Add Redirect URLs:
   - `https://wellwell.ai/**`
   - `http://localhost:5173/**` (for dev)
3. Save configuration

**Verification:**
- Confirmation emails contain working links
- Links redirect to correct domain

#### Fix 3: Automate Logo Embedding
**Why:** Manual replacement is error-prone and doesn't scale.

**Action:**
1. Modify `generate-email-templates.js` to:
   - Automatically embed logo as base64 OR
   - Use a configurable logo URL from environment
2. Create validation script to check templates before upload
3. Add pre-upload checklist

**Verification:**
- Generated templates always have logo (no `LOGO_URL` placeholder)
- Logo displays in test emails

#### Fix 4: Add Template Validation
**Why:** Catch issues before they reach production.

**Action:**
1. Create validation script that checks:
   - No `LOGO_URL` placeholders
   - Valid Go template syntax
   - Required variables present
   - Template size limits
2. Run before uploading to Supabase

**Verification:**
- Script catches template issues
- Prevents broken templates from being uploaded

#### Fix 5: Document Complete Workflow
**Why:** Prevent future configuration mistakes.

**Action:**
1. Create step-by-step guide with verification checkpoints
2. Include screenshots of Supabase Dashboard settings
3. Add troubleshooting section
4. Document all required Supabase settings

**Verification:**
- New team members can set up templates correctly
- Issues are caught early

---

## PHASE 5: Prevention Architecture

### Permanent Solutions

#### Solution 1: Automated Template Deployment
**Create:** Script that uploads templates directly to Supabase via API
- Validates templates before upload
- Checks Supabase configuration
- Provides rollback capability

#### Solution 2: Template Testing Framework
**Create:** Test suite that:
- Generates test emails
- Validates template variables are replaced
- Checks logo displays
- Verifies links are functional

#### Solution 3: Configuration Validation
**Create:** Pre-deployment check that verifies:
- Site URL is set
- Redirect URLs are whitelisted
- Templates are uploaded
- Logo assets are accessible

#### Solution 4: Monitoring & Alerts
**Create:** System that:
- Monitors email delivery
- Detects template variable failures
- Alerts on broken logo URLs
- Tracks email open rates

---

## Next Steps

1. **IMMEDIATE:** Run verification checklist (Steps 1-7 above)
2. **DIAGNOSE:** Identify which root causes apply
3. **FIX:** Apply fixes in priority order (P0 → P1 → P2)
4. **VERIFY:** Test each fix with actual email
5. **PREVENT:** Implement permanent solutions

**DO NOT PROCEED TO FIXES UNTIL:**
- All verification steps completed
- Root causes identified
- Fix plan approved

---

## Files Requiring Investigation

- `email-templates/*.html` - Check for `LOGO_URL` and template syntax
- `src/hooks/useAuth.tsx` - Verify `emailRedirectTo` configuration
- `scripts/generate-email-templates.js` - Check template generation logic
- Supabase Dashboard settings (manual verification required)

---

## Related Issues History

- Previous logo visibility issues (dark background fix)
- Template size issues (base64 vs URL decision)
- Documentation updates (logo path references)

This diagnostic acknowledges the full conversation history and builds on previous fixes.

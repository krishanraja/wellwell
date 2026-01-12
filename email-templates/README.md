# WellWell Email Templates

These are branded email templates for Supabase Authentication.

## Setup Instructions

### Recommended: Use Hosted Logo URL

1. **Upload Logo to Supabase Storage**
   - Logo location: `src/assets/wellwell-logo.png`
   - Go to Supabase Dashboard > Storage
   - Create a public bucket named `email-assets` (or use existing public bucket)
   - Upload `wellwell-logo.png` from `src/assets/`
   - Copy the public URL (e.g., `https://YOUR_PROJECT.supabase.co/storage/v1/object/public/email-assets/wellwell-logo.png`)

2. **Update Templates**
   - Open each template file in `email-templates/`
   - Find `LOGO_URL` and replace with your Supabase Storage URL
   - Save the file

### Alternative: Base64 Embedding (Not Recommended)

If you must embed the logo directly, you can use the optional embed script:
```bash
node scripts/embed-logo-in-templates.js
```

**Note:** This will make templates very large (80k+ characters) and harder to maintain.

2. **Load Templates into Supabase**
   - Go to: Supabase Dashboard > Authentication > Email Templates
   - For each template type:
     - Click "Edit" on the template
     - Copy the HTML from the corresponding file
     - Paste into the template editor
     - Save

3. **Template Types**
   - `confirm-signup.html` → Confirmation Email
   - `magic-link.html` → Magic Link
   - `change-email.html` → Change Email Address
   - `reset-password.html` → Reset Password
   - `invite-user.html` → Invite User

## Customization

All templates use WellWell brand colors:
- Mint: #C8FF7A
- Aqua: #00D9FF
- Background: #0D0F0E
- Text: #F5FAF8

The templates match WellWell's voice: composed, direct, grounded, and supportive.

## Supabase Variables

Templates use Supabase's built-in variables:
- `{{ .ConfirmationURL }}` - The confirmation/sign-in link
- `{{ .Token }}` - The token (if needed)
- `{{ .TokenHash }}` - The token hash (if needed)
- `{{ .SiteURL }}` - Your site URL

See Supabase docs for full list: https://supabase.com/docs/guides/auth/auth-email-templates

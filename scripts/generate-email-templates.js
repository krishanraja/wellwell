/**
 * WellWell Email Templates Generator
 * 
 * This script generates beautiful, branded HTML email templates for Supabase Auth.
 * These templates can be loaded into Supabase Dashboard > Authentication > Email Templates
 * 
 * Logo Location: src/assets/wellwell-logo.png
 * 
 * Usage:
 *   node scripts/generate-email-templates.js           # Uses LOGO_URL placeholder (recommended)
 *   node scripts/generate-email-templates.js --embed-logo # Embeds base64 (WARNING: exceeds 50k limit!)
 * 
 * Output: Creates email-templates/ directory with HTML files ready to paste into Supabase
 * 
 * Features:
 *   - Generates templates with LOGO_URL placeholder (under 50k char limit)
 *   - Validates character count (Supabase limit: 50,000)
 *   - Ensures all required Supabase variables are present
 *   - Optional base64 embedding (--embed-logo flag, but exceeds limit)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Logo path - located in src/assets/
const LOGO_PATH = path.join(__dirname, '..', 'src', 'assets', 'wellwell-logo.png');

// Logo URL - hosted on wellwell.ai domain
const LOGO_URL = 'https://www.wellwell.ai/assets/wellwell-logo-B2MASsdB.png';

// IMPORTANT: Supabase has a 50,000 character limit per template
// Base64 embedding creates templates that are 80k+ characters (EXCEEDS LIMIT)
// Default: Use hosted logo URL (well under 50k limit)
// Use --embed-logo flag ONLY if you have confirmed your templates will be under 50k chars
const AUTO_EMBED_LOGO = process.argv.includes('--embed-logo');

// Brand colors (from index.css)
const colors = {
  mint: '#C8FF7A',        // hsl(90 100% 79%)
  aqua: '#00D9FF',        // hsl(187 100% 60%)
  primary: '#00D9FF',      // Dark mode primary
  background: '#0D0F0E',  // Dark mode background
  foreground: '#F5FAF8',  // Dark mode foreground
  card: '#121514',        // Dark mode card
  border: '#1F2322',      // Dark mode border
  muted: '#1F2322',       // Dark mode muted
  mutedForeground: '#9CA3AF', // Muted text
};

// Base template wrapper
function createEmailTemplate({ title, greeting, body, ctaText, ctaUrl, footerText }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: ${colors.background};
      color: ${colors.foreground};
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: ${colors.card};
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid ${colors.border};
    }
    .email-header {
      background: ${colors.background};
      padding: 20px 24px;
      text-align: center;
      border-bottom: 1px solid ${colors.border};
      position: relative;
      overflow: hidden;
    }
    .email-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, ${colors.mint}15 0%, ${colors.aqua}15 100%);
      pointer-events: none;
    }
    .logo {
      height: 60px;
      width: auto;
      margin-bottom: 0;
      position: relative;
      z-index: 1;
      filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3));
    }
    .email-content {
      padding: 40px 32px;
    }
    .greeting {
      font-size: 24px;
      font-weight: 600;
      color: ${colors.foreground};
      margin-bottom: 16px;
      font-family: 'Space Grotesk', sans-serif;
    }
    .body-text {
      font-size: 16px;
      color: ${colors.foreground};
      margin-bottom: 24px;
      line-height: 1.7;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, ${colors.mint} 0%, ${colors.aqua} 100%);
      color: ${colors.background};
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      margin: 24px 0;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 20px -4px ${colors.aqua}40;
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px -8px ${colors.aqua}60;
    }
    .cta-container {
      text-align: center;
      margin: 32px 0;
    }
    .alternative-link {
      font-size: 14px;
      color: ${colors.mutedForeground};
      margin-top: 24px;
      word-break: break-all;
      padding: 16px;
      background: ${colors.muted};
      border-radius: 8px;
      border: 1px solid ${colors.border};
    }
    .email-footer {
      padding: 32px;
      text-align: center;
      border-top: 1px solid ${colors.border};
      background: ${colors.muted};
    }
    .footer-text {
      font-size: 14px;
      color: ${colors.mutedForeground};
      margin-bottom: 16px;
      line-height: 1.6;
    }
    .footer-tagline {
      font-size: 12px;
      color: ${colors.mutedForeground};
      font-style: italic;
      margin-top: 16px;
    }
    .divider {
      height: 1px;
      background: ${colors.border};
      margin: 32px 0;
    }
    @media only screen and (max-width: 600px) {
      .email-content {
        padding: 32px 24px;
      }
      .email-header {
        padding: 16px 20px;
      }
      .logo {
        height: 50px;
        max-width: 180px;
      }
      .greeting {
        font-size: 20px;
      }
      .body-text {
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div style="padding: 20px 10px;">
    <div class="email-container">
      <div class="email-header">
        <!-- Logo from Supabase Storage -->
        <!-- Logo source: src/assets/wellwell-logo.png -->
        <!-- Hosted at: Supabase Storage > Public bucket -->
        <img src="LOGO_URL" alt="WellWell" class="logo" width="200" height="60" style="display: block; max-width: 200px; height: 60px; width: auto; margin: 0 auto;" />
      </div>
      
      <div class="email-content">
        <div class="greeting">${greeting}</div>
        
        <div class="body-text">
          ${body}
        </div>
        
        ${ctaUrl ? `
        <div class="cta-container">
          <a href="{{ .ConfirmationURL }}" class="cta-button">${ctaText}</a>
        </div>
        
        <div class="alternative-link">
          <strong>Or copy and paste this link:</strong><br>
          <a href="{{ .ConfirmationURL }}" style="color: ${colors.aqua}; text-decoration: none;">{{ .ConfirmationURL }}</a>
        </div>
        ` : ''}
      </div>
      
      <div class="email-footer">
        <div class="footer-text">
          ${footerText}
        </div>
        <div class="footer-tagline">
          Pre-load your Stoic stance before the day destabilises you.
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// Generate templates
const templates = {
  'confirm-signup': {
    title: 'Confirm your WellWell account',
    greeting: 'Welcome to WellWell',
    body: `
      <p>You\'re one step away from building your Stoic practice.</p>
      <p>Click the button below to confirm your email and start your journey toward greater composure, clarity, and resilience.</p>
      <p>This link will expire in 24 hours. If you didn\'t create this account, you can safely ignore this email.</p>
    `,
    ctaText: 'Confirm Email',
    ctaUrl: '{{ .ConfirmationURL }}',
    footerText: 'If you have questions, just reply to this email. We\'re here to help.',
  },
  
  'magic-link': {
    title: 'Sign in to WellWell',
    greeting: 'Your sign-in link',
    body: `
      <p>You requested a sign-in link for your WellWell account.</p>
      <p>Click the button below to sign in securely. No password needed.</p>
      <p>This link will expire in 1 hour. If you didn\'t request this, you can safely ignore this email.</p>
    `,
    ctaText: 'Sign In to WellWell',
    ctaUrl: '{{ .ConfirmationURL }}',
    footerText: 'This is a secure, passwordless sign-in link. Only you can use it.',
  },
  
  'change-email': {
    title: 'Confirm your new email',
    greeting: 'Confirm your email change',
    body: `
      <p>You requested to change your email address for your WellWell account.</p>
      <p>Click the button below to confirm this new email address.</p>
      <p>If you didn\'t request this change, please contact us immediately.</p>
    `,
    ctaText: 'Confirm New Email',
    ctaUrl: '{{ .ConfirmationURL }}',
    footerText: 'If you didn\'t request this change, reply to this email and we\'ll help secure your account.',
  },
  
  'reset-password': {
    title: 'Reset your WellWell password',
    greeting: 'Reset your password',
    body: `
      <p>You requested to reset your password for your WellWell account.</p>
      <p>Click the button below to create a new password. This link will expire in 1 hour.</p>
      <p>If you didn\'t request this, you can safely ignore this email. Your password won\'t change.</p>
    `,
    ctaText: 'Reset Password',
    ctaUrl: '{{ .ConfirmationURL }}',
    footerText: 'For security, this link expires in 1 hour. If you need help, just reply to this email.',
  },
  
  'invite-user': {
    title: 'You have been invited to WellWell',
    greeting: 'You\'re invited',
    body: `
      <p>You\'ve been invited to join WellWell and start building your Stoic practice.</p>
      <p>Click the button below to accept the invitation and create your account.</p>
      <p>Join a community committed to pre-loading their stance before the day destabilises them.</p>
    `,
    ctaText: 'Accept Invitation',
    ctaUrl: '{{ .ConfirmationURL }}',
    footerText: 'This invitation will expire in 7 days. If you have questions, just reply to this email.',
  },
};

// Create output directory
const outputDir = path.join(__dirname, '..', 'email-templates');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Determine logo source
let logoDataUrl = LOGO_URL; // Default: Use hosted URL from Supabase Storage

if (AUTO_EMBED_LOGO) {
  console.warn(`\n⚠️  WARNING: Base64 embedding creates templates that exceed Supabase's 50,000 character limit!`);
  console.warn(`   Templates will be ~80k+ characters and will FAIL validation in Supabase.\n`);
  
  if (fs.existsSync(LOGO_PATH)) {
    try {
      const logoBuffer = fs.readFileSync(LOGO_PATH);
      const logoBase64 = logoBuffer.toString('base64');
      logoDataUrl = `data:image/png;base64,${logoBase64}`;
      const logoSizeKB = (logoBuffer.length / 1024).toFixed(2);
      const base64Length = logoBase64.length;
      console.log(`📸 Logo loaded: ${logoSizeKB} KB`);
      console.warn(`   Base64 length: ${base64Length.toLocaleString()} characters`);
      console.warn(`   This will make templates exceed 50,000 character limit!\n`);
    } catch (err) {
      console.error(`❌ Could not load logo: ${err.message}`);
      console.error(`   Falling back to hosted URL: ${LOGO_URL}`);
    }
  } else {
    console.warn(`⚠️  Logo not found at ${LOGO_PATH}`);
    console.warn(`   Using hosted URL: ${LOGO_URL}`);
  }
} else {
  console.log(`\n📸 Using hosted logo URL from Supabase Storage`);
  console.log(`   URL: ${LOGO_URL}`);
  console.log(`   ✅ This keeps templates well under 50k character limit`);
}

// Generate each template
let maxChars = 0;
let maxCharsFile = '';
Object.entries(templates).forEach(([key, config]) => {
  let html = createEmailTemplate(config);
  
  // Replace LOGO_URL placeholder with actual logo URL or base64
  html = html.replace(/LOGO_URL/g, logoDataUrl);
  
  const filePath = path.join(outputDir, `${key}.html`);
  fs.writeFileSync(filePath, html, 'utf8');
  
  // Check character count (Supabase limit: 50,000)
  const charCount = html.length;
  const sizeKB = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(2);
  
  if (charCount > maxChars) {
    maxChars = charCount;
    maxCharsFile = key;
  }
  
  if (charCount > 50000) {
    console.error(`❌ ${key}.html: ${charCount.toLocaleString()} chars (EXCEEDS 50,000 limit!)`);
    console.error(`   Size: ${sizeKB} KB`);
    console.error(`   Fix: Use hosted logo URL instead of base64 embedding`);
  } else {
    console.log(`✅ Generated: ${filePath} (${charCount.toLocaleString()} chars, ${sizeKB} KB)`);
  }
});

// Summary
console.log(`\n${'='.repeat(60)}`);
if (maxChars > 50000) {
  console.error(`\n❌ CRITICAL: Templates exceed Supabase's 50,000 character limit!`);
  console.error(`   Largest template: ${maxCharsFile}.html (${maxChars.toLocaleString()} chars)`);
  console.error(`\n📝 SOLUTION:`);
  console.error(`   1. Use hosted logo URL instead of base64`);
  console.error(`   2. Upload logo to Supabase Storage`);
  console.error(`   3. Replace LOGO_URL in templates with public URL`);
  console.error(`   4. Re-run: node scripts/generate-email-templates.js`);
  process.exit(1);
} else {
  console.log(`\n✅ All templates under 50,000 character limit`);
  console.log(`   Largest template: ${maxCharsFile}.html (${maxChars.toLocaleString()} chars)`);
}

// Create README with instructions
const readme = `# WellWell Email Templates

These are branded email templates for Supabase Authentication.

## Setup Instructions

### Recommended: Use Hosted Logo URL

1. **Upload Logo to Supabase Storage**
   - Logo location: \`src/assets/wellwell-logo.png\`
   - Go to Supabase Dashboard > Storage
   - Create a public bucket named \`email-assets\` (or use existing public bucket)
   - Upload \`wellwell-logo.png\` from \`src/assets/\`
   - Copy the public URL (e.g., \`https://YOUR_PROJECT.supabase.co/storage/v1/object/public/email-assets/wellwell-logo.png\`)

2. **Update Templates**
   - Open each template file in \`email-templates/\`
   - Find \`LOGO_URL\` and replace with your Supabase Storage URL
   - Save the file

### Alternative: Base64 Embedding (Not Recommended)

If you must embed the logo directly, you can use the optional embed script:
\`\`\`bash
node scripts/embed-logo-in-templates.js
\`\`\`

**Note:** This will make templates very large (80k+ characters) and harder to maintain.

2. **Load Templates into Supabase**
   - Go to: Supabase Dashboard > Authentication > Email Templates
   - For each template type:
     - Click "Edit" on the template
     - Copy the HTML from the corresponding file
     - Paste into the template editor
     - Save

3. **Template Types**
   - \`confirm-signup.html\` → Confirmation Email
   - \`magic-link.html\` → Magic Link
   - \`change-email.html\` → Change Email Address
   - \`reset-password.html\` → Reset Password
   - \`invite-user.html\` → Invite User

## Customization

All templates use WellWell brand colors:
- Mint: #C8FF7A
- Aqua: #00D9FF
- Background: #0D0F0E
- Text: #F5FAF8

The templates match WellWell's voice: composed, direct, grounded, and supportive.

## Supabase Variables

Templates use Supabase's built-in variables:
- \`{{ .ConfirmationURL }}\` - The confirmation/sign-in link
- \`{{ .Token }}\` - The token (if needed)
- \`{{ .TokenHash }}\` - The token hash (if needed)
- \`{{ .SiteURL }}\` - Your site URL

See Supabase docs for full list: https://supabase.com/docs/guides/auth/auth-email-templates
`;

fs.writeFileSync(path.join(outputDir, 'README.md'), readme, 'utf8');
console.log(`✅ Generated: ${path.join(outputDir, 'README.md')}`);

// Validation summary
if (AUTO_EMBED_LOGO && logoDataUrl.includes('data:image/png;base64,')) {
  console.warn(`\n⚠️  Logo embedded as base64 - templates may exceed 50k char limit!`);
  console.warn(`   Check character counts above.`);
} else if (logoDataUrl === LOGO_URL) {
  console.log(`\n✅ Templates use hosted logo URL (under 50k char limit)`);
  console.log(`   Logo URL: ${LOGO_URL}`);
} else {
  console.log(`\n✅ Templates configured with logo`);
}

console.log(`\n✨ All email templates generated successfully!`);
console.log(`📁 Output directory: ${outputDir}`);

// Run validation automatically
console.log(`\n🔍 Running template validation...`);
try {
  const { spawn } = await import('child_process');
  const validationProcess = spawn('node', ['scripts/validate-email-templates.js'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    shell: true
  });
  
  validationProcess.on('close', (code) => {
    if (code !== 0) {
      console.warn(`\n⚠️  Validation found issues - please review and fix`);
    }
  });
} catch (err) {
  console.warn(`\n⚠️  Could not run validation automatically`);
  console.warn(`   Run manually: node scripts/validate-email-templates.js`);
}

console.log(`\n📝 Next steps:`);
console.log(`   1. Verify templates pass validation: node scripts/validate-email-templates.js`);
console.log(`   2. Upload templates to Supabase Dashboard > Authentication > Email Templates`);
console.log(`   3. Configure Supabase:`);
console.log(`      - Set Site URL: Dashboard > Authentication > URL Configuration`);
console.log(`      - Whitelist Redirect URLs: Same page`);
console.log(`   4. Test by triggering a test email`);
console.log(`\n💡 Tip: Templates are ready to use - logo is embedded automatically!`);

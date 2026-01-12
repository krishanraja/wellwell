/**
 * WellWell Email Templates - Logo URL Replacer
 * 
 * This script helps replace logo URL in templates (if you need to change it).
 * Templates are generated with the logo URL already embedded by default.
 * 
 * Usage:
 *   node scripts/replace-logo-url.js <NEW_LOGO_URL>
 * 
 * Example:
 *   node scripts/replace-logo-url.js https://your-project.supabase.co/storage/v1/object/public/email-assets/wellwell-logo.png
 * 
 * Note: Default logo URL is already set in generate-email-templates.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.join(__dirname, '..', 'email-templates');

// Get logo URL from command line
const logoUrl = process.argv[2];

if (!logoUrl) {
  console.error('❌ Error: Logo URL required');
  console.error('\nUsage:');
  console.error('  node scripts/replace-logo-url.js <LOGO_URL>');
  console.error('\nExample:');
  console.error('  node scripts/replace-logo-url.js https://your-project.supabase.co/storage/v1/object/public/email-assets/wellwell-logo.png');
  process.exit(1);
}

// Validate URL format
if (!logoUrl.startsWith('http://') && !logoUrl.startsWith('https://')) {
  console.error('❌ Error: Logo URL must start with http:// or https://');
  console.error(`   Received: ${logoUrl}`);
  process.exit(1);
}

console.log('🔄 Replacing LOGO_URL with hosted logo URL...\n');
console.log(`   Logo URL: ${logoUrl}\n`);

// Check templates directory
if (!fs.existsSync(TEMPLATES_DIR)) {
  console.error(`❌ Templates directory not found: ${TEMPLATES_DIR}`);
  console.error('   Run: node scripts/generate-email-templates.js first');
  process.exit(1);
}

// Get all HTML template files
const templateFiles = fs.readdirSync(TEMPLATES_DIR)
  .filter(file => file.endsWith('.html'));

if (templateFiles.length === 0) {
  console.error(`❌ No template files found in ${TEMPLATES_DIR}`);
  console.error('   Run: node scripts/generate-email-templates.js first');
  process.exit(1);
}

// Replace LOGO_URL in each template
let updatedCount = 0;
let maxChars = 0;

templateFiles.forEach(file => {
  const filePath = path.join(TEMPLATES_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const originalCharCount = content.length;
  
  // Replace either LOGO_URL placeholder OR existing hosted URL
  const hasPlaceholder = content.includes('LOGO_URL');
  const hasExistingUrl = /https?:\/\/[^\s"']+\.(png|jpg|jpeg|svg|webp)/i.test(content);
  
  if (hasPlaceholder) {
    content = content.replace(/LOGO_URL/g, logoUrl);
    fs.writeFileSync(filePath, content, 'utf8');
    
    const newCharCount = content.length;
    const charIncrease = newCharCount - originalCharCount;
    
    if (newCharCount > maxChars) {
      maxChars = newCharCount;
    }
    
    updatedCount++;
    console.log(`✅ Updated: ${file}`);
    console.log(`   Characters: ${originalCharCount.toLocaleString()} → ${newCharCount.toLocaleString()} (+${charIncrease})`);
    
    // Check if still under limit
    if (newCharCount > 50000) {
      console.error(`   ⚠️  WARNING: Exceeds 50,000 character limit!`);
    } else {
      const remaining = 50000 - newCharCount;
      console.log(`   ✅ Under limit (${remaining.toLocaleString()} chars remaining)`);
    }
  } else if (hasExistingUrl) {
    // Replace existing hosted URL
    const urlPattern = /https?:\/\/[^\s"']+\.(png|jpg|jpeg|svg|webp)/gi;
    content = content.replace(urlPattern, logoUrl);
    fs.writeFileSync(filePath, content, 'utf8');
    
    const newCharCount = content.length;
    const charIncrease = newCharCount - originalCharCount;
    
    if (newCharCount > maxChars) {
      maxChars = newCharCount;
    }
    
    updatedCount++;
    console.log(`✅ Updated: ${file} (replaced existing URL)`);
    console.log(`   Characters: ${originalCharCount.toLocaleString()} → ${newCharCount.toLocaleString()} (+${charIncrease})`);
    
    if (newCharCount > 50000) {
      console.error(`   ⚠️  WARNING: Exceeds 50,000 character limit!`);
    } else {
      const remaining = 50000 - newCharCount;
      console.log(`   ✅ Under limit (${remaining.toLocaleString()} chars remaining)`);
    }
  } else {
    console.log(`⏭️  Skipped: ${file} (no logo URL found to replace)`);
  }
});

console.log(`\n${'='.repeat(60)}`);
if (updatedCount > 0) {
  console.log(`\n✅ Updated ${updatedCount} template(s) with logo URL`);
  console.log(`   Largest template: ${maxChars.toLocaleString()} characters`);
  
  if (maxChars > 50000) {
    console.error(`\n❌ CRITICAL: Templates exceed 50,000 character limit!`);
    console.error(`   Largest: ${maxChars.toLocaleString()} chars`);
    console.error(`   Fix: Use a shorter logo URL or optimize the template`);
    process.exit(1);
  } else {
    console.log(`\n✅ All templates under 50,000 character limit`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Validate: node scripts/validate-email-templates.js`);
    console.log(`   2. Deploy: node scripts/deploy-email-templates.js`);
    console.log(`   3. Upload templates to Supabase Dashboard`);
  }
} else {
  console.log(`\n⚠️  No templates updated (LOGO_URL not found)`);
  console.log(`   Templates may already have logo URL or base64 embedded`);
}

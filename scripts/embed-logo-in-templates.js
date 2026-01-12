/**
 * WellWell Email Templates - Logo Embedder (Optional)
 * 
 * ⚠️ WARNING: This script embeds the logo as base64, making templates very large (80k+ chars).
 * It's recommended to use a hosted URL instead (see README.md).
 * 
 * Logo Location: src/assets/wellwell-logo.png
 * 
 * This script is provided as an optional convenience tool if you must embed the logo directly.
 * 
 * Usage:
 *   node scripts/embed-logo-in-templates.js
 * 
 * This will update all templates in email-templates/ to include the base64-encoded logo.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Logo path - located in src/assets/
const LOGO_PATH = path.join(__dirname, '..', 'src', 'assets', 'wellwell-logo.png');
const TEMPLATES_DIR = path.join(__dirname, '..', 'email-templates');

// Check if logo exists
if (!fs.existsSync(LOGO_PATH)) {
  console.error(`❌ Logo not found at: ${LOGO_PATH}`);
  console.error(`\n   Expected location: src/assets/wellwell-logo.png`);
  console.error(`   Please ensure the logo file exists at this path.`);
  process.exit(1);
}

// Read logo and convert to base64
const logoBuffer = fs.readFileSync(LOGO_PATH);
const logoBase64 = logoBuffer.toString('base64');
const logoDataUrl = `data:image/png;base64,${logoBase64}`;

console.log(`📸 Logo loaded from: ${LOGO_PATH}`);
console.log(`   Size: ${(logoBuffer.length / 1024).toFixed(2)} KB`);
console.log(`   Base64 length: ${logoBase64.length.toLocaleString()} characters`);
console.log(`\n⚠️  WARNING: Embedding logo as base64 will make templates very large!`);
console.log(`   Each template will be ~${Math.round((logoBase64.length + 5000) / 1024)} KB`);
console.log(`   Consider using a hosted URL instead (see email-templates/README.md)`);
console.log(`\n   Continue? This will replace LOGO_URL in all templates...`);

// Get all HTML template files
if (!fs.existsSync(TEMPLATES_DIR)) {
  console.error(`❌ Templates directory not found: ${TEMPLATES_DIR}`);
  console.error(`   Run scripts/generate-email-templates.js first`);
  process.exit(1);
}

const templateFiles = fs.readdirSync(TEMPLATES_DIR)
  .filter(file => file.endsWith('.html'));

if (templateFiles.length === 0) {
  console.error(`❌ No template files found in ${TEMPLATES_DIR}`);
  console.error('   Run scripts/generate-email-templates.js first');
  process.exit(1);
}

// Update each template
let updatedCount = 0;
let totalSizeIncrease = 0;

templateFiles.forEach(file => {
  const filePath = path.join(TEMPLATES_DIR, file);
  const originalSize = fs.statSync(filePath).size;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace LOGO_URL placeholder with base64 data URL
  if (content.includes('LOGO_URL')) {
    content = content.replace(/LOGO_URL/g, logoDataUrl);
    fs.writeFileSync(filePath, content, 'utf8');
    const newSize = fs.statSync(filePath).size;
    const sizeIncrease = newSize - originalSize;
    totalSizeIncrease += sizeIncrease;
    updatedCount++;
    console.log(`✅ Updated: ${file} (+${(sizeIncrease / 1024).toFixed(2)} KB)`);
  } else {
    console.log(`⏭️  Skipped: ${file} (no LOGO_URL placeholder)`);
  }
});

console.log(`\n✨ Updated ${updatedCount} template(s) with embedded logo`);
console.log(`   Total size increase: +${(totalSizeIncrease / 1024).toFixed(2)} KB`);
console.log(`\n📝 Next steps:`);
console.log(`   1. Review the templates in email-templates/ (they're now very large!)`);
console.log(`   2. Copy each template into Supabase Dashboard > Authentication > Email Templates`);
console.log(`   3. Test by triggering each email type`);
console.log(`\n💡 Tip: If templates are too large, regenerate without embedding:`);
console.log(`   node scripts/generate-email-templates.js`);
console.log(`\n📁 Logo source: src/assets/wellwell-logo.png`);

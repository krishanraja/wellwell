/**
 * Verify Supabase Email Template Configuration
 * 
 * This script helps diagnose why {{ .ConfirmationURL }} appears as literal text.
 * It checks template syntax and provides a checklist for Supabase Dashboard configuration.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesDir = path.join(__dirname, '..', 'email-templates');

console.log('🔍 Verifying Email Template Configuration...\n');

// Check 1: Templates exist
console.log('📁 Checking template files...');
const templateFiles = [
  'confirm-signup.html',
  'magic-link.html',
  'change-email.html',
  'reset-password.html',
  'invite-user.html',
];

let allTemplatesExist = true;
templateFiles.forEach(file => {
  const filePath = path.join(templatesDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    allTemplatesExist = false;
  }
});

if (!allTemplatesExist) {
  console.log('\n❌ Some templates are missing. Run: node scripts/generate-email-templates.js');
  process.exit(1);
}

// Check 2: Template syntax
console.log('\n📝 Checking template syntax...');
let allSyntaxValid = true;

templateFiles.forEach(file => {
  const filePath = path.join(templatesDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for correct Go template syntax
  const correctPattern = /\{\{\s*\.ConfirmationURL\s*\}\}/;
  const incorrectPatterns = [
    /\{\{\s*ConfirmationURL\s*\}\}/, // Missing dot
    /\{\{ConfirmationURL\}\}/, // No spaces
    /\{\{\s*\.\s*ConfirmationURL\s*\.\s*\}\}/, // Extra dots
  ];
  
  const hasCorrect = correctPattern.test(content);
  const hasIncorrect = incorrectPatterns.some(p => p.test(content));
  
  if (hasCorrect && !hasIncorrect) {
    console.log(`   ✅ ${file} - Correct syntax: {{ .ConfirmationURL }}`);
  } else if (hasIncorrect) {
    console.log(`   ❌ ${file} - Invalid syntax detected`);
    allSyntaxValid = false;
  } else {
    console.log(`   ⚠️  ${file} - No ConfirmationURL variable found`);
  }
  
  // Check for logo
  const hasLogo = content.includes('https://www.wellwell.ai/assets/wellwell-logo-B2MASsdB.png') ||
                  content.includes('data:image/png;base64,') ||
                  content.includes('LOGO_URL');
  
  if (hasLogo && !content.includes('LOGO_URL')) {
    console.log(`   ✅ ${file} - Logo URL embedded`);
  } else if (content.includes('LOGO_URL')) {
    console.log(`   ⚠️  ${file} - Logo placeholder (LOGO_URL) needs replacement`);
  } else {
    console.log(`   ❌ ${file} - No logo found`);
  }
});

if (!allSyntaxValid) {
  console.log('\n❌ Template syntax errors found. Fix before uploading to Supabase.');
  process.exit(1);
}

// Check 3: Character limits
console.log('\n📊 Checking character limits...');
let allUnderLimit = true;

templateFiles.forEach(file => {
  const filePath = path.join(templatesDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const charCount = content.length;
  
  if (charCount > 50000) {
    console.log(`   ❌ ${file} - ${charCount.toLocaleString()} chars (EXCEEDS 50k limit!)`);
    allUnderLimit = false;
  } else {
    const sizeKB = (Buffer.byteLength(content, 'utf8') / 1024).toFixed(2);
    console.log(`   ✅ ${file} - ${charCount.toLocaleString()} chars (${sizeKB} KB)`);
  }
});

if (!allUnderLimit) {
  console.log('\n❌ Some templates exceed Supabase\'s 50,000 character limit.');
  process.exit(1);
}

// Summary and next steps
console.log('\n' + '='.repeat(60));
console.log('✅ All template files are valid!');
console.log('='.repeat(60));

console.log('\n📋 SUPABASE DASHBOARD CHECKLIST:');
console.log('\n1. ✅ Templates Uploaded:');
console.log('   → Go to: https://supabase.com/dashboard/project/zioacippbtcbctexywgc/auth/templates');
console.log('   → For each template, copy HTML from email-templates/ and paste into Supabase');
console.log('   → Click "Save" (wait for confirmation)');

console.log('\n2. ⚠️  Site URL Configured (CRITICAL):');
console.log('   → Go to: https://supabase.com/dashboard/project/zioacippbtcbctexywgc/auth/url-configuration');
console.log('   → Set "Site URL" to: https://wellwell.ai');
console.log('   → Click "Save"');
console.log('   → ⚠️  WITHOUT THIS, {{ .ConfirmationURL }} WILL NOT WORK');

console.log('\n3. ⚠️  Redirect URLs Whitelisted (CRITICAL):');
console.log('   → On the same page (URL Configuration)');
console.log('   → Add to "Redirect URLs":');
console.log('     - https://wellwell.ai/**');
console.log('     - http://localhost:5173/**');
console.log('   → Click "Save"');
console.log('   → ⚠️  WITHOUT THIS, TEMPLATE PROCESSING WILL FAIL');

console.log('\n4. 🧪 Test:');
console.log('   → Hard refresh Supabase Dashboard (Ctrl+Shift+R)');
console.log('   → Go to Email Templates > Preview');
console.log('   → Should see actual URL, NOT {{ .ConfirmationURL }}');
console.log('   → Send test email from your app');
console.log('   → Verify email has working links');

console.log('\n💡 Most Common Issue:');
console.log('   Site URL not configured = variables not replaced');
console.log('   Redirect URLs not whitelisted = template processing fails');

console.log('\n✨ Next: Complete the Supabase Dashboard checklist above!');

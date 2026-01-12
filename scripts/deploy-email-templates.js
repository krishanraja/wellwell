/**
 * WellWell Email Templates - Deployment Script
 * 
 * This script validates and prepares email templates for Supabase deployment.
 * It checks all prerequisites and provides clear instructions.
 * 
 * Usage:
 *   node scripts/deploy-email-templates.js
 * 
 * Prerequisites:
 *   - Templates generated: node scripts/generate-email-templates.js
 *   - Templates validated: node scripts/validate-email-templates.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.join(__dirname, '..', 'email-templates');
const SUPABASE_PROJECT_ID = 'zioacippbtcbctexywgc';
const SUPABASE_DASHBOARD_URL = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`;

// Template type mapping
const TEMPLATE_MAPPING = {
  'confirm-signup.html': 'Confirmation Email',
  'magic-link.html': 'Magic Link',
  'change-email.html': 'Change Email Address',
  'reset-password.html': 'Reset Password',
  'invite-user.html': 'Invite User',
};

function checkTemplatesExist() {
  const templateFiles = Object.keys(TEMPLATE_MAPPING);
  const missing = [];
  
  templateFiles.forEach(file => {
    const filePath = path.join(TEMPLATES_DIR, file);
    if (!fs.existsSync(filePath)) {
      missing.push(file);
    }
  });
  
  return { exists: missing.length === 0, missing };
}

function checkTemplateContent(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const charCount = content.length;
  const issues = [];
  
  // CRITICAL: Check character limit (Supabase: 50,000)
  if (charCount > 50000) {
    issues.push(`EXCEEDS 50,000 character limit: ${charCount.toLocaleString()} chars`);
    issues.push('Fix: Use hosted logo URL instead of base64 embedding');
  }
  
  // Check for required template variables
  if (!content.includes('{{ .ConfirmationURL }}')) {
    issues.push('Missing required variable: {{ .ConfirmationURL }}');
  }
  
  // Logo check: should have hosted URL (default) or base64
  const hasBase64 = content.includes('data:image/png;base64,');
  const hasHttpUrl = /https?:\/\/[^\s"']+\.(png|jpg|jpeg|svg|webp)/i.test(content);
  const hasPlaceholder = content.includes('LOGO_URL');
  
  if (!hasBase64 && !hasHttpUrl && !hasPlaceholder) {
    issues.push('No logo found (neither base64, URL, nor LOGO_URL placeholder)');
  }
  
  // Warn if using base64 (likely to exceed limit)
  if (hasBase64 && charCount > 50000) {
    issues.push('Base64 logo causes template to exceed 50k limit - use hosted URL');
  }
  
  // Prefer hosted URL over placeholder
  if (hasPlaceholder && !hasHttpUrl) {
    issues.push('Template has LOGO_URL placeholder - logo URL should be embedded');
  }
  
  return { valid: issues.length === 0, issues, charCount };
}

function generateDeploymentInstructions() {
  const instructions = [];
  
  instructions.push('\n📋 DEPLOYMENT INSTRUCTIONS');
  instructions.push('='.repeat(60));
  instructions.push('\n1. Open Supabase Dashboard:');
  instructions.push(`   ${SUPABASE_DASHBOARD_URL}/auth/templates`);
  instructions.push('\n2. Upload templates to Supabase:');
  instructions.push('   ✅ Logo URL already embedded in templates');
  instructions.push('   ✅ Templates are ready to use (no manual replacement needed)');
  
  Object.entries(TEMPLATE_MAPPING).forEach(([file, templateName]) => {
    instructions.push(`\n   ${templateName}:`);
    instructions.push(`   - Open: email-templates/${file}`);
    instructions.push(`   - Copy entire HTML content`);
    instructions.push(`   - Paste into Supabase "${templateName}" template`);
    instructions.push(`   - Click "Save"`);
  });
  
  instructions.push('\n   ⚠️  IMPORTANT: Templates must be under 50,000 characters');
  instructions.push('      If you see validation errors, use hosted logo URL (not base64)');
  
  instructions.push('\n3. Configure Supabase URL Settings:');
  instructions.push(`   ${SUPABASE_DASHBOARD_URL}/auth/url-configuration`);
  instructions.push('   - Set Site URL: https://wellwell.ai (or your domain)');
  instructions.push('   - Add Redirect URLs:');
  instructions.push('     * https://wellwell.ai/**');
  instructions.push('     * http://localhost:5173/**');
  instructions.push('   - Click "Save"');
  
  instructions.push('\n4. Test Email:');
  instructions.push('   - Trigger a test signup');
  instructions.push('   - Check received email for working links');
  instructions.push('   - Verify logo displays correctly');
  
  return instructions.join('\n');
}

// Main execution
console.log('🚀 Email Templates Deployment Check\n');

// Check templates directory exists
if (!fs.existsSync(TEMPLATES_DIR)) {
  console.error('❌ Templates directory not found:', TEMPLATES_DIR);
  console.error('   Run: node scripts/generate-email-templates.js');
  process.exit(1);
}

// Check all templates exist
const { exists, missing } = checkTemplatesExist();
if (!exists) {
  console.error('❌ Missing template files:');
  missing.forEach(file => console.error(`   - ${file}`));
  console.error('\n   Run: node scripts/generate-email-templates.js');
  process.exit(1);
}

console.log('✅ All template files found');

// Validate each template
let allValid = true;
const templateFiles = Object.keys(TEMPLATE_MAPPING);

templateFiles.forEach(file => {
  const filePath = path.join(TEMPLATES_DIR, file);
  const { valid, issues, charCount } = checkTemplateContent(filePath);
  
  if (!valid) {
    allValid = false;
    console.error(`\n❌ ${file} (${charCount?.toLocaleString() || 'unknown'} chars):`);
    issues.forEach(issue => console.error(`   • ${issue}`));
  } else {
    const sizeKB = (fs.statSync(filePath).size / 1024).toFixed(2);
    const chars = charCount || fs.readFileSync(filePath, 'utf8').length;
    console.log(`✅ ${file} (${chars.toLocaleString()} chars, ${sizeKB} KB)`);
  }
});

if (!allValid) {
  console.error('\n❌ Template validation failed');
  console.error('   Fix issues above before deploying');
  process.exit(1);
}

// All checks passed
console.log('\n' + '='.repeat(60));
console.log('✅ All templates validated successfully!');
console.log('='.repeat(60));

// Generate deployment instructions
console.log(generateDeploymentInstructions());

console.log('\n' + '='.repeat(60));
console.log('💡 TIP: After uploading, test immediately with a real email');
console.log('   If variables still appear as literal text, check:');
console.log('   1. Templates were saved in Supabase');
console.log('   2. Site URL is configured correctly');
console.log('   3. Redirect URLs are whitelisted');
console.log('   4. No extra whitespace in template variables');
console.log('='.repeat(60));

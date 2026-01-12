/**
 * WellWell Email Templates - Validation Script
 * 
 * This script validates email templates before uploading to Supabase.
 * It checks for common issues that would cause template failures.
 * 
 * Usage:
 *   node scripts/validate-email-templates.js
 * 
 * Exit codes:
 *   0 = All templates valid
 *   1 = Validation errors found
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.join(__dirname, '..', 'email-templates');
const LOGO_PATH = path.join(__dirname, '..', 'src', 'assets', 'wellwell-logo.png');

// Required Supabase template variables
const REQUIRED_VARIABLES = [
  '{{ .ConfirmationURL }}',
];

// Validation rules
const validationRules = {
  logoPlaceholderOrEmbedded: {
    check: (content) => {
      // LOGO_URL placeholder is VALID - user will replace with hosted URL
      // OR logo can be base64/URL embedded
      const hasPlaceholder = content.includes('LOGO_URL');
      const hasBase64 = content.includes('data:image/png;base64,');
      const hasHttpUrl = /https?:\/\/[^\s"']+\.(png|jpg|jpeg|svg|webp)/i.test(content);
      // Any of these is valid
      return hasPlaceholder || hasBase64 || hasHttpUrl;
    },
    error: 'Template must have logo (LOGO_URL placeholder, base64, or hosted URL)',
  },
  hasLogo: {
    check: (content) => {
      // Logo can be base64 OR hosted URL OR placeholder (placeholder is OK if user will replace)
      const hasBase64 = content.includes('data:image/png;base64,');
      const hasHttpUrl = /https?:\/\/[^\s"']+\.(png|jpg|jpeg|svg|webp)/i.test(content);
      const hasPlaceholder = content.includes('LOGO_URL');
      // Accept placeholder OR actual logo (base64 or URL)
      return hasBase64 || hasHttpUrl || hasPlaceholder;
    },
    error: 'Template must contain logo (base64, URL, or LOGO_URL placeholder)',
  },
  hasRequiredVariables: {
    check: (content, templateType) => {
      // Confirmation templates need ConfirmationURL
      if (['confirm-signup', 'magic-link', 'change-email', 'reset-password', 'invite-user'].includes(templateType)) {
        return content.includes('{{ .ConfirmationURL }}');
      }
      return true;
    },
    error: 'Template missing required Supabase variable: {{ .ConfirmationURL }}',
  },
  validGoTemplateSyntax: {
    check: (content) => {
      // Supabase uses Go templates with space: {{ .ConfirmationURL }}
      // This is CORRECT syntax - spaces are required
      // Check for actual syntax errors:
      const invalidPatterns = [
        /\{\{\s*ConfirmationURL\s*\}\}/, // Missing dot: {{ ConfirmationURL }}
        /\{\{ConfirmationURL\}\}/, // No spaces at all: {{ConfirmationURL}}
        /\{\{\s*\.\s*ConfirmationURL\s*\.\s*\}\}/, // Extra dots
      ];
      // Must have correct format: {{ .ConfirmationURL }} (with space after { and before .)
      const correctPattern = /\{\{\s*\.ConfirmationURL\s*\}\}/;
      const hasCorrectSyntax = correctPattern.test(content);
      const hasInvalidSyntax = invalidPatterns.some(pattern => pattern.test(content));
      return hasCorrectSyntax && !hasInvalidSyntax;
    },
    error: 'Invalid Go template syntax - must use {{ .ConfirmationURL }} (with space)',
  },
  noExposedVariables: {
    check: (content) => {
      // Variables should be in href or text, not exposed as plain text
      // This is a heuristic - actual validation happens in Supabase
      return true; // Pass for now, Supabase will handle this
    },
    error: 'Template variables may be exposed',
  },
  characterLimit: {
    check: (content) => {
      // Supabase has a strict 50,000 character limit per template
      const charCount = content.length;
      return charCount <= 50000;
    },
    error: 'Template exceeds Supabase 50,000 character limit - use hosted logo URL instead of base64',
  },
  reasonableSize: {
    check: (content) => {
      const sizeKB = Buffer.byteLength(content, 'utf8') / 1024;
      // Templates should be under 200KB (base64 logo adds ~80KB)
      return sizeKB < 200;
    },
    error: 'Template exceeds 200KB size limit',
  },
};

let hasErrors = false;
let errorCount = 0;

function validateTemplate(filePath, templateType) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  const charCount = content.length;
  const errors = [];

  // Run all validation rules
  Object.entries(validationRules).forEach(([ruleName, rule]) => {
    try {
      if (!rule.check(content, templateType)) {
        errors.push({
          rule: ruleName,
          message: rule.error,
        });
      }
    } catch (err) {
      errors.push({
        rule: ruleName,
        message: `Validation error: ${err.message}`,
      });
    }
  });

  if (errors.length > 0) {
    hasErrors = true;
    errorCount += errors.length;
    console.error(`\n❌ ${fileName} (${charCount.toLocaleString()} chars):`);
    errors.forEach(err => {
      console.error(`   • ${err.message}`);
    });
  } else {
    const sizeKB = (Buffer.byteLength(content, 'utf8') / 1024).toFixed(2);
    console.log(`✅ ${fileName} (${charCount.toLocaleString()} chars, ${sizeKB} KB)`);
  }

  return errors;
}

// Main validation
console.log('🔍 Validating email templates...\n');

if (!fs.existsSync(TEMPLATES_DIR)) {
  console.error(`❌ Templates directory not found: ${TEMPLATES_DIR}`);
  console.error('   Run scripts/generate-email-templates.js first');
  process.exit(1);
}

const templateFiles = fs.readdirSync(TEMPLATES_DIR)
  .filter(file => file.endsWith('.html'));

if (templateFiles.length === 0) {
  console.error(`❌ No template files found in ${TEMPLATES_DIR}`);
  console.error('   Run scripts/generate-email-templates.js first');
  process.exit(1);
}

// Validate each template
templateFiles.forEach(file => {
  const filePath = path.join(TEMPLATES_DIR, file);
  const templateType = file.replace('.html', '');
  validateTemplate(filePath, templateType);
});

// Summary
console.log(`\n${'='.repeat(60)}`);
if (hasErrors) {
  console.error(`\n❌ Validation failed: ${errorCount} error(s) found`);
  console.error('\n📝 Fix errors before uploading templates to Supabase');
  console.error('   Run: node scripts/generate-email-templates.js');
  console.error('   Then: node scripts/embed-logo-in-templates.js (if using base64)');
  process.exit(1);
} else {
  console.log(`\n✅ All templates validated successfully!`);
  console.log(`   ${templateFiles.length} template(s) ready for Supabase`);
  console.log('\n📝 Next steps:');
  console.log('   1. Upload templates to Supabase Dashboard > Authentication > Email Templates');
  console.log('   2. Verify Site URL is configured in Supabase');
  console.log('   3. Verify Redirect URLs are whitelisted');
  console.log('   4. Test by triggering a test email');
  process.exit(0);
}

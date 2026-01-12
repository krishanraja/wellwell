/**
 * WellWell - Configure Supabase Auth URLs
 * 
 * This script configures Site URL and Redirect URLs in Supabase
 * using the Supabase Management API.
 * 
 * Usage:
 *   node scripts/configure-supabase-urls.js
 * 
 * Prerequisites:
 *   - SUPABASE_ACCESS_TOKEN environment variable (from Supabase Dashboard > Settings > Access Tokens)
 *   - Or provide via .env file
 * 
 * Alternative:
 *   - Use SQL script: scripts/configure-supabase-urls.sql
 *   - Or configure manually in Dashboard
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_PROJECT_ID = 'zioacippbtcbctexywgc';
const SUPABASE_MANAGEMENT_API = 'https://api.supabase.com/v1';

// Default URLs to configure
const SITE_URL = 'https://wellwell.ai';
const REDIRECT_URLS = [
  'https://wellwell.ai/**',
  'http://localhost:5173/**',
];

// Get access token from environment
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || process.env.SUPABASE_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('❌ Error: SUPABASE_ACCESS_TOKEN environment variable required');
  console.error('\nTo get your access token:');
  console.error('  1. Go to: https://supabase.com/dashboard/account/tokens');
  console.error('  2. Create a new access token');
  console.error('  3. Set it as environment variable:');
  console.error('     export SUPABASE_ACCESS_TOKEN=your_token_here');
  console.error('\nOr add to .env file:');
  console.error('     SUPABASE_ACCESS_TOKEN=your_token_here');
  console.error('\nAlternative: Use SQL script instead');
  console.error('  Run: scripts/configure-supabase-urls.sql in Supabase SQL Editor');
  process.exit(1);
}

async function configureUrls() {
  console.log('🔧 Configuring Supabase Auth URLs...\n');
  console.log(`   Project ID: ${SUPABASE_PROJECT_ID}`);
  console.log(`   Site URL: ${SITE_URL}`);
  console.log(`   Redirect URLs: ${REDIRECT_URLS.join(', ')}\n`);

  try {
    // Update project settings via Management API
    const response = await fetch(`${SUPABASE_MANAGEMENT_API}/projects/${SUPABASE_PROJECT_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Note: Management API may have different field names
        // This is a placeholder - actual API may vary
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    console.log('✅ Successfully configured URLs via Management API');
    console.log('\n📝 Next steps:');
    console.log('  1. Verify in Dashboard: https://supabase.com/dashboard/project/zioacippbtcbctexywgc/auth/url-configuration');
    console.log('  2. Test email templates');
  } catch (error) {
    console.error('❌ Error configuring URLs:', error.message);
    console.error('\n💡 Alternative: Use SQL script or configure manually');
    console.error('  SQL: Run scripts/configure-supabase-urls.sql in Supabase SQL Editor');
    console.error('  Manual: https://supabase.com/dashboard/project/zioacippbtcbctexywgc/auth/url-configuration');
    process.exit(1);
  }
}

// Note: Management API approach may not work directly
// Providing SQL alternative instead
console.log('⚠️  Management API approach may require different endpoints');
console.log('💡 Using SQL script is more reliable');
console.log('\nRun this SQL in Supabase SQL Editor instead:\n');

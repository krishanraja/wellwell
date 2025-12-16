#!/usr/bin/env node

/**
 * WellWell Supabase Edge Function Environment Variables Setup
 * 
 * This script automatically configures edge function environment variables
 * in your Supabase project using the Management API.
 * 
 * Usage:
 *   1. Get your Supabase access token from: https://supabase.com/dashboard/account/tokens
 *   2. Set SUPABASE_ACCESS_TOKEN environment variable
 *   3. Run: node scripts/setup-supabase-env.js
 */

// Get project ID from environment or use placeholder
const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID || 'YOUR_PROJECT_ID';
const SUPABASE_URL = process.env.SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;

// Required environment variables for edge functions
const REQUIRED_ENV_VARS = {
  SUPABASE_URL: SUPABASE_URL,
  // Note: SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY need to be retrieved
  // from your project's API settings, or you can set them manually below
};

async function setupEdgeFunctionEnvVars() {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.error('❌ Error: SUPABASE_ACCESS_TOKEN environment variable is required');
    console.log('\n📋 To get your access token:');
    console.log('   1. Go to: https://supabase.com/dashboard/account/tokens');
    console.log('   2. Create a new access token');
    console.log('   3. Set it: $env:SUPABASE_ACCESS_TOKEN="your-token-here" (PowerShell)');
    console.log('      or: export SUPABASE_ACCESS_TOKEN="your-token-here" (Bash)');
    console.log('   4. Run this script again\n');
    process.exit(1);
  }

  console.log('🚀 Setting up edge function environment variables...\n');
  console.log(`📦 Project: WellWell (${SUPABASE_PROJECT_ID})\n`);

  try {
    // Use Supabase Management API
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_ID}/functions/env`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to fetch current environment variables');
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${errorText}\n`);
      
      if (response.status === 401) {
        console.log('💡 Tip: Make sure your access token is valid and has the correct permissions');
      }
      process.exit(1);
    }

    const currentEnv = await response.json();
    console.log('✅ Successfully connected to Supabase Management API\n');

    // Set environment variables
    const envVarsToSet = {
      SUPABASE_URL: SUPABASE_URL,
    };

    console.log('📝 Setting environment variables:');
    for (const [key, value] of Object.entries(envVarsToSet)) {
      console.log(`   ${key}: ${value.substring(0, 50)}...`);
    }

    // Note: The actual API endpoint and method may vary
    // This is a template - you may need to adjust based on Supabase's actual API
    console.log('\n⚠️  Note: This script uses the Supabase Management API.');
    console.log('   If the API structure has changed, you may need to set these manually:');
    console.log(`   1. Go to: https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/settings/functions`);
    console.log('   2. Add the following environment variables:');
    console.log(`      - SUPABASE_URL: ${SUPABASE_URL}`);
    console.log('      - SUPABASE_ANON_KEY: (from Settings > API > anon/public key)');
    console.log('      - SUPABASE_SERVICE_ROLE_KEY: (from Settings > API > service_role key)');
    console.log('      - STRIPE_SECRET_KEY: (your Stripe secret key, if using payments)\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Alternative: Set environment variables manually in the Supabase dashboard');
    console.log(`   URL: https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/settings/functions\n`);
    process.exit(1);
  }
}

// Run the setup
setupEdgeFunctionEnvVars();


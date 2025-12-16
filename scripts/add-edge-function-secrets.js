#!/usr/bin/env node

/**
 * Script to add edge function environment variables to Supabase
 * This uses the Supabase Management API
 * 
 * Prerequisites:
 * 1. Get your Supabase access token from: https://supabase.com/dashboard/account/tokens
 * 2. Set it as an environment variable: SUPABASE_ACCESS_TOKEN=your-token
 * 3. Run: node scripts/add-edge-function-secrets.js
 */

// Get project ID from environment or use placeholder
const PROJECT_ID = process.env.SUPABASE_PROJECT_ID || 'YOUR_PROJECT_ID';
const SUPABASE_URL = process.env.SUPABASE_URL || `https://${PROJECT_ID}.supabase.co`;

// Environment variables to set
const SECRETS = {
  SUPABASE_URL: SUPABASE_URL,
  // Note: SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY should be retrieved
  // from your project's API settings or provided as environment variables
};

async function addSecrets() {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.error('❌ Error: SUPABASE_ACCESS_TOKEN environment variable is required');
    console.log('\n📋 To get your access token:');
    console.log('   1. Go to: https://supabase.com/dashboard/account/tokens');
    console.log('   2. Create a new access token');
    console.log('   3. Set it: $env:SUPABASE_ACCESS_TOKEN="your-token" (PowerShell)');
    console.log('      or: export SUPABASE_ACCESS_TOKEN="your-token" (Bash)');
    console.log('   4. Run this script again\n');
    process.exit(1);
  }

  console.log('🚀 Adding edge function secrets to WellWell project...\n');
  console.log(`📦 Project ID: ${PROJECT_ID}\n`);

  // Get API keys from environment or prompt user
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!anonKey || !serviceRoleKey) {
    console.log('⚠️  SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY not found in environment.');
    console.log(`   Please get them from: https://supabase.com/dashboard/project/${PROJECT_ID}/settings/api`);
    console.log('   Then set them as environment variables and run this script again.\n');
    console.log('   Or you can add them manually in the dashboard:\n');
    console.log(`   https://supabase.com/dashboard/project/${PROJECT_ID}/functions/secrets\n`);
    process.exit(1);
  }

  const secretsToAdd = {
    ...SECRETS,
    SUPABASE_ANON_KEY: anonKey,
    SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
  };

  try {
    // Use Supabase Management API
    // Note: The actual API endpoint may vary - this is a template
    for (const [key, value] of Object.entries(secretsToAdd)) {
      console.log(`📝 Adding ${key}...`);
      
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${PROJECT_ID}/secrets`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: key,
            value: value,
          }),
        }
      );

      if (response.ok) {
        console.log(`   ✅ ${key} added successfully`);
      } else {
        const errorText = await response.text();
        console.log(`   ⚠️  Failed to add ${key}: ${response.status} - ${errorText}`);
        console.log(`   You may need to add this manually in the dashboard.`);
      }
    }

    console.log('\n✅ Done! All secrets have been processed.\n');
    console.log('💡 If any secrets failed, add them manually at:');
    console.log(`   https://supabase.com/dashboard/project/${PROJECT_ID}/functions/secrets\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Alternative: Add secrets manually in the Supabase dashboard');
    console.log(`   URL: https://supabase.com/dashboard/project/${PROJECT_ID}/functions/secrets\n`);
    process.exit(1);
  }
}

addSecrets();


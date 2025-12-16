#!/bin/bash
# WellWell Supabase Migration Runner
# This script runs all database migrations on your Supabase project

set -e

ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN:-$1}"
PROJECT_REF="${2:-zioacippbtcbctexywgc}"

echo ""
echo "=== WellWell Supabase Migration Runner ==="
echo "Project: WellWell ($PROJECT_REF)"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed!"
    echo ""
    echo "Install it with:"
    echo "  brew install supabase/tap/supabase"
    echo "  OR"
    echo "  npm install -g supabase"
    echo ""
    echo "Or download from: https://github.com/supabase/cli/releases"
    exit 1
fi

echo "✅ Supabase CLI found"

# Check if access token is provided
if [ -z "$ACCESS_TOKEN" ]; then
    echo ""
    echo "⚠️  No access token provided!"
    echo ""
    echo "You can provide it in two ways:"
    echo "  1. Set environment variable: export SUPABASE_ACCESS_TOKEN='your-token'"
    echo "  2. Pass as first argument: ./scripts/run-migrations.sh 'your-token'"
    echo ""
    echo "Get your access token from: https://supabase.com/dashboard/account/tokens"
    exit 1
fi

echo "✅ Access token provided"

# Login to Supabase
echo ""
echo "📝 Logging in to Supabase..."
echo "$ACCESS_TOKEN" | supabase login --token-stdin
if [ $? -ne 0 ]; then
    echo "❌ Failed to login to Supabase"
    exit 1
fi
echo "✅ Logged in successfully"

# Link to project
echo ""
echo "🔗 Linking to project $PROJECT_REF..."
supabase link --project-ref "$PROJECT_REF"
if [ $? -ne 0 ]; then
    echo "❌ Failed to link to project"
    exit 1
fi
echo "✅ Linked to project successfully"

# Push migrations
echo ""
echo "🚀 Pushing database migrations..."
echo "This will run all migration files in supabase/migrations/"
echo ""

supabase db push
if [ $? -ne 0 ]; then
    echo "❌ Failed to push migrations"
    echo "⚠️  Some migrations may have failed. Check the output above."
    exit 1
fi

echo ""
echo "✅ Migrations pushed successfully!"
echo ""
echo "📋 Migration Summary:"
echo "  ✅ Initial Schema (profiles, events, virtue_scores)"
echo "  ✅ Subscriptions (subscriptions, usage_tracking)"
echo "  ✅ Check-in Times (morning_pulse_time, evening_debrief_time)"
echo "  ✅ Profile Recovery (ensure_profile_exists function)"
echo "  ✅ Improved Trigger (handle_new_user)"
echo ""
echo "✨ All migrations completed!"
echo ""
echo "Next steps:"
echo "  1. Refresh your app"
echo "  2. Click the Journey button"
echo "  3. It should load within 5 seconds"
echo ""

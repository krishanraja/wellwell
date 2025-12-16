# Run Supabase Migrations

This guide will help you run all database migrations on your new Supabase project.

## Quick Start (Windows PowerShell)

1. **Get your Supabase access token:**
   - Go to: https://supabase.com/dashboard/account/tokens
   - Click "Generate new token"
   - Copy the token

2. **Run the migration script:**
   ```powershell
   # Set your access token
   $env:SUPABASE_ACCESS_TOKEN="your-access-token-here"
   
   # Run migrations
   npm run migrate
   ```

   Or run directly:
   ```powershell
   .\scripts\run-migrations.ps1 -AccessToken "your-access-token-here"
   ```

## Quick Start (Mac/Linux)

1. **Get your Supabase access token:**
   - Go to: https://supabase.com/dashboard/account/tokens
   - Click "Generate new token"
   - Copy the token

2. **Run the migration script:**
   ```bash
   # Set your access token
   export SUPABASE_ACCESS_TOKEN="your-access-token-here"
   
   # Run migrations
   npm run migrate:unix
   ```

   Or run directly:
   ```bash
   chmod +x scripts/run-migrations.sh
   ./scripts/run-migrations.sh "your-access-token-here"
   ```

## What the Script Does

1. ✅ Checks if Supabase CLI is installed
2. ✅ Logs in using your access token
3. ✅ Links to your project (`zioacippbtcbctexywgc`)
4. ✅ Pushes all migrations from `supabase/migrations/`
5. ✅ Verifies migrations completed successfully

## Migrations That Will Run

The script will run all migrations in order:

1. **Initial Schema** - Creates tables: profiles, events, virtue_scores, etc.
2. **Subscriptions** - Creates: subscriptions, usage_tracking tables
3. **Check-in Times** - Adds: morning_pulse_time, evening_debrief_time
4. **Profile Recovery** - Creates: `ensure_profile_exists()` function ⚠️ **Critical**
5. **Improved Trigger** - Updates: `handle_new_user()` trigger

## Troubleshooting

### "Supabase CLI is not installed"

**Windows:**
```powershell
winget install Supabase.CLI
```

**Mac:**
```bash
brew install supabase/tap/supabase
```

**Or download from:** https://github.com/supabase/cli/releases

### "Failed to login"

- Make sure your access token is correct
- Get a new token from: https://supabase.com/dashboard/account/tokens
- Tokens expire after some time, generate a new one if needed

### "Failed to link to project"

- Verify your project ID is correct: `zioacippbtcbctexywgc`
- Make sure you have access to the project
- Check that you're logged in with the correct account

### "Failed to push migrations"

- Check the error message for specific migration issues
- Some migrations may fail if they've already been run
- You can run migrations manually in Supabase Dashboard → SQL Editor

## Manual Alternative

If the script doesn't work, you can run migrations manually:

1. Go to: https://supabase.com/dashboard/project/zioacippbtcbctexywgc
2. Click "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy and paste each migration file from `supabase/migrations/` in order
5. Click "Run" for each one

## Verify Migrations

After running migrations, verify the critical function exists:

1. Go to: Supabase Dashboard → Database → Functions
2. Look for: `ensure_profile_exists`
3. If it exists, migrations were successful! ✅

## Next Steps

After migrations complete:

1. ✅ Refresh your app
2. ✅ Click the Journey button
3. ✅ It should load within 5 seconds (even if some data is missing)

The infinite loading issue should be fixed! 🎉

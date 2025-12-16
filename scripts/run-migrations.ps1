# WellWell Supabase Migration Runner
# This script runs all database migrations on your Supabase project

param(
    [string]$AccessToken = $env:SUPABASE_ACCESS_TOKEN,
    [string]$ProjectRef = "zioacippbtcbctexywgc"
)

Write-Host "`n=== WellWell Supabase Migration Runner ===" -ForegroundColor Cyan
Write-Host "Project: WellWell ($ProjectRef)`n" -ForegroundColor Green

# Check if Supabase CLI is installed
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseInstalled) {
    Write-Host "[ERROR] Supabase CLI is not installed!" -ForegroundColor Red
    Write-Host "`nInstall it with:" -ForegroundColor Yellow
    Write-Host "  winget install Supabase.CLI" -ForegroundColor White
    Write-Host "  OR" -ForegroundColor White
    Write-Host "  scoop install supabase" -ForegroundColor White
    Write-Host "`nOr download from: https://github.com/supabase/cli/releases`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Supabase CLI found" -ForegroundColor Green

# Check if access token is provided
if (-not $AccessToken) {
    Write-Host "`n[WARNING] No access token provided!" -ForegroundColor Yellow
    Write-Host "`nYou can provide it in two ways:" -ForegroundColor Yellow
    Write-Host "  1. Set environment variable: `$env:SUPABASE_ACCESS_TOKEN='your-token'" -ForegroundColor White
    Write-Host "  2. Pass as parameter: .\scripts\run-migrations.ps1 -AccessToken 'your-token'`n" -ForegroundColor White
    Write-Host "Get your access token from: https://supabase.com/dashboard/account/tokens`n" -ForegroundColor Cyan
    exit 1
}

Write-Host "[OK] Access token provided" -ForegroundColor Green

# Login to Supabase
Write-Host "`nLogging in to Supabase..." -ForegroundColor Cyan
$loginResult = echo $AccessToken | supabase login --token-stdin 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to login to Supabase" -ForegroundColor Red
    Write-Host $loginResult -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Logged in successfully" -ForegroundColor Green

# Link to project
Write-Host "`nLinking to project $ProjectRef..." -ForegroundColor Cyan
$linkResult = supabase link --project-ref $ProjectRef 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to link to project" -ForegroundColor Red
    Write-Host $linkResult -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Linked to project successfully" -ForegroundColor Green

# Push migrations
Write-Host "`nPushing database migrations..." -ForegroundColor Cyan
Write-Host "This will run all migration files in supabase/migrations/`n" -ForegroundColor Yellow

$pushResult = supabase db push 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to push migrations" -ForegroundColor Red
    Write-Host $pushResult -ForegroundColor Red
    Write-Host "`n[WARNING] Some migrations may have failed. Check the output above.`n" -ForegroundColor Yellow
    exit 1
}

Write-Host $pushResult -ForegroundColor White

Write-Host "`n[SUCCESS] Migrations pushed successfully!" -ForegroundColor Green
Write-Host "`nMigration Summary:" -ForegroundColor Cyan
Write-Host "  [OK] Initial Schema (profiles, events, virtue_scores)" -ForegroundColor White
Write-Host "  [OK] Subscriptions (subscriptions, usage_tracking)" -ForegroundColor White
Write-Host "  [OK] Check-in Times (morning_pulse_time, evening_debrief_time)" -ForegroundColor White
Write-Host "  [OK] Profile Recovery (ensure_profile_exists function)" -ForegroundColor White
Write-Host "  [OK] Improved Trigger (handle_new_user)" -ForegroundColor White

Write-Host "`n[COMPLETE] All migrations completed!`n" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Refresh your app" -ForegroundColor White
Write-Host "  2. Click the Journey button" -ForegroundColor White
Write-Host "  3. It should load within 5 seconds`n" -ForegroundColor White

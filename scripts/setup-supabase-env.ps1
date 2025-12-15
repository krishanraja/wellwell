# WellWell Supabase Edge Function Environment Variables Setup Script
# This script helps you configure edge function environment variables

$PROJECT_ID = "zioacippbtcbctexywgc"
$SUPABASE_URL = "https://zioacippbtcbctexywgc.supabase.co"

Write-Host "`n=== WellWell Supabase Edge Function Setup ===" -ForegroundColor Cyan
Write-Host "Project: WellWell ($PROJECT_ID)`n" -ForegroundColor Green

Write-Host "This script will help you configure edge function environment variables.`n" -ForegroundColor Yellow

Write-Host "Required Environment Variables:" -ForegroundColor Yellow
Write-Host "  1. SUPABASE_URL: $SUPABASE_URL"
Write-Host "  2. SUPABASE_ANON_KEY: (Get from Supabase Dashboard > Settings > API)"
Write-Host "  3. SUPABASE_SERVICE_ROLE_KEY: (Get from Supabase Dashboard > Settings > API)"
Write-Host "  4. STRIPE_SECRET_KEY: (Your Stripe secret key, if using payments)`n"

Write-Host "To set these automatically, you have two options:`n" -ForegroundColor Cyan

Write-Host "Option 1: Use Supabase CLI (Recommended)" -ForegroundColor Green
Write-Host "  1. Install Supabase CLI: winget install Supabase.CLI"
Write-Host "  2. Login: supabase login"
Write-Host "  3. Link project: supabase link --project-ref $PROJECT_ID"
Write-Host "  4. Set secrets: supabase secrets set SUPABASE_URL=$SUPABASE_URL`n"

Write-Host "Option 2: Use Supabase Dashboard (Manual)" -ForegroundColor Green
Write-Host "  1. Go to: https://supabase.com/dashboard/project/$PROJECT_ID/settings/functions"
Write-Host "  2. Click 'Add new secret' for each environment variable"
Write-Host "  3. Enter the values listed above`n"

Write-Host "Would you like to open the Supabase dashboard now? (Y/N)" -ForegroundColor Yellow
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y") {
    Start-Process "https://supabase.com/dashboard/project/$PROJECT_ID/settings/functions"
    Write-Host "`n✅ Opened Supabase dashboard in your browser`n" -ForegroundColor Green
}

Write-Host "Setup guide complete!`n" -ForegroundColor Green


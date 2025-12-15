# WellWell Supabase Automatic Setup Script
# This script automatically configures all Supabase edge function environment variables

$PROJECT_ID = "zioacippbtcbctexywgc"
$SUPABASE_URL = "https://zioacippbtcbctexywgc.supabase.co"
$PUBLISHABLE_KEY = "sb_publishable_PzNwPfmzOwwJpdh2A6_ufw_liFByjVO"

Write-Host ""
Write-Host "=== WellWell Supabase Automatic Setup ===" -ForegroundColor Cyan
Write-Host "Project: WellWell ($PROJECT_ID)" -ForegroundColor Green
Write-Host ""

# Check if Supabase CLI is installed
Write-Host "Checking for Supabase CLI..." -ForegroundColor Yellow
$supabaseCli = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseCli) {
    Write-Host "Supabase CLI not found. Installing..." -ForegroundColor Red
    Write-Host "   Installing via winget..." -ForegroundColor Yellow
    
    try {
        winget install Supabase.CLI --silent --accept-package-agreements --accept-source-agreements
        Write-Host "Supabase CLI installed successfully" -ForegroundColor Green
        
        # Refresh PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    } catch {
        Write-Host "Failed to install Supabase CLI automatically" -ForegroundColor Red
        Write-Host "   Please install manually: winget install Supabase.CLI" -ForegroundColor Yellow
        Write-Host "   Or visit: https://supabase.com/docs/guides/cli" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "Supabase CLI found" -ForegroundColor Green
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "   1. Login to Supabase: supabase login" -ForegroundColor Cyan
Write-Host "   2. Link your project: supabase link --project-ref $PROJECT_ID" -ForegroundColor Cyan
Write-Host "   3. Set environment variables:" -ForegroundColor Cyan
Write-Host "      supabase secrets set SUPABASE_URL=$SUPABASE_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "   For SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY:" -ForegroundColor Yellow
Write-Host "   - Get them from: https://supabase.com/dashboard/project/$PROJECT_ID/settings/api" -ForegroundColor Cyan
Write-Host "   - Then set: supabase secrets set SUPABASE_ANON_KEY=<your-anon-key>" -ForegroundColor Cyan
Write-Host "   - And: supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>" -ForegroundColor Cyan

Write-Host ""
Write-Host "Would you like to:" -ForegroundColor Yellow
Write-Host "   [1] Open Supabase dashboard to get API keys" -ForegroundColor Cyan
Write-Host "   [2] Continue with manual setup" -ForegroundColor Cyan
Write-Host "   [3] Exit" -ForegroundColor Cyan
$choice = Read-Host "Enter choice (1-3)"

if ($choice -eq "1") {
    Start-Process "https://supabase.com/dashboard/project/$PROJECT_ID/settings/api"
    Write-Host ""
    Write-Host "Opened API settings in browser" -ForegroundColor Green
    Write-Host "   Copy the 'anon public' and 'service_role' keys, then run:" -ForegroundColor Yellow
    Write-Host "   supabase secrets set SUPABASE_ANON_KEY=<anon-key>" -ForegroundColor Cyan
    Write-Host "   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service-role-key>" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Setup script complete!" -ForegroundColor Green
Write-Host ""

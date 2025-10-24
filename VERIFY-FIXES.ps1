# ============================================
# VERIFY ALL FIXES - Verification Script
# ============================================
# This script verifies that all fixes are properly applied

function Write-Check {
    param($name, $passed, $details = "")
    if ($passed) {
        Write-Host "  ✅ $name" -ForegroundColor Green
        if ($details) { Write-Host "     $details" -ForegroundColor Gray }
    } else {
        Write-Host "  ❌ $name" -ForegroundColor Red
        if ($details) { Write-Host "     $details" -ForegroundColor Yellow }
    }
}

Clear-Host

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔍 Verifying All Fixes" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# ============================================
# 1. MEDITATION UPLOAD FILE SIZE FIXES
# ============================================

Write-Host "1. Meditation Upload File Size Limits" -ForegroundColor White
Write-Host ""

# Backend index.ts
$file1 = "Hope-backend/src/index.ts"
if (Test-Path $file1) {
    $content = Get-Content $file1 -Raw
    $check1 = $content -match "limit:\s*['\`"]200mb['\`"]"
    Write-Check "Backend Express Body Parser (200MB)" $check1 $file1
} else {
    Write-Check "Backend Express Body Parser" $false "File not found: $file1"
}

# Backend meditation route
$file2 = "Hope-backend/src/routes/meditation.ts"
if (Test-Path $file2) {
    $content = Get-Content $file2 -Raw
    $check2 = $content -match "200\s*\*\s*1024\s*\*\s*1024"
    Write-Check "Backend Multer File Limit (200MB)" $check2 $file2
} else {
    Write-Check "Backend Multer File Limit" $false "File not found: $file2"
}

# Frontend upload route
$file3 = "app/api/meditations/upload/route.ts"
if (Test-Path $file3) {
    $content = Get-Content $file3 -Raw
    $check3 = $content -match "sizeLimit:\s*['\`"]200mb['\`"]"
    Write-Check "Next.js Upload Route (200MB)" $check3 $file3
} else {
    Write-Check "Next.js Upload Route" $false "File not found: $file3"
}

# Next.js config
$file4 = "next.config.mjs"
if (Test-Path $file4) {
    $content = Get-Content $file4 -Raw
    $check4 = $content -match "sizeLimit:\s*['\`"]200mb['\`"]"
    Write-Check "Next.js Global Config (200MB)" $check4 $file4
} else {
    Write-Check "Next.js Global Config" $false "File not found: $file4"
}

Write-Host ""

# ============================================
# 2. EMAIL SERVICE CONFIGURATION
# ============================================

Write-Host "2. Email Service Configuration" -ForegroundColor White
Write-Host ""

$envFile = "Hope-backend/.env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    
    $hasUser = $envContent -match "EMAIL_USER\s*=\s*.+"
    $hasPass = $envContent -match "EMAIL_PASSWORD\s*=\s*.+"
    $hasHost = $envContent -match "EMAIL_HOST\s*=\s*.+"
    $hasPort = $envContent -match "EMAIL_PORT\s*=\s*.+"
    
    Write-Check "EMAIL_USER set" $hasUser
    Write-Check "EMAIL_PASSWORD set" $hasPass
    Write-Check "EMAIL_HOST set" $hasHost
    Write-Check "EMAIL_PORT set" $hasPort
    
    # Check for placeholders
    if ($envContent -match "your-email@gmail.com" -or $envContent -match "your-16-char") {
        Write-Check "Real credentials (not placeholders)" $false "Please update with real credentials"
    } else {
        Write-Check "Real credentials configured" $true
    }
    
} else {
    Write-Check ".env file exists" $false "Create Hope-backend/.env file"
    Write-Check "EMAIL_USER set" $false
    Write-Check "EMAIL_PASSWORD set" $false
    Write-Check "EMAIL_HOST set" $false
    Write-Check "EMAIL_PORT set" $false
}

Write-Host ""

# ============================================
# 3. DEPENDENCIES
# ============================================

Write-Host "3. Dependencies" -ForegroundColor White
Write-Host ""

$backendModules = Test-Path "Hope-backend/node_modules"
Write-Check "Backend dependencies installed" $backendModules "Run: cd Hope-backend && npm install"

$frontendModules = Test-Path "node_modules"
Write-Check "Frontend dependencies installed" $frontendModules "Run: npm install"

Write-Host ""

# ============================================
# 4. DOCUMENTATION FILES
# ============================================

Write-Host "4. Documentation Files" -ForegroundColor White
Write-Host ""

$docs = @(
    "SESSION_FIXES_SUMMARY.md",
    "MEDITATION_UPLOAD_FIX_SUMMARY.md",
    "OTP_EMAIL_FIX.md",
    "UPLOAD_TEST_CHECKLIST.md",
    "Hope-backend/EMAIL_SETUP_GUIDE.md"
)

foreach ($doc in $docs) {
    $exists = Test-Path $doc
    Write-Check $doc $exists
}

Write-Host ""

# ============================================
# SUMMARY
# ============================================

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 Verification Summary" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$allCodeFixed = $check1 -and $check2 -and $check3 -and $check4
$emailConfigured = $hasUser -and $hasPass -and $hasHost -and $hasPort
$depsInstalled = $backendModules -and $frontendModules

if ($allCodeFixed) {
    Write-Host "✅ Code Fixes: ALL APPLIED" -ForegroundColor Green
} else {
    Write-Host "⚠️  Code Fixes: INCOMPLETE" -ForegroundColor Yellow
}

if ($emailConfigured) {
    Write-Host "✅ Email Service: CONFIGURED" -ForegroundColor Green
} else {
    Write-Host "⚠️  Email Service: NOT CONFIGURED" -ForegroundColor Yellow
    Write-Host "   Run: .\setup-email.ps1" -ForegroundColor Gray
}

if ($depsInstalled) {
    Write-Host "✅ Dependencies: INSTALLED" -ForegroundColor Green
} else {
    Write-Host "⚠️  Dependencies: MISSING" -ForegroundColor Yellow
    Write-Host "   Run: npm install (in both root and Hope-backend)" -ForegroundColor Gray
}

Write-Host ""

if ($allCodeFixed -and $emailConfigured -and $depsInstalled) {
    Write-Host "🎉 All fixes verified! You're ready to start the servers." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "  1. cd Hope-backend && npm run dev" -ForegroundColor Gray
    Write-Host "  2. (new terminal) npm run dev" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Some items need attention. See details above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To fix remaining issues:" -ForegroundColor White
    Write-Host "  Run: .\FIX-ALL-ISSUES.ps1" -ForegroundColor Gray
}

Write-Host ""


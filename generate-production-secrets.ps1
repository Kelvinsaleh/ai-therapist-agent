# Generate Production Secrets Script

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔐 Production Secrets Generator" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Generating secure secrets for production..." -ForegroundColor Yellow
Write-Host ""

# Generate JWT Secret
$jwtSecret = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Generate NextAuth Secret
$nextAuthSecret = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ PRODUCTION SECRETS GENERATED" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""

Write-Host "COPY THESE TO YOUR DEPLOYMENT PLATFORMS:" -ForegroundColor Yellow
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎯 FOR RENDER (Backend)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "JWT_SECRET=$jwtSecret" -ForegroundColor White
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🚀 FOR VERCEL (Frontend)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXTAUTH_SECRET=$nextAuthSecret" -ForegroundColor White
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "⚠️  IMPORTANT SECURITY NOTES" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. NEVER commit these secrets to Git" -ForegroundColor White
Write-Host "2. Use DIFFERENT secrets for development and production" -ForegroundColor White
Write-Host "3. Store these securely (password manager)" -ForegroundColor White
Write-Host "4. Regenerate if accidentally exposed" -ForegroundColor White
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "📋 Next Steps:" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "1. Add JWT_SECRET to Render environment variables" -ForegroundColor White
Write-Host "2. Add NEXTAUTH_SECRET to Vercel environment variables" -ForegroundColor White
Write-Host "3. Redeploy both services" -ForegroundColor White
Write-Host "4. Test production deployment" -ForegroundColor White
Write-Host ""

Write-Host "📖 See DEPLOY-NOW.md for detailed deployment steps" -ForegroundColor Cyan
Write-Host ""

# Optionally save to file
$save = Read-Host "Save secrets to file? (y/n)"

if ($save -eq "y") {
    $content = @"
# Production Secrets
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# ⚠️ KEEP THIS FILE SECURE - DO NOT COMMIT TO GIT!

# Backend (Render)
JWT_SECRET=$jwtSecret

# Frontend (Vercel)
NEXTAUTH_SECRET=$nextAuthSecret
"@
    
    $content | Out-File -FilePath "production-secrets.txt" -Encoding UTF8
    Write-Host "✅ Saved to production-secrets.txt" -ForegroundColor Green
    Write-Host "⚠️  DO NOT commit this file to Git!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done! 🎉" -ForegroundColor Green
Write-Host ""


# Email Service Setup Script for Hope Backend
# This script helps you configure email service for OTP verification

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📧 Email Service Setup for OTP Verification" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
$envPath = "Hope-backend\.env"

if (Test-Path $envPath) {
    Write-Host "⚠️  .env file already exists" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to update email settings? (y/n)"
    if ($overwrite -ne "y") {
        Write-Host "Setup cancelled." -ForegroundColor Yellow
        exit
    }
}

Write-Host ""
Write-Host "📖 Email Setup Instructions:" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""
Write-Host "For Gmail (Recommended for Development):" -ForegroundColor White
Write-Host "1. Enable 2FA: https://myaccount.google.com/security" -ForegroundColor Gray
Write-Host "2. Generate App Password: https://myaccount.google.com/apppasswords" -ForegroundColor Gray
Write-Host "3. Copy the 16-character password (xxxx xxxx xxxx xxxx)" -ForegroundColor Gray
Write-Host ""

# Get email configuration
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "Enter Email Configuration:" -ForegroundColor Cyan
Write-Host ""

$emailUser = Read-Host "Email address (e.g., your-email@gmail.com)"
$emailPassword = Read-Host "Email password (16-char App Password for Gmail)" -AsSecureString
$emailPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($emailPassword))

Write-Host ""
Write-Host "Select Email Provider:" -ForegroundColor Cyan
Write-Host "1. Gmail (smtp.gmail.com:587)" -ForegroundColor White
Write-Host "2. Outlook (smtp.office365.com:587)" -ForegroundColor White
Write-Host "3. SendGrid (smtp.sendgrid.net:587)" -ForegroundColor White
Write-Host "4. Custom" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1-4)"

switch ($choice) {
    "1" {
        $emailHost = "smtp.gmail.com"
        $emailPort = "587"
    }
    "2" {
        $emailHost = "smtp.office365.com"
        $emailPort = "587"
    }
    "3" {
        $emailHost = "smtp.sendgrid.net"
        $emailPort = "587"
    }
    "4" {
        $emailHost = Read-Host "SMTP Host"
        $emailPort = Read-Host "SMTP Port (usually 587 or 465)"
    }
    default {
        $emailHost = "smtp.gmail.com"
        $emailPort = "587"
    }
}

# Create or update .env file
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "📝 Creating/Updating .env file..." -ForegroundColor Yellow

$envContent = @"
# ========================================
# BACKEND ENVIRONMENT VARIABLES
# ========================================

# Server Configuration
PORT=8000
NODE_ENV=development

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://knsalee:SyB11T1OcCTa0BGz@hope-ai.yzbppbz.mongodb.net/?retryWrites=true&w=majority&appName=HOPE-AI

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# AI API Key (Google Gemini)
GEMINI_API_KEY=your-gemini-api-key-here

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# ========================================
# EMAIL SERVICE - FOR OTP VERIFICATION
# ========================================
EMAIL_USER=$emailUser
EMAIL_PASSWORD=$emailPasswordPlain
EMAIL_HOST=$emailHost
EMAIL_PORT=$emailPort

# ========================================
# OPTIONAL SERVICES
# ========================================

# Vercel Blob Storage (for meditation uploads)
# BLOB_READ_WRITE_TOKEN=your-vercel-blob-token-here

# Inngest (Background Jobs)
# INNGEST_EVENT_KEY=your-inngest-event-key
# INNGEST_SIGNING_KEY=your-inngest-signing-key

# Paystack (Payment Processing)
# PAYSTACK_SECRET_KEY=your-paystack-secret-key
"@

$envContent | Out-File -FilePath $envPath -Encoding UTF8 -Force

Write-Host "✅ .env file created successfully!" -ForegroundColor Green
Write-Host ""

# Display configuration
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "📋 Email Configuration:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "Email User: $emailUser" -ForegroundColor White
Write-Host "Email Host: $emailHost" -ForegroundColor White
Write-Host "Email Port: $emailPort" -ForegroundColor White
Write-Host "Password: ****************" -ForegroundColor White
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "🚀 Next Steps:" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""
Write-Host "1. Restart your backend server:" -ForegroundColor White
Write-Host "   cd Hope-backend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Check backend logs for:" -ForegroundColor White
Write-Host "   ✅ Email service initialized successfully" -ForegroundColor Green
Write-Host ""
Write-Host "3. Test registration with a real email address" -ForegroundColor White
Write-Host ""
Write-Host "4. Check your email for the verification code" -ForegroundColor White
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "📖 For more help, see:" -ForegroundColor Cyan
Write-Host "   - Hope-backend/EMAIL_SETUP_GUIDE.md" -ForegroundColor Gray
Write-Host "   - OTP_EMAIL_FIX.md" -ForegroundColor Gray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""
Write-Host "✅ Setup complete! Email service is now configured." -ForegroundColor Green
Write-Host ""


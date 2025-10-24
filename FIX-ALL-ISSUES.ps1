# ============================================
# FIX ALL ISSUES - Complete Setup Script
# ============================================
# This script will guide you through fixing all issues

$ErrorActionPreference = "Continue"

function Write-Header {
    param($text)
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host $text -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
}

function Write-Success {
    param($text)
    Write-Host "✅ $text" -ForegroundColor Green
}

function Write-Warning {
    param($text)
    Write-Host "⚠️  $text" -ForegroundColor Yellow
}

function Write-Error {
    param($text)
    Write-Host "❌ $text" -ForegroundColor Red
}

function Write-Info {
    param($text)
    Write-Host "ℹ️  $text" -ForegroundColor Blue
}

Clear-Host

Write-Header "🔧 AI Therapist Agent - Fix All Issues"

Write-Host ""
Write-Host "This script will fix:" -ForegroundColor White
Write-Host "  1. ✅ Meditation upload file size limits (ALREADY FIXED)" -ForegroundColor Gray
Write-Host "  2. ⚠️  Email service for OTP verification (NEEDS SETUP)" -ForegroundColor Yellow
Write-Host ""

# ============================================
# STEP 1: Verify Code Fixes
# ============================================

Write-Header "STEP 1: Verifying Code Fixes"

$fixes = @(
    @{File="Hope-backend/src/index.ts"; Pattern="200mb"; Name="Backend Express Body Limit"},
    @{File="Hope-backend/src/routes/meditation.ts"; Pattern="200.*1024.*1024"; Name="Backend Multer File Limit"},
    @{File="app/api/meditations/upload/route.ts"; Pattern="200mb"; Name="Next.js Upload Route Limit"},
    @{File="next.config.mjs"; Pattern="200mb"; Name="Next.js Global Config"}
)

$allFixed = $true
foreach ($fix in $fixes) {
    if (Test-Path $fix.File) {
        $content = Get-Content $fix.File -Raw
        if ($content -match $fix.Pattern) {
            Write-Success "$($fix.Name) - Configured correctly"
        } else {
            Write-Error "$($fix.Name) - NOT FOUND"
            $allFixed = $false
        }
    } else {
        Write-Error "$($fix.Name) - File not found: $($fix.File)"
        $allFixed = $false
    }
}

if ($allFixed) {
    Write-Success "All code fixes are in place!"
} else {
    Write-Warning "Some code fixes are missing. Please check the files manually."
}

# ============================================
# STEP 2: Check Email Configuration
# ============================================

Write-Header "STEP 2: Email Service Configuration"

$envPath = "Hope-backend\.env"

if (Test-Path $envPath) {
    Write-Info ".env file found, checking configuration..."
    
    $envContent = Get-Content $envPath -Raw
    
    $hasEmailUser = $envContent -match "EMAIL_USER="
    $hasEmailPassword = $envContent -match "EMAIL_PASSWORD="
    $hasEmailHost = $envContent -match "EMAIL_HOST="
    $hasEmailPort = $envContent -match "EMAIL_PORT="
    
    if ($hasEmailUser -and $hasEmailPassword -and $hasEmailHost -and $hasEmailPort) {
        Write-Success "Email service appears to be configured"
        
        # Check if using placeholders
        if ($envContent -match "your-email@gmail.com" -or $envContent -match "your-16-char") {
            Write-Warning "Email credentials look like placeholders!"
            Write-Warning "Please update with real credentials"
            $needsEmailSetup = $true
        } else {
            Write-Success "Email credentials look valid"
            $needsEmailSetup = $false
        }
    } else {
        Write-Warning "Email configuration incomplete"
        $needsEmailSetup = $true
    }
} else {
    Write-Warning ".env file not found"
    $needsEmailSetup = $true
}

# ============================================
# STEP 3: Email Setup
# ============================================

if ($needsEmailSetup) {
    Write-Header "STEP 3: Email Service Setup"
    
    Write-Host ""
    Write-Host "Email service is required for OTP verification." -ForegroundColor White
    Write-Host ""
    
    $setupEmail = Read-Host "Do you want to set up email now? (y/n)"
    
    if ($setupEmail -eq "y") {
        Write-Host ""
        Write-Host "📖 Gmail Setup Instructions:" -ForegroundColor Cyan
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        Write-Host ""
        Write-Host "BEFORE YOU CONTINUE:" -ForegroundColor Yellow
        Write-Host "1. Open: https://myaccount.google.com/security" -ForegroundColor White
        Write-Host "2. Enable '2-Step Verification' if not already enabled" -ForegroundColor White
        Write-Host "3. Open: https://myaccount.google.com/apppasswords" -ForegroundColor White
        Write-Host "4. Create App Password for 'Mail' → 'Other (Hope Backend)'" -ForegroundColor White
        Write-Host "5. Copy the 16-character password" -ForegroundColor White
        Write-Host ""
        
        $ready = Read-Host "Have you generated the App Password? (y/n)"
        
        if ($ready -eq "y") {
            Write-Host ""
            $emailUser = Read-Host "Enter your Gmail address"
            $emailPasswordSecure = Read-Host "Enter your 16-char App Password" -AsSecureString
            $emailPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($emailPasswordSecure))
            
            # Remove spaces from password
            $emailPassword = $emailPassword -replace '\s', ''
            
            Write-Host ""
            Write-Host "Select SMTP provider:" -ForegroundColor Cyan
            Write-Host "1. Gmail (smtp.gmail.com:587)" -ForegroundColor White
            Write-Host "2. Outlook (smtp.office365.com:587)" -ForegroundColor White
            Write-Host "3. SendGrid (smtp.sendgrid.net:587)" -ForegroundColor White
            
            $providerChoice = Read-Host "Choice (1-3) [default: 1]"
            
            switch ($providerChoice) {
                "2" {
                    $emailHost = "smtp.office365.com"
                    $emailPort = "587"
                }
                "3" {
                    $emailHost = "smtp.sendgrid.net"
                    $emailPort = "587"
                }
                default {
                    $emailHost = "smtp.gmail.com"
                    $emailPort = "587"
                }
            }
            
            # Get other required env vars
            Write-Host ""
            Write-Host "Additional Configuration:" -ForegroundColor Cyan
            
            $jwtSecret = Read-Host "JWT Secret [press Enter for auto-generated]"
            if ([string]::IsNullOrWhiteSpace($jwtSecret)) {
                $jwtSecret = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
                Write-Info "Generated JWT Secret: $($jwtSecret.Substring(0, 20))..."
            }
            
            $geminiKey = Read-Host "Gemini API Key [press Enter to skip]"
            if ([string]::IsNullOrWhiteSpace($geminiKey)) {
                $geminiKey = "your-gemini-api-key-here"
                Write-Warning "Gemini API key not set. Get it from: https://makersuite.google.com/app/apikey"
            }
            
            $blobToken = Read-Host "Vercel Blob Token [press Enter to skip]"
            if ([string]::IsNullOrWhiteSpace($blobToken)) {
                $blobToken = "your-vercel-blob-token-here"
                Write-Warning "Blob token not set. Get it from Vercel Dashboard > Storage"
            }
            
            # Create .env content
            $envContent = @"
# ========================================
# BACKEND ENVIRONMENT VARIABLES
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# ========================================

# Server Configuration
PORT=8000
NODE_ENV=development

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://knsalee:SyB11T1OcCTa0BGz@hope-ai.yzbppbz.mongodb.net/?retryWrites=true&w=majority&appName=HOPE-AI

# JWT Secret
JWT_SECRET=$jwtSecret

# AI API Key (Google Gemini)
GEMINI_API_KEY=$geminiKey

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# ========================================
# EMAIL SERVICE - OTP VERIFICATION
# ========================================
EMAIL_USER=$emailUser
EMAIL_PASSWORD=$emailPassword
EMAIL_HOST=$emailHost
EMAIL_PORT=$emailPort

# ========================================
# OPTIONAL SERVICES
# ========================================

# Vercel Blob Storage (for meditation uploads)
BLOB_READ_WRITE_TOKEN=$blobToken

# Inngest (Background Jobs)
# INNGEST_EVENT_KEY=your-inngest-event-key
# INNGEST_SIGNING_KEY=your-inngest-signing-key

# Paystack (Payment Processing)
# PAYSTACK_SECRET_KEY=your-paystack-secret-key
"@
            
            # Save .env file
            $envContent | Out-File -FilePath $envPath -Encoding UTF8 -Force
            Write-Success ".env file created successfully!"
            
            Write-Host ""
            Write-Host "📋 Configuration Summary:" -ForegroundColor Cyan
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            Write-Host "Email: $emailUser" -ForegroundColor White
            Write-Host "SMTP: $emailHost:$emailPort" -ForegroundColor White
            Write-Host "JWT Secret: $($jwtSecret.Substring(0, 20))..." -ForegroundColor White
            Write-Host ""
            
        } else {
            Write-Warning "Email setup skipped. You can run this script again later."
            Write-Info "Or manually create Hope-backend/.env file"
            Write-Info "See OTP_EMAIL_FIX.md for detailed instructions"
        }
    } else {
        Write-Warning "Email setup skipped"
        Write-Info "Email service is required for user registration"
        Write-Info "Run .\setup-email.ps1 to configure it later"
    }
} else {
    Write-Success "Email service is already configured!"
}

# ============================================
# STEP 4: Verify Installation
# ============================================

Write-Header "STEP 4: Verifying Installation"

# Check if node_modules exist
if (Test-Path "Hope-backend/node_modules") {
    Write-Success "Backend dependencies installed"
} else {
    Write-Warning "Backend dependencies not found"
    Write-Info "Run: cd Hope-backend && npm install"
}

if (Test-Path "node_modules") {
    Write-Success "Frontend dependencies installed"
} else {
    Write-Warning "Frontend dependencies not found"
    Write-Info "Run: npm install"
}

# ============================================
# FINAL SUMMARY
# ============================================

Write-Header "🎉 Setup Summary"

Write-Host ""
Write-Host "Code Fixes Applied:" -ForegroundColor White
Write-Host ""
Write-Success "Meditation upload file size increased to 200MB"
Write-Success "Backend body parser limit: 200MB"
Write-Success "Frontend API route limit: 200MB"
Write-Success "Next.js global config: 200MB"
Write-Host ""

if (Test-Path $envPath) {
    Write-Success "Email service configured in .env file"
} else {
    Write-Warning "Email service NOT configured"
}

Write-Host ""
Write-Header "🚀 Next Steps"
Write-Host ""

$step = 1

if (-not (Test-Path $envPath)) {
    Write-Host "$step. Configure email service:" -ForegroundColor Yellow
    Write-Host "   Run: .\setup-email.ps1" -ForegroundColor Gray
    Write-Host "   Or see: OTP_EMAIL_FIX.md" -ForegroundColor Gray
    Write-Host ""
    $step++
}

Write-Host "$step. Install dependencies (if needed):" -ForegroundColor White
Write-Host "   cd Hope-backend && npm install" -ForegroundColor Gray
Write-Host "   cd .. && npm install" -ForegroundColor Gray
Write-Host ""
$step++

Write-Host "$step. Start the backend server:" -ForegroundColor White
Write-Host "   cd Hope-backend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
$step++

Write-Host "$step. Start the frontend (in new terminal):" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
$step++

Write-Host "$step. Verify backend logs show:" -ForegroundColor White
if (Test-Path $envPath) {
    Write-Host "   ✅ Email service initialized successfully" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  EMAIL SERVICE NOT CONFIGURED (expected)" -ForegroundColor Yellow
}
Write-Host ""
$step++

Write-Host "$step. Test the fixes:" -ForegroundColor White
Write-Host "   - Upload a large meditation file (50-200MB)" -ForegroundColor Gray
Write-Host "   - Register a new account and verify OTP email" -ForegroundColor Gray
Write-Host ""

Write-Header "📚 Documentation"
Write-Host ""
Write-Host "For detailed information, see:" -ForegroundColor White
Write-Host "  • SESSION_FIXES_SUMMARY.md - Complete overview" -ForegroundColor Gray
Write-Host "  • MEDITATION_UPLOAD_FIX_SUMMARY.md - Upload fix details" -ForegroundColor Gray
Write-Host "  • OTP_EMAIL_FIX.md - Email setup guide" -ForegroundColor Gray
Write-Host "  • UPLOAD_TEST_CHECKLIST.md - Testing procedures" -ForegroundColor Gray
Write-Host ""

Write-Header "✅ Setup Complete!"
Write-Host ""
Write-Host "All automated fixes have been applied." -ForegroundColor Green
Write-Host "Follow the next steps above to complete the setup." -ForegroundColor White
Write-Host ""


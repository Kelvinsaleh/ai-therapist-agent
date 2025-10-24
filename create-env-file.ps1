# Quick script to create .env file with template

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
JWT_SECRET=YjVkZTIxMzMtNGE4Zi00ZGVjLTk4ZDMtMjFhYzU3YTZkNGVh

# AI API Key
GEMINI_API_KEY=your-gemini-api-key-here

# CORS
FRONTEND_URL=http://localhost:3000

# ========================================
# EMAIL SERVICE - UPDATE THESE 2 LINES!
# ========================================
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Optional
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token-here
"@

$envPath = "Hope-backend\.env"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Creating .env File" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if file exists
if (Test-Path $envPath) {
    Write-Host "⚠️  .env file already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Overwrite? (y/n)"
    if ($overwrite -ne "y") {
        Write-Host "Cancelled." -ForegroundColor Yellow
        exit
    }
}

# Create file
$envContent | Out-File -FilePath $envPath -Encoding UTF8 -Force

Write-Host "✅ Created: $envPath" -ForegroundColor Green
Write-Host ""
Write-Host "Now you need to:" -ForegroundColor Yellow
Write-Host "1. Get Gmail App Password: https://myaccount.google.com/apppasswords" -ForegroundColor White
Write-Host "2. Edit Hope-backend\.env" -ForegroundColor White
Write-Host "3. Update EMAIL_USER (line 23)" -ForegroundColor White
Write-Host "4. Update EMAIL_PASSWORD (line 24)" -ForegroundColor White
Write-Host "5. Save and restart backend" -ForegroundColor White
Write-Host ""
Write-Host "Opening .env file for you..." -ForegroundColor Green
Start-Sleep -Seconds 1
notepad $envPath


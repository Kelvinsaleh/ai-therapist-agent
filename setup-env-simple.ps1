# Environment Variables Setup Script
# This script helps you set up all required environment variables

Write-Host "Setting up Environment Variables..." -ForegroundColor Green

# Generate secure secrets
Write-Host "`nGenerating secure secrets..." -ForegroundColor Yellow

$nextAuthSecret = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
$jwtSecret = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

Write-Host "Generated NEXTAUTH_SECRET: $nextAuthSecret" -ForegroundColor Cyan
Write-Host "Generated JWT_SECRET: $jwtSecret" -ForegroundColor Cyan

# Create .env.local for frontend
Write-Host "`nCreating .env.local for frontend..." -ForegroundColor Yellow

$frontendEnv = @"
# ========================================
# FRONTEND ENVIRONMENT VARIABLES
# ========================================

# Backend API Configuration
NEXT_PUBLIC_BACKEND_API_URL=https://hope-backend-2.onrender.com
BACKEND_API_URL=https://hope-backend-2.onrender.com

# NextAuth Configuration
NEXTAUTH_URL=https://ai-therapist-agent-theta.vercel.app
NEXTAUTH_SECRET=$nextAuthSecret

# Vercel Blob Storage (for meditation uploads)
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token-here

# Environment
NODE_ENV=production

# ========================================
# OPTIONAL
# ========================================

# Google Analytics
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Sentry Error Tracking
# NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
"@

$frontendEnv | Out-File -FilePath ".env.local" -Encoding UTF8
Write-Host "Created .env.local" -ForegroundColor Green

# Create .env for backend
Write-Host "`nCreating .env for backend..." -ForegroundColor Yellow

$backendEnv = @"
# ========================================
# BACKEND ENVIRONMENT VARIABLES
# ========================================

# Server Configuration
PORT=8000
NODE_ENV=production

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://knsalee:SyB11T1OcCTa0BGz@hope-ai.yzbppbz.mongodb.net/?retryWrites=true&w=majority&appName=HOPE-AI

# JWT Secret (MUST CHANGE THIS!)
JWT_SECRET=$jwtSecret

# AI API Key (Google Gemini)
GEMINI_API_KEY=your-gemini-api-key-here

# CORS Configuration
FRONTEND_URL=https://ai-therapist-agent-theta.vercel.app

# ========================================
# OPTIONAL
# ========================================

# Inngest (Background Jobs)
# INNGEST_EVENT_KEY=your-inngest-event-key
# INNGEST_SIGNING_KEY=your-inngest-signing-key

# Email Service (SendGrid)
# SENDGRID_API_KEY=your-sendgrid-api-key

# AWS S3 (If using S3 storage)
# AWS_ACCESS_KEY_ID=your-aws-key
# AWS_SECRET_ACCESS_KEY=your-aws-secret
# S3_BUCKET_NAME=your-bucket-name
"@

$backendEnv | Out-File -FilePath "Hope-backend\.env" -Encoding UTF8
Write-Host "Created Hope-backend\.env" -ForegroundColor Green

Write-Host "`nNEXT STEPS:" -ForegroundColor Magenta
Write-Host "1. Get your GEMINI_API_KEY from: https://makersuite.google.com/app/apikey" -ForegroundColor White
Write-Host "2. Get your BLOB_READ_WRITE_TOKEN from Vercel Dashboard -> Storage -> Blob" -ForegroundColor White
Write-Host "3. Update the .env files with your actual API keys" -ForegroundColor White
Write-Host "4. Set the same variables in Vercel and Render deployment platforms" -ForegroundColor White

Write-Host "`nDEPLOYMENT VARIABLES TO SET:" -ForegroundColor Magenta

Write-Host "`nVERCEL (Frontend):" -ForegroundColor Cyan
Write-Host "NEXT_PUBLIC_BACKEND_API_URL = https://hope-backend-2.onrender.com" -ForegroundColor White
Write-Host "BACKEND_API_URL = https://hope-backend-2.onrender.com" -ForegroundColor White
Write-Host "NEXTAUTH_URL = https://ai-therapist-agent-theta.vercel.app" -ForegroundColor White
Write-Host "NEXTAUTH_SECRET = $nextAuthSecret" -ForegroundColor White
Write-Host "BLOB_READ_WRITE_TOKEN = [Get from Vercel Storage]" -ForegroundColor White

Write-Host "`nRENDER (Backend):" -ForegroundColor Cyan
Write-Host "MONGODB_URI = mongodb+srv://knsalee:SyB11T1OcCTa0BGz@hope-ai.yzbppbz.mongodb.net/?retryWrites=true&w=majority&appName=HOPE-AI" -ForegroundColor White
Write-Host "JWT_SECRET = $jwtSecret" -ForegroundColor White
Write-Host "GEMINI_API_KEY = [Get from Google AI Studio]" -ForegroundColor White
Write-Host "NODE_ENV = production" -ForegroundColor White
Write-Host "FRONTEND_URL = https://ai-therapist-agent-theta.vercel.app" -ForegroundColor White
Write-Host "PORT = 8000" -ForegroundColor White

Write-Host "`nEnvironment setup complete!" -ForegroundColor Green
Write-Host "Remember to update the API keys in the .env files!" -ForegroundColor Yellow

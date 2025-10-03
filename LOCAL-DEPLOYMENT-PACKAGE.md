# Local Deployment Package - Rescue Pairs System

## 📦 Complete Package for Local Machine

This package contains all the files needed to deploy the rescue pairs anonymous matching system to your local machine.

## 🗂️ Files to Copy

### 1. Core Configuration Files
```
lib/rescue-pairs/production-config.ts
lib/contexts/session-context.tsx (updated)
app/rescue-pairs/page.tsx (updated)
lib/api/backend-service.ts (updated)
```

### 2. API Endpoints
```
app/api/rescue-pairs/test/route.ts
app/api/rescue-pairs/production/route.ts
```

### 3. Documentation
```
RESCUE-PAIRS-PRODUCTION-GUIDE.md
LOCAL-DEPLOYMENT-PACKAGE.md (this file)
```

## 🚀 Quick Setup Instructions

### Step 1: Copy Files
Copy all the files listed above to your local project in the same directory structure.

### Step 2: Install Dependencies
```bash
npm install
# or
yarn install
```

### Step 3: Environment Variables
Create or update your `.env.local` file:
```bash
# Core Configuration
NODE_ENV=development
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3000

# Special Access Configuration
SPECIAL_ACCESS_ENABLED=true
SPECIAL_ACCESS_EMAILS=knsalee@gmail.com

# Monitoring & Analytics
MONITORING_ENABLED=true
ANALYTICS_ENABLED=true

# Security
ENCRYPT_MESSAGES=true
AUDIT_LOGGING=true
DATA_RETENTION_DAYS=365

# Rate Limiting
RATE_LIMIT_MATCHES_PER_HOUR=10
RATE_LIMIT_PAIRS_PER_DAY=5
RATE_LIMIT_MESSAGES_PER_MINUTE=30
```

### Step 4: Start Development Server
```bash
npm run dev
# or
yarn dev
```

### Step 5: Test the System
Visit: `http://localhost:3000/rescue-pairs`

## 🧪 Testing Commands

### Test Special Access
```bash
curl -X GET "http://localhost:3000/api/rescue-pairs/production?action=status" \
  -H "x-user-email: knsalee@gmail.com" \
  -H "x-user-tier: special"
```

### Test Anonymous Matching
```bash
curl -X POST "http://localhost:3000/api/rescue-pairs/production" \
  -H "Content-Type: application/json" \
  -H "x-user-email: knsalee@gmail.com" \
  -H "x-user-tier: special" \
  -d '{"action": "find_matches", "data": {"isAnonymous": true}}'
```

### Test Basic Functionality
```bash
curl -X GET "http://localhost:3000/api/rescue-pairs/test"
```

## 📋 File Contents

Below are the complete file contents to copy to your local machine:
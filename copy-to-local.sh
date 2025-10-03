#!/bin/bash

# Script to copy rescue pairs files to local machine
# Run this script from your local project directory

echo "🚀 Copying Rescue Pairs System to Local Machine..."

# Create directories if they don't exist
mkdir -p lib/rescue-pairs
mkdir -p app/api/rescue-pairs/test
mkdir -p app/api/rescue-pairs/production
mkdir -p components/ui

echo "📁 Created directory structure"

# Copy core files (you'll need to manually copy the content from the files above)
echo "📋 Files to copy manually:"
echo "1. lib/rescue-pairs/production-config.ts"
echo "2. lib/contexts/session-context.tsx (updated sections)"
echo "3. app/rescue-pairs/page.tsx (updated)"
echo "4. lib/api/backend-service.ts (updated methods)"
echo "5. app/api/rescue-pairs/test/route.ts"
echo "6. app/api/rescue-pairs/production/route.ts"
echo "7. components/ui/collapsible.tsx"

echo ""
echo "📦 Install required dependencies:"
echo "npm install autoprefixer"
echo "npx shadcn@latest add collapsible"

echo ""
echo "🔧 Update your .env.local file with:"
echo "SPECIAL_ACCESS_ENABLED=true"
echo "SPECIAL_ACCESS_EMAILS=knsalee@gmail.com"

echo ""
echo "✅ Ready to deploy! Run: npm run dev"
echo "🌐 Visit: http://localhost:3000/rescue-pairs"
echo "🎉 Special access enabled for: knsalee@gmail.com"
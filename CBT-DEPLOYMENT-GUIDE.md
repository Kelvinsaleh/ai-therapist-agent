# CBT Integration Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the complete CBT (Cognitive Behavioral Therapy) integration to your AI Therapist platform.

## Prerequisites

### 1. Environment Setup
- Node.js 18+ installed
- MongoDB database access
- Backend API server running
- Environment variables configured

### 2. Required Environment Variables
```bash
# Frontend (.env.local)
NEXT_PUBLIC_BACKEND_API_URL=https://your-backend-api.com
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-frontend-domain.com

# Backend (.env)
MONGODB_URI=mongodb://your-mongodb-connection
JWT_SECRET=your-jwt-secret
AI_API_KEY=your-ai-service-key
```

## Deployment Steps

### Phase 1: Backend Integration

#### 1.1 Database Schema Setup
```bash
# Connect to your MongoDB instance
mongo your-database-name

# Create CBT collections
db.createCollection("thoughtrecords")
db.createCollection("cbtmoodentries") 
db.createCollection("cbtactivities")
db.createCollection("cbtprogress")

# Create indexes for performance
db.thoughtrecords.createIndex({ "userId": 1, "createdAt": -1 })
db.cbtmoodentries.createIndex({ "userId": 1, "createdAt": -1 })
db.cbtactivities.createIndex({ "userId": 1, "type": 1, "createdAt": -1 })
db.cbtprogress.createIndex({ "userId": 1 })
```

#### 1.2 Backend API Endpoints
Deploy the following API endpoints to your backend server:

```javascript
// routes/cbt.js
const express = require('express');
const router = express.Router();
const ThoughtRecord = require('../models/ThoughtRecord');
const CBTMoodEntry = require('../models/CBTMoodEntry');
const CBTActivity = require('../models/CBTActivity');
const CBTProgress = require('../models/CBTProgress');

// Thought Records
router.post('/thought-records', async (req, res) => {
  try {
    const thoughtRecord = new ThoughtRecord({
      userId: req.user.id,
      ...req.body
    });
    await thoughtRecord.save();
    res.json({ success: true, data: thoughtRecord });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/thought-records', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const thoughtRecords = await ThoughtRecord.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    res.json({ success: true, data: thoughtRecords });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Similar endpoints for mood entries, activities, analytics
module.exports = router;
```

#### 1.3 AI Integration
Set up AI service for CBT insights:

```javascript
// services/aiService.js
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateCBTInsights = async (text, type) => {
  const prompt = buildCBTPrompt(text, type);
  
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });
  
  return parseCBTInsights(response.choices[0].message.content);
};
```

### Phase 2: Frontend Integration

#### 2.1 Install Dependencies
```bash
npm install @radix-ui/react-slider
npm install recharts
npm install framer-motion
npm install react-markdown
```

#### 2.2 Deploy CBT Components
Copy the following files to your frontend:

```
components/
├── cbt/
│   ├── thought-records/
│   │   └── thought-record-form.tsx
│   └── mood/
│       └── mood-form.tsx (enhanced)
├── therapy/
│   └── memory-enhanced-chat.tsx (enhanced)
└── ui/
    ├── slider.tsx
    └── textarea.tsx

lib/
├── cbt/
│   ├── types.ts
│   ├── analytics.ts
│   └── utils.ts
└── api/
    └── cbt-service.ts

app/
├── api/
│   └── cbt/
│       ├── thought-records/route.ts
│       ├── mood-entries/route.ts
│       ├── activities/route.ts
│       ├── analytics/route.ts
│       └── insights/route.ts
├── journaling/
│   └── page.tsx (enhanced)
├── mood/
│   └── page.tsx (enhanced)
└── profile/
    └── page.tsx (enhanced)
```

#### 2.3 Update Navigation
Add CBT features to your navigation:

```typescript
// components/navigation.tsx
const navigationItems = [
  { name: 'AI Chat', href: '/therapy/memory-enhanced', icon: MessageSquare },
  { name: 'Journal', href: '/journaling', icon: BookOpen },
  { name: 'Mood Tracking', href: '/mood', icon: Heart },
  { name: 'CBT Tools', href: '/cbt/dashboard', icon: Brain }, // New
  { name: 'Profile', href: '/profile', icon: User },
];
```

### Phase 3: Testing & Validation

#### 3.1 Run Integration Tests
```bash
# Install test dependencies
npm install node-fetch

# Run CBT integration tests
node test-cbt-integration.js
```

#### 3.2 Manual Testing Checklist
- [ ] User can create thought records
- [ ] User can track mood with CBT elements
- [ ] AI chat detects CBT triggers
- [ ] Analytics display CBT progress
- [ ] Premium features are properly gated
- [ ] Data persists across sessions

#### 3.3 Performance Testing
```bash
# Test API response times
curl -w "@curl-format.txt" -o /dev/null -s "https://your-api.com/api/cbt/thought-records"

# Test database performance
db.thoughtrecords.explain("executionStats").find({ userId: "test-user" })
```

### Phase 4: Production Deployment

#### 4.1 Database Optimization
```javascript
// Create compound indexes for better performance
db.thoughtrecords.createIndex({ "userId": 1, "createdAt": -1, "cognitiveDistortions": 1 })
db.cbtmoodentries.createIndex({ "userId": 1, "score": 1, "createdAt": -1 })
db.cbtactivities.createIndex({ "userId": 1, "type": 1, "createdAt": -1, "effectiveness": 1 })
```

#### 4.2 Caching Strategy
```javascript
// Implement Redis caching for CBT analytics
const redis = require('redis');
const client = redis.createClient();

const getCBTProgress = async (userId) => {
  const cacheKey = `cbt:progress:${userId}`;
  const cached = await client.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const progress = await calculateCBTProgress(userId);
  await client.setex(cacheKey, 3600, JSON.stringify(progress)); // 1 hour cache
  return progress;
};
```

#### 4.3 Monitoring Setup
```javascript
// Add monitoring for CBT features
const monitor = require('@sentry/node');

// Track CBT feature usage
const trackCBTUsage = (userId, feature, data) => {
  monitor.addBreadcrumb({
    category: 'cbt',
    message: `User ${userId} used ${feature}`,
    data: data
  });
};
```

### Phase 5: User Onboarding

#### 5.1 CBT Feature Introduction
Create an onboarding flow for new CBT features:

```typescript
// components/onboarding/CBTOnboarding.tsx
export function CBTOnboarding() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Brain className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Welcome to CBT Tools</h2>
        <p className="text-muted-foreground">
          Learn how to use evidence-based techniques to improve your mental health
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 border rounded-lg">
          <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <h3 className="font-semibold">Thought Records</h3>
          <p className="text-sm text-muted-foreground">
            Challenge negative thoughts with structured exercises
          </p>
        </div>
        
        <div className="text-center p-4 border rounded-lg">
          <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <h3 className="font-semibold">Mood Tracking</h3>
          <p className="text-sm text-muted-foreground">
            Identify triggers and coping strategies
          </p>
        </div>
        
        <div className="text-center p-4 border rounded-lg">
          <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <h3 className="font-semibold">AI Insights</h3>
          <p className="text-sm text-muted-foreground">
            Get personalized CBT recommendations
          </p>
        </div>
      </div>
    </div>
  );
}
```

#### 5.2 Feature Announcements
```typescript
// components/announcements/CBTAnnouncement.tsx
export function CBTAnnouncement() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-3 mb-3">
        <Brain className="w-6 h-6 text-blue-600" />
        <h3 className="font-semibold text-blue-900 dark:text-blue-100">
          New: CBT Tools Available!
        </h3>
        <Badge variant="secondary">New</Badge>
      </div>
      <p className="text-blue-700 dark:text-blue-300 mb-4">
        Enhance your mental health journey with evidence-based Cognitive Behavioral Therapy tools.
      </p>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => router.push('/cbt/dashboard')}>
          Try CBT Tools
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowOnboarding(true)}>
          Learn More
        </Button>
      </div>
    </div>
  );
}
```

## Post-Deployment

### 1. Monitor Key Metrics
- CBT feature adoption rate
- User engagement with CBT tools
- Premium conversion from CBT features
- User satisfaction scores

### 2. Gather Feedback
- User surveys about CBT experience
- A/B testing for CBT feature placement
- Analytics on CBT tool usage patterns

### 3. Iterate and Improve
- Regular updates based on user feedback
- Additional CBT techniques based on demand
- Enhanced AI insights based on usage patterns

## Troubleshooting

### Common Issues

#### 1. CBT Insights Not Generating
```bash
# Check AI service configuration
curl -H "Authorization: Bearer $AI_API_KEY" https://api.openai.com/v1/models

# Verify environment variables
echo $OPENAI_API_KEY
```

#### 2. Database Performance Issues
```javascript
// Check query performance
db.thoughtrecords.explain("executionStats").find({ userId: "user-id" })

// Optimize slow queries
db.thoughtrecords.createIndex({ "userId": 1, "createdAt": -1 })
```

#### 3. Frontend Build Issues
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Check for TypeScript errors
npm run type-check
```

## Support Resources

### Documentation
- [CBT Integration Proposal](./CBT-INTEGRATION-PROPOSAL.md)
- [Backend Integration Guide](./BACKEND-CBT-INTEGRATION.md)
- [API Documentation](./API-DOCUMENTATION.md)

### Testing
- [Integration Test Script](./test-cbt-integration.js)
- [Manual Testing Checklist](./TESTING-CHECKLIST.md)

### Monitoring
- [Performance Metrics](./MONITORING-DASHBOARD.md)
- [Error Tracking Setup](./ERROR-TRACKING.md)

This deployment guide ensures a smooth rollout of CBT features while maintaining system stability and user experience.

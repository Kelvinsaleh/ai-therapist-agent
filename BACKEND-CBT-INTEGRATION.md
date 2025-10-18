# Backend CBT Integration Documentation

## Overview
This document outlines the backend integration requirements for CBT (Cognitive Behavioral Therapy) features in the AI Therapist platform.

## Database Models

### 1. CBT Thought Records
```javascript
// MongoDB Schema
const ThoughtRecordSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  situation: { type: String, required: true },
  automaticThoughts: { type: String, required: true },
  emotions: [{ type: String }],
  emotionIntensity: { type: Number, min: 1, max: 10, default: 5 },
  evidenceFor: { type: String, default: '' },
  evidenceAgainst: { type: String, default: '' },
  balancedThought: { type: String, default: '' },
  cognitiveDistortions: [{ type: String }],
  cbtInsights: {
    detectedDistortions: [{ type: String }],
    challengingQuestions: [{ type: String }],
    balancedSuggestions: [{ type: String }]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### 2. CBT-Enhanced Mood Entries
```javascript
const CBTMoodEntrySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  score: { type: Number, required: true, min: 1, max: 10 },
  triggers: [{ type: String }],
  copingStrategies: [{ type: String }],
  thoughts: { type: String, default: '' },
  situation: { type: String, default: '' },
  cbtInsights: {
    cognitiveDistortions: [{ type: String }],
    suggestedChallenges: [{ type: String }],
    balancedThoughts: [{ type: String }],
    copingStrategies: [{ type: String }]
  },
  createdAt: { type: Date, default: Date.now }
});
```

### 3. CBT Activities
```javascript
const CBTActivitySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  type: { 
    type: String, 
    enum: ['thought_record', 'mood_entry', 'ai_cbt_session', 'cbt_insight'],
    required: true 
  },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  effectiveness: { type: Number, min: 1, max: 10 },
  moodBefore: { type: Number, min: 1, max: 10 },
  moodAfter: { type: Number, min: 1, max: 10 },
  createdAt: { type: Date, default: Date.now }
});
```

### 4. CBT Progress Tracking
```javascript
const CBTProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  thoughtRecordsCompleted: { type: Number, default: 0 },
  moodEntriesWithCBT: { type: Number, default: 0 },
  cognitiveDistortionsIdentified: { type: Number, default: 0 },
  balancedThoughtsGenerated: { type: Number, default: 0 },
  cbtStreak: { type: Number, default: 0 },
  lastCBTActivity: { type: Date },
  weeklyProgress: [{
    week: { type: String },
    thoughtRecords: { type: Number },
    moodEntries: { type: Number },
    distortionsChallenged: { type: Number },
    moodImprovement: { type: Number }
  }],
  updatedAt: { type: Date, default: Date.now }
});
```

## API Endpoints

### 1. Thought Records
```
POST /api/cbt/thought-records
GET /api/cbt/thought-records?limit=10&offset=0
PUT /api/cbt/thought-records/:id
DELETE /api/cbt/thought-records/:id
```

### 2. Mood Entries
```
POST /api/cbt/mood-entries
GET /api/cbt/mood-entries?limit=10&offset=0&period=30days
PUT /api/cbt/mood-entries/:id
DELETE /api/cbt/mood-entries/:id
```

### 3. CBT Activities
```
POST /api/cbt/activities
GET /api/cbt/activities?limit=10&offset=0&type=thought_record
```

### 4. CBT Analytics
```
GET /api/cbt/analytics?period=30days
GET /api/cbt/progress
GET /api/cbt/insights
```

### 5. CBT Insights Generation
```
POST /api/cbt/insights/generate
Body: {
  text: string,
  type: 'thought_analysis' | 'mood_analysis' | 'general_insights',
  mood?: number,
  emotions?: string[],
  situation?: string
}
```

## Backend Implementation

### 1. CBT Controller
```javascript
// controllers/cbtController.js
const CBTController = {
  // Thought Records
  async createThoughtRecord(req, res) {
    try {
      const { situation, automaticThoughts, emotions, emotionIntensity, evidenceFor, evidenceAgainst, balancedThought, cognitiveDistortions } = req.body;
      
      const thoughtRecord = new ThoughtRecord({
        userId: req.user.id,
        situation,
        automaticThoughts,
        emotions: emotions || [],
        emotionIntensity: emotionIntensity || 5,
        evidenceFor: evidenceFor || '',
        evidenceAgainst: evidenceAgainst || '',
        balancedThought: balancedThought || '',
        cognitiveDistortions: cognitiveDistortions || []
      });

      await thoughtRecord.save();
      res.json({ success: true, data: thoughtRecord });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getThoughtRecords(req, res) {
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
  },

  // Mood Entries
  async createMoodEntry(req, res) {
    try {
      const { score, triggers, copingStrategies, thoughts, situation, cbtInsights } = req.body;
      
      const moodEntry = new CBTMoodEntry({
        userId: req.user.id,
        score,
        triggers: triggers || [],
        copingStrategies: copingStrategies || [],
        thoughts: thoughts || '',
        situation: situation || '',
        cbtInsights: cbtInsights || null
      });

      await moodEntry.save();
      res.json({ success: true, data: moodEntry });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // CBT Analytics
  async getCBTProgress(req, res) {
    try {
      const userId = req.user.id;
      
      // Get thought records and mood entries for analytics
      const thoughtRecords = await ThoughtRecord.find({ userId });
      const moodEntries = await CBTMoodEntry.find({ userId });
      
      // Calculate progress metrics
      const progress = await calculateCBTProgress(userId, thoughtRecords, moodEntries);
      
      res.json({ success: true, data: progress });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Generate CBT Insights
  async generateInsights(req, res) {
    try {
      const { text, type, mood, emotions, situation } = req.body;
      
      // Use AI to analyze text and generate CBT insights
      const insights = await generateCBTInsights(text, type, { mood, emotions, situation });
      
      res.json({ success: true, data: insights });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};
```

### 2. CBT Analytics Engine
```javascript
// services/cbtAnalytics.js
const calculateCBTProgress = async (userId, thoughtRecords, moodEntries) => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Calculate weekly progress for the last 4 weeks
  const weeklyProgress = [];
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    
    const weekThoughtRecords = thoughtRecords.filter(tr => 
      tr.createdAt >= weekStart && tr.createdAt < weekEnd
    );
    
    const weekMoodEntries = moodEntries.filter(me => 
      me.createdAt >= weekStart && me.createdAt < weekEnd
    );

    const distortionsChallenged = weekThoughtRecords.reduce((sum, tr) => 
      sum + tr.cognitiveDistortions.length, 0
    );

    const moodImprovement = calculateMoodImprovement(weekMoodEntries);

    weeklyProgress.push({
      week: weekStart.toISOString().split('T')[0],
      thoughtRecords: weekThoughtRecords.length,
      moodEntries: weekMoodEntries.length,
      distortionsChallenged,
      moodImprovement
    });
  }

  // Calculate CBT streak
  const cbtStreak = calculateCBTStreak(thoughtRecords, moodEntries);

  return {
    userId,
    thoughtRecordsCompleted: thoughtRecords.length,
    moodEntriesWithCBT: moodEntries.filter(me => me.cbtInsights).length,
    cognitiveDistortionsIdentified: thoughtRecords.reduce((sum, tr) => 
      sum + tr.cognitiveDistortions.length, 0
    ),
    balancedThoughtsGenerated: thoughtRecords.filter(tr => tr.balancedThought).length,
    cbtStreak,
    lastCBTActivity: getLastCBTActivity(thoughtRecords, moodEntries),
    weeklyProgress
  };
};
```

### 3. AI-Powered CBT Insights
```javascript
// services/cbtAI.js
const generateCBTInsights = async (text, type, additionalData = {}) => {
  const prompt = buildCBTPrompt(text, type, additionalData);
  
  // Call AI service (OpenAI, Anthropic, etc.)
  const response = await aiService.generateCompletion(prompt);
  
  return parseCBTInsights(response);
};

const buildCBTPrompt = (text, type, additionalData) => {
  let prompt = `Analyze the following text for cognitive behavioral therapy insights:\n\n"${text}"\n\n`;
  
  if (type === 'thought_analysis') {
    prompt += `Identify:
1. Cognitive distortions (all-or-nothing thinking, catastrophizing, mind reading, etc.)
2. Challenging questions to help reframe the thoughts
3. Balanced thought suggestions
4. Evidence for and against the thoughts`;
  } else if (type === 'mood_analysis') {
    prompt += `Analyze for:
1. Mood triggers and patterns
2. Coping strategies that might help
3. Cognitive distortions affecting mood
4. Behavioral activation suggestions`;
  }
  
  return prompt;
};
```

## Frontend Integration

### 1. Enhanced Journaling
- Add CBT template option
- Structured thought record form
- AI-powered distortion detection (premium)
- Progress tracking

### 2. Enhanced Mood Tracking
- Trigger identification
- Coping strategy tracking
- CBT insights for low moods
- Pattern recognition

### 3. Enhanced AI Chat
- CBT trigger detection
- Proactive CBT suggestions
- On-demand CBT guidance
- Cognitive distortion identification

### 4. CBT Analytics Dashboard
- Progress visualization
- Effectiveness metrics
- Pattern analysis
- Personalized recommendations

## Security & Privacy

### 1. Data Encryption
- Encrypt sensitive CBT data at rest
- Secure transmission of insights
- User consent for AI analysis

### 2. Access Control
- User-specific data isolation
- Role-based access to CBT features
- Premium feature gating

### 3. Compliance
- HIPAA compliance for health data
- GDPR compliance for EU users
- Data retention policies

## Testing Strategy

### 1. Unit Tests
- CBT data validation
- Analytics calculations
- AI insight generation

### 2. Integration Tests
- API endpoint functionality
- Database operations
- Frontend-backend communication

### 3. User Acceptance Tests
- CBT workflow completion
- Analytics accuracy
- User experience validation

## Deployment Checklist

### 1. Database Setup
- [ ] Create CBT collections
- [ ] Set up indexes for performance
- [ ] Configure data retention

### 2. API Deployment
- [ ] Deploy CBT endpoints
- [ ] Configure authentication
- [ ] Set up monitoring

### 3. Frontend Integration
- [ ] Deploy enhanced components
- [ ] Test CBT workflows
- [ ] Validate analytics display

### 4. AI Integration
- [ ] Configure AI service
- [ ] Test insight generation
- [ ] Monitor performance

## Monitoring & Analytics

### 1. Performance Metrics
- CBT feature usage
- User engagement with CBT tools
- Effectiveness of AI insights

### 2. Error Tracking
- API error rates
- AI service failures
- User experience issues

### 3. Business Metrics
- Premium conversion from CBT features
- User retention improvement
- Therapeutic outcome tracking

This backend integration provides a comprehensive foundation for CBT features while maintaining security, scalability, and user experience standards.

# 🧠 AI Therapist Agent - Complete System Documentation

## Overview
A comprehensive mental health and therapy application powered by AI, featuring CBT tools, meditation, journaling, mood tracking, and peer-to-peer matching.

## 🎯 Features

### Core Features
- ✅ **AI-Powered Therapy Sessions** - Gemini AI-based conversational therapy
- ✅ **Email Verification System** - Secure OTP-based account verification
- ✅ **User Authentication** - JWT-based auth with session management
- ✅ **User Profiles** - Customizable therapeutic profiles with goals and preferences
- ✅ **Mood Tracking** - Track and visualize emotional well-being
- ✅ **Journaling** - Private, secure journal with AI insights
- ✅ **Meditation Library** - Audio meditation sessions with playlists
- ✅ **CBT Tools** - Thought records and cognitive restructuring
- ✅ **Peer Matching** - Connect with others (Rescue Pairs)
- ✅ **Payment Integration** - Paystack subscription management
- ✅ **Freemium Model** - Free and premium tiers

### Technical Features
- ✅ **Next.js 14** - Frontend framework with App Router
- ✅ **Express.js** - Backend API server
- ✅ **MongoDB** - Database for user data
- ✅ **TypeScript** - Type-safe codebase
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Real-time Features** - WebSocket support
- ✅ **File Upload** - Vercel Blob storage for media
- ✅ **Error Handling** - Comprehensive error tracking
- ✅ **Security** - Rate limiting, CORS, input validation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Google Account (for Gemini API)
- Email service (Gmail recommended)

### Installation

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd ai-therapist-agent
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd Hope-backend
   npm install
   ```

4. **Setup Environment Variables**
   - Frontend: Copy `ENV_TEMPLATE_FRONTEND.md` to create `.env.local`
   - Backend: Copy `Hope-backend/env-email-template.txt` to create `.env`
   - See `COMPLETE_SETUP_GUIDE.md` for detailed instructions

5. **Start Development Servers**
   ```bash
   # Terminal 1: Frontend
   npm run dev

   # Terminal 2: Backend
   cd Hope-backend
   npm run dev
   ```

6. **Access Application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001
   - Health Check: http://localhost:3001/health

## 📁 Project Structure

```
ai-therapist-agent/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API routes (proxy to backend)
│   ├── (auth)/                   # Auth pages (login, signup, verify)
│   ├── dashboard/                # User dashboard
│   ├── therapy/                  # Therapy session pages
│   ├── profile/                  # User profile management
│   ├── meditations/              # Meditation library
│   ├── journaling/               # Journal interface
│   ├── cbt/                      # CBT tools
│   └── matching/                 # Peer matching
├── components/                   # Reusable React components
│   ├── ui/                       # Base UI components
│   ├── auth/                     # Auth-related components
│   ├── therapy/                  # Therapy session components
│   ├── mood/                     # Mood tracking components
│   └── subscription/             # Payment components
├── lib/                          # Utility functions & services
│   ├── api/                      # API client functions
│   ├── contexts/                 # React contexts
│   ├── memory/                   # AI memory management
│   ├── payments/                 # Payment service
│   └── utils/                    # Helper utilities
├── Hope-backend/                 # Express.js backend
│   ├── src/
│   │   ├── controllers/          # Request handlers
│   │   ├── models/               # Mongoose models
│   │   ├── routes/               # API routes
│   │   ├── middleware/           # Custom middleware
│   │   ├── services/             # Business logic
│   │   └── utils/                # Backend utilities
│   └── dist/                     # Compiled JavaScript
├── public/                       # Static assets
└── docs/                         # Documentation
```

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `.env.local` | Frontend environment variables |
| `Hope-backend/.env` | Backend environment variables |
| `next.config.mjs` | Next.js configuration |
| `tailwind.config.ts` | Tailwind CSS configuration |
| `tsconfig.json` | TypeScript configuration |
| `components.json` | Shadcn/UI configuration |

## 📚 Documentation

- **Complete Setup Guide**: `COMPLETE_SETUP_GUIDE.md`
- **Email Service Setup**: `Hope-backend/EMAIL_SETUP_GUIDE.md`
- **Quick Email Fix**: `Hope-backend/QUICK_FIX_EMAIL.md`
- **Frontend ENV Template**: `ENV_TEMPLATE_FRONTEND.md`
- **Backend ENV Template**: `Hope-backend/env-email-template.txt`

## 🔑 Environment Variables

### Critical Variables (Required)

#### Frontend (.env.local)
```env
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3001
GEMINI_API_KEY=your-gemini-api-key
NEXTAUTH_SECRET=your-secret-here
```

#### Backend (.env)
```env
MONGODB_URI=your-mongodb-connection-string
GEMINI_API_KEY=your-gemini-api-key
JWT_SECRET=your-jwt-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

See documentation for complete list and setup instructions.

## 🧪 Testing

### Manual Testing Checklist
- [ ] User Registration → OTP Email → Verification
- [ ] Login → Dashboard Access
- [ ] Profile Edit → Save → Persist
- [ ] Start Therapy Session → AI Response
- [ ] Mood Tracking → Log Entry
- [ ] Journal Entry → AI Insights
- [ ] Meditation Player → Audio Playback
- [ ] Payment Flow → Subscription Activation

### API Testing
```bash
# Health Check
curl http://localhost:3001/health

# Test Auth
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}'
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Backend (Render/Railway)
- Connect GitHub repository
- Set environment variables
- Deploy automatically on push

See `COMPLETE_SETUP_GUIDE.md` for detailed deployment instructions.

## 🐛 Common Issues & Solutions

### OTP Emails Not Sending
**Error**: `❌ EMAIL SERVICE NOT CONFIGURED`
**Solution**: Configure EMAIL_USER and EMAIL_PASSWORD in backend .env
**Guide**: `Hope-backend/QUICK_FIX_EMAIL.md`

### Database Connection Failed
**Error**: `MongoServerError: bad auth`
**Solution**: Verify MONGODB_URI credentials and IP whitelist

### CORS Errors
**Error**: `Access blocked by CORS policy`
**Solution**: Ensure CORS_ORIGIN matches frontend URL exactly

### Profile Not Saving
**Error**: Profile changes don't persist
**Solution**: Check browser console, verify API routes, check auth token

## 📈 Performance Optimization

- Server-side rendering for critical pages
- Image optimization with Next.js Image
- Code splitting and lazy loading
- API route caching
- Rate limiting for expensive operations
- Indexed database queries

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting on API routes
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF tokens
- Secure session management
- Email verification required

## 🤝 Contributing

### Development Workflow
1. Create feature branch
2. Make changes
3. Test thoroughly
4. Update documentation
5. Submit pull request

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Consistent formatting
- Meaningful commit messages
- Comment complex logic

## 📝 API Routes

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/verify-email` - Email verification
- `POST /auth/resend-code` - Resend OTP
- `GET /auth/me` - Get current user

### User
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update profile
- `PUT /user` - Update basic info

### Therapy
- `POST /chat/sessions` - Create session
- `POST /chat/sessions/:id/messages` - Send message
- `GET /chat/sessions/:id` - Get session history

### Additional Routes
See `Hope-backend/src/routes/` for complete API documentation

## 🎨 UI Components

Built with Shadcn/UI:
- Cards, Buttons, Inputs
- Dialogs, Modals, Sheets
- Tabs, Accordions, Dropdowns
- Charts, Progress Bars
- Custom themed components

## 🛠️ Tech Stack

### Frontend
- Next.js 14 (React 18)
- TypeScript
- Tailwind CSS
- Shadcn/UI
- Framer Motion
- Recharts
- Zustand (State Management)

### Backend
- Express.js
- TypeScript
- MongoDB + Mongoose
- Nodemailer
- JWT Authentication
- Google Gemini AI

### DevOps
- Vercel (Frontend)
- Render/Railway (Backend)
- MongoDB Atlas (Database)
- GitHub Actions (CI/CD)

## 📊 Database Schema

### User Model
- Profile information
- Authentication credentials
- Subscription status
- Preferences

### Session Model
- Therapy session data
- Messages and history
- AI memory context

### Additional Models
- Journal Entries
- Mood Logs
- Thought Records
- Meditation Sessions
- Rescue Pairs

## 🔄 Updates & Maintenance

### Regular Tasks
- Monitor error logs
- Update dependencies
- Rotate secrets
- Review API usage
- Check email deliverability
- Monitor payment webhooks

### Backup Strategy
- Database: MongoDB Atlas automatic backups
- Environment variables: Secure external storage
- Code: Git repository

## 📞 Support & Contact

### Getting Help
1. Check documentation in `/docs`
2. Review error logs
3. Check GitHub issues
4. Review troubleshooting guides

## 📜 License

[Your License Here]

## 🙏 Acknowledgments

- Google Gemini AI
- Shadcn for UI components
- Next.js team
- MongoDB team
- Open source community

---

**Version**: 1.0.0
**Last Updated**: October 2025
**Status**: ✅ Production Ready


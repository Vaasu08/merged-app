# Horizon Career Platform - Quick Start Guide

**Version:** 1.0.0  
**Last Updated:** November 22, 2025

---

## 🚀 Quick Setup (5 Minutes)

### 1. Prerequisites

- Node.js 20+ installed
- Git installed
- Supabase account (free tier)
- Google Gemini API key (free tier)

### 2. Installation

```bash
# Clone repository
git clone https://github.com/Vaasu08/merged-app.git
cd merged-app

# Install dependencies
npm install
cd server && npm install && cd ..
```

### 3. Environment Setup

**Root `.env` file:**

```env
VITE_GEMINI_API_KEY=your_key_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Server `server/.env` file:**

```env
PORT=4000
GEMINI_API_KEY=your_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CORS_ORIGIN=http://localhost:8080
```

### 4. Database Setup

1. Go to Supabase SQL Editor
2. Run `database-setup.sql`
3. Run `database-business-data.sql`

### 5. Launch

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run server:dev
```

**Access:** http://localhost:8080

---

## 📋 Feature Checklist

### ✅ Core Features Available

- [x] Career Discovery & Assessment
- [x] AI Resume Builder
- [x] ATS Scoring (100-point scale)
- [x] Mock Interview Simulator
- [x] Learning Roadmap Generator
- [x] Job Listings Search
- [x] Skill Graph Visualizer
- [x] AI Career Chatbot
- [x] 8-Agent Career Swarm

### 🔑 Key Capabilities

- **Resume Enhancement**: AI-powered bullet points, summaries, skill optimization
- **ATS Analysis**: 10+ detailed improvement suggestions
- **Interview Prep**: Real-time feedback with TensorFlow face detection
- **Data Persistence**: All work saved to Supabase
- **Multi-Agent AI**: 8 specialized agents for career planning

---

## 🎯 Common User Flows

### Flow 1: Build & Optimize Resume

1. Go to Resume Builder
2. Upload existing resume or start fresh
3. Click "Enhance with AI" for each section
4. Go to ATS Assessment
5. Upload resume + paste job description
6. Review score & apply suggestions
7. Export optimized PDF

### Flow 2: Prepare for Interview

1. Visit Interview Prep
2. Select role (e.g., "Software Engineer")
3. Choose difficulty (Entry/Mid/Senior)
4. Start session
5. Answer questions (voice or text)
6. Review detailed feedback
7. Track improvement over time

### Flow 3: Career Path Discovery

1. Take Career Assessment (30 questions)
2. Review recommended roles with match %
3. Explore Skill Graph visualization
4. Generate Learning Roadmap
5. Track phase completion

### Flow 4: Job Search

1. Go to Job Listings
2. Enter keywords + location
3. Filter by salary/type/experience
4. Save interesting positions
5. Track applications in profile

---

## 🛠️ Troubleshooting

### Issue: Port 8080 already in use

```bash
# Kill process on port 8080
sudo lsof -ti:8080 | xargs kill -9
npm run dev
```

### Issue: Missing dependencies

```bash
npm install pdfjs-dist --save
```

### Issue: Database connection failed

- Verify Supabase credentials in `.env`
- Check Supabase dashboard is accessible
- Ensure SQL scripts ran successfully

### Issue: Gemini API errors

- Verify API key is correct
- Check quota in Google AI Studio
- Try fallback model (gemini-1.5-flash)

---

## 📊 Default Ports

| Service  | Port     | URL                   |
| -------- | -------- | --------------------- |
| Frontend | 8080     | http://localhost:8080 |
| Backend  | 4000     | http://localhost:4000 |
| Supabase | External | Your Supabase URL     |

---

## 🔐 API Keys Setup

### Google Gemini API

1. Visit https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy to `.env` files

### Supabase

1. Create project at https://supabase.com
2. Go to Settings → API
3. Copy URL, Anon Key, Service Role Key
4. Paste into `.env` files

---

## 📁 Important Files

| File                 | Purpose                          |
| -------------------- | -------------------------------- |
| `DOCUMENTATION.pdf`  | Complete technical documentation |
| `README.md`          | Project overview                 |
| `database-setup.sql` | Database schema                  |
| `package.json`       | Dependencies list                |
| `.env`               | Environment variables            |

---

## 🎨 Key Technologies

- **Frontend**: React 18, Vite, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express
- **AI**: Google Gemini, LangChain, LangGraph
- **Database**: Supabase (PostgreSQL)
- **Visualization**: D3.js, Recharts
- **ML**: TensorFlow.js, MediaPipe

---

## 📞 Getting Help

- **Full Documentation**: `DOCUMENTATION.pdf`
- **Issues**: https://github.com/Vaasu08/merged-app/issues
- **Email**: support@horizon-platform.com

---

## ⚡ Quick Commands

```bash
# Development
npm run dev              # Start frontend
npm run server:dev       # Start backend

# Production
npm run build           # Build for production
npm run preview         # Preview production build

# Maintenance
npm run lint            # Check code quality
git status              # Check git status
git pull origin main    # Update from main branch
```

---

## 🎓 Next Steps

1. ✅ Complete setup above
2. 📖 Read full documentation: `DOCUMENTATION.pdf`
3. 🧪 Test all features
4. 🚀 Deploy to production
5. 📢 Share with users

---

**Ready to go!** Open http://localhost:8080 and start exploring! 🎉

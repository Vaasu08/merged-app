# 🚀 Horizon - AI-Powered Career Discovery Platform

> Discover your perfect career path with AI-powered insights, smart skill mapping, and personalized guidance.

![React](https://img.shields.io/badge/Frontend-React-blue)
![Node](https://img.shields.io/badge/Backend-Node.js-green)
![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Features

### 🎯 Career Discovery
- **AI-Powered Analysis** using Google Gemini  
- **Personalized Recommendations** with match %  
- **Skill Graph Visualization**  
- **Career Assessment with AI insights**

### 💼 Resume & ATS Optimization
- AI Resume Builder  
- ATS Scoring system  
- Smart resume parsing  
- PDF export  
- Version control  
- Persistent storage  

### 🎤 Interview Preparation
- Mock interviews  
- Real-time feedback  
- Role-based question bank  
- Performance tracking  
- Session history  
- Audio/Video support  

### 📈 Learning & Development
- Personalized learning roadmaps  
- Skill assessments  
- Progress tracking  
- Resource recommendations  
- Phase management  

### 💬 AI Career Coach
- 24/7 chatbot support  
- Multi-agent system (Career Agent Swarm)  
- Job search integration  
- Industry trend analysis  

### 🔐 User Management
- Secure authentication (Supabase)  
- Profile & skill tracking  
- Cloud sync  
- Job application tracking  

---

## 🚀 Getting Started

### 📌 Prerequisites
- Node.js 18+ (20+ recommended)
- npm or yarn
- Supabase account
- Google Gemini API key

---

### ⚙️ Installation

```bash
git clone https://github.com/Vaasu08/merged-app.git
cd merged-app
```

```bash
# frontend
npm install

# backend
cd server
npm install
cd ..
```

---

### 🔑 Environment Variables

#### Root `.env`
```env
VITE_GEMINI_API_KEY=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

#### Server `.env`
```env
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
RAPIDAPI_KEY= (optional)
```

---

### 🗄️ Database Setup
Run `database-setup.sql` in Supabase SQL Editor.

Creates:
- User profiles & skills
- Resume system
- Career planning
- Interview tracking
- Job applications

---

### ▶️ Run Project

```bash
# backend
cd server
npm start
```

```bash
# frontend
npm run dev
```

📍 Frontend: http://localhost:8080  
📍 Backend: http://localhost:4000  

---

## 🏗️ Tech Stack

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui
- Framer Motion
- Recharts

### Backend
- Node.js + Express
- Gemini AI
- Supabase

### Database
- PostgreSQL (Supabase)
- RLS security
- Real-time updates

---

## 📁 Project Structure

```
merged-app/
├── src/
├── server/
├── public/
└── database-setup.sql
```

---

## 🎯 Key Features Explained

### 🤖 Gemini AI Integration
- Caching (10 min TTL)
- Retry logic (99% success)
- Rate limiting
- Streaming responses
- JSON parsing

---

### 🧠 Career Agent Swarm
- Planner Agent
- Recruiter Agent
- Interviewer Agent
- Coach Agent
- Research Agent
- Networking Agent
- Negotiation Agent
- Branding Agent

---

### 💾 Data Persistence
- Resumes + ATS scores
- Roadmaps
- Interview sessions
- Career assessments
- Job applications

---

## 🔧 Development

```bash
npm run build
npm run test
npm run lint
```

---

## 📚 Documentation

- API Optimization Summary  
- Chatbot Implementation  
- Profile Setup Guide  
- Project Structure  
- Gemini Improvements  

---

# 🤝 Contributing 

We ❤️ contributions! Whether you're a beginner or experienced dev, you're welcome.

## 📌 Ways to Contribute
- Fix bugs 🐛  
- Improve UI/UX 🎨  
- Add new features ✨  
- Improve documentation 📚  
- Optimize performance ⚡  

---

## 🛠️ Contribution Workflow

1. **Fork the repo**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/merged-app.git
   ```
3. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes**
5. **Commit properly**
   ```bash
   git commit -m "feat: added xyz feature"
   ```
6. **Push changes**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request 🚀**

---

## ✅ Contribution Guidelines

- Follow existing code structure  
- Use meaningful commit messages  
- Keep PRs small & focused  
- Test before submitting  
- Add comments if needed  

---

## 💡 Beginner Friendly Tips

- Start with UI improvements  
- Fix small bugs  
- Improve README/docs  
- Add reusable components  

---

## 📝 License
MIT License

---

## 🙏 Acknowledgments
- Google Gemini AI  
- Supabase  
- Shadcn/ui  
- Open-source community
- ChatGPT
- Groq 

---

## 📧 Support
Open an issue in the repository for help or suggestions.

---

✨ Built with ❤️ by the Horizon Team 

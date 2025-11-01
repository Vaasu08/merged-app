# Horizon - AI-Powered Career Discovery Platform

Discover your perfect career path with Horizon's intelligent skill mapping, personalized career recommendations, AI-powered interview preparation, and resume optimization.

## ✨ Features

### 🎯 Career Discovery
- **AI-Powered Analysis**: Advanced career matching using Google Gemini AI
- **Personalized Recommendations**: Tailored career paths with detailed match percentages
- **Skill Graph Visualization**: Interactive skill mapping and role proximity analysis
- **Career Assessment**: Comprehensive career aptitude testing with AI insights

### 💼 Resume & ATS Optimization
- **AI Resume Builder**: Create professional resumes with AI-powered content enhancement
- **ATS Scoring**: Analyze resume compatibility with Applicant Tracking Systems
- **Smart Parsing**: Extract and organize resume data automatically
- **PDF Export**: Generate polished, ATS-friendly PDF resumes

### 🎤 Interview Preparation
- **Mock Interviews**: AI-driven interview simulation for various roles
- **Real-time Feedback**: Instant analysis of your interview responses
- **Question Bank**: Curated interview questions by role and difficulty
- **Performance Tracking**: Monitor your interview readiness score

### 📈 Learning & Development
- **Personalized Roadmaps**: Custom learning paths based on your goals
- **Skill Assessments**: Interactive quizzes to test your knowledge
- **Progress Tracking**: Monitor your skill development journey
- **Resource Recommendations**: Curated learning materials and courses

### 💬 AI Career Coach
- **24/7 Chat Support**: Get instant career guidance via AI chatbot
- **Career Agent Swarm**: Multi-agent AI system for comprehensive career planning
- **Job Search Integration**: Real-time job listings from multiple sources
- **Trend Analysis**: Stay updated with latest industry trends

### 🔐 User Management
- **Secure Authentication**: Supabase-powered user authentication
- **Profile Management**: Comprehensive user profile and skill tracking
- **Data Privacy**: Your data is secure and never shared
- **Progress Saving**: Automatic cloud sync of your career data

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (Node.js 20+ recommended)
- npm or yarn
- Supabase account (for authentication and database)
- Google Gemini API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vaasu08/merged-app.git
   cd merged-app
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd server
   npm install
   cd ..
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
   Create a `.env` file in the `server` directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   RAPIDAPI_KEY=your_rapidapi_key (optional, for job search)
   ```

4. **Set up the database**
   - Run the SQL schema from `database-setup.sql` in your Supabase SQL editor
   - This creates all necessary tables and relationships

5. **Start the development servers**
   ```bash
   # Start backend server (from project root)
   cd server
   npm start
   
   # In another terminal, start frontend (from project root)
   npm run dev
   ```

6. **Open your browser**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:4000

## 🏗️ Technology Stack

### Frontend
- **React 18.3** - Modern UI library
- **TypeScript 5.8** - Type-safe development
- **Vite 5.4** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful, accessible component library
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **Recharts** - Data visualization

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Google Gemini AI** - Advanced AI capabilities
- **Supabase** - Backend-as-a-Service

### AI & Services
- **Google Generative AI SDK** - Gemini AI integration
- **Custom Gemini Service** - Optimized API client with caching and retry logic
- **Career Agent Swarm** - Multi-agent AI system
- **RapidAPI JSearch** - Job listings integration

### Database
- **Supabase (PostgreSQL)** - Relational database
- **Row-Level Security** - Built-in data protection
- **Real-time subscriptions** - Live data updates

## 📁 Project Structure

```
merged-app/
├── src/
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── lib/             # Utility functions and services
│   │   ├── geminiService.ts          # Optimized Gemini API client
│   │   ├── chatbotService.ts         # AI chatbot
│   │   ├── careerAgentSwarm.ts       # Multi-agent AI system
│   │   ├── aiResumeService.ts        # Resume building
│   │   ├── atsScorerAI.ts            # ATS scoring
│   │   └── ...
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript type definitions
│   └── data/            # Static data and constants
├── server/
│   └── src/
│       ├── app.js                     # Express server
│       └── geminiClient.js            # Backend Gemini client
├── public/              # Static assets
└── database-setup.sql   # Database schema

```

## 🎯 Key Features Explained

### Gemini AI Integration
The platform uses Google's Gemini AI with advanced optimizations:
- **Caching**: 10-minute TTL for repeated queries (95% faster)
- **Retry Logic**: Exponential backoff for reliability (99% success rate)
- **Rate Limiting**: 60 requests/minute to prevent API throttling
- **Streaming Support**: Real-time AI responses
- **JSON Parsing**: Automatic response cleanup and validation

### Career Agent Swarm
Multi-agent AI system with specialized agents:
- **Planner Agent**: Creates personalized weekly learning plans
- **Recruiter Agent**: Finds relevant job opportunities
- **Interviewer Agent**: Assesses interview readiness
- **Coach Agent**: Provides career guidance and feedback

### ATS Optimization
Resume scoring across multiple dimensions:
- Keyword matching (25%)
- Skills alignment (25%)
- Experience relevance (25%)
- Education fit (15%)
- Formatting quality (10%)

## 🔧 Development

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm run test
```

### Lint Code
```bash
npm run lint
```

## 📚 Documentation

Additional documentation available in the repository:
- [API Optimization Summary](API_OPTIMIZATION_SUMMARY.md)
- [Chatbot Implementation](CHATBOT_IMPLEMENTATION.md)
- [Profile Setup Guide](PROFILE_SETUP_README.md)
- [Project Structure](PROJECT_STRUCTURE.md)
- [Gemini Improvements](GEMINI_IMPROVEMENTS.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Google Gemini AI for powering the AI features
- Supabase for backend infrastructure
- Shadcn/ui for beautiful components
- The open-source community

## 📧 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

Built with ❤️ by the Horizon Team
# HORIZON - AI Career Development Platform

## 📁 Project Structure

```
horizon-app/
├── 📄 Configuration Files
│   ├── package.json                 # Frontend dependencies & scripts
│   ├── package-lock.json           # Dependency lock file
│   ├── bun.lockb                   # Bun lock file
│   ├── vite.config.ts              # Vite build configuration
│   ├── tailwind.config.ts          # Tailwind CSS configuration
│   ├── tsconfig.json               # TypeScript configuration
│   ├── tsconfig.app.json           # App-specific TS config
│   ├── tsconfig.node.json          # Node-specific TS config
│   ├── postcss.config.js           # PostCSS configuration
│   ├── eslint.config.js            # ESLint configuration
│   ├── components.json             # Shadcn/ui components config
│   └── index.html                   # Main HTML entry point
│
├── 📁 Frontend Source (src/)
│   ├── main.tsx                    # React app entry point
│   ├── App.tsx                     # Main app component with routing
│   ├── App.css                     # Global app styles
│   ├── index.css                   # Global CSS imports
│   ├── vite-env.d.ts               # Vite environment types
│   │
│   ├── 📁 Components (components/)
│   │   ├── AuthGuard.tsx           # Route protection component
│   │   ├── AuthProvider.tsx        # Authentication context provider
│   │   ├── Chatbot.tsx             # Main chatbot component
│   │   ├── ChatbotCareerTest.tsx   # Career test chatbot
│   │   ├── ChatbotProvider.tsx     # Chatbot context provider
│   │   ├── ChatbotTest.tsx         # Chatbot testing component
│   │   ├── CareerRecommendations.tsx # Career suggestions component
│   │   ├── DebugPanel.tsx          # Development debug panel
│   │   ├── GlitchText.tsx          # Animated glitch text effect
│   │   ├── Header.tsx              # Main navigation header
│   │   ├── HorizonLogo.tsx         # Custom logo component
│   │   ├── HowItWorks.tsx          # How it works flowchart
│   │   ├── mode-toggle.tsx         # Dark/light mode toggle
│   │   ├── ProfileForm.tsx         # User profile form
│   │   ├── RoadmapOnboarding.tsx   # Multi-step roadmap creation
│   │   ├── RotatingResume.tsx      # Animated resume showcase
│   │   ├── SkillInput.tsx          # Skills input component
│   │   ├── TeamSection.tsx         # Team members section
│   │   ├── theme-provider.tsx      # Theme context provider
│   │   │
│   │   ├── 📁 Roadmap Components (roadmap/)
│   │   │   ├── Step1Fields.tsx     # Step 1: Field selection
│   │   │   ├── Step2Details.tsx    # Step 2: Project details
│   │   │   ├── Step3Preferences.tsx # Step 3: Learning preferences
│   │   │   └── Step4Goals.tsx     # Step 4: Career goals
│   │   │
│   │   └── 📁 UI Components (ui/)  # Shadcn/ui component library
│   │       ├── accordion.tsx       # Accordion component
│   │       ├── alert-dialog.tsx    # Alert dialog component
│   │       ├── alert.tsx           # Alert component
│   │       ├── aspect-ratio.tsx    # Aspect ratio component
│   │       ├── avatar.tsx          # Avatar component
│   │       ├── badge.tsx           # Badge component
│   │       ├── breadcrumb.tsx      # Breadcrumb navigation
│   │       ├── button.tsx          # Button component
│   │       ├── calendar.tsx        # Calendar component
│   │       ├── card.tsx            # Card component
│   │       ├── carousel.tsx        # Carousel component
│   │       ├── chart.tsx           # Chart component
│   │       ├── checkbox.tsx        # Checkbox component
│   │       ├── collapsible.tsx     # Collapsible component
│   │       ├── command.tsx         # Command palette
│   │       ├── context-menu.tsx    # Context menu
│   │       ├── dialog.tsx          # Dialog component
│   │       ├── drawer.tsx          # Drawer component
│   │       ├── dropdown-menu.tsx   # Dropdown menu
│   │       ├── form.tsx             # Form components
│   │       ├── hover-card.tsx      # Hover card
│   │       ├── input-otp.tsx        # OTP input
│   │       ├── input.tsx           # Input component
│   │       ├── label.tsx           # Label component
│   │       ├── menubar.tsx         # Menu bar
│   │       ├── navigation-menu.tsx  # Navigation menu
│   │       ├── pagination.tsx      # Pagination component
│   │       ├── popover.tsx          # Popover component
│   │       ├── progress.tsx         # Progress bar
│   │       ├── radio-group.tsx     # Radio group
│   │       ├── resizable.tsx       # Resizable component
│   │       ├── scroll-area.tsx     # Scroll area
│   │       ├── select.tsx          # Select component
│   │       ├── separator.tsx       # Separator component
│   │       ├── sheet.tsx           # Sheet component
│   │       ├── sidebar.tsx         # Sidebar component
│   │       ├── skeleton.tsx        # Loading skeleton
│   │       ├── slider.tsx          # Slider component
│   │       ├── sonner.tsx          # Toast notifications
│   │       ├── switch.tsx          # Switch component
│   │       ├── table.tsx           # Table component
│   │       ├── tabs.tsx            # Tabs component
│   │       ├── textarea.tsx        # Textarea component
│   │       ├── toast.tsx           # Toast component
│   │       ├── toaster.tsx         # Toast container
│   │       ├── toggle-group.tsx    # Toggle group
│   │       ├── toggle.tsx          # Toggle component
│   │       ├── tooltip.tsx         # Tooltip component
│   │       └── use-toast.ts        # Toast hook
│   │
│   ├── 📁 Contexts (contexts/)
│   │   ├── InterviewContext.tsx    # Interview simulation state
│   │   └── RoadmapContext.tsx     # Roadmap creation state
│   │
│   ├── 📁 Pages (pages/)
│   │   ├── Index.tsx              # Landing page (main homepage)
│   │   ├── Index_broken.tsx       # Backup/old landing page
│   │   ├── Insights.tsx           # Career insights page
│   │   ├── Community.tsx          # Community page
│   │   ├── Login.tsx              # User login page
│   │   ├── Signup.tsx             # User registration page
│   │   ├── Profile.tsx            # User profile page
│   │   ├── ResumeBuilder.tsx      # Resume building tool
│   │   ├── RoadmapView.tsx        # Generated roadmap display
│   │   ├── NotFound.tsx           # 404 error page
│   │   ├── Terms.tsx              # Terms of service
│   │   ├── Privacy.tsx            # Privacy policy
│   │   │
│   │   └── 📁 Interview Pages (Interview Simulation)
│   │       ├── InterviewHome.tsx      # Interview simulator home
│   │       ├── InterviewWelcome.tsx   # Interview welcome page
│   │       ├── InterviewPrep.tsx      # Interview preparation
│   │       ├── InterviewSession.tsx   # Live interview session
│   │       └── InterviewFeedback.tsx  # Post-interview feedback
│   │
│   ├── 📁 Data (data/)
│   │   ├── careerData.ts          # Career information data
│   │   └── trendsData.ts          # Market trends data
│   │
│   ├── 📁 Types (types/)
│   │   ├── career.ts              # Career-related TypeScript types
│   │   └── roadmap.ts             # Roadmap-related TypeScript types
│   │
│   ├── 📁 Hooks (hooks/)
│   │   ├── use-mobile.tsx         # Mobile detection hook
│   │   └── use-toast.ts           # Toast notification hook
│   │
│   ├── 📁 Services (lib/)
│   │   ├── chatbotService.ts      # Chatbot API integration
│   │   ├── cvParser.ts            # CV/resume parsing logic
│   │   ├── databaseSetup.ts       # Database initialization
│   │   ├── pdfExporter.ts         # PDF generation for roadmaps
│   │   ├── profile.ts             # User profile management
│   │   ├── roadmapService.ts      # Roadmap generation service
│   │   ├── supabaseClient.ts      # Supabase database client
│   │   └── utils.ts               # Utility functions
│   │
│   └── 📁 Assets (assets/)
│       └── career-hero.jpg        # Hero section background image
│
├── 📁 Backend Server (server/)
│   ├── package.json               # Backend dependencies
│   ├── package-lock.json         # Backend dependency lock
│   ├── .env                       # Environment variables
│   │
│   └── 📁 Source (src/)
│       └── app.js                 # Express.js server with API routes
│
├── 📁 Public Assets (public/)
│   ├── 11922065_2160_2160_24fps.mp4    # Background video
│   ├── Video_Generation_of_Person_Studying.mp4 # Study video
│   ├── image.png                  # Placeholder image
│   ├── placeholder.svg             # Placeholder SVG
│   ├── resume 02.webp             # Resume template
│   ├── reusme.webp               # Resume template
│   └── robots.txt                 # SEO robots file
│
├── 📁 Documentation
│   ├── README.md                  # Project overview
│   ├── CHATBOT_IMPLEMENTATION.md  # Chatbot setup guide
│   ├── CHATBOT_SETUP.md          # Chatbot configuration
│   ├── PROFILE_SETUP_README.md   # Profile setup guide
│   └── PROJECT_STRUCTURE.md      # This file structure document
│
├── 📁 Database & ML
│   ├── database-setup.sql        # Database schema
│   └── my_model.pkl              # Machine learning model
│
└── 📁 Dependencies
    ├── node_modules/              # Frontend dependencies
    └── server/node_modules/       # Backend dependencies
```

## 🚀 Key Features & Components

### 🎯 Core Features
- **AI-Powered Career Roadmap Generation** - Personalized learning paths using Gemini AI
- **Interview Simulator** - AI-powered mock interviews with feedback
- **Resume Builder** - Dynamic resume creation tool
- **Career Insights** - Market trends and career analytics
- **Community Platform** - User interaction and sharing

### 🔧 Technical Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Backend**: Express.js + Node.js
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: Google Gemini API + OpenAI API
- **Authentication**: Supabase Auth
- **State Management**: React Context + React Query

### 📡 API Endpoints
- `GET /health` - Server health check
- `POST /api/query` - Gemini OCR Q&A
- `POST /api/roadmap/generate` - OpenAI roadmap generation
- `POST /api/roadmap/generate-gemini` - Gemini roadmap generation

### 🎨 UI/UX Features
- **Responsive Design** - Mobile-first approach
- **Dark/Light Mode** - Theme switching
- **Smooth Animations** - Framer Motion integration
- **Interactive Components** - Shadcn/ui component library
- **Custom Branding** - Horizon logo and design system

### 🔐 Authentication & Security
- **User Registration/Login** - Supabase Auth integration
- **Protected Routes** - AuthGuard component
- **Profile Management** - User data persistence
- **API Security** - Environment variable protection

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- npm/yarn
- Supabase account
- Google Gemini API key
- OpenAI API key (optional)

### Environment Variables
```env
# Frontend (.env)
VITE_GEMINI_API_KEY=your_gemini_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:4000

# Backend (server/.env)
PORT=4000
CORS_ORIGIN=http://localhost:8080
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
```

### Running the Application
```bash
# Frontend
npm run dev          # Runs on http://localhost:8080

# Backend
cd server
npm run dev          # Runs on http://localhost:4000
```

## 📊 Project Status
✅ **Fully Functional** - All core features implemented and working
✅ **AI Integration** - Real Gemini AI generating personalized roadmaps
✅ **Database Connected** - Supabase integration complete
✅ **Authentication** - User login/registration working
✅ **Responsive Design** - Mobile and desktop optimized
✅ **Production Ready** - Error handling and fallbacks implemented

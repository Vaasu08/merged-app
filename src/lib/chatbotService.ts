// Using direct fetch to Gemini API like LinkedIn Analyzer

// Website knowledge base - comprehensive information about Horizon
const WEBSITE_KNOWLEDGE_BASE = `
# Horizon - AI-Powered Career Discovery Platform

## About Horizon
Horizon is an AI-powered career discovery platform that helps users discover their perfect career path through intelligent skill mapping and personalized career recommendations. It's built by passionate students from Maharaja Agrasen Institute of Technology.

## Core Features

### 1. Skill-Based Career Discovery
- Comprehensive skills database with 90+ skills across multiple categories
- AI-powered career matching algorithm that calculates match percentages
- 12 predefined career paths including:
  - Full Stack Developer
  - Data Scientist
  - DevOps Engineer
  - Frontend Developer
  - Backend Developer
  - Mobile App Developer
  - Machine Learning Engineer
  - Data Engineer
  - Cloud Architect
  - UI/UX Designer
  - QA/Test Automation Engineer
  - Cybersecurity Analyst
  - Product Manager

### 2. User Authentication & Profiles
- Supabase-powered authentication with email/password and magic links
- Comprehensive user profile management
- Skills persistence and synchronization across devices
- Protected routes with authentication guards

### 3. Industry Insights Dashboard
- Real-time job market trends visualization
- Salary ranges by career level and experience
- Skill demand and growth rate analysis
- Interactive charts showing industry trends

### 4. Job News Aggregator
- RSS feed integration from 40+ job sources
- Real-time job posting updates
- Advanced filtering and search capabilities
- Categories include: Remote, Tech, General, Startup, Developer, Community, News, International, Freelance

### 5. CV/Resume Analysis
- File upload support for TXT, PDF, CSV, JSON formats
- Intelligent skill extraction from documents
- Pattern matching and fallback algorithms
- Confidence scoring for parsed results

### 6. Career Planning Tools
- Step-by-step career roadmaps
- Resource recommendations (courses, tutorials, certifications)
- Progress tracking with completion status
- Export functionality (PDF and text formats)

## Technology Stack
- Frontend: React 18.3.1 with TypeScript, Vite
- UI: Tailwind CSS, Shadcn/ui components, Framer Motion
- Backend: Supabase (authentication, database)
- State Management: React Query, React Hook Form
- Charts: Recharts for data visualization
- Additional: Sonner for notifications, jsPDF for exports

## How It Works
1. Users input their skills through the skill input interface
2. Skills are matched against the career database using AI algorithms
3. Career recommendations are generated with match percentages
4. Users can explore detailed career paths with next steps and resources
5. Progress is tracked and persisted across sessions

## Career Guidance Features
- **Skill Assessment**: Users can input their current skills and get personalized career recommendations
- **Career Matching**: AI-powered algorithm matches user skills to suitable career paths
- **Career Paths Available**: 12 predefined career paths including Full Stack Developer, Data Scientist, DevOps Engineer, Frontend Developer, Backend Developer, Mobile App Developer, Machine Learning Engineer, Data Engineer, Cloud Architect, UI/UX Designer, QA/Test Automation Engineer, Cybersecurity Analyst, and Product Manager
- **Skill Gap Analysis**: Shows which skills users need to develop for specific careers
- **Learning Resources**: Provides courses, tutorials, and certifications for career development
- **Progress Tracking**: Users can track their progress through career development steps
- **Resume Building**: Built-in resume builder to help users create professional resumes
- **LinkedIn Analysis**: LinkedIn profile analysis tool for career optimization
- **Industry Insights**: Real-time job market trends and salary information
- **Job News**: Aggregated job postings from 40+ sources

## Key Pages
- Home (Index): Landing page with hero section and skill input
- Profile: User profile management and skills overview
- Insights: Industry trends and salary data dashboard
- Job News: Real-time job posting aggregator
- LinkedIn Analyzer: LinkedIn profile analysis tool
- Resume Builder: Resume creation and export tool
- Login/Signup: Authentication pages

## Contact Information
For any inquiries or support, users can reach out through the platform's contact features.

## Team
Built by students from Maharaja Agrasen Institute of Technology:
- Divyaansh: Frontend Developer
- Vaasu: Fullstack Developer  
- Mannat: Backend Developer

## Mission
Our mission is to help confused students find clarity, confidence, and direction in their career journey. We provide a one-stop AI-powered advisor that delivers career roadmaps, job trends, skill mapping, resume and LinkedIn support, higher studies guidance, and soft skills training.

## Common Questions the Chatbot Can Answer
- "How do I get career recommendations?" - Answer: Input your skills on the home page and click "Analyze My Career Path"
- "What career paths are available?" - Answer: We have 12 career paths including Full Stack Developer, Data Scientist, DevOps Engineer, and more
- "How does skill matching work?" - Answer: Our AI matches your skills against career requirements and shows match percentages
- "How do I track my progress?" - Answer: Complete steps in your career roadmap and mark them as done
- "What skills should I learn?" - Answer: Use our skill gap analysis to see which skills you need for specific careers
- "How do I build a resume?" - Answer: Use our Resume Builder tool in your profile
- "What job opportunities are available?" - Answer: Check our Job News section for real-time job postings
- "How do I analyze my LinkedIn?" - Answer: Use our LinkedIn Analyzer tool
- "What are the salary ranges?" - Answer: Check our Insights page for salary data by career and experience level
`;

export class ChatbotService {
  private apiKey: string;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY is required');
    }
    this.apiKey = apiKey;
    console.log('ChatbotService initialized with API key:', apiKey.substring(0, 10) + '...');
  }

  // Test API key validity
  async testApiKey(): Promise<boolean> {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello' }] }]
        })
      });
      return res.ok;
    } catch (error) {
      console.error('API key test failed:', error);
      return false;
    }
  }

  async processMessage(message: string): Promise<string> {
    try {
      console.log('Processing message:', message);
      console.log('API Key available:', !!this.apiKey);
      
      // Create a comprehensive prompt for the chatbot
      const prompt = `
You are a helpful and friendly chatbot for the Horizon career discovery platform. You should be conversational, helpful, and knowledgeable about career guidance and the Horizon platform.

WEBSITE KNOWLEDGE BASE:
${WEBSITE_KNOWLEDGE_BASE}

INSTRUCTIONS:
- Be helpful and conversational in your responses
- Answer questions about career guidance, skills, career paths, and how to use Horizon platform features
- For questions about Horizon's features, provide detailed and helpful information
- For general career questions, provide helpful guidance while mentioning Horizon's relevant features
- Keep responses concise but informative (2-3 sentences typically)
- Be friendly and encouraging

User Question: ${message}

Provide a helpful and conversational response:`;

      console.log('Sending prompt to Gemini:', prompt.substring(0, 200) + '...');
      
      // Use direct fetch like LinkedIn Analyzer
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, topP: 0.9 }
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Gemini API Error:', errorText);
        throw new Error(`Gemini request failed: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log('Full Gemini response:', data);
      
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!text) {
        console.error('No content in response:', data);
        throw new Error('No content returned by Gemini');
      }
      
      console.log('Raw Gemini response:', text);
      
      // Add contact information to every response
      const responseWithContact = `${text.trim()}\n\nFor further inquiries, please contact: horizon@gmail.com`;
      
      console.log('Returning Gemini response with contact:', responseWithContact);
      return responseWithContact;

    } catch (error) {
      console.error('Chatbot service error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'Unknown error type'
      });
      return "I'm sorry, I'm having trouble responding right now. Please try again in a moment!";
    }
  }
}

// Create a singleton instance
let chatbotService: ChatbotService | null = null;

export const getChatbotService = (): ChatbotService => {
  if (!chatbotService) {
    chatbotService = new ChatbotService();
  }
  return chatbotService;
};

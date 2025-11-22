// Enhanced Chatbot Service with advanced features

// Comprehensive website knowledge base - regularly updated
const WEBSITE_KNOWLEDGE_BASE = `
# Horizon - AI-Powered Career Discovery Platform

## About Horizon
Horizon is an advanced AI-powered career discovery platform that helps users discover their perfect career path through intelligent skill mapping, personalized career recommendations, and comprehensive career assessment tools. Built by passionate students from Maharaja Agrasen Institute of Technology (MAIT).

## Core Features

### 1. AI-Powered Career Assessment (NEW!)
- 10-question comprehensive career assessment
- Gemini AI-powered personalized job recommendations
- Scientific psychological profiling (MBTI, Big Five, Holland Code)
- 3-tier strategic career matching (88-94%, 78-85%, 70-76% match scores)
- 6 deeply personalized career recommendations with:
  - Detailed job descriptions (4-5 sentences)
  - 7-9 key skills required
  - Realistic salary ranges (Entry/Mid/Senior levels)
  - Industry growth rates with context
  - Detailed work environment descriptions
  - 5-6 personalized reasons based on your actual answers

### 2. Skill-Based Career Discovery
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

### 3. User Authentication & Profiles
- Supabase-powered authentication with email/password and magic links
- Comprehensive user profile management
- Skills persistence and synchronization across devices
- Protected routes with authentication guards
- Save and track your career recommendations

### 4. Industry Insights Dashboard
- Real-time job market trends visualization
- Salary ranges by career level and experience
- Skill demand and growth rate analysis
- Interactive charts showing industry trends
- 2025 market data for accurate career planning

### 5. CV/Resume Analysis & Builder
- File upload support for TXT, PDF, CSV, JSON formats
- Intelligent skill extraction from documents
- Pattern matching and fallback algorithms
- Confidence scoring for parsed results
- Professional resume builder with export options

### 6. Career Planning Tools
- Step-by-step career roadmaps
- Resource recommendations (courses, tutorials, certifications)
- Progress tracking with completion status
- Export functionality (PDF and text formats)
- Interview preparation modules

## Technology Stack
- Frontend: React 18.3.1 with TypeScript, Vite
- UI: Tailwind CSS, Shadcn/ui components, Framer Motion
- AI: Google Gemini 2.0 Flash for career recommendations
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
- **Industry Insights**: Real-time job market trends and salary information

## Key Pages
- Home (Index): Landing page with hero section and skill input
- Profile: User profile management and skills overview
- Insights: Industry trends and salary data dashboard
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
- "What are the salary ranges?" - Answer: Check our Insights page for salary data by career and experience level
`;

export class ChatbotService {
  private apiKey: string | null;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ VITE_GEMINI_API_KEY is missing. Chatbot AI features will not work.');
    }
    this.apiKey = apiKey || null;
    if (this.apiKey) {
      console.log('ChatbotService initialized with API key:', this.apiKey.substring(0, 10) + '...');
    }
  }

  private hasApiKey(): boolean {
    return this.apiKey !== null && this.apiKey.length > 0;
  }

  // Test API key validity
  async testApiKey(): Promise<boolean> {
    if (!this.hasApiKey()) {
      return false;
    }
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
    // If no API key, return a helpful message
    if (!this.hasApiKey()) {
      return `I'm sorry, but the AI chat feature requires an API key to be configured. However, I can still help you with basic information about Horizon:

**How to get career recommendations:**
- Input your skills on the home page and click "Analyze My Career Path"

**Available career paths:**
- We have 12 career paths including Full Stack Developer, Data Scientist, DevOps Engineer, Frontend Developer, Backend Developer, and more

**Key features:**
- AI-Powered Career Assessment
- Skill-Based Career Discovery
- Resume Builder
- Industry Insights Dashboard

Please configure VITE_GEMINI_API_KEY in your environment variables to enable full AI chat capabilities.`;
    }

    try {
      console.log('🤖 Processing message:', message);
      console.log('🔑 API Key available:', !!this.apiKey);
      
      // Create an enhanced, intelligent prompt for the chatbot
      const prompt = `You are Horizon AI Assistant - an expert, friendly, and enthusiastic career guidance chatbot for the Horizon platform. Your personality is warm, supportive, and knowledgeable.

═══════════════════════════════════════════════════════
📚 HORIZON PLATFORM KNOWLEDGE BASE:
═══════════════════════════════════════════════════════
${WEBSITE_KNOWLEDGE_BASE}

═══════════════════════════════════════════════════════
🎯 YOUR ROLE & CAPABILITIES:
═══════════════════════════════════════════════════════
You are here to help users:
1. **Discover Career Paths**: Guide them through our AI-powered career assessment
2. **Understand Features**: Explain how to use Horizon's tools (skill matching, insights, resume builder)
3. **Navigate Platform**: Help them find what they need quickly
4. **Career Guidance**: Provide general career advice while highlighting relevant Horizon features
5. **Answer Questions**: Be the friendly expert on all things Horizon

═══════════════════════════════════════════════════════
💡 RESPONSE GUIDELINES:
═══════════════════════════════════════════════════════
✓ **Be Enthusiastic**: Use emojis occasionally (🚀 💼 🎯 📊 ✨) to make responses engaging
✓ **Be Specific**: Mention exact features, page names, and tools when relevant
✓ **Be Actionable**: Tell users what to do next (e.g., "Click 'Test Career Assessment' on the homepage")
✓ **Be Concise**: 2-4 sentences for simple questions, more for complex ones
✓ **Be Encouraging**: Career discovery can be overwhelming - be supportive!
✓ **Use Examples**: When explaining features, give concrete examples
✓ **Format Well**: Use bullet points, bold text, or numbered lists when appropriate

✗ **Avoid**: Generic responses, vague information, or being overly formal

═══════════════════════════════════════════════════════
🎨 RESPONSE STYLE EXAMPLES:
═══════════════════════════════════════════════════════

Question: "How do I get career recommendations?"
Good Response: "Great question! 🎯 Horizon offers TWO powerful ways:

1. **AI Career Assessment** (Recommended!) - Take our 10-question assessment on the homepage by clicking 'Test Career Assessment'. You'll get 6 personalized job recommendations powered by Gemini AI with match scores, salary ranges, and reasons why each career fits YOU specifically.

2. **Skill-Based Matching** - Input your skills on the homepage, and we'll show you careers that match your skillset with percentage scores.

Both are free! Which would you like to try first?"

Question: "What is Horizon?"
Good Response: "Welcome to Horizon! 🚀 We're an AI-powered career discovery platform built by students from MAIT to help YOU find your perfect career path. 

We combine AI technology with comprehensive career data to give you personalized recommendations, salary insights, skill gap analysis, and career roadmaps - all in one place. Think of us as your personal career advisor that's available 24/7! 

Ready to discover your ideal career? Start with our career assessment!"

═══════════════════════════════════════════════════════
❓ USER'S QUESTION:
═══════════════════════════════════════════════════════
${message}

═══════════════════════════════════════════════════════
📝 YOUR RESPONSE (Be helpful, specific, and engaging):
═══════════════════════════════════════════════════════`;

      console.log('📤 Sending enhanced prompt to Gemini');
      
      // Use Gemini 2.0 Flash for better responses
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            temperature: 0.8, // Higher for more creative, engaging responses
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 1024
          }
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Gemini API Error:', errorText);
        throw new Error(`Gemini request failed: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log('✅ Gemini response received');
      
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!text) {
        console.error('❌ No content in response:', data);
        throw new Error('No content returned by Gemini');
      }
      
      console.log('📥 Raw Gemini response:', text.substring(0, 150) + '...');
      
      // Clean up the response and add helpful footer
      const cleanedResponse = text.trim();
      
      // Add a subtle footer with contact info
      const footer = `\n\n━━━━━━━━━━━━━━━━━━━━━━━━\n💬 Need more help? Email: horizon@gmail.com`;
      
      console.log('✨ Returning enhanced response');
      return cleanedResponse + footer;

    } catch (error) {
      console.error('❌ Chatbot service error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'Unknown error type'
      });
      
      // Return helpful fallback message with platform information
      return `I'm sorry, I'm having trouble connecting to the AI service right now. However, I can still help you with basic information about Horizon:

**How to get career recommendations:**
- Input your skills on the home page and click "Analyze My Career Path"
- Or take our AI Career Assessment for personalized recommendations

**Available features:**
- AI-Powered Career Assessment
- Skill-Based Career Discovery  
- Resume Builder with ATS Optimization
- Interview Simulator
- Career Roadmap Generator

**Need help?**
- Check our FAQ section
- Email: horizon@gmail.com

Please try again in a moment, or explore the features above while the AI service recovers!`;
    }
  }
}

// Create a singleton instance
let chatbotService: ChatbotService | null = null;

export const getChatbotService = (): ChatbotService | null => {
  try {
    if (!chatbotService) {
      chatbotService = new ChatbotService();
    }
    return chatbotService;
  } catch (error) {
    console.error('Failed to create ChatbotService:', error);
    return null;
  }
};
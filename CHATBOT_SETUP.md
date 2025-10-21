# Chatbot Setup Instructions

## Environment Variables Required

Create a `.env.local` file in your project root with the following variables:

```bash
# Gemini AI API Key (Required for chatbot functionality)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration (Already configured)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Getting Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Add it to your `.env.local` file

## Installation

1. Install the required dependency:
```bash
npm install @google/generative-ai
```

2. Start the development server:
```bash
npm run dev
```

## Features

The chatbot provides:
- Website-specific knowledge about Horizon platform
- Short, precise responses about features and functionality
- Fallback to contact email for irrelevant queries
- Floating chat widget accessible from all pages
- Smooth animations and responsive design

## Testing

Try asking the chatbot:
- "What is Horizon?"
- "How does the career matching work?"
- "What skills are available?"
- "How do I create an account?"

For queries outside the website scope, it will respond with the contact email.

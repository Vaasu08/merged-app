import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import OpenAI from 'openai'; // Modern OpenAI import (v4+)
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';


// ==================== ENV SETUP ====================
const PORT = process.env.PORT || 4000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Debug logging
console.log('🔍 Environment Variables Debug:');
console.log('SUPABASE_URL:', SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
console.log('GEMINI_API_KEY:', GEMINI_API_KEY ? '✅ Set' : '❌ Missing');
console.log('OPENAI_API_KEY:', OPENAI_API_KEY ? '✅ Set' : '❌ Missing');
console.log('');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Warning: Missing Supabase env. Database features will be disabled.');
  console.warn('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for full functionality.');
}
if (!GEMINI_API_KEY) {
  console.warn('Warning: Missing Gemini key. Set GEMINI_API_KEY for AI features.');
  console.warn('Roadmap generation will use fallback responses.');
}
if (!OPENAI_API_KEY) {
  console.warn('Warning: Missing OpenAI key. Roadmap generation will not work.');
}

// ==================== CLIENTS ====================
// Supabase admin client (only if env vars are provided)
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

// OpenAI client (for roadmap generation) - only if API key is provided
const openai = OPENAI_API_KEY ? new OpenAI({
  apiKey: OPENAI_API_KEY,
}) : null;

// ==================== EXPRESS APP ====================
const app = express();

// Enable CORS
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true }));

// Parse JSON with size limit
app.use(express.json({ limit: '2mb' }));

// Add response compression (lightweight, built-in optimization)
app.set('json spaces', 0); // Minimize JSON whitespace

// Request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(15000); // 15 second timeout
  next();
});

// ==================== VALIDATION SCHEMAS ====================
const QueryBodySchema = z.object({
  userId: z.string().min(1),
  question: z.string().min(1).max(4000),
  ocrText: z.string().min(1),
  metadata: z
    .object({
      documentName: z.string().optional(),
      language: z.string().optional(),
    })
    .optional(),
});

const RoadmapBodySchema = z.object({
  fields: z.array(z.string()).min(1),
  project: z.string(),
  days: z.number().min(30).max(365),
  checkpoints: z.boolean(),
  experience_level: z.string(),
  learning_style: z.string(),
  time_per_day: z.string(),
  goals: z.string(),
});

const QuizBodySchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  subtopic: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  numQuestions: z.number().min(1).max(20),
  duration: z.number().min(5).max(120),
});

const JobSearchSchema = z.object({
  what: z.string().min(1),
  where: z.string().optional(),
  results_per_page: z.number().optional(),
  page: z.number().optional(),
  sort_by: z.enum(['relevance', 'date', 'salary']).optional(),
  salary_min: z.number().optional(),
  max_days_old: z.number().optional(),
  country: z.string().optional(),
});

const SkillGraphBodySchema = z.object({
  text: z.string().min(1),
});

const SkillGraphSchema = z.object({
  nodes: z.array(z.object({ id: z.string(), group: z.string() })),
  links: z.array(z.object({ source: z.string(), target: z.string() })),
});

// ==================== CACHING ====================
const jobCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100;
let cacheHits = 0;
let cacheMisses = 0;

function getCacheKey(params) {
  // Normalize and create compact cache key
  const normalized = {
    q: (params.what || '').toLowerCase().trim(),
    l: (params.where || '').toLowerCase().trim(),
    p: params.page || 1,
    d: params.max_days_old || 30
  };
  return `${normalized.q}|${normalized.l}|${normalized.p}|${normalized.d}`;
}

function pruneCache() {
  // Remove oldest entries when cache is full
  if (jobCache.size >= MAX_CACHE_SIZE) {
    const entriesToRemove = Math.floor(MAX_CACHE_SIZE * 0.2); // Remove 20%
    const keys = Array.from(jobCache.keys());
    for (let i = 0; i < entriesToRemove; i++) {
      jobCache.delete(keys[i]);
    }
    console.log(`🧹 Pruned ${entriesToRemove} cache entries (${jobCache.size} remaining)`);
  }
}

function getCacheStats() {
  const total = cacheHits + cacheMisses;
  const hitRate = total > 0 ? ((cacheHits / total) * 100).toFixed(1) : 0;
  return { hits: cacheHits, misses: cacheMisses, hitRate: `${hitRate}%`, size: jobCache.size };
}

// ==================== ROUTES ====================

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// Cache statistics endpoint
app.get('/api/cache/stats', (_req, res) => {
  res.json(getCacheStats());
});

// ==================== EXISTING GEMINI QUERY ROUTE ====================
app.post('/api/query', async (req, res) => {
  const parse = QueryBodySchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid request', details: parse.error.flatten() });
  }
  const { userId, question, ocrText, metadata } = parse.data;

  try {
    const prompt = `You are a helpful assistant.
You will be given OCR-extracted document text and a user question.
Answer strictly based on the provided document text. If the answer is not present, say you cannot find it.

Document Text:
"""
${ocrText}
"""

Question: ${question}

Answer:`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, topP: 0.9 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const text = await geminiRes.text();
      throw new Error(`Gemini error ${geminiRes.status}: ${text}`);
    }
    const data = await geminiRes.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    if (!answer) throw new Error('Empty answer from Gemini');

    // Persist to Supabase if configured; otherwise skip persistence
    if (supabase) {
      const { error: insertError, data: inserted } = await supabase
        .from('gemini_responses')
        .insert({
          user_id: userId,
          question,
          ocr_text: ocrText,
          answer,
          metadata,
        })
        .select('*')
        .limit(1)
        .maybeSingle();

      if (insertError) throw insertError;

      return res.status(200).json({ answer, id: inserted?.id });
    }

    return res.status(200).json({ answer });
  } catch (err) {
    console.error('Query handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== NEW ROADMAP GENERATION ROUTE ====================
app.post('/api/roadmap/generate', async (req, res) => {
  // Validate request body
  const parse = RoadmapBodySchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ 
      error: 'Invalid request', 
      details: parse.error.flatten() 
    });
  }

  const { fields, project, days, checkpoints, experience_level, learning_style, time_per_day, goals } = parse.data;

  if (!openai) {
    return res.status(503).json({ 
      error: 'OpenAI service not configured',
      message: 'Please set OPENAI_API_KEY environment variable' 
    });
  }

  try {
    const prompt = `
Create a detailed, personalized learning roadmap for a student with the following profile:

Fields of Interest: ${fields.join(', ')}
Prior Project: ${project}
Timeframe: ${days} days
Include Checkpoints/Tests: ${checkpoints ? 'Yes' : 'No'}
Experience Level: ${experience_level}
Learning Style: ${learning_style}
Daily Time Commitment: ${time_per_day} hours
Goals: ${goals}

Generate a comprehensive roadmap with:
1. Weekly breakdown with specific topics and subtopics
2. Recommended resources (courses, books, documentation)
3. Hands-on projects for each phase
4. Skill checkpoints and assessments ${checkpoints ? '(include test details)' : ''}
5. Estimated time for each milestone
6. Prerequisites and learning path dependencies

Format as JSON:
{
  "title": "Personalized Roadmap Title",
  "overview": "2-3 sentence overview",
  "duration_days": ${days},
  "difficulty": "beginner/intermediate/advanced",
  "phases": [
    {
      "phase_number": 1,
      "title": "Phase name",
      "duration_days": X,
      "description": "What you'll learn",
      "topics": ["topic1", "topic2"],
      "resources": [
        {"type": "course", "name": "Resource name", "url": "optional url", "duration": "X hours"}
      ],
      "project": {"title": "Project name", "description": "What to build", "skills_practiced": []},
      "checkpoint": {"title": "Test/Assessment", "topics_covered": [], "estimated_time": "X hours"}
    }
  ],
  "final_project": {
    "title": "Capstone project name",
    "description": "Detailed description",
    "skills_required": [],
    "estimated_duration": "X days"
  },
  "next_steps": ["suggestion1", "suggestion2"]
}

Make it practical, actionable, and tailored to the user's background and goals.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert learning path designer and career coach. Create detailed, practical, and personalized learning roadmaps. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: "json_object" }
    });

    const roadmapText = response.choices[0]?.message?.content;
    if (!roadmapText) {
      throw new Error('Empty response from OpenAI');
    }

    const roadmap = JSON.parse(roadmapText);

    return res.status(200).json({
      success: true,
      roadmap: roadmap
    });
  } catch (error) {
    console.error('Error generating roadmap:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// ==================== ALTERNATIVE: GEMINI-BASED ROADMAP (Cost-effective) ====================
app.post('/api/roadmap/generate-gemini', async (req, res) => {
  const parse = RoadmapBodySchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid request', details: parse.error.flatten() });
  }

  const { fields, project, days, checkpoints, experience_level, learning_style, time_per_day, goals } = parse.data;

  console.log('🚀 Gemini API Route Debug:');
  console.log('GEMINI_API_KEY exists:', !!GEMINI_API_KEY);
  console.log('GEMINI_API_KEY length:', GEMINI_API_KEY ? GEMINI_API_KEY.length : 0);
  console.log('Request data:', { fields, project, days, checkpoints, experience_level, learning_style, time_per_day, goals });

  // Fallback response if no Gemini API key
  if (!GEMINI_API_KEY) {
    console.log('❌ Using fallback - no Gemini API key');
    const fallbackRoadmap = {
      title: `Personalized ${fields[0] || 'Career'} Development Roadmap`,
      overview: `A ${days}-day journey tailored to your ${experience_level} experience level in ${fields.join(', ')}`,
      duration_days: days,
      difficulty: experience_level === 'beginner' ? 'Beginner' : experience_level === 'intermediate' ? 'Intermediate' : 'Advanced',
      phases: [
        {
          phase_number: 1,
          title: 'Foundation Setup',
          duration_days: Math.ceil(days / 4),
          description: `Build your fundamental knowledge in ${fields[0] || 'your chosen field'}`,
          topics: ['Core concepts', 'Essential tools', 'Best practices'],
          resources: [
            { type: 'Course', name: 'Getting Started Guide', duration: '2 weeks' },
            { type: 'Documentation', name: 'Official Docs', duration: '1 week' }
          ],
          project: {
            title: 'Setup Project',
            description: 'Create your first project to apply what you learn',
            skills_practiced: ['Setup', 'Basic concepts', 'Tool usage']
          },
          checkpoint: checkpoints ? {
            title: 'Foundation Checkpoint',
            topics_covered: ['Core concepts', 'Tool setup'],
            estimated_time: '30 minutes'
          } : undefined
        },
        {
          phase_number: 2,
          title: 'Core Development',
          duration_days: Math.ceil(days / 3),
          description: 'Deep dive into practical implementation',
          topics: ['Advanced concepts', 'Real-world applications', 'Problem solving'],
          resources: [
            { type: 'Course', name: 'Advanced Topics', duration: '3 weeks' },
            { type: 'Practice', name: 'Exercises', duration: '2 weeks' }
          ],
          project: {
            title: 'Core Project',
            description: 'Build something substantial using core concepts',
            skills_practiced: ['Implementation', 'Problem solving', 'Best practices']
          },
          checkpoint: checkpoints ? {
            title: 'Core Checkpoint',
            topics_covered: ['Advanced concepts', 'Implementation'],
            estimated_time: '45 minutes'
          } : undefined
        },
        {
          phase_number: 3,
          title: 'Advanced Topics',
          duration_days: Math.ceil(days / 3),
          description: 'Master advanced techniques and specialization',
          topics: ['Specialized knowledge', 'Industry standards', 'Expert techniques'],
          resources: [
            { type: 'Course', name: 'Masterclass', duration: '2 weeks' },
            { type: 'Project', name: 'Capstone Prep', duration: '2 weeks' }
          ],
          project: {
            title: 'Advanced Project',
            description: 'Create an advanced project showcasing expertise',
            skills_practiced: ['Specialization', 'Expert techniques', 'Innovation']
          }
        },
        {
          phase_number: 4,
          title: 'Capstone & Portfolio',
          duration_days: Math.ceil(days / 4),
          description: 'Build your final showcase project',
          topics: ['Portfolio development', 'Presentation skills', 'Career readiness'],
          resources: [
            { type: 'Project', name: 'Capstone Project', duration: '2 weeks' },
            { type: 'Material', name: 'Portfolio Guide', duration: '1 week' }
          ],
          project: {
            title: 'Capstone Project',
            description: 'Create an impressive final project for your portfolio',
            skills_practiced: ['Full-stack development', 'Project management', 'Portfolio building']
          }
        }
      ],
      final_project: {
        title: 'Final Showcase Project',
        description: 'A comprehensive project demonstrating all your learned skills',
        skills_required: [...fields, 'Problem solving', 'Design thinking'],
        estimated_duration: '2-3 weeks'
      },
      next_steps: [
        'Complete your capstone project',
        'Build your portfolio',
        'Start applying for opportunities',
        'Continue learning and growing'
      ]
    };

    return res.status(200).json({
      success: true,
      roadmap: fallbackRoadmap,
      note: 'Generated using fallback template (add GEMINI_API_KEY for AI-generated roadmaps)'
    });
  }

  try {
    console.log('✅ Using Gemini API - making request to Google');
    const prompt = `
Create a detailed, personalized learning roadmap for a student with the following profile:

Fields of Interest: ${fields.join(', ')}
Prior Project: ${project}
Timeframe: ${days} days
Include Checkpoints/Tests: ${checkpoints ? 'Yes' : 'No'}
Experience Level: ${experience_level}
Learning Style: ${learning_style}
Daily Time Commitment: ${time_per_day} hours
Goals: ${goals}

Generate a comprehensive roadmap with weekly breakdown, resources, projects, and assessments.

Return ONLY valid JSON in this exact format:
{
  "title": "string",
  "overview": "string",
  "duration_days": ${days},
  "difficulty": "beginner|intermediate|advanced",
  "phases": [
    {
      "phase_number": 1,
      "title": "string",
      "duration_days": number,
      "description": "string",
      "topics": ["string"],
      "resources": [{"type": "string", "name": "string", "url": "string", "duration": "string"}],
      "project": {"title": "string", "description": "string", "skills_practiced": ["string"]},
      "checkpoint": {"title": "string", "topics_covered": ["string"], "estimated_time": "string"}
    }
  ],
  "final_project": {
    "title": "string",
    "description": "string",
    "skills_required": ["string"],
    "estimated_duration": "string"
  },
  "next_steps": ["string"]
}
`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            temperature: 0.7, 
            topP: 0.9,
            responseMimeType: "application/json" 
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const text = await geminiRes.text();
      throw new Error(`Gemini error ${geminiRes.status}: ${text}`);
    }

    const data = await geminiRes.json();
    const roadmapText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    if (!roadmapText) throw new Error('Empty roadmap from Gemini');

    const roadmap = JSON.parse(roadmapText);

    return res.status(200).json({
      success: true,
      roadmap: roadmap
    });
  } catch (error) {
    console.error('Error generating roadmap with Gemini:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// ==================== QUIZ GENERATION ROUTE ====================
app.post('/api/quiz/generate', async (req, res) => {
  const parse = QuizBodySchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid request', details: parse.error.flatten() });
  }

  const { topic, subtopic, difficulty, numQuestions, duration } = parse.data;

  // Fallback response if no Gemini API key
  if (!GEMINI_API_KEY) {
    const fallbackQuiz = {
      id: `quiz_${Date.now()}`,
      title: `${topic} ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Quiz`,
      description: `Test your knowledge of ${topic}${subtopic ? ` - ${subtopic}` : ''}`,
      questions: [
        {
          id: '1',
          question: `What is the primary purpose of ${topic}?`,
          options: [
            'Creating web applications',
            'Data manipulation and analysis',
            'Machine learning model training',
            'Game development'
          ],
          correctAnswer: 1,
          explanation: `${topic} is primarily used for data manipulation and analysis tasks.`
        },
        {
          id: '2',
          question: `Which function is commonly used in ${topic}?`,
          options: [
            'create_function()',
            'main_function()',
            'primary_function()',
            'core_function()'
          ],
          correctAnswer: 1,
          explanation: 'The main_function() is a standard pattern in this field.'
        },
        {
          id: '3',
          question: `How do you implement best practices in ${topic}?`,
          options: [
            'By following coding standards',
            'By using proper documentation',
            'By implementing error handling',
            'All of the above'
          ],
          correctAnswer: 3,
          explanation: 'Best practices include all of these elements.'
        },
        {
          id: '4',
          question: `What is the most important aspect of ${topic}?`,
          options: [
            'Speed',
            'Accuracy',
            'Simplicity',
            'Scalability'
          ],
          correctAnswer: 1,
          explanation: 'Accuracy is crucial for reliable results.'
        }
      ].slice(0, numQuestions),
      duration,
      difficulty,
      topic,
      subtopic,
    };

    return res.status(200).json({
      success: true,
      quiz: fallbackQuiz,
      note: 'Generated using fallback template (add GEMINI_API_KEY for AI-generated quizzes)'
    });
  }

  try {
    console.log('✅ Using Gemini API - generating quiz');
    const prompt = `
Create a ${difficulty} level quiz about ${topic}${subtopic ? ` focusing on ${subtopic}` : ''}.

Generate exactly ${numQuestions} multiple-choice questions with 4 options each.

Return ONLY valid JSON in this exact format:
{
  "id": "quiz_${Date.now()}",
  "title": "${topic} ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Quiz",
  "description": "Test your knowledge of ${topic}${subtopic ? ` - ${subtopic}` : ''}",
  "questions": [
    {
      "id": "1",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation of the correct answer"
    }
  ],
  "duration": ${duration},
  "difficulty": "${difficulty}",
  "topic": "${topic}",
  "subtopic": "${subtopic || ''}"
}

Make sure:
- correctAnswer is 0, 1, 2, or 3 (index of correct option)
- Questions are appropriate for ${difficulty} level
- Options are plausible but only one is correct
- Include helpful explanations
- Focus on practical knowledge and best practices
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const quizText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    if (!quizText) throw new Error('Empty quiz from Gemini');

    // Clean up the response - remove markdown code blocks if present
    let cleanQuizText = quizText;
    if (cleanQuizText.includes('```json')) {
      cleanQuizText = cleanQuizText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    if (cleanQuizText.includes('```')) {
      cleanQuizText = cleanQuizText.replace(/```\n?/g, '');
    }

    const quiz = JSON.parse(cleanQuizText);

    return res.status(200).json({
      success: true,
      quiz: quiz
    });
  } catch (error) {
    console.error('Error generating quiz with Gemini:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// ==================== ADZUNA JOB SEARCH PROXY ====================
app.post('/api/jobs/search', async (req, res) => {
  const startTime = Date.now();
  const parse = JobSearchSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid request', details: parse.error.flatten() });
  }

  const {
    what,
    where = '',
    results_per_page = 20,
    page = 1,
    sort_by = 'relevance',
    salary_min,
    max_days_old = 30,
    country = 'us'
  } = parse.data;

  // Check cache first
  const cacheKey = getCacheKey({ what, where, page, max_days_old });
  const cached = jobCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    cacheHits++;
    const age = Math.round((Date.now() - cached.timestamp) / 1000);
    console.log(`📦 Cache hit (${age}s old) | Stats:`, getCacheStats());
    return res.status(200).json(cached.data);
  }

  cacheMisses++;

  try {
    // RapidAPI credentials from environment
    const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
    const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'jsearch.p.rapidapi.com';
    if (!RAPIDAPI_KEY) {
      return res.status(503).json({ success: false, error: 'RapidAPI service not configured', message: 'Please set RAPIDAPI_KEY environment variable' });
    }
    
    // Build query parameters for JSearch API
    const queryParams = new URLSearchParams({
      query: `${what} ${where}`.trim(),
      page: page.toString(),
      num_pages: '1',
      date_posted: max_days_old <= 7 ? 'week' : max_days_old <= 30 ? 'month' : 'all'
    });

    const url = `https://${RAPIDAPI_HOST}/search?${queryParams.toString()}`;
    
    console.log('🔍 Fetching from RapidAPI:', { what, where, page });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
        'Accept': 'application/json',
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ RapidAPI error:', errorText);
      throw new Error(`RapidAPI error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform JSearch response to match our expected format (optimized)
    const transformedResults = (data.data || [])
      .slice(0, results_per_page)
      .map(job => ({
        id: job.job_id || `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: job.job_title || 'N/A',
        company: job.employer_name || 'N/A',
        location: {
          display_name: [job.job_city, job.job_state, job.job_country]
            .filter(Boolean)
            .join(', ') || 'Remote',
          area: [job.job_country, job.job_state, job.job_city].filter(Boolean)
        },
        description: job.job_description || 'No description available',
        salary_min: job.job_min_salary,
        salary_max: job.job_max_salary,
        salary_is_predicted: !job.job_salary_currency,
        contract_type: job.job_employment_type,
        contract_time: job.job_is_remote ? 'remote' : 'full_time',
        category: {
          label: job.job_occupation || 'General',
          tag: (job.job_occupation || 'general').toLowerCase().replace(/\s+/g, '-')
        },
        created: job.job_posted_at_datetime_utc || new Date().toISOString(),
        redirect_url: job.job_apply_link || job.job_google_link || '#'
      }));
    
    const result = {
      success: true,
      results: transformedResults,
      count: transformedResults.length,
      mean: 0
    };

    // Cache the result
    pruneCache();
    jobCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Fetched ${transformedResults.length} jobs (${duration}ms) | Stats:`, getCacheStats());
    
    return res.status(200).json(result);

  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error.name === 'AbortError') {
      console.error(`⏱️ Request timeout after ${duration}ms`);
      return res.status(504).json({
        success: false,
        error: 'Request timeout - please try again'
      });
    }
    
    console.error(`❌ Error after ${duration}ms:`, error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch jobs'
    });
  }
});

// ==================== SKILL GRAPH ROUTE ====================
app.post('/api/skill-graph', async (req, res) => {
  const parse = SkillGraphBodySchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid request', details: parse.error.flatten() });
  }

  const { text } = parse.data;

  try {
    if (!OPENAI_API_KEY) {
      return res.status(503).json({ error: 'OpenAI service not configured', message: 'Please set OPENAI_API_KEY environment variable' });
    }
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', 'You are a helpful assistant that extracts skills and their relationships from a given text and returns a skill graph in JSON format.'],
      ['human', 'Please extract the skills and their relationships from the following text:\n\n{text}\n\nReturn the skill graph in the format specified by the following JSON schema:\n\n{schema}'],
    ]);

    const llm = new ChatOpenAI({ model: 'gpt-4-turbo-preview', temperature: 0 });

    const structuredLLM = llm.withStructuredOutput(SkillGraphSchema);

    const skillGraph = await structuredLLM.invoke({
      text,
      schema: JSON.stringify(SkillGraphSchema.shape, null, 2),
    });

    return res.status(200).json(skillGraph);
  } catch (error) {
    console.error('Error generating skill graph:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`✅ Server listening on :${PORT}`);
  console.log(`📡 Available endpoints:`);
  console.log(`   GET  /health`);
  console.log(`   GET  /api/cache/stats`);
  console.log(`   POST /api/query (Gemini OCR Q&A)`);
  console.log(`   POST /api/roadmap/generate (OpenAI)`);
  console.log(`   POST /api/roadmap/generate-gemini (Gemini - Free)`);
  console.log(`   POST /api/quiz/generate (Gemini Quiz Generation)`);
  console.log(`   POST /api/jobs/search (RapidAPI JSearch Proxy - Cached)`);
  console.log(`   POST /api/skill-graph (Skill Graph Generation)`);
  console.log(`\n💾 Cache: ${MAX_CACHE_SIZE} entries max, ${CACHE_DURATION / 60000} min TTL`);
});

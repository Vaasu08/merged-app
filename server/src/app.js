import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { generateText, generateJSON, getCacheStats as getGeminiCacheStats, clearCache as clearGeminiCache } from './geminiClient.js';

// ==================== ENV SETUP ====================
const PORT = process.env.PORT || 4000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Debug logging
console.log('🔍 Environment Variables Debug:');
console.log('SUPABASE_URL:', SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
console.log('GEMINI_API_KEY:', GEMINI_API_KEY ? '✅ Set' : '❌ Missing');
console.log('');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Warning: Missing Supabase env. Database features will be disabled.');
  console.warn('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for full functionality.');
}
if (!GEMINI_API_KEY) {
  console.warn('Warning: Missing Gemini key. Set GEMINI_API_KEY for AI features.');
  console.warn('Roadmap generation will use fallback responses.');
}

// ==================== CLIENTS ====================
// Supabase admin client (only if env vars are provided)
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  : null;

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

// GET /api/scores - Return saved ATS scores (placeholder for now)
app.get('/api/scores', (_req, res) => {
  // Return empty array as we're not persisting scores yet
  res.json([]);
});

// Cache statistics endpoint
app.get('/api/cache/stats', (_req, res) => {
  const jobCacheStats = getCacheStats();
  const geminiCacheStats = getGeminiCacheStats();

  res.json({
    jobCache: jobCacheStats,
    geminiCache: geminiCacheStats,
  });
});

// Clear Gemini cache endpoint (for debugging/admin)
app.post('/api/cache/clear', (_req, res) => {
  clearGeminiCache();
  res.json({ success: true, message: 'Gemini cache cleared' });
});

// ==================== OPTIMIZED GEMINI QUERY ROUTE ====================
app.post('/api/query', async (req, res) => {
  const parse = QueryBodySchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid request', details: parse.error.flatten() });
  }
  const { userId, question, ocrText, metadata } = parse.data;

  try {
    const prompt = `You are a helpful assistant analyzing document content.
Answer the user's question strictly based on the provided document text.
If the answer is not present, clearly state that you cannot find it in the document.

Document Text:
"""
${ocrText}
"""

Question: ${question}

Provide a clear, concise answer:`;

    // Use optimized Gemini client with caching and retry logic
    const answer = await generateText(prompt, {
      temperature: 0.2,
      maxOutputTokens: 1024,
      useCache: true,
    });

    if (!answer) throw new Error('Empty answer from Gemini');

    // Persist to Supabase (if available)
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

      if (insertError) console.warn('Supabase insert warning:', insertError);

      return res.status(200).json({ answer, id: inserted?.id });
    }

    return res.status(200).json({ answer });
  } catch (err) {
    console.error('Query handler error:', err);
    console.warn('⚠️ Returning fallback answer due to API error');
    // Return fallback answer instead of error
    return res.status(200).json({
      answer: 'I apologize, but I am currently unable to process this request. Please try again later or rephrase your question.',
      note: 'Fallback response due to API error'
    });
  }
});

// ==================== GEMINI-BASED ROADMAP GENERATION ====================
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

Return ONLY valid JSON with no markdown code blocks or additional text. Use this exact format:
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

    // Use optimized Gemini client with automatic JSON parsing
    const roadmap = await generateJSON(prompt, {
      temperature: 0.7,
      maxOutputTokens: 3000,
      useCache: true,
    });

    return res.status(200).json({
      success: true,
      roadmap: roadmap
    });
  } catch (error) {
    console.error('Error generating roadmap with Gemini:', error);
    console.warn('⚠️ Returning fallback roadmap due to API error');
    // Return fallback roadmap instead of error
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
      note: 'Generated using fallback template due to API error'
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

Return ONLY valid JSON with no markdown code blocks or additional text. Use this exact format:
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

    // Use optimized Gemini client with automatic JSON parsing
    const quiz = await generateJSON(prompt, {
      temperature: 0.7,
      maxOutputTokens: 2048,
      useCache: true,
    });

    return res.status(200).json({
      success: true,
      quiz: quiz
    });
  } catch (error) {
    console.error('Error generating quiz with Gemini:', error);
    console.warn('⚠️ Returning fallback quiz due to API error');
    // Return fallback quiz instead of error
    const fallbackQuiz = {
      id: `quiz_${Date.now()}`,
      title: `${topic} ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Quiz`,
      description: `Test your knowledge of ${topic}${subtopic ? ` - ${subtopic}` : ''}`,
      questions: Array.from({ length: Math.min(numQuestions, 10) }, (_, i) => ({
        id: (i + 1).toString(),
        question: `Question ${i + 1} about ${topic}?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: i % 4,
        explanation: `This is a placeholder explanation for question ${i + 1}.`
      })),
      duration,
      difficulty,
      topic,
      subtopic: subtopic || ''
    };
    return res.status(200).json({
      success: true,
      quiz: fallbackQuiz,
      note: 'Generated using fallback template due to API error'
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
    // RapidAPI credentials (can be overridden with RAPIDAPI_KEY env var)
    const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'c5b9bfa7fbmshf020f8d59db3005p1d3fabjsn350c18b182ae';
    const RAPIDAPI_HOST = 'jsearch.p.rapidapi.com';

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
      // Return empty results instead of error
      return res.status(200).json({
        success: true,
        results: [],
        count: 0,
        mean: 0,
        note: 'Request timeout - returned empty results'
      });
    }

    console.error(`❌ Error after ${duration}ms:`, error.message);
    // Return empty results as fallback instead of error
    console.warn('⚠️ Returning fallback empty job results due to API error');
    return res.status(200).json({
      success: true,
      results: [],
      count: 0,
      mean: 0,
      note: 'Unable to fetch jobs - returned empty results'
    });
  }
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`✅ Server listening on :${PORT}`);
  console.log(`📡 Available endpoints:`);
  console.log(`   GET  /health`);
  console.log(`   GET  /api/cache/stats`);
  console.log(`   POST /api/query (Gemini OCR Q&A)`);
  console.log(`   POST /api/roadmap/generate-gemini (Gemini Roadmap Generation)`);
  console.log(`   POST /api/quiz/generate (Gemini Quiz Generation)`);
  console.log(`   POST /api/jobs/search (RapidAPI JSearch Proxy - Cached)`);
  console.log(`\n💾 Cache: ${MAX_CACHE_SIZE} entries max, ${CACHE_DURATION / 60000} min TTL`);
});

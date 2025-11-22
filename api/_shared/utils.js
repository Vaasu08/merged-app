// Shared utilities for Vercel serverless functions
import { z } from 'zod';

// Export validation schemas
export const QueryBodySchema = z.object({
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

export const RoadmapBodySchema = z.object({
  fields: z.array(z.string()).min(1),
  project: z.string(),
  days: z.number().min(30).max(365),
  checkpoints: z.boolean(),
  experience_level: z.string(),
  learning_style: z.string(),
  time_per_day: z.string(),
  goals: z.string(),
});

export const QuizBodySchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  subtopic: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  numQuestions: z.number().min(1).max(20),
  duration: z.number().min(5).max(120),
});

export const JobSearchSchema = z.object({
  what: z.string().min(1),
  where: z.string().optional(),
  results_per_page: z.number().optional(),
  page: z.number().optional(),
  sort_by: z.enum(['relevance', 'date', 'salary']).optional(),
  salary_min: z.number().optional(),
  max_days_old: z.number().optional(),
  country: z.string().optional(),
});

// CORS headers helper
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Helper to handle CORS preflight
export function handleCors(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return true;
  }
  return false;
}

// Error response helper
export function sendError(res, status, message) {
  res.writeHead(status, { ...corsHeaders, 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: message, success: false }));
}

// Success response helper
export function sendSuccess(res, data, status = 200) {
  res.writeHead(status, { ...corsHeaders, 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ...data, success: true }));
}









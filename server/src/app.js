import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Env
const PORT = process.env.PORT || 4000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // server-only
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // server-only

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // eslint-disable-next-line no-console
  console.error('Missing Supabase env. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (!GEMINI_API_KEY) {
  // eslint-disable-next-line no-console
  console.error('Missing Gemini key. Set GEMINI_API_KEY');
  process.exit(1);
}

// Supabase admin client (service role)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true }));
app.use(express.json({ limit: '2mb' }));

// Schema validation
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

// Route
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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

    // Persist to Supabase
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
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Query handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on :${PORT}`);
});



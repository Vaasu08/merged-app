/**
 * Centralized Gemini AI Service for Frontend
 * Provides optimized, reusable methods for interacting with Google's Gemini API
 * Features: Retry logic, caching, error handling, type safety
 */

import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';

// ==================== CONFIGURATION ====================
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const DEFAULT_MODEL = 'gemini-2.0-flash-exp';
const ALTERNATIVE_MODEL = 'gemini-1.5-flash';

// Cache for API responses
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const responseCache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Rate limiting
let requestCount = 0;
let requestResetTime = Date.now() + 60000;

// ==================== TYPES ====================
export interface GeminiOptions {
  model?: string;
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  useCache?: boolean;
  systemInstruction?: string;
}

export interface GeminiResponse<T = string> {
  data: T;
  cached: boolean;
  duration: number;
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Generate cache key based on model, prompt, and config
 */
function getCacheKey(model: string, prompt: string, options: GeminiOptions): string {
  const configStr = JSON.stringify(options);
  // Use full prompt hash instead of substring to avoid cache collisions
  // Create a simple hash from the prompt to keep key manageable
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `${model}:${hash}:${configStr}`;
}

/**
 * Clean expired cache entries
 */
function cleanCache(): void {
  const now = Date.now();
  for (const [key, entry] of responseCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      responseCache.delete(key);
    }
  }
}

/**
 * Rate limiting check
 */
function checkRateLimit(): void {
  const now = Date.now();
  if (now > requestResetTime) {
    requestCount = 0;
    requestResetTime = now + 60000;
  }
  
  requestCount++;
  
  if (requestCount > 60) {
    throw new Error('Rate limit exceeded. Please try again in a moment.');
  }
}

/**
 * Retry logic with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const isLastAttempt = attempt === maxRetries - 1;
      
      // Don't retry on client errors (4xx)
      if (typeof error === 'object' && error !== null && 'status' in error) {
        const status = (error as { status: number }).status;
        if (status >= 400 && status < 500) {
          throw error;
        }
      }
      
      if (isLastAttempt) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`⚠️ Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Parse JSON response, handling markdown code blocks
 */
function parseJSONResponse(text: string): unknown {
  let cleanText = text.trim();
  
  if (cleanText.includes('```json')) {
    cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  } else if (cleanText.includes('```')) {
    cleanText = cleanText.replace(/```\n?/g, '');
  }
  
  return JSON.parse(cleanText);
}

// ==================== GEMINI SERVICE CLASS ====================

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private defaultModel: string;

  constructor(apiKey: string = GEMINI_API_KEY, defaultModel: string = DEFAULT_MODEL) {
    if (!apiKey) {
      throw new Error('Gemini API key not configured. Set VITE_GEMINI_API_KEY environment variable.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.defaultModel = defaultModel;
  }

  /**
   * Get a generative model instance
   */
  private getModel(modelName: string = this.defaultModel): GenerativeModel {
    return this.genAI.getGenerativeModel({ model: modelName });
  }

  /**
   * Generate text content
   */
  async generateText(
    prompt: string,
    options: GeminiOptions = {}
  ): Promise<GeminiResponse<string>> {
    const startTime = Date.now();
    const {
      model = this.defaultModel,
      temperature = 0.7,
      topK = 40,
      topP = 0.95,
      maxOutputTokens = 2048,
      useCache = true,
    } = options;

    // Check rate limit
    checkRateLimit();

    // Check cache
    if (useCache) {
      const cacheKey = getCacheKey(model, prompt, options);
      const cached = responseCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log('📦 Using cached Gemini response');
        return {
          data: cached.data as string,
          cached: true,
          duration: Date.now() - startTime,
        };
      }
    }

    // Clean cache periodically
    if (Math.random() < 0.1) {
      cleanCache();
    }

    const generationConfig: GenerationConfig = {
      temperature,
      topK,
      topP,
      maxOutputTokens,
    };

    const modelInstance = this.getModel(model);

    // Make API call with retry logic
    const result = await retryWithBackoff(async () => {
      const response = await modelInstance.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });
      
      return response;
    });

    const text = result.response.text();
    
    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    // Cache successful response
    if (useCache) {
      const cacheKey = getCacheKey(model, prompt, options);
      responseCache.set(cacheKey, {
        data: text,
        timestamp: Date.now(),
      });
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Gemini API call completed in ${duration}ms`);

    return {
      data: text,
      cached: false,
      duration,
    };
  }

  /**
   * Generate JSON content with automatic parsing
   */
  async generateJSON<T = unknown>(
    prompt: string,
    options: GeminiOptions = {}
  ): Promise<GeminiResponse<T>> {
    const response = await this.generateText(prompt, {
      ...options,
      maxOutputTokens: options.maxOutputTokens || 3000,
    });

    try {
      const jsonData = parseJSONResponse(response.data);
      
      // Validate that we got actual data
      if (!jsonData || (typeof jsonData === 'object' && Object.keys(jsonData).length === 0)) {
        console.error('Empty or invalid JSON response from Gemini');
        throw new Error('Empty response from Gemini API');
      }
      
      return {
        data: jsonData as T,
        cached: response.cached,
        duration: response.duration,
      };
    } catch (error) {
      console.error('❌ Failed to parse JSON response from Gemini');
      console.error('Raw response (first 500 chars):', response.data.substring(0, 500));
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON format from Gemini: ${error.message}`);
      }
      throw error instanceof Error ? error : new Error('Invalid JSON response from Gemini');
    }
  }

  /**
   * Generate content with streaming
   */
  async* generateStream(
    prompt: string,
    options: GeminiOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    const {
      model = this.defaultModel,
      temperature = 0.7,
      topK = 40,
      topP = 0.95,
      maxOutputTokens = 2048,
    } = options;

    checkRateLimit();

    const generationConfig: GenerationConfig = {
      temperature,
      topK,
      topP,
      maxOutputTokens,
    };

    const modelInstance = this.getModel(model);

    const result = await modelInstance.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    });

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        yield chunkText;
      }
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    cleanCache();
    return {
      size: responseCache.size,
      maxSize: 100,
      ttl: CACHE_TTL,
      requestCount,
      requestsRemaining: Math.max(0, 60 - requestCount),
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    responseCache.clear();
    console.log('🗑️ Gemini cache cleared');
  }
}

// ==================== SINGLETON INSTANCE ====================
const geminiService = new GeminiService();

export default geminiService;

// ==================== EXPORTS ====================
export { GeminiService, DEFAULT_MODEL, ALTERNATIVE_MODEL };

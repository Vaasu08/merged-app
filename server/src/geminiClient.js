/**
 * Centralized Gemini AI Client
 * Provides optimized, reusable methods for interacting with Google's Gemini API
 * Features: Retry logic, caching, error handling, response streaming
 */

// ==================== CONFIGURATION ====================
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-2.0-flash-exp';
const ALTERNATIVE_MODEL = 'gemini-1.5-flash'; // Fallback model

// Cache for API responses (in-memory for now)
const responseCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Rate limiting
let requestCount = 0;
let requestResetTime = Date.now() + 60000; // Reset every minute

// ==================== UTILITY FUNCTIONS ====================

/**
 * Generate cache key from request parameters
 */
function getCacheKey(model, prompt, config) {
  const configStr = JSON.stringify(config);
  return `${model}:${prompt.substring(0, 100)}:${configStr}`;
}

/**
 * Check and clean expired cache entries
 */
function cleanCache() {
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
function checkRateLimit() {
  const now = Date.now();
  if (now > requestResetTime) {
    requestCount = 0;
    requestResetTime = now + 60000;
  }
  
  requestCount++;
  
  // Allow up to 60 requests per minute (Gemini free tier limit)
  if (requestCount > 60) {
    throw new Error('Rate limit exceeded. Please try again in a moment.');
  }
}

/**
 * Retry logic with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;
      
      // Don't retry on client errors (4xx)
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      if (isLastAttempt) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`⚠️ Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Parse JSON response, handling markdown code blocks
 */
function parseJSONResponse(text) {
  let cleanText = text.trim();
  
  // Remove markdown code blocks if present
  if (cleanText.includes('```json')) {
    cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  } else if (cleanText.includes('```')) {
    cleanText = cleanText.replace(/```\n?/g, '');
  }
  
  return JSON.parse(cleanText);
}

// ==================== CORE API CLIENT ====================

/**
 * Main function to call Gemini API
 * @param {string} prompt - The prompt to send
 * @param {object} options - Configuration options
 * @returns {Promise<object>} - API response
 */
async function generateContent(prompt, options = {}) {
  if (!GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY not configured, returning fallback response');
    // Return fallback response structure
    return {
      candidates: [{
        content: {
          parts: [{
            text: 'AI service unavailable. Please configure GEMINI_API_KEY.'
          }]
        }
      }]
    };
  }
  
  const {
    model = DEFAULT_MODEL,
    temperature = 0.7,
    topK = 40,
    topP = 0.95,
    maxOutputTokens = 2048,
    responseMimeType = 'application/json',
    useCache = true,
    systemInstruction = null,
  } = options;
  
  // Check rate limit
  try {
    checkRateLimit();
  } catch (error) {
    console.warn('⚠️ Rate limit exceeded, returning fallback response');
    return {
      candidates: [{
        content: {
          parts: [{
            text: 'Rate limit exceeded. Please try again in a moment.'
          }]
        }
      }]
    };
  }
  
  // Check cache
  if (useCache) {
    const cacheKey = getCacheKey(model, prompt, options);
    const cached = responseCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('📦 Using cached Gemini response');
      return cached.data;
    }
  }
  
  // Clean old cache entries periodically
  if (Math.random() < 0.1) {
    cleanCache();
  }
  
  const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`;
  
  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature,
      topK,
      topP,
      maxOutputTokens,
      responseMimeType,
    },
  };
  
  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }
  
  // Make API call with retry logic
  try {
    const response = await retryWithBackoff(async () => {
      const startTime = Date.now();
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      const duration = Date.now() - startTime;
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const error = new Error(
          errorData.error?.message || `Gemini API error: ${res.status}`
        );
        error.status = res.status;
        error.details = errorData;
        throw error;
      }
      
      const data = await res.json();
      console.log(`✅ Gemini API call completed in ${duration}ms`);
      
      return data;
    });
    
    // Cache successful response
    if (useCache) {
      const cacheKey = getCacheKey(model, prompt, options);
      responseCache.set(cacheKey, {
        data: response,
        timestamp: Date.now(),
      });
    }
    
    return response;
  } catch (error) {
    console.error('❌ Gemini API call failed:', error);
    console.warn('⚠️ Returning fallback response');
    // Return fallback response structure
    return {
      candidates: [{
        content: {
          parts: [{
            text: 'AI service encountered an error. Please try again later or check your API configuration.'
          }]
        }
      }]
    };
  }
}

/**
 * Generate content and extract text from response
 * @param {string} prompt - The prompt to send
 * @param {object} options - Configuration options
 * @returns {Promise<string>} - Extracted text
 */
async function generateText(prompt, options = {}) {
  try {
    const response = await generateContent(prompt, {
      ...options,
      responseMimeType: 'text/plain',
    });
    
    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    
    if (!text) {
      console.warn('⚠️ Empty response from Gemini, returning fallback message');
      return 'AI service returned an empty response. Please try again.';
    }
    
    return text;
  } catch (error) {
    console.error('❌ Error in generateText:', error);
    return 'AI service encountered an error. Please try again later.';
  }
}

/**
 * Generate JSON content with automatic parsing
 * @param {string} prompt - The prompt to send
 * @param {object} options - Configuration options
 * @returns {Promise<object>} - Parsed JSON object
 */
async function generateJSON(prompt, options = {}) {
  try {
    const response = await generateContent(prompt, {
      ...options,
      responseMimeType: 'application/json',
    });
    
    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    
    if (!text) {
      console.warn('⚠️ Empty response from Gemini, returning fallback empty object');
      return {};
    }
    
    try {
      return parseJSONResponse(text);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.warn('⚠️ Returning fallback empty object');
      return {};
    }
  } catch (error) {
    console.error('❌ Error in generateJSON:', error);
    return {};
  }
}

/**
 * Generate content with streaming (for long responses)
 * Note: Requires different API endpoint (streamGenerateContent)
 * @param {string} prompt - The prompt to send
 * @param {function} onChunk - Callback for each chunk
 * @param {object} options - Configuration options
 */
async function generateStreamingContent(prompt, onChunk, options = {}) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  
  const { model = DEFAULT_MODEL } = options;
  const url = `${GEMINI_BASE_URL}/${model}:streamGenerateContent?key=${GEMINI_API_KEY}&alt=sse`;
  
  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: options.temperature || 0.7,
      topK: options.topK || 40,
      topP: options.topP || 0.95,
      maxOutputTokens: options.maxOutputTokens || 2048,
    },
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API error: ${response.status}`);
  }
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (text) {
            fullText += text;
            onChunk(text);
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }
  
  return fullText;
}

/**
 * Get cache statistics
 */
function getCacheStats() {
  cleanCache();
  return {
    size: responseCache.size,
    maxSize: 100, // Soft limit
    ttl: CACHE_TTL,
    requestCount,
    requestsRemaining: Math.max(0, 60 - requestCount),
  };
}

/**
 * Clear all cached responses
 */
function clearCache() {
  responseCache.clear();
  console.log('🗑️ Gemini cache cleared');
}

// ==================== EXPORTS ====================

export {
  generateContent,
  generateText,
  generateJSON,
  generateStreamingContent,
  getCacheStats,
  clearCache,
  DEFAULT_MODEL,
  ALTERNATIVE_MODEL,
};

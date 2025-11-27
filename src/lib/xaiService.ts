/**
 * xAI (Grok) Service for ATS Resume Scoring
 * Uses the xAI API with Grok model for intelligent resume analysis
 */

interface XAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface XAIOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

class XAIService {
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1';
  private defaultModel = 'llama-3.3-70b-versatile';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateJSON<T>(prompt: string, options: XAIOptions = {}): Promise<{ data: T; usage: XAIResponse['usage'] }> {
    const { temperature = 0.2, maxTokens = 4096, model = this.defaultModel } = options;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert ATS (Applicant Tracking System) analyzer. Always respond with valid JSON only, no markdown code blocks or additional text.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('xAI API error:', response.status, errorText);
        throw new Error(`xAI API error: ${response.status} - ${errorText}`);
      }

      const result: XAIResponse = await response.json();
      
      if (!result.choices || result.choices.length === 0) {
        throw new Error('No response from xAI API');
      }

      const content = result.choices[0].message.content;
      
      // Clean the response - remove markdown code blocks if present
      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.slice(7);
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.slice(3);
      }
      if (cleanedContent.endsWith('```')) {
        cleanedContent = cleanedContent.slice(0, -3);
      }
      cleanedContent = cleanedContent.trim();

      const data = JSON.parse(cleanedContent) as T;

      return {
        data,
        usage: result.usage
      };
    } catch (error) {
      console.error('xAI Service Error:', error);
      throw error;
    }
  }

  async generateText(prompt: string, options: XAIOptions = {}): Promise<string> {
    const { temperature = 0.7, maxTokens = 1024, model = this.defaultModel } = options;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`xAI API error: ${response.status}`);
    }

    const result: XAIResponse = await response.json();
    return result.choices[0]?.message?.content || '';
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.generateText('Say "ok" if you can hear me.', { maxTokens: 10 });
      return response.length > 0;
    } catch (error) {
      console.error('xAI connection test failed:', error);
      return false;
    }
  }
}

// Create singleton with API key from environment variable (GROQ API)
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

if (!GROQ_API_KEY) {
  console.warn('⚠️ VITE_GROQ_API_KEY is not set in .env file. AI scoring will use fallback.');
}

export const xaiService = new XAIService(GROQ_API_KEY);
export default xaiService;

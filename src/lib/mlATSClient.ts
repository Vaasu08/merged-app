// ML Backend API Client
// TypeScript types and API integration

export interface ATSScoreBreakdown {
  keywords: number;
  experience: number;
  formatting: number;
  skills: number;
  structure: number;
}

export interface ATSSuggestion {
  category: 'keywords' | 'experience' | 'formatting' | 'skills' | 'structure';
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
}

export interface ATSScoreResponse {
  overall_score: number;
  confidence: number;
  breakdown: ATSScoreBreakdown;
  suggestions: ATSSuggestion[];
  model_version: string;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  version: string;
}

/**
 * ML-powered ATS Score API Client
 */
export class MLATSClient {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:8000') {
    this.baseURL = baseURL;
  }

  /**
   * Check if ML backend is healthy
   */
  async checkHealth(): Promise<HealthResponse> {
    const response = await fetch(`${this.baseURL}/health`);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Get ATS score for uploaded resume file
   */
  async scoreResume(
    file: File,
    jobDescription?: string
  ): Promise<ATSScoreResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (jobDescription) {
      formData.append('job_description', jobDescription);
    }

    const response = await fetch(`${this.baseURL}/api/ats-score`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Failed to score resume: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get ATS score from resume text
   */
  async scoreResumeText(
    resumeText: string,
    jobDescription?: string
  ): Promise<ATSScoreResponse> {
    const response = await fetch(`${this.baseURL}/api/ats-score-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resume_text: resumeText,
        job_description: jobDescription,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Failed to score resume: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Check if ML backend is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const health = await this.checkHealth();
      return health.status === 'healthy';
    } catch {
      return false;
    }
  }

  /**
   * Check if ML model is loaded
   */
  async isModelLoaded(): Promise<boolean> {
    try {
      const health = await this.checkHealth();
      return health.model_loaded;
    } catch {
      return false;
    }
  }
}

/**
 * Default ML client instance
 */
export const mlATSClient = new MLATSClient();

/**
 * Get color for score value
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Get background color for score value
 */
export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-100';
  if (score >= 60) return 'bg-yellow-100';
  return 'bg-red-100';
}

/**
 * Get priority color for suggestion
 */
export function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'high':
      return 'text-red-600 bg-red-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'low':
      return 'text-blue-600 bg-blue-100';
  }
}

/**
 * Format confidence as percentage
 */
export function formatConfidence(confidence: number): string {
  return `${(confidence * 100).toFixed(0)}%`;
}

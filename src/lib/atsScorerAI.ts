import { ParsedCV } from './cvParser';
import { GeminiService } from './geminiService';

interface ATSScores {
  overall: number;
  keywordMatch: number;
  skillsMatch: number;
  experience: number;
  education: number;
  formatting: number;
  grade: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: Suggestion[];
}

interface Suggestion {
  type: string;
  priority: 'high' | 'medium' | 'low';
  message: string;
}

interface GeminiATSAnalysis {
  overall_score: number;
  keyword_match_score: number;
  skills_match_score: number;
  experience_score: number;
  education_score: number;
  formatting_score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  suggestions: Array<{
    type: string;
    priority: 'high' | 'medium' | 'low';
    message: string;
  }>;
}

export class ATSScorerAI {
  private apiKey: string | null;
  private geminiService: GeminiService | null;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ VITE_GEMINI_API_KEY is missing. AI-powered ATS scoring will use fallback scoring.');
      this.apiKey = null;
      this.geminiService = null;
    } else {
      this.apiKey = apiKey;
      try {
        this.geminiService = new GeminiService(apiKey);
      } catch (error) {
        console.error('Failed to initialize GeminiService:', error);
        this.geminiService = null;
        this.apiKey = null;
      }
    }
  }

  private hasApiKey(): boolean {
    return this.apiKey !== null && this.apiKey.length > 0 && this.geminiService !== null;
  }

  async calculateScore(
    resumeData: ParsedCV,
    jobDescription?: string
  ): Promise<ATSScores> {
    // If no API key, use fallback scorer
    if (!this.hasApiKey()) {
      console.warn('⚠️ API key not available, falling back to rule-based scoring');
      return ATSScorerFallback.calculateScore(resumeData, jobDescription);
    }

    try {
      console.log('🤖 Using Gemini AI for ATS scoring...');
      
      const analysis = await this.analyzeWithGemini(resumeData, jobDescription);
      
      // Validate and format the response
      const suggestions = this.formatSuggestions(analysis.suggestions || []);
      
      console.log('✅ Gemini analysis complete:', {
        overall: analysis.overall_score,
        suggestionsCount: suggestions.length,
        matchedKeywords: analysis.matched_keywords?.length || 0,
        missingKeywords: analysis.missing_keywords?.length || 0
      });
      
      return {
        overall: Math.round(analysis.overall_score || 0),
        keywordMatch: Math.round(analysis.keyword_match_score || 0),
        skillsMatch: Math.round(analysis.skills_match_score || 0),
        experience: Math.round(analysis.experience_score || 0),
        education: Math.round(analysis.education_score || 0),
        formatting: Math.round(analysis.formatting_score || 0),
        grade: this.getGrade(analysis.overall_score || 0),
        matchedKeywords: Array.isArray(analysis.matched_keywords) ? analysis.matched_keywords : [],
        missingKeywords: Array.isArray(analysis.missing_keywords) ? analysis.missing_keywords : [],
        suggestions: suggestions
      };
    } catch (error) {
      console.error('❌ Gemini ATS scoring failed:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      // Fall back to rule-based scoring instead of throwing
      console.warn('⚠️ Falling back to rule-based scoring');
      return ATSScorerFallback.calculateScore(resumeData, jobDescription);
    }
  }

  private async analyzeWithGemini(
    resumeData: ParsedCV,
    jobDescription?: string
  ): Promise<GeminiATSAnalysis> {
    if (!this.apiKey || !this.geminiService) {
      throw new Error('API key is required');
    }
    
    try {
      console.log('📡 Sending request to Gemini API...');
      const prompt = this.buildAnalysisPrompt(resumeData, jobDescription);
      
      // Use optimized Gemini service with caching and retry logic
      const response = await this.geminiService.generateJSON<GeminiATSAnalysis>(prompt, {
        temperature: 0.3,
        maxOutputTokens: 3000, // Increased to ensure full response
        useCache: false, // Disable cache for fresh results
      });

      console.log('📥 Received response from Gemini');
      
      // Validate response structure
      if (!response || !response.data) {
        throw new Error('Invalid response from Gemini API');
      }
      
      const analysis = response.data;
      
      // Ensure all required fields exist
      if (typeof analysis.overall_score !== 'number') {
        console.warn('⚠️ Missing overall_score in response, using 0');
        analysis.overall_score = 0;
      }
      
      // Ensure suggestions array exists and is properly formatted
      if (!Array.isArray(analysis.suggestions)) {
        console.warn('⚠️ Suggestions not in array format, initializing empty array');
        analysis.suggestions = [];
      }
      
      // Ensure keywords arrays exist
      if (!Array.isArray(analysis.matched_keywords)) {
        analysis.matched_keywords = [];
      }
      if (!Array.isArray(analysis.missing_keywords)) {
        analysis.missing_keywords = [];
      }
      
      return analysis;
    } catch (error) {
      console.error('❌ Gemini API call failed:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  }
  
  /**
   * Format suggestions to match UI expectations
   * Converts message -> text and ensures proper structure
   */
  private formatSuggestions(suggestions: Array<{
    type?: string;
    priority?: 'high' | 'medium' | 'low' | 'critical';
    message?: string;
    text?: string;
  }>): Array<{
    type: string;
    priority: 'high' | 'medium' | 'low';
    message: string;
    text: string; // For UI compatibility
  }> {
    if (!Array.isArray(suggestions)) {
      console.warn('⚠️ Suggestions is not an array, initializing empty array');
      suggestions = [];
    }
    
    // Map and filter suggestions
    const formatted = suggestions.map((suggestion, idx) => {
      // Handle both 'message' and 'text' properties
      const message = suggestion.message || suggestion.text || `Suggestion ${idx + 1}`;
      const priority = suggestion.priority || 'medium';
      const type = suggestion.type || 'general';
      
      // Normalize priority (handle 'critical' as 'high')
      let validPriority: 'high' | 'medium' | 'low' = 'medium';
      if (priority === 'high' || priority === 'critical') {
        validPriority = 'high';
      } else if (priority === 'low') {
        validPriority = 'low';
      }
      
      return {
        type,
        priority: validPriority,
        message: message.trim(),
        text: message.trim() // Add text property for UI compatibility
      };
    }).filter(s => s.message && s.message.trim().length > 0 && s.message !== 'No suggestion provided'); // Filter out empty suggestions
    
    // If no valid suggestions, provide default helpful suggestions
    if (formatted.length === 0) {
      console.warn('⚠️ No valid suggestions received from Gemini, generating default suggestions');
      return [
        {
          type: 'formatting',
          priority: 'medium' as const,
          message: 'Ensure your resume has clear section headings and consistent formatting for better ATS parsing',
          text: 'Ensure your resume has clear section headings and consistent formatting for better ATS parsing'
        },
        {
          type: 'keywords',
          priority: 'medium' as const,
          message: 'Review the job description and ensure relevant keywords from the role are present in your resume',
          text: 'Review the job description and ensure relevant keywords from the role are present in your resume'
        }
      ];
    }
    
    return formatted;
  }

  private buildAnalysisPrompt(resumeData: ParsedCV, jobDescription?: string): string {
    // Ensure we have proper fallbacks for missing data
    const resumeText = resumeData.text || '';
    const skills = resumeData.skills?.join(', ') || 'No skills listed';
    const experienceYears = resumeData.experienceYears || 0;
    const education = resumeData.education?.join(', ') || 'No education listed';
    const keywords = resumeData.keywords?.join(', ') || 'No keywords found';
    
    // Format contact info properly
    let contactInfo = 'No contact information provided';
    if (resumeData.contactInfo) {
      contactInfo = JSON.stringify(resumeData.contactInfo, null, 2);
    }

    return `You are an expert ATS (Applicant Tracking System) analyst. Analyze this resume against the job description and provide detailed scoring.

RESUME DATA:
Text: ${resumeText.substring(0, 2000)} // Limit text length for API efficiency
Skills: ${skills}
Experience Years: ${experienceYears}
Education: ${education}
Keywords: ${keywords}
Contact Info: ${contactInfo}

${jobDescription ? `JOB DESCRIPTION:
${jobDescription}` : 'No specific job description provided - analyze for general ATS compatibility.'}

ANALYSIS REQUIREMENTS:
1. Score each category (0-100):
   - keyword_match_score: How well resume keywords match job requirements
   - skills_match_score: Relevance and completeness of technical skills
   - experience_score: Years of experience and role relevance
   - education_score: Educational background appropriateness
   - formatting_score: Resume structure, clarity, and ATS-friendliness

2. Identify matched and missing keywords from job description
3. Provide specific, actionable suggestions for improvement

SCORING CRITERIA:
- keyword_match_score: Semantic matching, not just exact words (synonyms count)
- skills_match_score: Consider skill relevance, depth, and modern technologies
- experience_score: Years + role progression + achievements
- education_score: Degree level + field relevance + certifications
- formatting_score: Structure, readability, ATS parsing, contact info completeness

Return ONLY valid JSON in this exact format:
{
  "overall_score": 85,
  "keyword_match_score": 78,
  "skills_match_score": 92,
  "experience_score": 88,
  "education_score": 75,
  "formatting_score": 82,
  "matched_keywords": ["JavaScript", "React", "Node.js", "Agile"],
  "missing_keywords": ["TypeScript", "AWS", "Docker", "CI/CD"],
  "suggestions": [
    {
      "type": "keywords",
      "priority": "high",
      "message": "Add TypeScript and AWS to your skills section to match job requirements"
    },
    {
      "type": "experience",
      "priority": "medium", 
      "message": "Quantify your achievements with specific metrics (e.g., 'increased performance by 40%')"
    }
  ]
}

CRITICAL REQUIREMENTS:
1. ALWAYS provide at least 2-5 suggestions in the suggestions array - this is mandatory
2. Each suggestion must have: type, priority (high/medium/low), and message fields
3. Suggestions should be specific, actionable, and relevant to the resume analysis
4. All scores must be between 0-100
5. matched_keywords and missing_keywords must be arrays (can be empty)
6. suggestions array MUST contain at least one suggestion with a non-empty message
7. Priority levels: "high" for critical issues, "medium" for important improvements, "low" for optional enhancements

Focus on actionable improvements that help the candidate optimize their resume for ATS systems.`;
  }

  private getGrade(score: number): string {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'C+';
    if (score >= 65) return 'C';
    return 'D';
  }

  // Test method to validate API connection
  async testConnection(): Promise<boolean> {
    if (!this.hasApiKey() || !this.geminiService) {
      return false;
    }
    try {
      await this.geminiService.generateText('Test connection', {
        maxOutputTokens: 10,
        useCache: false
      });
      return true;
    } catch (error) {
      console.error('Gemini connection test failed:', error);
      return false;
    }
  }
}

// Fallback to rule-based scoring if AI fails
export class ATSScorerFallback {
  static calculateScore(
    resumeData: ParsedCV,
    jobDescription?: string
  ): ATSScores {
    console.log('📊 Using fallback rule-based ATS scoring...');
    
    const scores = {
      keywordMatch: this.scoreKeywords(resumeData, jobDescription),
      skillsMatch: this.scoreSkills(resumeData),
      experience: this.scoreExperience(resumeData),
      education: this.scoreEducation(resumeData),
      formatting: this.scoreFormatting(resumeData),
    };

    const overall = this.calculateOverall(scores);
    const { matched, missing } = this.analyzeKeywords(resumeData, jobDescription);

    return {
      overall: Math.round(overall),
      ...scores,
      grade: this.getGrade(overall),
      matchedKeywords: matched,
      missingKeywords: missing,
      suggestions: this.generateSuggestions(scores, resumeData),
    };
  }

  private static scoreKeywords(resume: ParsedCV, jd?: string): number {
    if (!jd) return 75;
    const resumeKeywords = new Set(resume.keywords?.map(k => k.toLowerCase()) || []);
    const jdKeywords = this.extractKeywords(jd);
    if (jdKeywords.length === 0) return 75;
    const matches = jdKeywords.filter(k => resumeKeywords.has(k.toLowerCase()));
    return Math.min(100, Math.max(0, (matches.length / jdKeywords.length) * 100));
  }

  private static scoreSkills(resume: ParsedCV): number {
    const skillCount = resume.skills?.length || 0;
    if (skillCount >= 15) return 100;
    if (skillCount >= 10) return 90;
    if (skillCount >= 7) return 80;
    if (skillCount >= 5) return 70;
    if (skillCount >= 3) return 60;
    return 50;
  }

  private static scoreExperience(resume: ParsedCV): number {
    const years = resume.experienceYears || 0;
    if (years >= 10) return 100;
    if (years >= 7) return 90;
    if (years >= 5) return 85;
    if (years >= 3) return 75;
    if (years >= 1) return 65;
    return 50;
  }

  private static scoreEducation(resume: ParsedCV): number {
    const edu = (resume.education?.join(' ') || '').toLowerCase();
    if (edu.includes('phd') || edu.includes('doctor')) return 100;
    if (edu.includes('master') || edu.includes('m.')) return 90;
    if (edu.includes('bachelor') || edu.includes('b.')) return 80;
    if (edu.includes('associate') || edu.includes('diploma')) return 70;
    return 60;
  }

  private static scoreFormatting(resume: ParsedCV): number {
    let score = 100;
    const text = resume.text || '';
    
    // Check for minimum content
    if (text.length < 100) score -= 30;
    else if (text.length < 300) score -= 20;
    else if (text.length < 500) score -= 10;
    
    // Check for skills
    if (!resume.skills || resume.skills.length === 0) score -= 20;
    
    // Check for contact info
    if (!resume.contactInfo || Object.keys(resume.contactInfo).length === 0) score -= 15;
    
    return Math.max(score, 50);
  }

  private static calculateOverall(scores: any): number {
    const WEIGHTS = {
      keywordMatch: 0.40,
      skillsMatch: 0.25,
      experience: 0.20,
      education: 0.10,
      formatting: 0.05,
    };
    
    return (
      (scores.keywordMatch || 0) * WEIGHTS.keywordMatch +
      (scores.skillsMatch || 0) * WEIGHTS.skillsMatch +
      (scores.experience || 0) * WEIGHTS.experience +
      (scores.education || 0) * WEIGHTS.education +
      (scores.formatting || 0) * WEIGHTS.formatting
    );
  }

  private static getGrade(score: number): string {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'C+';
    if (score >= 65) return 'C';
    return 'D';
  }

  private static extractKeywords(text: string): string[] {
    // Simple keyword extraction
    const words = text.toLowerCase().match(/\b\w{3,}\b/g) || [];
    return [...new Set(words)].slice(0, 50); // Limit to 50 unique keywords
  }

  private static analyzeKeywords(resume: ParsedCV, jd?: string): { matched: string[]; missing: string[] } {
    if (!jd) return { matched: [], missing: [] };
    
    const resumeKeywords = new Set(resume.keywords?.map(k => k.toLowerCase()) || []);
    const jdKeywords = this.extractKeywords(jd);
    
    const matched = jdKeywords.filter(k => resumeKeywords.has(k));
    const missing = jdKeywords.filter(k => !resumeKeywords.has(k));
    
    return { matched, missing };
  }

  private static generateSuggestions(scores: any, resume: ParsedCV): Suggestion[] {
    const suggestions: Suggestion[] = [];
    
    // Keyword suggestions
    if ((scores.keywordMatch || 0) < 70) {
      suggestions.push({
        type: 'keywords',
        priority: 'high',
        message: 'Add more keywords from the job description to improve keyword matching'
      });
    }
    
    // Skills suggestions
    if ((scores.skillsMatch || 0) < 70) {
      suggestions.push({
        type: 'skills',
        priority: 'high',
        message: 'Add more relevant technical skills to strengthen your profile'
      });
    }
    
    // Experience suggestions
    if ((scores.experience || 0) < 70) {
      suggestions.push({
        type: 'experience',
        priority: 'medium',
        message: 'Include more quantifiable achievements in your work experience'
      });
    }
    
    // Education suggestions
    if ((scores.education || 0) < 70) {
      suggestions.push({
        type: 'education',
        priority: 'low',
        message: 'Consider adding relevant certifications or continuing education'
      });
    }
    
    // Formatting suggestions
    if ((scores.formatting || 0) < 70) {
      suggestions.push({
        type: 'formatting',
        priority: 'medium',
        message: 'Improve resume formatting with clear section headings and consistent formatting'
      });
    }
    
    // General suggestions if no specific issues
    if (suggestions.length === 0) {
      suggestions.push({
        type: 'general',
        priority: 'low',
        message: 'Your resume looks good! Consider updating it with recent achievements'
      });
    }
    
    return suggestions;
  }
}
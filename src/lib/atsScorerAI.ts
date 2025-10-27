import { ParsedResume } from './cvParser';

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
  private apiKey: string;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY is required for AI-powered ATS scoring');
    }
    this.apiKey = apiKey;
  }

  async calculateScore(
    resumeData: ParsedResume,
    jobDescription?: string
  ): Promise<ATSScores> {
    try {
      console.log('🤖 Using Gemini AI for ATS scoring...');
      
      const analysis = await this.analyzeWithGemini(resumeData, jobDescription);
      
      return {
        overall: Math.round(analysis.overall_score),
        keywordMatch: Math.round(analysis.keyword_match_score),
        skillsMatch: Math.round(analysis.skills_match_score),
        experience: Math.round(analysis.experience_score),
        education: Math.round(analysis.education_score),
        formatting: Math.round(analysis.formatting_score),
        grade: this.getGrade(analysis.overall_score),
        matchedKeywords: analysis.matched_keywords,
        missingKeywords: analysis.missing_keywords,
        suggestions: analysis.suggestions
      };
    } catch (error) {
      console.error('Gemini ATS scoring failed:', error);
      throw new Error('AI-powered ATS scoring is currently unavailable. Please try again later.');
    }
  }

  private async analyzeWithGemini(
    resumeData: ParsedResume,
    jobDescription?: string
  ): Promise<GeminiATSAnalysis> {
    const prompt = this.buildAnalysisPrompt(resumeData, jobDescription);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            topP: 0.9,
            maxOutputTokens: 2048,
            responseMimeType: "application/json"
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const analysisText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!analysisText) {
      throw new Error('No analysis returned from Gemini');
    }

    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanAnalysisText = analysisText;
      if (cleanAnalysisText.includes('```json')) {
        cleanAnalysisText = cleanAnalysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      if (cleanAnalysisText.includes('```')) {
        cleanAnalysisText = cleanAnalysisText.replace(/```\n?/g, '');
      }

      return JSON.parse(cleanAnalysisText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      console.error('Raw response:', analysisText);
      throw new Error('Failed to parse AI analysis response');
    }
  }

  private buildAnalysisPrompt(resumeData: ParsedResume, jobDescription?: string): string {
    const resumeText = resumeData.text;
    const skills = resumeData.skills.join(', ');
    const experienceYears = resumeData.experienceYears;
    const education = resumeData.education.join(', ');
    const keywords = resumeData.keywords.join(', ');
    const contactInfo = JSON.stringify(resumeData.contactInfo, null, 2);

    return `You are an expert ATS (Applicant Tracking System) analyst. Analyze this resume against the job description and provide detailed scoring.

RESUME DATA:
Text: ${resumeText}
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

Be thorough but concise. Focus on actionable improvements.`;
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
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Test connection' }] }]
          })
        }
      );
      return response.ok;
    } catch (error) {
      console.error('Gemini connection test failed:', error);
      return false;
    }
  }
}

// Fallback to rule-based scoring if AI fails
export class ATSScorerFallback {
  static calculateScore(
    resumeData: ParsedResume,
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

  private static scoreKeywords(resume: ParsedResume, jd?: string): number {
    if (!jd) return 75;
    const resumeKeywords = new Set(resume.keywords.map(k => k.toLowerCase()));
    const jdKeywords = this.extractKeywords(jd);
    if (jdKeywords.length === 0) return 75;
    const matches = jdKeywords.filter(k => resumeKeywords.has(k.toLowerCase()));
    return (matches.length / jdKeywords.length) * 100;
  }

  private static scoreSkills(resume: ParsedResume): number {
    const skillCount = resume.skills.length;
    if (skillCount >= 10) return 100;
    if (skillCount >= 7) return 85;
    if (skillCount >= 5) return 70;
    if (skillCount >= 3) return 55;
    return 40;
  }

  private static scoreExperience(resume: ParsedResume): number {
    const years = resume.experienceYears;
    if (years >= 5) return 100;
    if (years >= 3) return 85;
    if (years >= 1) return 70;
    return 50;
  }

  private static scoreEducation(resume: ParsedResume): number {
    const edu = resume.education.join(' ').toLowerCase();
    if (edu.includes('phd') || edu.includes('doctor')) return 100;
    if (edu.includes('master') || edu.includes('m.')) return 90;
    if (edu.includes('bachelor') || edu.includes('b.')) return 80;
    return 60;
  }

  private static scoreFormatting(resume: ParsedResume): number {
    let score = 100;
    if (resume.text.length < 200) score -= 20;
    if (resume.skills.length === 0) score -= 15;
    return Math.max(score, 60);
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
      scores.keywordMatch * WEIGHTS.keywordMatch +
      scores.skillsMatch * WEIGHTS.skillsMatch +
      scores.experience * WEIGHTS.experience +
      scores.education * WEIGHTS.education +
      scores.formatting * WEIGHTS.formatting
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
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at']);
    return [...new Set(words.filter(w => w.length > 3 && !stopWords.has(w)))];
  }

  private static analyzeKeywords(resume: ParsedResume, jd?: string) {
    if (!jd) return { matched: [], missing: [] };
    const resumeKw = new Set(resume.keywords.map(k => k.toLowerCase()));
    const jdKw = this.extractKeywords(jd);
    const matched = jdKw.filter(k => resumeKw.has(k.toLowerCase()));
    const missing = jdKw.filter(k => !resumeKw.has(k.toLowerCase())).slice(0, 10);
    return { matched, missing };
  }

  private static generateSuggestions(scores: any, resume: ParsedResume): Suggestion[] {
    const suggestions: Suggestion[] = [];
    if (scores.keywordMatch < 70) {
      suggestions.push({
        type: 'keywords',
        priority: 'high',
        message: 'Add more keywords from the job description to improve match rate',
      });
    }
    if (scores.skillsMatch < 70) {
      suggestions.push({
        type: 'skills',
        priority: 'high',
        message: 'Add more relevant technical skills to your resume',
      });
    }
    if (scores.experience < 70) {
      suggestions.push({
        type: 'experience',
        priority: 'medium',
        message: 'Quantify your achievements with specific metrics and numbers',
      });
    }
    return suggestions;
  }
}

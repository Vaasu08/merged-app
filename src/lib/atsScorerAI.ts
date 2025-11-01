import { ParsedCV } from './cvParser';
import geminiService from './geminiService';

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
  constructor() {
    console.log('ATSScorerAI initialized with optimized Gemini service');
  }

  async calculateScore(
    resumeData: ParsedCV,
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
    resumeData: ParsedCV,
    jobDescription?: string
  ): Promise<GeminiATSAnalysis> {
    const prompt = this.buildAnalysisPrompt(resumeData, jobDescription);

    // Use optimized Gemini service with caching and retry logic
    const response = await geminiService.generateJSON<GeminiATSAnalysis>(prompt, {
      temperature: 0.2, // Lowered from 0.3 for more consistent scoring
      maxOutputTokens: 3072, // Increased from 2048 for detailed suggestions
      useCache: true,
    });

    return response.data;
  }

  private buildAnalysisPrompt(resumeData: ParsedCV, jobDescription?: string): string {
    const resumeText = resumeData.text.slice(0, 3000); // Increased from 2000
    const skills = resumeData.skills.join(', ');
    const experienceYears = resumeData.experienceYears;
    const education = resumeData.education.join('; ');
    const keywords = resumeData.keywords.join(', ');
    const contactInfo = `${resumeData.contactInfo?.email || ''} | ${resumeData.contactInfo?.phone || ''} | ${resumeData.contactInfo?.location || ''}`.trim();

    return `You are an ELITE ATS (Applicant Tracking System) analyst and senior technical recruiter with 15+ years at Fortune 500 companies and top tech firms (Google, Amazon, Microsoft). You've reviewed 50,000+ resumes and know exactly what separates top 1% candidates.

🎯 YOUR MISSION: Provide brutally honest, data-driven ATS analysis that will genuinely help this candidate land interviews.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 RESUME DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Full Text: ${resumeText}

💼 Skills: ${skills || 'None listed'}
⏱️ Experience: ${experienceYears} years
🎓 Education: ${education || 'Not specified'}
🔑 Keywords: ${keywords || 'None extracted'}
📧 Contact: ${contactInfo || 'Incomplete'}

${jobDescription ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TARGET JOB DESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${jobDescription.slice(0, 2000)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL MATCHING INSTRUCTIONS:
1. Extract MUST-HAVE requirements (qualifications, years exp, specific tech)
2. Extract NICE-TO-HAVE skills (preferred qualifications, soft skills)
3. Identify exact keyword matches AND semantic equivalents
   - Example: "JavaScript" matches "JS", "React.js" matches "React", "CI/CD" matches "continuous integration"
4. Heavily penalize missing must-have requirements
5. Award bonus points for exceeding requirements` : 
`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  NO JOB DESCRIPTION PROVIDED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Analyze for GENERAL ATS best practices:
- Tech industry standards
- Professional formatting
- Clear value proposition
- Quantified achievements
- Modern, in-demand skills`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SCORING METHODOLOGY (0-100)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ KEYWORD MATCH (Weight: 40%)
${jobDescription ? `
   - Exact keyword matches: +10 points each (max 40 pts)
   - Semantic matches (synonyms): +7 points each (max 30 pts)
   - Context relevance: +20 points if keywords used properly
   - Missing MUST-HAVE keywords: -15 points each
   - Calculate: (matched_required / total_required) × 100
` : `
   - Industry-standard keywords present: 80+ points
   - Some relevant keywords: 60-80 points
   - Generic/outdated keywords: 40-60 points
   - Few/no keywords: <40 points
`}

2️⃣ SKILLS MATCH (Weight: 25%)
   - Required technical skills: +15 points each (max 60 pts)
   - Bonus skills: +8 points each (max 25 pts)
   - Skill depth indicators (years, projects): +15 points
   - Modern/trending tech stack: +10 bonus
   - Outdated-only skills: -20 penalty

3️⃣ EXPERIENCE QUALITY (Weight: 20%)
   - Years of experience adequacy: 30 points
   - Quantified achievements (metrics, %): +40 points
   - Leadership/impact indicators: +15 points
   - Career progression shown: +10 points
   - Generic descriptions only: -25 penalty

4️⃣ EDUCATION & CERTIFICATIONS (Weight: 10%)
   - Relevant degree field: 60 points
   - Advanced degree bonus: +20 points
   - Industry certifications: +15 points each
   - Recent/active learning: +5 points

5️⃣ ATS FORMATTING (Weight: 5%)
   - Standard section headers: 20 points
   - Contact info complete: 20 points
   - Readable structure: 20 points
   - No parsing errors: 20 points
   - Proper dates/formatting: 20 points

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 OUTPUT REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY valid JSON (no markdown, no commentary):

{
  "overall_score": 85,
  "keyword_match_score": 78,
  "skills_match_score": 92,
  "experience_score": 88,
  "education_score": 75,
  "formatting_score": 95,
  "matched_keywords": ["JavaScript", "React", "Node.js", "AWS", "Agile", "Docker"],
  "missing_keywords": ["TypeScript", "Kubernetes", "CI/CD", "GraphQL"],
  "suggestions": [
    {
      "type": "keywords",
      "priority": "critical",
      "message": "URGENT: Add 'TypeScript' and 'CI/CD' to skills - both are must-have requirements for this role"
    },
    {
      "type": "experience",
      "priority": "high",
      "message": "Quantify ALL achievements with specific metrics. Example: 'Improved API performance' → 'Reduced API latency by 60% (from 500ms to 200ms), serving 2M daily requests'"
    },
    {
      "type": "skills",
      "priority": "high",
      "message": "Add 'Kubernetes' and 'GraphQL' - mentioned 3x in job description as key technologies"
    },
    {
      "type": "formatting",
      "priority": "medium",
      "message": "Use standard headers: 'Professional Summary', 'Experience', 'Education', 'Skills' for optimal ATS parsing"
    },
    {
      "type": "keywords",
      "priority": "low",
      "message": "Consider adding industry buzzwords: 'microservices architecture', 'cloud-native' to match company tech stack"
    }
  ]
}

SUGGESTION PRIORITIES:
- "critical": Must fix before applying (missing requirements)
- "high": Strong recommendation (major improvement)
- "medium": Should do (moderate improvement)
- "low": Nice to have (minor polish)

QUALITY STANDARDS:
✅ BE SPECIFIC: Don't say "add more keywords" - say "Add TypeScript, AWS, Docker"
✅ BE QUANTIFIED: Reference actual gaps ("missing 3 of 5 must-have skills")
✅ BE ACTIONABLE: Tell them WHERE and HOW to improve
✅ BE HONEST: Score fairly - don't inflate scores to make candidate feel good
✅ BE RELEVANT: Every suggestion must directly improve ATS score or interview chances`;
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
      await geminiService.generateText('Test connection', {
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
    const resumeKeywords = new Set(resume.keywords.map(k => k.toLowerCase()));
    const jdKeywords = this.extractKeywords(jd);
    if (jdKeywords.length === 0) return 75;
    const matches = jdKeywords.filter(k => resumeKeywords.has(k.toLowerCase()));
    return (matches.length / jdKeywords.length) * 100;
  }

  private static scoreSkills(resume: ParsedCV): number {
    const skillCount = resume.skills.length;
    if (skillCount >= 10) return 100;
    if (skillCount >= 7) return 85;
    if (skillCount >= 5) return 70;
    if (skillCount >= 3) return 55;
    return 40;
  }

  private static scoreExperience(resume: ParsedCV): number {
    const years = resume.experienceYears;
    if (years >= 5) return 100;
    if (years >= 3) return 85;
    if (years >= 1) return 70;
    return 50;
  }

  private static scoreEducation(resume: ParsedCV): number {
    const edu = resume.education.join(' ').toLowerCase();
    if (edu.includes('phd') || edu.includes('doctor')) return 100;
    if (edu.includes('master') || edu.includes('m.')) return 90;
    if (edu.includes('bachelor') || edu.includes('b.')) return 80;
    return 60;
  }

  private static scoreFormatting(resume: ParsedCV): number {
    let score = 100;
    if (resume.text.length < 200) score -= 20;
    if (resume.skills.length === 0) score -= 15;
    return Math.max(score, 60);
  }

  private static calculateOverall(scores: {
    keywordMatch: number;
    skillsMatch: number;
    experience: number;
    education: number;
    formatting: number;
  }): number {
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

  private static analyzeKeywords(resume: ParsedCV, jd?: string) {
    if (!jd) return { matched: [], missing: [] };
    const resumeKw = new Set(resume.keywords.map(k => k.toLowerCase()));
    const jdKw = this.extractKeywords(jd);
    const matched = jdKw.filter(k => resumeKw.has(k.toLowerCase()));
    const missing = jdKw.filter(k => !resumeKw.has(k.toLowerCase())).slice(0, 10);
    return { matched, missing };
  }

  private static generateSuggestions(scores: {
    keywordMatch: number;
    skillsMatch: number;
    experience: number;
    education: number;
    formatting: number;
  }, resume: ParsedCV): Suggestion[] {
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

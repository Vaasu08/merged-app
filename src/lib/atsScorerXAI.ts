/**
 * xAI (Grok) Powered ATS Scorer
 * Industry-grade ATS scoring using Grok AI model
 */

import { ParsedCV } from './cvParser';
import xaiService from './xaiService';

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
  usedAI?: boolean;
}

interface Suggestion {
  type: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  impact: string;
  action: string;
}

interface XAIATSAnalysis {
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
    priority: 'critical' | 'high' | 'medium' | 'low';
    message: string;
    impact: string;
    action: string;
  }>;
}

export class ATSScorerXAI {
  /**
   * Analyze resume and return ATS scores using xAI (Grok)
   */
  static async analyzeResume(
    resumeText: string,
    jobDescription?: string
  ): Promise<ATSScores> {
    console.log('🤖 Using xAI (Grok) for ATS scoring...');
    
    try {
      const analysis = await this.analyzeWithXAI(resumeText, jobDescription);
      
      console.log('📊 xAI Analysis received:', {
        overall: analysis.overall_score,
        suggestionCount: analysis.suggestions.length,
      });
      
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
        suggestions: analysis.suggestions,
        usedAI: true
      };
    } catch (error) {
      console.error('xAI ATS scoring failed:', error);
      throw error;
    }
  }

  private static async analyzeWithXAI(
    resumeText: string,
    jobDescription?: string
  ): Promise<XAIATSAnalysis> {
    const prompt = this.buildAnalysisPrompt(resumeText, jobDescription);
    
    console.log('📝 Sending resume for analysis (length:', resumeText.length, 'chars)');
    
    const response = await xaiService.generateJSON<XAIATSAnalysis>(prompt, {
      temperature: 0.5,
      maxTokens: 4096,
    });

    console.log('📊 Raw API response scores:', {
      overall: response.data.overall_score,
      keyword: response.data.keyword_match_score,
      skills: response.data.skills_match_score,
      experience: response.data.experience_score,
      education: response.data.education_score,
      formatting: response.data.formatting_score
    });

    // Calculate the overall score ourselves using the proper weights
    // instead of trusting the LLM's overall_score (which tends to default to ~82)
    const calculatedOverall = 
      (response.data.keyword_match_score * 0.40) +
      (response.data.skills_match_score * 0.25) +
      (response.data.experience_score * 0.20) +
      (response.data.education_score * 0.10) +
      (response.data.formatting_score * 0.05);
    
    console.log('📊 Calculated overall score:', Math.round(calculatedOverall), '(API returned:', response.data.overall_score, ')');
    
    // Override the overall score with our calculation
    response.data.overall_score = Math.round(calculatedOverall);

    return response.data;
  }

  private static buildAnalysisPrompt(resumeText: string, jobDescription?: string): string {
    const truncatedResume = resumeText.slice(0, 4000);

    return `You are an ELITE ATS (Applicant Tracking System) analyst and senior technical recruiter with 15+ years at Fortune 500 companies and top tech firms (Google, Amazon, Microsoft). You've reviewed 50,000+ resumes and know exactly what separates top 1% candidates.

🎯 YOUR MISSION: Provide brutally honest, data-driven ATS analysis that will genuinely help this candidate land interviews.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 RESUME TEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${truncatedResume}

${jobDescription ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TARGET JOB DESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${jobDescription.slice(0, 2500)}
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

Return ONLY valid JSON (no markdown, no commentary).

IMPORTANT: Score HONESTLY based on the actual resume content. Do NOT default to scores around 80-85. 
- A poor resume with few skills should score 30-50
- An average resume should score 50-70  
- A good resume should score 70-85
- An excellent resume should score 85-95
- Only perfect resumes score 95+

Example JSON structure (DO NOT copy these scores - calculate based on actual resume):

{
  "overall_score": <calculate based on resume>,
  "keyword_match_score": <calculate based on resume>,
  "skills_match_score": <calculate based on resume>,
  "experience_score": <calculate based on resume>,
  "education_score": <calculate based on resume>,
  "formatting_score": <calculate based on resume>,
  "matched_keywords": ["JavaScript", "React", "Node.js", "AWS", "Agile", "Docker"],
  "missing_keywords": ["TypeScript", "Kubernetes", "CI/CD", "GraphQL"],
  "suggestions": [
    {
      "type": "keywords",
      "priority": "critical",
      "message": "URGENT: Add 'TypeScript' and 'CI/CD' to skills - both are must-have requirements for this role",
      "impact": "+20-25 points overall",
      "action": "Add these exact keywords to your Skills section AND mention them in context in 2-3 experience bullets"
    },
    {
      "type": "experience",
      "priority": "high",
      "message": "Quantify ALL achievements with specific metrics - currently only 20% of bullets have numbers",
      "impact": "+15-20 points",
      "action": "Add metrics to EVERY bullet: percentages ('+40% efficiency'), dollar amounts, numbers, timeframes"
    },
    {
      "type": "skills",
      "priority": "high",
      "message": "Add 'Kubernetes' and 'GraphQL' - mentioned 3x in job description",
      "impact": "+12-18 points",
      "action": "Add to Technical Skills section with context in experience bullets"
    },
    {
      "type": "formatting",
      "priority": "medium",
      "message": "Use standard section headers for optimal ATS parsing",
      "impact": "+8-12 points",
      "action": "Rename to: 'Professional Summary', 'Work Experience', 'Education', 'Technical Skills'"
    },
    {
      "type": "experience",
      "priority": "high",
      "message": "Weak action verbs detected - use powerful verbs to show impact",
      "impact": "+8-10 points",
      "action": "Replace: 'Worked on' → 'Architected', 'Responsible for' → 'Led', 'Helped' → 'Delivered'"
    }
  ]
}

CRITICAL INSTRUCTIONS FOR SUGGESTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 GENERATE 6-10 SUGGESTIONS (minimum 6, target 8-10)
- Cover ALL weak areas (keyword, skills, experience, formatting, education)
- Each suggestion MUST have: type, priority, message, impact (+X points), action (specific steps)
- Prioritize critical and high priority issues first
- Be specific and actionable

SUGGESTION PRIORITIES:
- "critical": Must fix before applying (missing requirements, deal-breakers)
- "high": Strong recommendation (major improvement, obvious gaps)
- "medium": Should do (moderate improvement, polish)
- "low": Nice to have (minor optimizations)

QUALITY STANDARDS:
✅ BE SPECIFIC: Don't say "add more keywords" - say WHICH keywords
✅ BE QUANTIFIED: Reference actual gaps ("missing 3 of 5 must-have skills")
✅ BE ACTIONABLE: Tell them WHERE and HOW to improve
✅ BE HONEST: Score fairly - don't inflate
✅ SHOW IMPACT: Every suggestion needs "+X points" estimate

Return ONLY valid JSON with no markdown or commentary.`;
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

  /**
   * Test xAI API connection
   */
  static async testConnection(): Promise<boolean> {
    return await xaiService.testConnection();
  }
}

export default ATSScorerXAI;

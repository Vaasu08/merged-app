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
  priority: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  impact: string;
  action: string;
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
    priority: 'critical' | 'high' | 'medium' | 'low';
    message: string;
    impact: string;
    action: string;
  }>;
}

export class ATSScorerAI {
  private apiKey: string | null;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ VITE_GEMINI_API_KEY is missing. AI-powered ATS scoring will use fallback scoring.');
    }
    this.apiKey = apiKey || null;
  }

  private hasApiKey(): boolean {
    return this.apiKey !== null && this.apiKey.length > 0;
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
      
      console.log('📊 AI Analysis received:', {
        overall: analysis.overall_score,
        suggestionCount: analysis.suggestions.length,
        suggestions: analysis.suggestions
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
        suggestions: analysis.suggestions
      };
    } catch (error) {
      console.error('Gemini ATS scoring failed:', error);
      // Fall back to rule-based scoring instead of throwing
      console.warn('⚠️ Falling back to rule-based scoring');
      return ATSScorerFallback.calculateScore(resumeData, jobDescription);
    }
  }

  private async analyzeWithGemini(
    resumeData: ParsedCV,
    jobDescription?: string
  ): Promise<GeminiATSAnalysis> {
    if (!this.apiKey) {
      throw new Error('API key is required');
    }
    
    // Use optimized Gemini service with caching and retry logic
    const response = await geminiService.generateJSON<GeminiATSAnalysis>(this.buildAnalysisPrompt(resumeData, jobDescription), {
      temperature: 0.2, // Lowered from 0.3 for more consistent scoring
      maxOutputTokens: 4096, // Increased from 3072 for MORE detailed suggestions (6-10 items)
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
      "message": "URGENT: Add 'TypeScript' and 'CI/CD' to skills - both are must-have requirements for this role",
      "impact": "+20-25 points overall",
      "action": "Add these exact keywords to your Skills section AND mention them in context in 2-3 experience bullets (e.g., 'Built CI/CD pipeline using Jenkins...')"
    },
    {
      "type": "experience",
      "priority": "high",
      "message": "Quantify ALL achievements with specific metrics - currently only 20% of bullets have numbers",
      "impact": "+15-20 points",
      "action": "Add metrics to EVERY bullet: percentages ('+40% efficiency'), dollar amounts ('saved $200K'), numbers ('team of 8', 'processed 10M records'), timeframes ('reduced from 4hrs to 30min')"
    },
    {
      "type": "skills",
      "priority": "high",
      "message": "Add 'Kubernetes' and 'GraphQL' - mentioned 3x in job description as key technologies",
      "impact": "+12-18 points",
      "action": "Add to Technical Skills section. If you have experience, add bullets like: 'Deployed 15+ microservices to Kubernetes clusters' or 'Built GraphQL API serving 50K requests/day'"
    },
    {
      "type": "formatting",
      "priority": "medium",
      "message": "Use standard section headers for optimal ATS parsing",
      "impact": "+8-12 points",
      "action": "Rename sections to exact ATS-friendly names: 'Professional Summary', 'Work Experience', 'Education', 'Technical Skills', 'Certifications'. Avoid creative names like 'My Journey' or 'What I Do'"
    },
    {
      "type": "keywords",
      "priority": "medium",
      "message": "Missing industry-standard terms that recruiters search for",
      "impact": "+10-15 points",
      "action": "Add 5-7 more relevant keywords: 'Agile/Scrum', 'RESTful APIs', 'unit testing', 'code review', 'Git/GitHub', 'cloud architecture'. Use naturally in experience bullets"
    },
    {
      "type": "experience",
      "priority": "high",
      "message": "Weak action verbs detected - use powerful, specific verbs to show impact",
      "impact": "+8-10 points",
      "action": "Replace weak verbs: 'Worked on' → 'Architected/Engineered', 'Responsible for' → 'Led/Managed', 'Helped with' → 'Drove/Delivered'. Start EVERY bullet with a strong verb"
    },
    {
      "type": "education",
      "priority": "low",
      "message": "Add relevant certifications to stand out",
      "impact": "+5-8 points",
      "action": "List any tech certifications: AWS Certified, Google Cloud, Microsoft Azure, PMI, Scrum Master, etc. Include certification year if recent (last 3 years)"
    }
  ]
}

CRITICAL INSTRUCTIONS FOR SUGGESTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 GENERATE 6-10 SUGGESTIONS (minimum 6, target 8-10)
- Cover ALL weak areas (keyword, skills, experience, formatting, education)
- Each suggestion MUST have: type, priority, message, impact (+X points), action (specific steps)
- Be hyper-specific with examples and numbers
- Mix priorities: 1-2 critical, 2-3 high, 2-3 medium, 1-2 low

SUGGESTION PRIORITIES:
- "critical": Must fix before applying (missing requirements, deal-breakers)
- "high": Strong recommendation (major improvement, obvious gaps)
- "medium": Should do (moderate improvement, polish)
- "low": Nice to have (minor optimizations, bonus points)

QUALITY STANDARDS:
✅ BE SPECIFIC: Don't say "add more keywords" - say "Add TypeScript, AWS, Docker"
✅ BE QUANTIFIED: Reference actual gaps ("missing 3 of 5 must-have skills")
✅ BE ACTIONABLE: Tell them WHERE and HOW to improve with exact examples
✅ BE HONEST: Score fairly - don't inflate scores to make candidate feel good
✅ BE RELEVANT: Every suggestion must directly improve ATS score or interview chances
✅ SHOW IMPACT: Every suggestion needs "+X points" impact estimate
✅ GIVE ACTIONS: Provide 1-2 sentence action plan with specific examples`;
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
    if (!this.hasApiKey()) {
      return false;
    }
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
    if (!jd) {
      // Without job description, score based on general keyword density
      const keywordCount = resume.keywords.length;
      if (keywordCount === 0) return 15; // CRITICAL - no keywords
      if (keywordCount < 5) return 25; // VERY POOR
      if (keywordCount < 10) return 40; // POOR
      if (keywordCount < 15) return 55; // BELOW AVERAGE
      if (keywordCount < 20) return 68; // AVERAGE
      return 75; // GOOD (without JD, cap at 75)
    }
    
    // With job description - much stricter
    const resumeKeywords = new Set(resume.keywords.map(k => k.toLowerCase()));
    const resumeText = resume.text.toLowerCase();
    const jdKeywords = this.extractKeywords(jd);
    
    if (jdKeywords.length === 0) return 50;
    
    // Check for exact and semantic matches
    let exactMatches = 0;
    let semanticMatches = 0;
    
    jdKeywords.forEach(keyword => {
      if (resumeKeywords.has(keyword.toLowerCase())) {
        exactMatches++;
      } else if (resumeText.includes(keyword.toLowerCase())) {
        semanticMatches++;
      }
    });
    
    const totalMatches = exactMatches + (semanticMatches * 0.5);
    const matchPercentage = (totalMatches / jdKeywords.length);
    
    // STRICT REALISTIC SCORING
    if (matchPercentage < 0.20) return Math.round(matchPercentage * 100); // 0-20%: 0-20 points
    if (matchPercentage < 0.40) return Math.round(20 + (matchPercentage - 0.20) * 100); // 20-40%: 20-40 points
    if (matchPercentage < 0.60) return Math.round(40 + (matchPercentage - 0.40) * 75); // 40-60%: 40-55 points
    if (matchPercentage < 0.80) return Math.round(55 + (matchPercentage - 0.60) * 75); // 60-80%: 55-70 points
    return Math.round(70 + (matchPercentage - 0.80) * 150); // 80-100%: 70-100 points
  }

  private static scoreSkills(resume: ParsedCV): number {
    const skillCount = resume.skills.length;
    const hasText = resume.text.length > 300;
    
    // REALISTIC ATS STANDARDS - Most resumes score 40-60
    if (skillCount === 0) return 10; // CRITICAL FAILURE
    if (skillCount < 4) return 25; // VERY POOR - instant rejection
    if (skillCount < 7) return 40; // POOR - needs improvement
    if (skillCount < 10) return 55; // BELOW AVERAGE
    if (skillCount < 13) return 68; // AVERAGE
    if (skillCount < 16) return 78; // GOOD
    if (skillCount < 20) return 88; // VERY GOOD
    
    // Bonus for having good content + many skills
    return hasText ? 95 : 90; // EXCELLENT
  }

  private static scoreExperience(resume: ParsedCV): number {
    const years = resume.experienceYears;
    const text = resume.text.toLowerCase();
    
    // Check for quantified achievements (numbers, percentages, dollars)
    const hasMetrics = /\d+%|\$\d+|\d+x|increased|decreased|reduced|improved|saved/.test(text);
    const hasActionVerbs = /\b(led|managed|architected|built|designed|implemented|delivered|created)\b/i.test(text);
    
    let baseScore = 0;
    
    // Base score on experience years (realistic - most people score 40-65)
    if (years === 0) baseScore = 20; // Entry level
    else if (years < 2) baseScore = 35; // Junior
    else if (years < 4) baseScore = 50; // Mid
    else if (years < 7) baseScore = 62; // Senior
    else if (years < 10) baseScore = 72; // Very Senior
    else baseScore = 80; // Expert
    
    // Penalties and bonuses (realistic impact)
    if (!hasMetrics) baseScore -= 15; // No quantified achievements = major penalty
    if (!hasActionVerbs) baseScore -= 10; // Weak/passive language
    if (resume.text.length < 300) baseScore -= 10; // Too short
    
    if (hasMetrics && hasActionVerbs) baseScore += 8; // Good combo
    
    return Math.max(15, Math.min(95, baseScore)); // Cap between 15-95
  }

  private static scoreEducation(resume: ParsedCV): number {
    const edu = resume.education.join(' ').toLowerCase();
    if (edu.includes('phd') || edu.includes('doctor')) return 100;
    if (edu.includes('master') || edu.includes('m.')) return 90;
    if (edu.includes('bachelor') || edu.includes('b.')) return 80;
    return 60;
  }

  private static scoreFormatting(resume: ParsedCV): number {
    let score = 75; // Start at average, not perfect
    const text = resume.text;
    const textLength = text.length;
    
    // Length checks (realistic penalties)
    if (textLength < 200) score -= 30; // Way too short
    else if (textLength < 400) score -= 20; // Too short
    else if (textLength > 4000) score -= 10; // Might be too long
    
    // Content checks
    if (resume.skills.length === 0) score -= 25; // No skills section = major issue
    if (!resume.contactInfo?.email) score -= 15; // No email = critical
    if (!resume.contactInfo?.phone) score -= 10; // No phone
    
    // Structure checks
    const hasStandardHeaders = /experience|education|skills|summary/i.test(text);
    if (!hasStandardHeaders) score -= 15; // Non-standard format
    
    // Check for common ATS-breaking elements
    if (/\t/.test(text)) score -= 8; // Tables detected
    if (text.split('\n').length < 10) score -= 10; // Not enough structure
    
    // Bonus for good formatting
    if (textLength > 600 && textLength < 2500) score += 10; // Good length
    if (resume.contactInfo?.email && resume.contactInfo?.phone) score += 5; // Complete contact
    
    return Math.max(20, Math.min(95, score)); // Cap between 20-95
  }

  private static calculateOverall(scores: Record<string, number>): number {
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

  private static generateSuggestions(scores: Record<string, number>, resume: ParsedCV): Suggestion[] {
    const suggestions: Suggestion[] = [];
    const text = resume.text.toLowerCase();
    
    // CRITICAL: Keyword Match
    if (scores.keywordMatch < 50) {
      suggestions.push({
        type: 'keywords',
        priority: 'critical',
        message: `CRITICAL: Only ${scores.keywordMatch}% keyword match - ATS will likely reject`,
        impact: '+20-30 points overall',
        action: 'Add 8-12 job-specific keywords from the job description to your skills section AND mention them in context in your experience bullets'
      });
    } else if (scores.keywordMatch < 70) {
      suggestions.push({
        type: 'keywords',
        priority: 'high',
        message: `${scores.keywordMatch}% keyword match - needs improvement to pass ATS`,
        impact: '+10-15 points overall',
        action: 'Review job description and add 4-6 missing keywords. Focus on technical skills mentioned multiple times'
      });
    }
    
    // CRITICAL: Skills
    if (resume.skills.length === 0) {
      suggestions.push({
        type: 'skills',
        priority: 'critical',
        message: 'NO SKILLS SECTION - This will cause instant ATS rejection',
        impact: '+25-35 points overall',
        action: 'Add a dedicated "Skills" section with 12-15 relevant technical skills (languages, frameworks, tools, methodologies)'
      });
    } else if (resume.skills.length < 7) {
      suggestions.push({
        type: 'skills',
        priority: 'critical',
        message: `Only ${resume.skills.length} skills listed - minimum should be 10-12`,
        impact: '+15-25 points',
        action: 'Expand skills section to 12-15 items. Include: programming languages, frameworks, databases, cloud platforms, and tools'
      });
    } else if (scores.skillsMatch < 70) {
      suggestions.push({
        type: 'skills',
        priority: 'high',
        message: `${resume.skills.length} skills but score is low - may not be job-relevant`,
        impact: '+10-15 points',
        action: 'Add 3-5 more job-specific skills from the job description. Remove outdated/irrelevant skills'
      });
    }
    
    // Experience quality
    const hasMetrics = /\d+%|\$\d+|\d+x|increased|decreased|reduced|improved/i.test(text);
    if (!hasMetrics || scores.experience < 60) {
      suggestions.push({
        type: 'experience',
        priority: hasMetrics ? 'high' : 'critical',
        message: hasMetrics ? 'Experience needs more quantified achievements' : 'NO quantified achievements - experience appears weak',
        impact: '+15-20 points',
        action: 'Add specific metrics to EVERY bullet point: percentages ("+40%"), dollar amounts ("$500K saved"), numbers ("team of 8"), timeframes ("reduced from 4hrs to 30min")'
      });
    }
    
    // Action verbs
    const hasActionVerbs = /\b(led|managed|architected|built|designed|implemented|delivered|created|reduced|increased|improved)\b/i.test(text);
    if (!hasActionVerbs) {
      suggestions.push({
        type: 'experience',
        priority: 'high',
        message: 'Weak action verbs detected - use strong, specific verbs',
        impact: '+8-12 points',
        action: 'Start each bullet with powerful verbs: Architected, Led, Engineered, Optimized, Delivered, Scaled, Reduced, Increased (not "responsible for" or "worked on")'
      });
    }
    
    // Formatting issues
    if (resume.text.length < 400) {
      suggestions.push({
        type: 'formatting',
        priority: 'critical',
        message: 'Resume too short - appears incomplete to ATS',
        impact: '+15-20 points',
        action: 'Expand resume to 600-1500 words. Add more detail to experience bullets, include a professional summary, list certifications if any'
      });
    }
    
    if (!resume.contactInfo?.email) {
      suggestions.push({
        type: 'formatting',
        priority: 'critical',
        message: 'Missing email address - ATS cannot contact you',
        impact: '+10 points',
        action: 'Add email address at the top of resume in a clear "Contact" or header section'
      });
    }
    
    if (scores.formatting < 60) {
      suggestions.push({
        type: 'formatting',
        priority: 'high',
        message: 'Formatting issues detected - ATS may not parse correctly',
        impact: '+10-15 points',
        action: 'Use standard section headers: "Professional Summary", "Experience", "Education", "Skills". Avoid tables, graphics, columns. Use simple bullet points'
      });
    }
    
    // Education
    if (resume.education.length === 0 || scores.education < 60) {
      suggestions.push({
        type: 'education',
        priority: 'medium',
        message: 'Education section missing or incomplete',
        impact: '+5-10 points',
        action: 'Add education section with: Degree, Field of Study, Institution, Graduation Year. Include relevant certifications (AWS, PMP, etc.)'
      });
    }
    
    // Additional suggestions for comprehensive coverage
    
    // Professional summary
    if (!/summary|objective|profile/i.test(text) || resume.text.length < 500) {
      suggestions.push({
        type: 'formatting',
        priority: 'medium',
        message: 'Missing professional summary or profile section',
        impact: '+8-12 points',
        action: 'Add a 3-4 sentence "Professional Summary" at the top highlighting: years of experience, key expertise areas, major achievements, and career focus. Example: "Senior Software Engineer with 5+ years building scalable web applications..."'
      });
    }
    
    // Industry keywords
    if (scores.keywordMatch < 80 && resume.keywords.length < 25) {
      suggestions.push({
        type: 'keywords',
        priority: 'medium',
        message: 'Limited keyword diversity - add more industry-standard terms',
        impact: '+8-12 points',
        action: 'Incorporate 5-7 more professional keywords naturally: "cross-functional collaboration", "stakeholder management", "data-driven", "continuous improvement", "scalability", "performance optimization"'
      });
    }
    
    // Bullet point optimization
    const bulletCount = (text.match(/\n[•\-*]/g) || []).length;
    if (bulletCount < 10) {
      suggestions.push({
        type: 'experience',
        priority: 'medium',
        message: 'Too few bullet points - experience section needs more detail',
        impact: '+10-15 points',
        action: 'Expand to 3-5 bullet points per role. Each bullet should: start with action verb, describe WHAT you did, HOW you did it, and the IMPACT/RESULT. Aim for 15-20 total bullets across all roles'
      });
    }
    
    // LinkedIn/Portfolio
    if (!resume.contactInfo?.linkedin && !/linkedin|portfolio|github/i.test(text)) {
      suggestions.push({
        type: 'formatting',
        priority: 'low',
        message: 'Missing LinkedIn profile or portfolio link',
        impact: '+3-5 points',
        action: 'Add LinkedIn URL to contact section. If applicable, also add: GitHub profile, personal website, or online portfolio. Format: linkedin.com/in/yourname'
      });
    }
    
    // Modern tech stack
    const modernSkills = ['cloud', 'aws', 'azure', 'docker', 'kubernetes', 'react', 'python', 'typescript', 'api', 'agile'];
    const hasModernSkills = modernSkills.some(skill => text.toLowerCase().includes(skill));
    if (!hasModernSkills) {
      suggestions.push({
        type: 'skills',
        priority: 'high',
        message: 'Resume lacks modern, in-demand technology keywords',
        impact: '+12-18 points',
        action: 'If you have experience, add current technologies: Cloud platforms (AWS/Azure/GCP), Containers (Docker/Kubernetes), Modern frameworks (React/Angular/Vue), APIs (REST/GraphQL), Agile/Scrum methodologies'
      });
    }
    
    console.log(`✅ Generated ${suggestions.length} fallback suggestions`);
    return suggestions.slice(0, 10); // Return top 10 most critical suggestions
  }
}
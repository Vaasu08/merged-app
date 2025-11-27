/**
 * Hybrid ATS Scorer
 * Combines rule-based analysis with AI suggestions for accurate scoring
 */

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

// Comprehensive skill database for matching
const TECH_SKILLS = [
  // Programming Languages
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab',
  // Frontend
  'react', 'angular', 'vue', 'svelte', 'next.js', 'nuxt', 'gatsby', 'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap', 'material-ui',
  // Backend
  'node.js', 'express', 'fastify', 'django', 'flask', 'fastapi', 'spring', 'rails', '.net', 'asp.net', 'laravel',
  // Databases
  'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamodb', 'firebase', 'supabase',
  // Cloud & DevOps
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins', 'gitlab', 'github actions', 'ci/cd',
  // Data & ML
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'nlp', 'computer vision',
  // Tools & Practices
  'git', 'agile', 'scrum', 'jira', 'rest', 'graphql', 'microservices', 'api', 'testing', 'tdd', 'devops'
];

const ACTION_VERBS = [
  'led', 'managed', 'developed', 'designed', 'implemented', 'created', 'built', 'architected', 'engineered',
  'optimized', 'improved', 'increased', 'reduced', 'delivered', 'launched', 'deployed', 'automated',
  'collaborated', 'mentored', 'trained', 'coordinated', 'analyzed', 'researched', 'solved', 'transformed'
];

export class ATSScorerHybrid {
  /**
   * Analyze resume with hybrid approach
   */
  static async analyzeResume(
    resumeText: string,
    jobDescription?: string
  ): Promise<ATSScores> {
    console.log('🔄 Using Hybrid ATS scoring (rule-based + AI suggestions)...');
    
    const textLower = resumeText.toLowerCase();
    const jdLower = jobDescription?.toLowerCase() || '';
    
    // 1. Calculate scores based on actual content analysis
    const keywordScore = this.calculateKeywordScore(textLower, jdLower);
    const skillsScore = this.calculateSkillsScore(textLower, jdLower);
    const experienceScore = this.calculateExperienceScore(resumeText);
    const educationScore = this.calculateEducationScore(textLower);
    const formattingScore = this.calculateFormattingScore(resumeText);
    
    // 2. Calculate weighted overall - HARSH scoring
    let overall = Math.round(
      (keywordScore.score * 0.40) +
      (skillsScore.score * 0.25) +
      (experienceScore.score * 0.20) +
      (educationScore.score * 0.10) +
      (formattingScore.score * 0.05)
    );
    
    // Apply penalty for very weak areas
    if (keywordScore.score < 30 || skillsScore.score < 30) {
      overall = Math.min(overall, 55); // Cap if keywords/skills are very weak
    }
    if (experienceScore.score < 25) {
      overall = Math.min(overall, 50); // Cap if experience is very weak
    }
    
    // Overall can never exceed 95 (always room to improve)
    overall = Math.min(95, Math.max(5, overall));
    
    console.log('📊 Rule-based scores:', {
      overall,
      keyword: keywordScore.score,
      skills: skillsScore.score,
      experience: experienceScore.score,
      education: educationScore.score,
      formatting: formattingScore.score
    });
    
    // 3. Get AI-powered suggestions
    let suggestions: Suggestion[] = [];
    try {
      suggestions = await this.getAISuggestions(resumeText, jobDescription, {
        keywordScore: keywordScore.score,
        skillsScore: skillsScore.score,
        experienceScore: experienceScore.score,
        educationScore: educationScore.score,
        formattingScore: formattingScore.score,
        matchedSkills: skillsScore.matched,
        missingSkills: skillsScore.missing
      });
    } catch (error) {
      console.warn('AI suggestions failed, using fallback:', error);
      suggestions = this.generateFallbackSuggestions(keywordScore, skillsScore, experienceScore, formattingScore);
    }
    
    return {
      overall,
      keywordMatch: keywordScore.score,
      skillsMatch: skillsScore.score,
      experience: experienceScore.score,
      education: educationScore.score,
      formatting: formattingScore.score,
      grade: this.getGrade(overall),
      matchedKeywords: skillsScore.matched,
      missingKeywords: skillsScore.missing,
      suggestions,
      usedAI: true
    };
  }

  private static calculateKeywordScore(resumeText: string, jdText: string): { score: number; matched: string[]; missing: string[] } {
    if (!jdText) {
      // No job description - score harshly based on general keyword density
      const foundKeywords = TECH_SKILLS.filter(skill => resumeText.includes(skill));
      if (foundKeywords.length === 0) return { score: 5, matched: [], missing: [] };
      if (foundKeywords.length < 3) return { score: 15, matched: foundKeywords, missing: [] };
      if (foundKeywords.length < 6) return { score: 30, matched: foundKeywords, missing: [] };
      if (foundKeywords.length < 10) return { score: 45, matched: foundKeywords, missing: [] };
      const score = Math.min(70, 45 + (foundKeywords.length - 10) * 2);
      return { score, matched: foundKeywords.slice(0, 15), missing: [] };
    }
    
    // Extract keywords from job description
    const jdKeywords = TECH_SKILLS.filter(skill => jdText.includes(skill));
    const additionalJdWords = jdText.match(/\b[a-z]{4,}\b/g) || [];
    const importantWords = additionalJdWords.filter(w => 
      (jdText.match(new RegExp(w, 'gi')) || []).length >= 2 &&
      !['with', 'that', 'this', 'from', 'have', 'will', 'your', 'about', 'team', 'work'].includes(w)
    );
    
    const allJdKeywords = [...new Set([...jdKeywords, ...importantWords.slice(0, 15)])];
    
    if (allJdKeywords.length === 0) {
      return { score: 40, matched: [], missing: [] };
    }
    
    const matched = allJdKeywords.filter(kw => resumeText.includes(kw));
    const missing = allJdKeywords.filter(kw => !resumeText.includes(kw)).slice(0, 10);
    
    const matchRatio = matched.length / allJdKeywords.length;
    
    // HARSH scoring curve
    let score: number;
    if (matchRatio < 0.2) score = Math.round(matchRatio * 50); // 0-10
    else if (matchRatio < 0.4) score = 10 + Math.round((matchRatio - 0.2) * 100); // 10-30
    else if (matchRatio < 0.6) score = 30 + Math.round((matchRatio - 0.4) * 100); // 30-50
    else if (matchRatio < 0.8) score = 50 + Math.round((matchRatio - 0.6) * 100); // 50-70
    else score = 70 + Math.round((matchRatio - 0.8) * 150); // 70-100
    
    return { score: Math.min(100, score), matched, missing };
  }

  private static calculateSkillsScore(resumeText: string, jdText: string): { score: number; matched: string[]; missing: string[] } {
    const foundSkills = TECH_SKILLS.filter(skill => {
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(resumeText);
    });
    
    let score = 0;
    let missing: string[] = [];
    
    if (jdText) {
      // Score against job description requirements - HARSH
      const requiredSkills = TECH_SKILLS.filter(skill => jdText.includes(skill));
      const matchedRequired = requiredSkills.filter(skill => foundSkills.includes(skill));
      missing = requiredSkills.filter(skill => !foundSkills.includes(skill)).slice(0, 8);
      
      if (requiredSkills.length > 0) {
        const ratio = matchedRequired.length / requiredSkills.length;
        // Harsh curve: need 80%+ match for good score
        if (ratio < 0.3) score = Math.round(ratio * 50); // 0-15
        else if (ratio < 0.5) score = 15 + Math.round((ratio - 0.3) * 75); // 15-30
        else if (ratio < 0.7) score = 30 + Math.round((ratio - 0.5) * 100); // 30-50
        else if (ratio < 0.9) score = 50 + Math.round((ratio - 0.7) * 150); // 50-80
        else score = 80 + Math.round((ratio - 0.9) * 200); // 80-100
      }
      // Small bonus for extra skills
      const extraSkills = foundSkills.filter(skill => !requiredSkills.includes(skill));
      score += Math.min(extraSkills.length * 2, 15);
    } else {
      // General scoring - HARSH
      if (foundSkills.length === 0) score = 5;
      else if (foundSkills.length < 3) score = 15;
      else if (foundSkills.length < 5) score = 25;
      else if (foundSkills.length < 8) score = 40;
      else if (foundSkills.length < 12) score = 55;
      else if (foundSkills.length < 16) score = 70;
      else score = 70 + Math.min((foundSkills.length - 16) * 2, 25);
    }
    
    return { 
      score: Math.min(95, Math.max(5, score)), 
      matched: foundSkills.slice(0, 15), 
      missing 
    };
  }

  private static calculateExperienceScore(resumeText: string): { score: number; details: string } {
    let score = 30; // Start low - HARSH baseline
    const text = resumeText.toLowerCase();
    
    // Check for quantified achievements - CRITICAL
    const metricPatterns = /\d+%|\$[\d,]+k?m?|\d+x|\d+\s*(users|customers|clients|team|people|members)|\d+\s*(million|thousand|billion)/gi;
    const metricCount = (resumeText.match(metricPatterns) || []).length;
    
    // Check for action verbs
    const actionVerbCount = ACTION_VERBS.filter(verb => text.includes(verb)).length;
    
    // Check for experience years
    const yearsMatch = resumeText.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/i);
    const years = yearsMatch ? parseInt(yearsMatch[1]) : 0;
    
    // Seniority indicators
    const hasSeniorTitle = /senior|lead|principal|staff|manager|director|head|chief|architect/i.test(resumeText);
    const hasJuniorTitle = /junior|jr\.|intern|entry|graduate|trainee|fresher/i.test(resumeText);
    
    // HARSH scoring
    // Metrics are CRITICAL - biggest impact
    if (metricCount >= 8) score += 30;
    else if (metricCount >= 5) score += 20;
    else if (metricCount >= 3) score += 12;
    else if (metricCount >= 1) score += 5;
    else score -= 15; // HARSH penalty for no metrics
    
    // Action verbs
    if (actionVerbCount >= 10) score += 15;
    else if (actionVerbCount >= 6) score += 10;
    else if (actionVerbCount >= 3) score += 5;
    else score -= 10; // Penalty for weak verbs
    
    // Years of experience
    if (years >= 10) score += 12;
    else if (years >= 6) score += 8;
    else if (years >= 3) score += 5;
    else if (years >= 1) score += 2;
    // No penalty for being entry-level
    
    // Seniority
    if (hasSeniorTitle) score += 8;
    if (hasJuniorTitle && !hasSeniorTitle) score -= 5;
    
    // Resume length - too short is very bad
    if (resumeText.length < 400) score -= 25;
    else if (resumeText.length < 800) score -= 15;
    else if (resumeText.length < 1200) score -= 5;
    else if (resumeText.length > 2500) score += 5;
    
    return { 
      score: Math.min(95, Math.max(5, score)), 
      details: `${metricCount} metrics, ${actionVerbCount} verbs, ${years}y exp` 
    };
  }

  private static calculateEducationScore(resumeText: string): { score: number } {
    let score = 25; // Start HARSH
    
    // Check for degrees - more granular
    if (/ph\.?d|doctorate|doctor/i.test(resumeText)) score = 90;
    else if (/master|m\.s\.|m\.a\.|mba|m\.tech|m\.e\./i.test(resumeText)) score = 75;
    else if (/bachelor|b\.s\.|b\.a\.|b\.tech|b\.e\.|undergraduate/i.test(resumeText)) score = 55;
    else if (/associate|diploma/i.test(resumeText)) score = 40;
    else if (/certificate|bootcamp|course/i.test(resumeText)) score = 30;
    else score = 15; // No degree = harsh penalty
    
    // Relevant field bonus
    if (/computer science|software engineering|information technology|data science|electrical engineering|mathematics|statistics/i.test(resumeText)) {
      score = Math.min(95, score + 8);
    }
    
    // Certifications - modest bonus
    const certKeywords = ['aws certified', 'azure certified', 'google cloud certified', 'pmp', 'scrum master', 'cissp', 'cka', 'ckad'];
    const certCount = certKeywords.filter(cert => resumeText.toLowerCase().includes(cert)).length;
    if (certCount >= 2) score = Math.min(95, score + 10);
    else if (certCount >= 1) score = Math.min(95, score + 5);
    
    return { score: Math.max(10, score) };
  }

  private static calculateFormattingScore(resumeText: string): { score: number } {
    let score = 40; // Start HARSH
    
    // Check for standard sections - CRITICAL
    const sections = ['experience', 'education', 'skills'];
    const optionalSections = ['summary', 'projects', 'objective', 'certifications'];
    const foundCore = sections.filter(s => resumeText.toLowerCase().includes(s));
    const foundOptional = optionalSections.filter(s => resumeText.toLowerCase().includes(s));
    
    // Must have core sections
    if (foundCore.length < 3) score -= (3 - foundCore.length) * 15;
    score += foundCore.length * 8;
    score += foundOptional.length * 3;
    
    // Contact info - CRITICAL
    const hasEmail = /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText);
    const hasPhone = /\+?[\d\s.-]{10,}/.test(resumeText);
    const hasLinkedIn = /linkedin\.com/i.test(resumeText);
    const hasGithub = /github\.com/i.test(resumeText);
    
    if (!hasEmail) score -= 15; // HARSH
    else score += 8;
    if (!hasPhone) score -= 10;
    else score += 5;
    if (hasLinkedIn) score += 5;
    if (hasGithub) score += 5;
    
    // Structure checks
    const lineCount = (resumeText.match(/\n/g) || []).length;
    if (lineCount < 8) score -= 20; // Wall of text = very bad
    else if (lineCount < 15) score -= 10;
    else if (lineCount > 25) score += 5;
    
    // Date formatting
    const hasDates = /20\d{2}|present|current/i.test(resumeText);
    if (!hasDates) score -= 10;
    else score += 5;
    
    return { score: Math.min(95, Math.max(10, score)) };
  }

  private static async getAISuggestions(
    resumeText: string, 
    jobDescription: string | undefined,
    scores: {
      keywordScore: number;
      skillsScore: number;
      experienceScore: number;
      educationScore: number;
      formattingScore: number;
      matchedSkills: string[];
      missingSkills: string[];
    }
  ): Promise<Suggestion[]> {
    // COMPACT prompt for low token usage
    const prompt = `Resume ATS analysis. Give 5 improvement suggestions.

RESUME:
${resumeText.slice(0, 1500)}

${jobDescription ? `JD: ${jobDescription.slice(0, 800)}` : ''}

SCORES: Keywords:${scores.keywordScore} Skills:${scores.skillsScore} Exp:${scores.experienceScore} Edu:${scores.educationScore} Format:${scores.formattingScore}
Missing: ${scores.missingSkills.slice(0, 8).join(',')}

Return JSON array only:
[{"type":"keywords|skills|experience|formatting|education","priority":"critical|high|medium","message":"issue","impact":"+X pts","action":"fix"}]`;

    const response = await xaiService.generateJSON<Suggestion[]>(prompt, {
      temperature: 0.6,
      maxTokens: 800,
    });

    return response.data;
  }

  private static generateFallbackSuggestions(
    keywordScore: { score: number; matched: string[]; missing: string[] },
    skillsScore: { score: number; matched: string[]; missing: string[] },
    experienceScore: { score: number; details: string },
    formattingScore: { score: number }
  ): Suggestion[] {
    const suggestions: Suggestion[] = [];
    
    if (keywordScore.score < 60 && keywordScore.missing.length > 0) {
      suggestions.push({
        type: 'keywords',
        priority: 'critical',
        message: `Missing ${keywordScore.missing.length} important keywords from the job description`,
        impact: '+15-25 points',
        action: `Add these keywords: ${keywordScore.missing.slice(0, 5).join(', ')}`
      });
    }
    
    if (skillsScore.score < 60) {
      suggestions.push({
        type: 'skills',
        priority: 'high',
        message: 'Technical skills section needs more relevant skills',
        impact: '+10-20 points',
        action: 'Add a dedicated Technical Skills section with 10-15 relevant technologies'
      });
    }
    
    if (experienceScore.score < 60) {
      suggestions.push({
        type: 'experience',
        priority: 'high',
        message: 'Experience section lacks quantified achievements',
        impact: '+15-20 points',
        action: 'Add metrics to every bullet point: percentages, dollar amounts, team sizes, timeframes'
      });
    }
    
    if (formattingScore.score < 70) {
      suggestions.push({
        type: 'formatting',
        priority: 'medium',
        message: 'Resume formatting could be improved for ATS compatibility',
        impact: '+5-10 points',
        action: 'Use standard section headers: Professional Summary, Work Experience, Education, Skills'
      });
    }
    
    return suggestions;
  }

  private static getGrade(score: number): string {
    // HARSH grading scale
    if (score >= 90) return 'A+';
    if (score >= 82) return 'A';
    if (score >= 75) return 'B+';
    if (score >= 68) return 'B';
    if (score >= 60) return 'C+';
    if (score >= 52) return 'C';
    if (score >= 42) return 'D+';
    if (score >= 32) return 'D';
    return 'F';
  }
}

export default ATSScorerHybrid;

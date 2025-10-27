interface ParsedResume {
  text: string;
  skills: string[];
  experienceYears: number;
  education: string[];
  keywords: string[];
}


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


const WEIGHTS = {
  keywordMatch: 0.40,
  skillsMatch: 0.25,
  experience: 0.20,
  education: 0.10,
  formatting: 0.05,
};


export class ATSScorer {
  static calculateScore(
    resumeData: ParsedResume,
    jobDescription?: string
  ): ATSScores {
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
    if (!jd) return 75; // Default if no JD
   
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
   
    // Simple heuristics
    if (resume.text.length < 200) score -= 20;
    if (resume.skills.length === 0) score -= 15;
   
    return Math.max(score, 60);
  }


  private static calculateOverall(scores: any): number {
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
    // Simple keyword extraction
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
/**
 * AI-Powered Resume Enhancement Service
 * Uses Google Gemini AI to transform basic profile data into application-ready resume content
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import geminiService from './geminiService';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export interface BaseExperience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  location?: string;
  isCurrent?: boolean;
  description?: string;
  achievements?: string[];
}

export interface EnhancedExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  location: string;
  isCurrent: boolean;
  description: string;
  bulletPoints: string[];
  keyAchievements: string[];
  technologies?: string[];
  impactMetrics?: string;
}

export interface BaseEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  gpa?: number | null;
  isCurrent?: boolean;
  description?: string;
}

export interface EnhancedEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa: number | null;
  isCurrent: boolean;
  relevantCoursework?: string[];
  achievements?: string[];
  activities?: string[];
}

export interface EnhancedResume {
  professionalSummary: string;
  coreCompetencies: string[];
  experience: EnhancedExperience[];
  education: EnhancedEducation[];
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    impact: string;
  }>;
}

class AIResumeEnhancer {
  private model;
  private hasApiKey: boolean;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    this.hasApiKey = !!apiKey && apiKey.length > 0;
    if (this.hasApiKey) {
      this.model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 2048,
        }
      });
    } else {
      console.warn('⚠️ Gemini API key not configured. Resume enhancement will use fallback content.');
      this.model = null;
    }
  }

  /**
   * Generate a professional, ATS-optimized summary
   */
  async generateProfessionalSummary(
    fullName: string,
    skills: string[],
    experience: BaseExperience[],
    targetRole?: string
  ): Promise<string> {
    const experienceYears = this.calculateTotalYears(experience);
    const topSkills = skills.slice(0, 8).join(', ');
    
    const prompt = `You are an expert resume writer. Create a powerful, ATS-optimized professional summary for ${fullName}.

Profile:
- Target Role: ${targetRole || 'Software Engineer / Developer'}
- Total Experience: ${experienceYears} years
- Key Skills: ${topSkills}
- Recent Roles: ${experience.slice(0, 2).map(e => e.position).join(', ')}

Requirements:
1. Write 3-4 sentences (60-80 words)
2. Start with a strong professional title
3. Include quantifiable achievements if possible
4. Use power words: "Led", "Architected", "Optimized", "Delivered"
5. Include key technical skills naturally
6. ATS-friendly language
7. Professional, confident tone

Return ONLY the summary text, no additional commentary.`;

    // Return fallback if no API key
    if (!this.hasApiKey || !this.model) {
      console.warn('⚠️ API key not available, using fallback summary');
      return `${targetRole || 'Experienced Professional'} with ${experienceYears}+ years of expertise in ${topSkills}. Proven track record of delivering high-quality solutions and driving technical excellence across diverse projects. Skilled in problem-solving, cross-functional collaboration, and continuous learning with a passion for innovation.`;
    }

    try {
      console.log('Calling Gemini API for professional summary...');
      const result = await this.model.generateContent(prompt);
      const summary = result.response.text().trim();
      console.log('Professional summary received:', summary.substring(0, 100) + '...');
      return summary;
    } catch (error) {
      console.error('❌ Error generating summary:', error);
      // Improved fallback
      const fallback = `${targetRole || 'Experienced Professional'} with ${experienceYears}+ years of expertise in ${topSkills}. Proven track record of delivering high-quality solutions and driving technical excellence across diverse projects. Skilled in problem-solving, cross-functional collaboration, and continuous learning with a passion for innovation.`;
      console.warn('⚠️ Using fallback summary');
      return fallback;
    }
  }

  /**
   * Enhance work experience with professional bullet points
   */
  async enhanceWorkExperience(
    position: string,
    company: string,
    description: string,
    skills: string[]
  ): Promise<{ bulletPoints: string[]; keyAchievements: string[] }> {
    const prompt = `You are an expert resume writer. Transform this work experience into powerful, ATS-optimized bullet points.

Position: ${position}
Company: ${company}
Current Description: ${description || 'No description provided'}
Relevant Skills: ${skills.slice(0, 10).join(', ')}

Requirements:
1. Generate 4-5 strong achievement-focused bullet points
2. Use the STAR format (Situation, Task, Action, Result)
3. Start with action verbs: "Developed", "Led", "Architected", "Implemented", "Optimized"
4. Include quantifiable metrics where possible (e.g., "Improved performance by 40%")
5. Incorporate relevant skills naturally
6. Each bullet: 1-2 lines, max 20 words
7. Make it impressive and professional

Also provide 2-3 key achievements as separate short statements.

Format your response as JSON:
{
  "bulletPoints": ["point 1", "point 2", ...],
  "keyAchievements": ["achievement 1", "achievement 2", ...]
}

Return ONLY valid JSON, no markdown formatting.`;

    // Return fallback if no API key
    if (!this.hasApiKey || !this.model) {
      console.warn('⚠️ API key not available, using fallback bullet points');
      return {
        bulletPoints: [
          `${position} at ${company}, contributing to key projects and initiatives`,
          `Applied expertise in ${skills.slice(0, 3).join(', ')} to deliver high-quality solutions`,
          `Collaborated with cross-functional teams to achieve project objectives`,
          `Maintained code quality and followed best practices`
        ],
        keyAchievements: [
          'Successfully delivered multiple projects on time',
          'Contributed to team productivity and efficiency'
        ]
      };
    }

    try {
      const result = await this.model.generateContent(prompt);
      let responseText = result.response.text().trim();
      
      // Clean markdown formatting if present
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(responseText);
      return {
        bulletPoints: parsed.bulletPoints || [],
        keyAchievements: parsed.keyAchievements || []
      };
    } catch (error) {
      console.error('❌ Error enhancing experience:', error);
      // Fallback bullet points
      console.warn('⚠️ Using fallback bullet points');
      return {
        bulletPoints: [
          `${position} at ${company}, contributing to key projects and initiatives`,
          `Applied expertise in ${skills.slice(0, 3).join(', ')} to deliver high-quality solutions`,
          `Collaborated with cross-functional teams to achieve project objectives`,
          `Maintained code quality and followed best practices`
        ],
        keyAchievements: [
          'Successfully delivered multiple projects on time',
          'Contributed to team productivity and efficiency'
        ]
      };
    }
  }

  /**
   * Generate core competencies organized by category
   */
  async generateCoreCompetencies(skills: string[]): Promise<string[]> {
    if (skills.length === 0) return [];

    const prompt = `You are an expert resume writer. Organize these skills into 8-12 impressive competency statements.

Skills: ${skills.join(', ')}

Requirements:
1. Group related skills into competency areas
2. Use professional terminology
3. Make each competency sound impressive
4. Include both technical and soft skills
5. Format: "Category: Skill1, Skill2, Skill3"
6. Examples: "Frontend Development: React, Vue.js, TypeScript", "Cloud Architecture: AWS, Azure, Docker"

Return as a JSON array of strings:
["competency 1", "competency 2", ...]

Return ONLY valid JSON, no markdown.`;

    // Return fallback if no API key
    if (!this.hasApiKey || !this.model) {
      console.warn('⚠️ API key not available, using fallback competencies');
      return skills.slice(0, 12);
    }

    try {
      const result = await this.model.generateContent(prompt);
      let responseText = result.response.text().trim();
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(responseText);
      return Array.isArray(parsed) ? parsed : skills.slice(0, 12);
    } catch (error) {
      console.error('❌ Error generating competencies:', error);
      console.warn('⚠️ Using fallback competencies');
      return skills.slice(0, 12);
    }
  }

  /**
   * Enhance education with relevant coursework and achievements
   */
  async enhanceEducation(
    degree: string,
    fieldOfStudy: string,
    institution: string,
    skills: string[]
  ): Promise<{ coursework: string[]; achievements: string[] }> {
    const prompt = `You are an expert resume writer. Enhance this education entry with relevant coursework and achievements.

Degree: ${degree}
Field: ${fieldOfStudy}
Institution: ${institution}
Skills: ${skills.slice(0, 15).join(', ')}

Requirements:
1. Suggest 4-6 relevant coursework topics that align with the skills
2. Generate 2-3 impressive academic achievements
3. Make it professional and impressive
4. Keep each item concise (5-10 words)

Format as JSON:
{
  "coursework": ["course 1", "course 2", ...],
  "achievements": ["achievement 1", "achievement 2", ...]
}

Return ONLY valid JSON, no markdown.`;

    // Return fallback if no API key
    if (!this.hasApiKey || !this.model) {
      console.warn('⚠️ API key not available, using fallback education data');
      return { coursework: [], achievements: [] };
    }

    try {
      const result = await this.model.generateContent(prompt);
      let responseText = result.response.text().trim();
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(responseText);
      return {
        coursework: parsed.coursework || [],
        achievements: parsed.achievements || []
      };
    } catch (error) {
      console.error('❌ Error enhancing education:', error);
      console.warn('⚠️ Using fallback education data');
      return { coursework: [], achievements: [] };
    }
  }

  /**
   * Generate a complete enhanced resume
   */
  async enhanceCompleteResume(
    resumeData: {
      personalInfo: { fullName: string };
      skills: string[];
      experience: BaseExperience[];
      education: BaseEducation[];
      targetRole?: string;
    }
  ): Promise<EnhancedResume> {
    console.log('Starting resume enhancement...');
    
    try {
      // Validate input data
      if (!resumeData.personalInfo?.fullName) {
        throw new Error('Full name is required');
      }
      if (!resumeData.skills || resumeData.skills.length === 0) {
        throw new Error('At least one skill is required');
      }
      if (!resumeData.experience || resumeData.experience.length === 0) {
        throw new Error('At least one work experience is required');
      }

      console.log('Generating professional summary...');
      // Generate professional summary
      const professionalSummary = await this.generateProfessionalSummary(
        resumeData.personalInfo.fullName,
        resumeData.skills,
        resumeData.experience,
        resumeData.targetRole
      );
      console.log('Professional summary generated');

      console.log('Generating core competencies...');
      // Generate core competencies
      const coreCompetencies = await this.generateCoreCompetencies(resumeData.skills);
      console.log('Core competencies generated:', coreCompetencies.length);

      console.log('Enhancing work experience...');
      // Enhance each work experience
      const enhancedExperience: EnhancedExperience[] = [];
      for (let i = 0; i < resumeData.experience.length; i++) {
        const exp = resumeData.experience[i];
        console.log(`Enhancing experience ${i + 1}/${resumeData.experience.length}: ${exp.position}`);
        
        const { bulletPoints, keyAchievements } = await this.enhanceWorkExperience(
          exp.position,
          exp.company,
          exp.description || '',
          resumeData.skills
        );

        enhancedExperience.push({
          company: exp.company,
          position: exp.position,
          startDate: exp.startDate,
          endDate: exp.endDate || 'Present',
          location: exp.location || '',
          isCurrent: exp.isCurrent || false,
          description: exp.description || '',
          bulletPoints,
          keyAchievements,
          technologies: this.extractRelevantSkills(exp.description || '', resumeData.skills)
        });

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      console.log('Work experience enhancement complete');

      console.log('Enhancing education...');
      // Enhance education
      const enhancedEducation: EnhancedEducation[] = [];
      for (let i = 0; i < resumeData.education.length; i++) {
        const edu = resumeData.education[i];
        console.log(`Enhancing education ${i + 1}/${resumeData.education.length}: ${edu.degree}`);
        
        const { coursework, achievements } = await this.enhanceEducation(
          edu.degree,
          edu.fieldOfStudy,
          edu.institution,
          resumeData.skills
        );

        enhancedEducation.push({
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy,
          startDate: edu.startDate,
          endDate: edu.endDate || 'Present',
          gpa: edu.gpa || null,
          isCurrent: edu.isCurrent || false,
          relevantCoursework: coursework,
          achievements
        });

        await new Promise(resolve => setTimeout(resolve, 500));
      }
      console.log('Education enhancement complete');

      const result = {
        professionalSummary,
        coreCompetencies,
        experience: enhancedExperience,
        education: enhancedEducation
      };

      console.log('Resume enhancement completed successfully');
      return result;
    } catch (error) {
      console.error('Error enhancing resume:', error);
      throw error;
    }
  }

  /**
   * Calculate total years of experience
   */
  private calculateTotalYears(experience: BaseExperience[]): number {
    if (!experience || experience.length === 0) return 0;

    const totalMonths = experience.reduce((sum, exp) => {
      const start = new Date(exp.startDate);
      const end = exp.isCurrent ? new Date() : new Date(exp.endDate || new Date());
      const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                    (end.getMonth() - start.getMonth());
      return sum + Math.max(0, months);
    }, 0);

    return Math.max(0, Math.round(totalMonths / 12));
  }

  /**
   * Extract relevant skills from description
   */
  private extractRelevantSkills(description: string, allSkills: string[]): string[] {
    const lowerDesc = description.toLowerCase();
    return allSkills
      .filter(skill => lowerDesc.includes(skill.toLowerCase()))
      .slice(0, 5);
  }
}

export const aiResumeEnhancer = new AIResumeEnhancer();

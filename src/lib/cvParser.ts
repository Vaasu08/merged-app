import { skillsDatabase } from '@/data/careerData';




export interface ParsedCV {
  // Existing fields
  skills: string[];
  experience: string[];
  education: string[];
  confidence: number;
 
  // New ATS-specific fields
  text: string;
  keywords: string[];
  experienceYears: number;
  contactInfo: {
    email?: string;
    phone?: string;
    linkedin?: string;
    location?: string;
  };
  sections: {
    summary?: string;
    experience?: string;
    education?: string;
    skills?: string;
  };
}




export const parseCV = async (file: File): Promise<ParsedCV> => {
  try {
    // Check if file is empty
    if (file.size === 0) {
      throw new Error('File is empty');
    }
   
    const text = await extractTextFromFile(file);
   
    if (!text || text.trim().length === 0) {
      throw new Error('No text content found in file');
    }
   
    const skills = extractSkills(text);
   
    // If no skills found, try a more aggressive approach
    if (skills.length === 0) {
      const fallbackSkills = extractSkillsFallback(text);
      skills.push(...fallbackSkills);
    }
   
    const experience = extractExperience(text);
    const education = extractEducation(text);
   
    // New ATS extractions
    const keywords = extractKeywords(text);
    const experienceYears = calculateExperienceYears(text);
    const contactInfo = extractContactInfo(text);
    const sections = extractSections(text);
   
    const result = {
      // Existing fields
      skills: [...new Set(skills)], // Remove duplicates
      experience,
      education,
      confidence: calculateConfidence(skills.length, text.length),
     
      // New ATS fields
      text,
      keywords,
      experienceYears,
      contactInfo,
      sections,
    };
   
    return result;
  } catch (error) {
    console.error('CV parsing error:', error);
    throw new Error(`Failed to parse CV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};




const extractTextFromFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
   
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text || text.length === 0) {
        reject(new Error('File appears to be empty or could not be read as text'));
        return;
      }
      resolve(text);
    };
   
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      reject(new Error('Failed to read file'));
    };
   
    // Support multiple file types
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // For PDF files, we'll read as text (basic approach)
      // In production, you'd want to use a proper PDF parser like pdf-parse
      reader.readAsText(file);
    } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else if (file.type === 'application/json' || file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      // Try to read as text anyway for other formats
      console.warn(`Unsupported file type: ${file.type}. Attempting to read as text...`);
      reader.readAsText(file);
    }
  });
};




// Helper function to get skill variations
const getSkillVariations = (skillName: string): string[] => {
  const variations: string[] = [];
 
  // Common abbreviations and variations
  const skillVariations: Record<string, string[]> = {
    'javascript': ['js', 'ecmascript', 'es6', 'es2015'],
    'typescript': ['ts'],
    'react': ['reactjs', 'react.js'],
    'node.js': ['nodejs', 'node'],
    'html': ['html5'],
    'css': ['css3'],
    'python': ['py'],
    'machine learning': ['ml', 'ai'],
    'artificial intelligence': ['ai'],
    'data science': ['datascience'],
    'sql': ['mysql', 'postgresql', 'postgres'],
    'mongodb': ['mongo'],
    'aws': ['amazon web services'],
    'kubernetes': ['k8s'],
    'docker': ['containerization'],
    'git': ['github', 'gitlab', 'version control'],
    'agile': ['scrum', 'kanban'],
    'project management': ['pm', 'project mgmt']
  };
 
  if (skillVariations[skillName]) {
    variations.push(...skillVariations[skillName]);
  }
 
  return variations;
};




const extractSkills = (text: string): string[] => {
  const foundSkills: string[] = [];
  const textLower = text.toLowerCase();
 
  // Clean up the text for better matching
  const cleanText = textLower
    .replace(/[^\w\s]/g, ' ') // Replace special characters with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
 
  // Direct skill matching from our database
  skillsDatabase.forEach(skill => {
    const skillName = skill.name.toLowerCase();
    const skillId = skill.id.toLowerCase();
   
    // Check for exact skill name or ID
    if (cleanText.includes(skillName) || cleanText.includes(skillId)) {
      foundSkills.push(skill.id);
    }
   
    // Also check for common variations
    const variations = getSkillVariations(skillName);
    variations.forEach(variation => {
      if (cleanText.includes(variation)) {
        foundSkills.push(skill.id);
      }
    });
  });
 
  // Pattern-based extraction
  const skillPatterns = [
    /(?:skills?|technologies?|tools?|expertise)[:\s]*(.+?)(?:\n|$)/gi,
    /(?:proficient in|experience with|expertise in|knowledge of)[:\s]*(.+?)(?:\n|$)/gi,
    /(?:programming languages?|frameworks?|libraries?)[:\s]*(.+?)(?:\n|$)/gi,
  ];
 
  skillPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Extract the content after the colon
        const content = match.split(/[:\s]/).slice(1).join(' ').trim();
        if (content) {
          // Split by common separators and clean up
          const skills = content.split(/[,;|•\-\n]/)
            .map(s => s.trim())
            .filter(s => s.length > 1 && s.length < 50);
         
          // Try to match these with our skill database
          skills.forEach(skillText => {
            const matchedSkill = skillsDatabase.find(skill =>
              skill.name.toLowerCase().includes(skillText.toLowerCase()) ||
              skillText.toLowerCase().includes(skill.name.toLowerCase())
            );
            if (matchedSkill && !foundSkills.includes(matchedSkill.id)) {
              foundSkills.push(matchedSkill.id);
            }
          });
        }
      });
    }
  });
 
  return [...new Set(foundSkills)];
};




// Fallback skill extraction for when standard matching fails
const extractSkillsFallback = (text: string): string[] => {
  const foundSkills: string[] = [];
  const textLower = text.toLowerCase();
 
  // Simple keyword matching for common tech terms
  const techKeywords = [
    'javascript', 'js', 'typescript', 'ts', 'python', 'py', 'java', 'c++', 'cpp',
    'react', 'vue', 'angular', 'node', 'nodejs', 'express', 'django', 'flask',
    'html', 'css', 'bootstrap', 'tailwind', 'sass', 'scss',
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis',
    'aws', 'azure', 'docker', 'kubernetes', 'git', 'github',
    'agile', 'scrum', 'kanban', 'jira', 'confluence'
  ];
 
  techKeywords.forEach(keyword => {
    if (textLower.includes(keyword)) {
      // Try to find matching skill in database
      const matchingSkill = skillsDatabase.find(skill =>
        skill.name.toLowerCase().includes(keyword) ||
        skill.id.toLowerCase().includes(keyword) ||
        keyword.includes(skill.name.toLowerCase()) ||
        keyword.includes(skill.id.toLowerCase())
      );
     
      if (matchingSkill) {
        foundSkills.push(matchingSkill.id);
      }
    }
  });
 
  return [...new Set(foundSkills)];
};




const extractExperience = (text: string): string[] => {
  const experiencePatterns = [
    /(?:experience|work history|employment)[:\s]*(.+?)(?:\n\n|\n[A-Z]|$)/gis,
    /(?:worked at|employed at|position at)[:\s]*(.+?)(?:\n|$)/gi,
  ];
 
  const experiences: string[] = [];
 
  experiencePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const content = match.split(/[:\s]/).slice(1).join(' ').trim();
        if (content && content.length > 10) {
          experiences.push(content.substring(0, 200)); // Limit length
        }
      });
    }
  });
 
  return experiences.slice(0, 5); // Limit to 5 experiences
};




const extractEducation = (text: string): string[] => {
  const educationPatterns = [
    /(?:education|academic|degree|university|college)[:\s]*(.+?)(?:\n\n|\n[A-Z]|$)/gis,
    /(?:bachelor|master|phd|diploma|certificate)[:\s]*(.+?)(?:\n|$)/gi,
  ];
 
  const education: string[] = [];
 
  educationPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const content = match.split(/[:\s]/).slice(1).join(' ').trim();
        if (content && content.length > 5) {
          education.push(content.substring(0, 150)); // Limit length
        }
      });
    }
  });
 
  return education.slice(0, 3); // Limit to 3 education entries
};




// NEW: Extract keywords for ATS matching
const extractKeywords = (text: string): string[] => {
  const keywords: string[] = [];
  const textLower = text.toLowerCase();
 
  // Remove common stop words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
    'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
  ]);
 
  // Extract words (alphanumeric with optional dots/hyphens)
  const words = textLower.match(/\b[\w.-]+\b/g) || [];
 
  // Filter and collect keywords
  words.forEach(word => {
    // Must be longer than 3 chars and not a stop word
    if (word.length > 3 && !stopWords.has(word)) {
      keywords.push(word);
    }
  });
 
  // Get unique keywords and return top 50 most frequent
  const wordFreq: Record<string, number> = {};
  keywords.forEach(kw => {
    wordFreq[kw] = (wordFreq[kw] || 0) + 1;
  });
 
  const sortedKeywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .slice(0, 50);
 
  return sortedKeywords;
};




// NEW: Calculate total years of experience
const calculateExperienceYears = (text: string): number => {
  // Find year patterns (e.g., 2019-2023, 2019-Present, Jan 2019 - Dec 2023)
  const yearPattern = /\b(19|20)\d{2}\b/g;
  const years = text.match(yearPattern);
 
  if (!years || years.length === 0) return 0;
 
  // Convert to numbers and find range
  const yearNumbers = years.map(y => parseInt(y));
  const minYear = Math.min(...yearNumbers);
  const maxYear = Math.max(...yearNumbers);
 
  // Calculate difference
  const experienceYears = maxYear - minYear;
 
  // Cap at reasonable maximum (40 years)
  return Math.min(Math.max(experienceYears, 0), 40);
};




// NEW: Extract contact information
const extractContactInfo = (text: string): ParsedCV['contactInfo'] => {
  const contactInfo: ParsedCV['contactInfo'] = {};
 
  // Email regex
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const emailMatch = text.match(emailPattern);
  if (emailMatch) {
    contactInfo.email = emailMatch[0];
  }
 
  // Phone regex (various formats)
  const phonePattern = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const phoneMatch = text.match(phonePattern);
  if (phoneMatch) {
    contactInfo.phone = phoneMatch[0];
  }
 
  // LinkedIn profile
  const linkedinPattern = /(?:linkedin\.com\/in\/|linkedin:?\s*)([a-zA-Z0-9-]+)/i;
  const linkedinMatch = text.match(linkedinPattern);
  if (linkedinMatch) {
    contactInfo.linkedin = linkedinMatch[0];
  }
 
  // Location (city, state/country)
  const locationPattern = /(?:location|address|based in)[:\s]*([A-Z][a-zA-Z\s,]+(?:,\s*[A-Z]{2,})?)/i;
  const locationMatch = text.match(locationPattern);
  if (locationMatch && locationMatch[1]) {
    contactInfo.location = locationMatch[1].trim();
  }
 
  return contactInfo;
};




// NEW: Extract resume sections
const extractSections = (text: string): ParsedCV['sections'] => {
  const sections: ParsedCV['sections'] = {};
 
  // Summary/Objective section
  const summaryPattern = /(?:summary|objective|profile|about)[:\s]*(.+?)(?:\n\n|\n(?:[A-Z][A-Z\s]+:)|$)/is;
  const summaryMatch = text.match(summaryPattern);
  if (summaryMatch && summaryMatch[1]) {
    sections.summary = summaryMatch[1].trim().substring(0, 500);
  }
 
  // Experience section
  const expPattern = /(?:experience|work history|employment)[:\s]*(.+?)(?:\n\n(?:[A-Z][A-Z\s]+:)|$)/is;
  const expMatch = text.match(expPattern);
  if (expMatch && expMatch[1]) {
    sections.experience = expMatch[1].trim().substring(0, 1000);
  }
 
  // Education section
  const eduPattern = /(?:education|academic)[:\s]*(.+?)(?:\n\n(?:[A-Z][A-Z\s]+:)|$)/is;
  const eduMatch = text.match(eduPattern);
  if (eduMatch && eduMatch[1]) {
    sections.education = eduMatch[1].trim().substring(0, 500);
  }
 
  // Skills section
  const skillsPattern = /(?:skills|technical skills|competencies)[:\s]*(.+?)(?:\n\n(?:[A-Z][A-Z\s]+:)|$)/is;
  const skillsMatch = text.match(skillsPattern);
  if (skillsMatch && skillsMatch[1]) {
    sections.skills = skillsMatch[1].trim().substring(0, 500);
  }
 
  return sections;
};




const calculateConfidence = (skillCount: number, textLength: number): number => {
  // Simple confidence calculation based on skill count and text length
  const skillScore = Math.min(skillCount * 10, 50);
  const lengthScore = Math.min(textLength / 100, 30);
  const confidence = Math.min(skillScore + lengthScore, 100);
 
  return Math.round(confidence);
};




// Helper function to get skill name by ID
export const getSkillNameById = (skillId: string): string => {
  return skillsDatabase.find(skill => skill.id === skillId)?.name || skillId;
};




// NEW: Get education level for ATS scoring
export const getEducationLevel = (education: string[]): string[] => {
  const levels: string[] = [];
  const eduText = education.join(' ').toLowerCase();
 
  if (eduText.includes('phd') || eduText.includes('doctorate')) {
    levels.push('PhD');
  }
  if (eduText.includes('master') || eduText.includes('m.s') || eduText.includes('mba')) {
    levels.push('Masters');
  }
  if (eduText.includes('bachelor') || eduText.includes('b.s') || eduText.includes('b.a')) {
    levels.push('Bachelors');
  }
  if (eduText.includes('diploma') || eduText.includes('associate')) {
    levels.push('Diploma');
  }
 
  return levels;
};




// Test function for debugging (can be called from browser console)
export const testCVParsing = async (text: string): Promise<ParsedCV> => {
  const skills = extractSkills(text);
  const fallbackSkills = extractSkillsFallback(text);
  const allSkills = [...new Set([...skills, ...fallbackSkills])];
 
  return {
    skills: allSkills,
    experience: extractExperience(text),
    education: extractEducation(text),
    confidence: calculateConfidence(allSkills.length, text.length),
    text,
    keywords: extractKeywords(text),
    experienceYears: calculateExperienceYears(text),
    contactInfo: extractContactInfo(text),
    sections: extractSections(text),
  };
};










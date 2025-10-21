import { skillsDatabase } from '@/data/careerData';

export interface ParsedCV {
  skills: string[];
  experience: string[];
  education: string[];
  confidence: number;
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
    
    const result = {
      skills: [...new Set(skills)], // Remove duplicates
      experience,
      education,
      confidence: calculateConfidence(skills.length, text.length)
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

// Test function for debugging (can be called from browser console)
export const testCVParsing = async (text: string): Promise<ParsedCV> => {
  const skills = extractSkills(text);
  const fallbackSkills = extractSkillsFallback(text);
  const allSkills = [...new Set([...skills, ...fallbackSkills])];
  
  return {
    skills: allSkills,
    experience: extractExperience(text),
    education: extractEducation(text),
    confidence: calculateConfidence(allSkills.length, text.length)
  };
};

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
        // Extract the skills part (after the colon)
        const skillsPart = match.split(':').pop()?.trim() || '';
        // Split by common separators
        const skillsList = skillsPart.split(/[,/|•\n]/).map(s => s.trim());
        skillsList.forEach(skill => {
          if (skill.length > 1) { // Filter out single characters
            // Try to find a match in our skills database
            const matchedSkill = skillsDatabase.find(s => 
              s.name.toLowerCase() === skill.toLowerCase() || 
              s.id.toLowerCase() === skill.toLowerCase()
            );
            if (matchedSkill) {
              foundSkills.push(matchedSkill.id);
            }
          }
        });
      });
    }
  });
 
  return [...new Set(foundSkills)]; // Remove duplicates
};

const extractSkillsFallback = (text: string): string[] => {
  // More aggressive skill extraction for cases where standard extraction fails
  const foundSkills: string[] = [];
  const textLower = text.toLowerCase();
 
  // Look for common skill section headers and extract everything after them
  const sectionHeaders = [
    'skills', 'technical skills', 'technologies', 'tools', 
    'programming languages', 'frameworks', 'libraries', 'expertise'
  ];
 
  sectionHeaders.forEach(header => {
    const startIndex = textLower.indexOf(header);
    if (startIndex !== -1) {
      // Extract 300 characters after the header
      const sectionText = text.substring(startIndex, startIndex + 300);
      // Split by common separators and look for matches
      const potentialSkills = sectionText.split(/[,/|•\n:]/).map(s => s.trim());
      potentialSkills.forEach(skill => {
        if (skill.length > 1 && skill.length < 30) { // Reasonable length
          const matchedSkill = skillsDatabase.find(s => 
            s.name.toLowerCase().includes(skill.toLowerCase()) || 
            s.id.toLowerCase().includes(skill.toLowerCase())
          );
          if (matchedSkill) {
            foundSkills.push(matchedSkill.id);
          }
        }
      });
    }
  });
 
  return [...new Set(foundSkills)];
};

const extractExperience = (text: string): string[] => {
  const experiences: string[] = [];
 
  // Look for common experience section headers
  const experienceHeaders = [
    'experience', 'work experience', 'professional experience', 
    'employment', 'career history', 'positions'
  ];
 
  experienceHeaders.forEach(header => {
    const regex = new RegExp(`${header}([\\s\\S]*?)(?=\\n{2,}|$)`, 'i');
    const match = text.match(regex);
    if (match) {
      experiences.push(match[1].trim());
    }
  });
 
  // If no experience sections found, return the whole text as experience
  return experiences.length > 0 ? experiences : [text.substring(0, 500)];
};

const extractEducation = (text: string): string[] => {
  const educations: string[] = [];
 
  // Look for common education section headers
  const educationHeaders = [
    'education', 'academic background', 'qualifications', 
    'degrees', 'university', 'college'
  ];
 
  educationHeaders.forEach(header => {
    const regex = new RegExp(`${header}([\\s\\S]*?)(?=\\n{2,}|$)`, 'i');
    const match = text.match(regex);
    if (match) {
      educations.push(match[1].trim());
    }
  });
 
  return educations;
};

const extractKeywords = (text: string): string[] => {
  // Extract keywords using a more sophisticated approach
  const commonWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from',
    'up', 'about', 'into', 'over', 'after', 'before', 'under', 'above', 'below', 'between',
    'through', 'during', 'without', 'within', 'along', 'across', 'behind', 'beyond',
    'near', 'toward', 'among', 'throughout', 'despite', 'except', 'plus', 'minus',
    'via', 'per', 'etc', 'ie', 'eg', 'vs', 'etc.', 'i.e.', 'e.g.', 'v.s.', 'vs.'
  ]);
 
  // Extract words (3+ characters) and filter out common words
  const words = text.toLowerCase().match(/\b\w{3,}\b/g) || [];
  const filteredWords = words.filter(word => !commonWords.has(word));
 
  // Count frequency of each word
  const wordCount: Record<string, number> = {};
  filteredWords.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
 
  // Sort by frequency and return top 50 keywords
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([word]) => word);
};

const calculateExperienceYears = (text: string): number => {
  // Look for patterns like "X years of experience" or "X+ years"
  const yearsPatterns = [
    /(\d+)\s*years?\s*(?:of\s*)?experience/i,
    /(\d+)\+?\s*years?/i,
    /experience\s*:\s*(\d+)/i
  ];
 
  for (const pattern of yearsPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const years = parseInt(match[1], 10);
      if (!isNaN(years) && years > 0 && years < 50) {
        return years;
      }
    }
  }
 
  // Look for date ranges to calculate experience
  const datePattern = /(\d{4})\s*[-–—]\s*(\d{4}|present|current)/gi;
  let totalYears = 0;
  let match;
 
  while ((match = datePattern.exec(text)) !== null) {
    const startYear = parseInt(match[1], 10);
    const endYearStr = match[2].toLowerCase();
    const endYear = endYearStr === 'present' || endYearStr === 'current' ? 
      new Date().getFullYear() : parseInt(endYearStr, 10);
   
    if (!isNaN(startYear) && !isNaN(endYear) && startYear > 1980 && endYear >= startYear) {
      totalYears += (endYear - startYear);
    }
  }
 
  // If we found date ranges, return the total years
  if (totalYears > 0) {
    return Math.min(totalYears, 40); // Cap at 40 years
  }
 
  // Default fallback
  return 0;
};

const extractContactInfo = (text: string): ParsedCV['contactInfo'] => {
  const contactInfo: ParsedCV['contactInfo'] = {};
 
  // Email pattern
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  if (emailMatch) {
    contactInfo.email = emailMatch[0];
  }
 
  // Phone pattern (various formats)
  const phonePatterns = [
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // 123-456-7890 or 123.456.7890 or 1234567890
    /\(\d{3}\)\s*\d{3}[-.]?\d{4}/, // (123) 456-7890
    /\+\d{1,3}\s*\d{3,4}\s*\d{3,4}\s*\d{3,4}/ // +1 123 456 7890
  ];
 
  for (const pattern of phonePatterns) {
    const phoneMatch = text.match(pattern);
    if (phoneMatch) {
      contactInfo.phone = phoneMatch[0];
      break;
    }
  }
 
  // LinkedIn pattern
  const linkedinMatch = text.match(/linkedin\.com\/in\/[A-Za-z0-9_-]+/i);
  if (linkedinMatch) {
    contactInfo.linkedin = `https://www.${linkedinMatch[0]}`;
  }
 
  // Location pattern (simple approach)
  const locationMatch = text.match(/(?:location|based in|city)[:\s]*([A-Za-z\s,]+)/i);
  if (locationMatch) {
    contactInfo.location = locationMatch[1].trim();
  }
 
  return contactInfo;
};

const extractSections = (text: string): ParsedCV['sections'] => {
  const sections: ParsedCV['sections'] = {};
 
  // Define common section headers
  const sectionHeaders: Record<string, RegExp> = {
    summary: /(?:summary|profile|about me)([\s\S]*?)(?=\n{2,}|$)/i,
    experience: /(?:experience|work experience|professional experience)([\s\S]*?)(?=\n{2,}|$)/i,
    education: /(?:education|academic background|qualifications)([\s\S]*?)(?=\n{2,}|$)/i,
    skills: /(?:skills|technical skills|technologies|tools)([\s\S]*?)(?=\n{2,}|$)/i
  };
 
  // Extract each section
  Object.entries(sectionHeaders).forEach(([key, regex]) => {
    const match = text.match(regex);
    if (match) {
      sections[key as keyof ParsedCV['sections']] = match[1].trim();
    }
  });
 
  return sections;
};

const calculateConfidence = (skillsCount: number, textLength: number): number => {
  // Calculate confidence based on amount of data extracted
  let confidence = 50; // Base confidence
  
  // Add confidence for skills found
  confidence += Math.min(skillsCount * 5, 30);
  
  // Add confidence for text length
  confidence += Math.min(textLength / 100, 20);
  
  return Math.min(confidence, 100);
};
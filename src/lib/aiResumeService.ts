import { GoogleGenerativeAI } from '@google/generative-ai';


const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);


export class AIResumeService {
  static async generateSummary(
    userData: any,
    jobDescription: string
  ): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });


    const prompt = `Create a compelling, ATS-friendly professional summary for this candidate.


Target Role: ${userData.targetRole || 'Not specified'}
Experience: ${userData.experienceYears || 0} years
Key Skills: ${userData.skills?.slice(0, 8).join(', ') || 'Not specified'}


Job Description Keywords:
${jobDescription.slice(0, 500)}


Requirements:
- 3-4 sentences, 50-80 words
- Include exact keywords from job description naturally
- Professional, confident tone
- ATS-friendly language


Return ONLY the summary text.`;


    const result = await model.generateContent(prompt);
    return result.response.text();
  }


  static async generateBulletPoints(
    roleData: any,
    jobDescription: string
  ): Promise<string[]> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });


    const prompt = `Generate 4-5 ATS-optimized achievement bullet points for this role.


Role: ${roleData.title || ''}
Company: ${roleData.company || ''}
Responsibilities: ${roleData.description || ''}


Target Job Description:
${jobDescription.slice(0, 500)}


Requirements:
- Use STAR method
- Start with strong action verbs
- Include metrics/numbers where logical
- Incorporate job description keywords naturally
- Each bullet 15-25 words


Return as a JSON array: ["bullet 1", "bullet 2", ...]`;


    const result = await model.generateContent(prompt);
    const text = result.response.text();
   
    try {
      return JSON.parse(text);
    } catch {
      // Fallback if not valid JSON
      return text.split('\n').filter(line => line.trim().length > 0);
    }
  }


  static async optimizeSkills(
    currentSkills: string[],
    jobDescription: string
  ): Promise<{ technical: string[]; tools: string[]; soft: string[] }> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });


    const prompt = `Optimize this skills list for ATS based on the job description.


Current Skills: ${currentSkills.join(', ')}


Job Description:
${jobDescription.slice(0, 500)}


Tasks:
1. Prioritize skills matching job description
2. Group into categories (Technical, Tools, Soft Skills)
3. Add relevant missing skills if obvious
4. Use exact terminology from job description


Return as JSON:
{
  "technical": ["skill1", "skill2"],
  "tools": ["tool1", "tool2"],
  "soft": ["skill1", "skill2"]
}`;


    const result = await model.generateContent(prompt);
    const text = result.response.text();
   
    try {
      return JSON.parse(text);
    } catch {
      return {
        technical: currentSkills,
        tools: [],
        soft: [],
      };
    }
  }
}
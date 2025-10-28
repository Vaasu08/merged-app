// Gemini-powered Career Recommendation Service

export interface JobRecommendation {
  id: string;
  title: string;
  matchScore: number;
  description: string;
  keySkills: string[];
  averageSalary: string;
  growthRate: string;
  workEnvironment: string;
  reasons: string[];
}

export class GeminiCareerRecommendationService {
  private apiKey: string;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY is required');
    }
    this.apiKey = apiKey;
  }

  async generateRecommendations(answers: Record<number, string>): Promise<JobRecommendation[]> {
    try {
      console.log('🎯 Generating ADVANCED career recommendations with Gemini AI...');
      console.log('📊 Deep analyzing', Object.keys(answers).length, 'assessment responses');
      console.log('🧠 Using psychological profiling + strategic career matching');
      
      // Build a comprehensive prompt with the assessment answers
      const prompt = this.buildPrompt(answers);
      console.log('📝 Prompt length:', prompt.length, 'characters');
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7, // Lower for faster, more predictable results
              topK: 20, // Significantly reduced for speed
              topP: 0.9, // More focused generation
              maxOutputTokens: 2048, // Further reduced for speed
              candidateCount: 1,
            },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ]
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API error:', errorText);
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Gemini response received successfully');
      
      // Extract the text response
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) {
        console.error('❌ No text in Gemini response:', JSON.stringify(data, null, 2));
        throw new Error('No response text from Gemini - response may have been blocked');
      }

      console.log('📝 Response length:', textResponse.length, 'characters');
      
      // Parse the JSON response
      const recommendations = this.parseRecommendations(textResponse);
      console.log('🎉 Successfully parsed', recommendations.length, 'career recommendations');
      
      return recommendations;

    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

  private buildPrompt(answers: Record<number, string>): string {
    // Map question numbers to their actual questions with full context
    const questions = {
      1: "What type of work environment do you prefer?",
      2: "How would you describe your personality?",
      3: "Which team dynamic appeals to you most?",
      4: "What's your preferred approach to studying or learning?",
      5: "How do you approach problem-solving?",
      6: "What's your preferred way to work on a project?",
      7: "How do you define success in your career?",
      8: "How do you handle deadlines and pressure?",
      9: "Which subject or area interests you most?",
      10: "What's your learning style?"
    };

    const answerText = Object.entries(answers)
      .map(([num, answer]) => `Q${num}: ${answer}`)
      .join(' | ');

    return `Analyze these career assessment answers and return 6 job recommendations as JSON.

Answers: ${answerText}

Requirements:
- 6 diverse careers (different industries)
- Match scores: 70-94%
- 2 brief reasons per job
- 4 key skills per job
- Indian salary ranges

Return ONLY this JSON (no markdown):
[
  {
    "id": "career-1",
    "title": "Job Title",
    "matchScore": 85,
    "description": "One sentence about the role and growth potential.",
    "keySkills": ["Skill1", "Skill2", "Skill3", "Skill4"],
    "averageSalary": "₹5-10 LPA (Entry) | ₹12-25 LPA (Mid) | ₹30-50 LPA (Senior)",
    "growthRate": "15% - Reason",
    "workEnvironment": "Remote/Hybrid. Fast/Moderate pace.",
    "reasons": [
      "Your [answer] fits [job need].",
      "Your [trait] aligns with [responsibility]."
    ]
  }
]`;
  }

  private parseRecommendations(text: string): JobRecommendation[] {
    try {
      // Remove markdown code blocks if present
      let cleanText = text.trim();
      
      // Remove ```json and ``` markers
      cleanText = cleanText.replace(/```json\s*/g, '');
      cleanText = cleanText.replace(/```\s*/g, '');
      
      // Find the JSON array
      const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error('No JSON array found in response:', cleanText);
        throw new Error('Invalid response format from Gemini');
      }

      const recommendations = JSON.parse(jsonMatch[0]) as JobRecommendation[];
      
      // Validate the recommendations
      if (!Array.isArray(recommendations) || recommendations.length === 0) {
        throw new Error('Invalid recommendations format');
      }

      // Ensure all required fields are present
      recommendations.forEach((rec, index) => {
        if (!rec.id) rec.id = `job-${index + 1}`;
        if (!rec.title) throw new Error(`Missing title for recommendation ${index + 1}`);
        if (typeof rec.matchScore !== 'number') rec.matchScore = 75;
        if (!rec.description) rec.description = 'No description available';
        if (!Array.isArray(rec.keySkills)) rec.keySkills = [];
        if (!rec.averageSalary) rec.averageSalary = 'Competitive';
        if (!rec.growthRate) rec.growthRate = 'Moderate';
        if (!rec.workEnvironment) rec.workEnvironment = 'Varied';
        if (!Array.isArray(rec.reasons)) rec.reasons = ['Good match for your profile'];
      });

      console.log(`Successfully parsed ${recommendations.length} recommendations`);
      return recommendations.slice(0, 6); // Ensure max 6 recommendations

    } catch (error) {
      console.error('Error parsing recommendations:', error);
      console.error('Raw text:', text);
      throw new Error('Failed to parse career recommendations from Gemini response');
    }
  }
}

// Export a singleton instance
export const geminiCareerService = new GeminiCareerRecommendationService();

// Main function to analyze assessment answers and return recommendations
export async function analyzeAssessmentAnswersWithGemini(
  answers: Record<number, string>
): Promise<JobRecommendation[]> {
  try {
    const service = new GeminiCareerRecommendationService();
    const recommendations = await service.generateRecommendations(answers);
    return recommendations;
  } catch (error) {
    console.error('❌ Error analyzing assessment with Gemini:', error);
    
    // Enhanced fallback recommendations based on common assessment patterns
    console.log('⚠️ Using enhanced fallback recommendations');
    
    return [
      {
        id: 'fallback-1',
        title: 'Full Stack Developer',
        matchScore: 78,
        description: 'Build end-to-end web applications combining frontend user interfaces with backend server logic. Work with modern frameworks like React, Node.js, and databases to create scalable solutions. Collaborate with designers and product teams to bring ideas to life.',
        keySkills: ['JavaScript/TypeScript', 'React.js', 'Node.js', 'REST APIs', 'Database Design', 'Git/GitHub', 'Problem Solving', 'Agile Methodology'],
        averageSalary: '₹5-10 LPA (Entry) | ₹10-20 LPA (Mid) | ₹20-40 LPA (Senior)',
        growthRate: '16% annually - High demand across all sectors',
        workEnvironment: 'Hybrid work with 2-3 days remote, collaborative tech teams of 5-8 people, modern office spaces with flexible hours, fast-paced but supportive culture',
        reasons: [
          'Versatile career path that combines creativity with analytical thinking',
          'Strong job market with opportunities in startups, enterprises, and freelancing',
          'Continuous learning environment that stays current with technology trends',
          'Good work-life balance with remote work flexibility in most companies'
        ]
      },
      {
        id: 'fallback-2',
        title: 'Data Analyst',
        matchScore: 75,
        description: 'Transform raw data into actionable insights using statistical analysis and visualization tools. Help businesses make data-driven decisions by identifying trends, patterns, and opportunities. Present findings to stakeholders through compelling dashboards and reports.',
        keySkills: ['SQL', 'Python/R', 'Excel Advanced', 'Tableau/Power BI', 'Statistics', 'Data Cleaning', 'Business Acumen', 'Communication'],
        averageSalary: '₹4-8 LPA (Entry) | ₹8-16 LPA (Mid) | ₹16-30 LPA (Senior)',
        growthRate: '23% annually - One of the fastest growing fields',
        workEnvironment: 'Mix of remote and office work, collaborative cross-functional teams, structured 9-6 schedule with flexibility, data-driven company culture',
        reasons: [
          'Perfect blend of analytical thinking and business impact',
          'Every industry needs data analysts - diverse career opportunities',
          'Clear career progression path to senior analyst, manager, or data scientist roles',
          'High demand for professionals who can translate data into business value'
        ]
      },
      {
        id: 'fallback-3',
        title: 'UX/UI Designer',
        matchScore: 72,
        description: 'Design intuitive and beautiful digital experiences that users love. Conduct user research, create wireframes and prototypes, and work closely with developers to bring designs to life. Balance aesthetics with usability to solve real user problems.',
        keySkills: ['Figma/Adobe XD', 'User Research', 'Wireframing', 'Prototyping', 'Visual Design', 'Design Systems', 'Empathy', 'Collaboration'],
        averageSalary: '₹4-9 LPA (Entry) | ₹9-18 LPA (Mid) | ₹18-35 LPA (Senior)',
        growthRate: '13% annually - Growing with digital transformation',
        workEnvironment: 'Flexible hybrid model, creative studio spaces, collaborative design teams, iterative feedback culture, portfolio-driven career growth',
        reasons: [
          'Creative career that directly impacts how millions of people interact with technology',
          'Strong emphasis on user empathy and problem-solving',
          'Portfolio-based hiring means your work speaks for itself',
          'Excellent work-life balance in most design-forward companies'
        ]
      },
      {
        id: 'fallback-4',
        title: 'Digital Marketing Specialist',
        matchScore: 70,
        description: 'Drive brand growth through strategic online campaigns across social media, search engines, email, and content platforms. Analyze performance metrics, optimize conversions, and stay ahead of digital trends. Blend creativity with data analytics to achieve marketing goals.',
        keySkills: ['SEO/SEM', 'Google Analytics', 'Social Media Marketing', 'Content Strategy', 'Email Marketing', 'A/B Testing', 'Copywriting', 'Marketing Automation'],
        averageSalary: '₹3-7 LPA (Entry) | ₹7-15 LPA (Mid) | ₹15-30 LPA (Senior)',
        growthRate: '10% annually - Evolving with new platforms',
        workEnvironment: 'Remote-friendly roles, dynamic agency or in-house teams, campaign-based work cycles, creative brainstorming sessions, performance-driven culture',
        reasons: [
          'Dynamic field with new platforms and strategies emerging constantly',
          'See direct impact of your campaigns through measurable results',
          'Opportunities across all industries from startups to Fortune 500 companies',
          'Good balance of creative content creation and analytical optimization'
        ]
      },
      {
        id: 'fallback-5',
        title: 'Business Analyst',
        matchScore: 68,
        description: 'Bridge the gap between business needs and technology solutions. Gather requirements, analyze processes, and recommend improvements that drive efficiency and revenue. Work with stakeholders across departments to implement strategic initiatives.',
        keySkills: ['Requirements Gathering', 'Process Mapping', 'SQL', 'Business Intelligence Tools', 'Stakeholder Management', 'Documentation', 'Critical Thinking', 'Agile/Scrum'],
        averageSalary: '₹4-8 LPA (Entry) | ₹8-16 LPA (Mid) | ₹16-30 LPA (Senior)',
        growthRate: '11% annually - Stable demand across sectors',
        workEnvironment: 'Corporate office settings with hybrid options, cross-functional project teams, structured work hours, professional development opportunities, consulting or in-house roles',
        reasons: [
          'Strategic role that influences business decisions at all levels',
          'Excellent stepping stone to product management or consulting',
          'Varied work across different business units and projects',
          'Strong job security in consulting firms, banks, and large enterprises'
        ]
      },
      {
        id: 'fallback-6',
        title: 'Content Creator / Strategist',
        matchScore: 65,
        description: 'Create engaging content across blogs, videos, podcasts, and social media that resonates with target audiences. Develop content strategies aligned with brand goals, manage editorial calendars, and analyze content performance. Tell stories that educate, entertain, or inspire.',
        keySkills: ['Writing', 'Content Strategy', 'SEO', 'Social Media', 'Video Editing', 'Analytics', 'Creativity', 'Trend Analysis'],
        averageSalary: '₹3-6 LPA (Entry) | ₹6-12 LPA (Mid) | ₹12-25 LPA (Senior)',
        growthRate: '14% annually - Growing with creator economy',
        workEnvironment: 'Highly flexible remote work, independent or small team settings, project-based workflows, creative freedom, opportunities for freelance/consulting alongside full-time',
        reasons: [
          'Creative expression combined with strategic thinking and analytics',
          'Build your personal brand while working on company projects',
          'Flexible career with options for freelancing, agency work, or in-house roles',
          'Low barrier to entry - portfolio and results matter more than degrees'
        ]
      }
    ];
  }
}

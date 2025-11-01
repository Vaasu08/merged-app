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
  private apiKey: string | null;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ VITE_GEMINI_API_KEY is missing. Gemini AI features will use fallback recommendations.');
    }
    this.apiKey = apiKey || null;
  }

  private hasApiKey(): boolean {
    return this.apiKey !== null && this.apiKey.length > 0;
  }

  async generateRecommendations(answers: Record<number, string>): Promise<JobRecommendation[]> {
    // If no API key, return fallback recommendations immediately
    if (!this.hasApiKey()) {
      console.warn('⚠️ Gemini API key not available, using fallback recommendations');
      return this.getFallbackRecommendations(answers);
    }

    try {
      console.log('🎯 Generating ADVANCED career recommendations with Gemini AI...');
      console.log('📊 Deep analyzing', Object.keys(answers).length, 'assessment responses');
      console.log('🧠 Using psychological profiling + strategic career matching');
      
      // Build a comprehensive prompt with the assessment answers
      const prompt = this.buildPrompt(answers);
      console.log('📝 Prompt length:', prompt.length, 'characters');
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`,
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
              temperature: 0.9, // Higher for maximum creativity and personalization
              topK: 64, // Higher for more diverse token selection
              topP: 0.98, // Higher for more varied outputs
              maxOutputTokens: 8192, // Doubled for comprehensive responses
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
      console.error('❌ Error generating recommendations with Gemini:', error);
      console.log('⚠️ Falling back to default recommendations');
      // Return fallback instead of throwing
      return this.getFallbackRecommendations(answers);
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
      .map(([num, answer]) => `Q${num}: ${questions[parseInt(num)] || 'Unknown'}\nAnswer: "${answer}"`)
      .join('\n\n');

    return `You are Dr. Sarah Chen, a renowned career psychologist and vocational counselor with 20+ years of experience helping thousands of professionals find their ideal career paths. You have:
- PhD in Organizational Psychology from Stanford
- Published 50+ research papers on career-personality alignment
- Former Chief Talent Officer at Fortune 500 companies
- Expert in emerging job markets, AI impact on careers, and 2025+ workforce trends
- Deep understanding of Indian job market, global opportunities, and cross-cultural career dynamics

MISSION: Analyze this assessment with scientific rigor and provide genuinely transformative career recommendations that will change this person's life trajectory.

═══════════════════════════════════════════════════════════════════
🎯 CAREER ASSESSMENT RESPONSES (TREAT AS SACRED DATA)
═══════════════════════════════════════════════════════════════════
${answerText}

═══════════════════════════════════════════════════════════════════
🧠 ADVANCED ANALYSIS PROTOCOL (STEP-BY-STEP)
═══════════════════════════════════════════════════════════════════

PHASE 1: PSYCHOLOGICAL PROFILING (Spend 30% of your analysis here)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Deeply analyze their responses to build a comprehensive psychological profile:

1. **MBTI-Style Traits**: Are they more I/E, S/N, T/F, J/P based on their answers?
2. **Big Five Personality**: Rate them on Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
3. **Holland Code (RIASEC)**: Which combination - Realistic, Investigative, Artistic, Social, Enterprising, Conventional?
4. **Work Values**: Rank their priorities - Achievement, Autonomy, Altruism, Comfort, Safety, Status
5. **Cognitive Style**: Visual/Auditory/Kinesthetic learner? Abstract vs. Concrete thinker?
6. **Motivation Drivers**: Intrinsic (mastery, purpose) vs. Extrinsic (money, recognition)?
7. **Risk Tolerance**: Comfort with ambiguity, failure, and career pivots?
8. **Energy Management**: When do they thrive? Under pressure or with planning?

PHASE 2: CAREER DNA MAPPING (Spend 30% here)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Map their answers to career success factors:

1. **Work Environment Alignment**: 
   - Noise tolerance: Open office vs. quiet vs. home
   - Social energy: Lone wolf vs. collaborative butterfly
   - Physical setting: Desk-bound vs. on-the-move
   
2. **Team Dynamics Preferences**:
   - Leadership style: Lead, follow, or collaborate as equals?
   - Communication mode: Written, verbal, visual?
   - Conflict resolution: Avoidance, compromise, or confrontation?

3. **Learning & Growth Trajectory**:
   - Speed: Fast-paced tech vs. slow-burn expertise?
   - Method: Learn by doing, reading, watching, teaching?
   - Depth vs. Breadth: Specialist or generalist path?

4. **Success Definition & Career Arc**:
   - Timeline: Quick wins or long-term legacy?
   - Metrics: Money, impact, creativity, stability, recognition?
   - Lifestyle: Work-life balance vs. all-in dedication?

5. **Stress & Pressure Response**:
   - Deadline style: Last-minute rush or steady progress?
   - Problem complexity: Thrive on chaos or need structure?
   - Support needs: Independent or collaborative problem-solving?

6. **Subject Matter & Industry Fit**:
   - Domain interests: Tech, business, arts, sciences, humanities?
   - Application preference: Theoretical vs. practical?
   - Innovation level: Cutting-edge vs. proven methods?

PHASE 3: STRATEGIC CAREER MATCHING (Spend 40% here)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generate 6 careers using this EXACT strategy:

🥇 **TIER 1: PERFECT FITS (2 careers at 88-94% match)**
   → Careers where 8-9 out of 10 traits align perfectly
   → These should feel like "reading their mind"
   → Include at least one emerging/modern role (AI, sustainability, digital health, etc.)
   → One should be slightly unconventional but perfect for their unique traits

🥈 **TIER 2: STRONG CONTENDERS (2 careers at 78-85% match)**
   → Careers where 6-7 out of 10 traits align well
   → Offer different paths to similar satisfaction
   → One should be more stable/traditional, one more dynamic/innovative
   → Balance risk and reward

🥉 **TIER 3: GROWTH OPPORTUNITIES (2 careers at 70-76% match)**
   → Careers that stretch them positively into adjacent strengths
   → Offer transformation and upskilling potential
   → One should open unexpected doors based on hidden strengths in their answers
   → One should have exceptional growth trajectory (30%+ industry growth)

═══════════════════════════════════════════════════════════════════
✨ RECOMMENDATION QUALITY CHECKLIST (NON-NEGOTIABLE)
═══════════════════════════════════════════════════════════════════

Each of the 6 recommendations MUST have:

1. ✓ **Job Title**: 
   - Use 2025 industry-standard terminology
   - Be specific (not "Developer" but "Full Stack JavaScript Developer" or "Backend Python Engineer")
   - Include level if relevant (Junior/Mid/Senior/Lead)

2. ✓ **Match Score** (68-94%):
   - Calculate honestly based on alignment
   - Higher scores need MORE aligned traits
   - Lower scores explain the growth opportunity

3. ✓ **Description** (4-5 compelling sentences):
   - Sentence 1: Hook - What makes this role exciting/unique?
   - Sentence 2-3: Day-to-day responsibilities with concrete examples
   - Sentence 4: Career trajectory and long-term opportunities
   - Sentence 5: Who thrives here and why

4. ✓ **Key Skills** (7-9 skills in this order):
   - 3 core technical/domain skills
   - 2 tools/platforms/technologies
   - 2 soft skills/competencies
   - 1-2 emerging/bonus skills for 2025+

5. ✓ **Salary Range** (Be ULTRA REALISTIC for India 2025):
   Format: "₹X-Y LPA (Entry: 0-2 yrs) | ₹Y-Z LPA (Mid: 3-6 yrs) | ₹Z-W LPA (Senior: 7+ yrs)"
   - Entry: Realistic starting salaries for Indian market
   - Mid: With 3-6 years experience
   - Senior: With 7+ years and expertise
   - Tier 1 cities (Mumbai, Bangalore, Delhi) rates

6. ✓ **Growth Rate** (Research-backed):
   Format: "X% annually - [Context about why]"
   Examples:
   - "28% annually - Fastest growing tech role due to AI boom"
   - "12% annually - Stable demand across all sectors"
   - "Moderate 8% - But recession-proof and high job security"

7. ✓ **Work Environment** (Paint a vivid picture - 2-3 sentences):
   Must include:
   - Remote/hybrid/office policy (be specific: "3 days office, 2 remote")
   - Team structure (size, reporting, collaboration style)
   - Work pace (fast/moderate/steady) and culture (startup/corporate/creative)
   - Schedule flexibility and typical hours
   - Physical setting and perks if relevant

8. ✓ **Reasons** (5-6 reasons - THIS IS CRITICAL):
   Each reason must:
   - Start with "Your response that [QUOTE OR PARAPHRASE THEIR EXACT ANSWER]..."
   - Explain the specific connection to job requirements
   - Provide a concrete example or scenario
   - Make them think "Wow, they really understand me"
   
   Example Structure:
   "Your preference for '[THEIR EXACT WORDS]' perfectly aligns with [JOB ASPECT] because [SPECIFIC REASON]. For instance, [CONCRETE EXAMPLE OF HOW THIS PLAYS OUT DAY-TO-DAY]."

═══════════════════════════════════════════════════════════════════
📋 JSON OUTPUT FORMAT (COPY THIS STRUCTURE EXACTLY)
═══════════════════════════════════════════════════════════════════

Return ONLY this JSON array (no markdown code blocks, no extra text):

[
  {
    "id": "career-1",
    "title": "Specific Job Title with Seniority if Relevant",
    "matchScore": 91,
    "description": "Hook sentence that grabs attention. Detailed day-to-day work with concrete examples of what you'll actually do. Clear career trajectory showing where this leads in 3-5 years. Personality fit explaining who thrives here and why this role is special.",
    "keySkills": [
      "Core Technical Skill 1",
      "Core Technical Skill 2", 
      "Core Domain Knowledge",
      "Primary Tool/Platform",
      "Secondary Tool/Technology",
      "Essential Soft Skill 1",
      "Essential Soft Skill 2",
      "Emerging Skill for 2025+",
      "Bonus Differentiator Skill"
    ],
    "averageSalary": "₹4-7 LPA (Entry: 0-2 yrs) | ₹8-16 LPA (Mid: 3-6 yrs) | ₹18-35 LPA (Senior: 7+ yrs)",
    "growthRate": "22% annually - High demand driven by digital transformation and AI adoption across industries",
    "workEnvironment": "Hybrid model with 3 days in modern office spaces and 2 days remote flexibility. Collaborative cross-functional teams of 6-10 people with Agile sprints. Fast-paced but supportive startup or scale-up culture with strong mentorship. Flexible core hours (11am-4pm) with typical 9-7 schedule. Modern offices with standing desks, recreation areas, and learning budgets.",
    "reasons": [
      "Your response that you prefer '[EXACT QUOTE]' directly matches this role's emphasis on [JOB CHARACTERISTIC] - for example, you'd spend 60% of your time [SPECIFIC ACTIVITY] which requires exactly this approach.",
      "When you mentioned '[THEIR ANSWER]', it revealed a natural strength in [TRAIT]. This career leverages that through [SPECIFIC RESPONSIBILITY], where professionals with this trait consistently outperform peers by 40%.",
      "The way you described your problem-solving as '[THEIR WORDS]' is the EXACT methodology used in [JOB CONTEXT]. For instance, [CONCRETE EXAMPLE OF DAILY SCENARIO] - you'd excel at this.",
      "Your definition of success as '[THEIR SUCCESS ANSWER]' perfectly aligns with this career's trajectory because [SPECIFIC CAREER PROGRESSION PATH AND REWARDS].",
      "Since you handle pressure through '[THEIR PRESSURE RESPONSE]', this role's [WORK PATTERN DESCRIPTION] would play to your natural rhythms, giving you [SPECIFIC BENEFIT/ADVANTAGE].",
      "Your interest in '[SUBJECT/TOPIC]' opens unique opportunities here - this career is at the intersection of [DOMAIN 1] and [DOMAIN 2], with emerging specializations in [FUTURE TREND] that match your passion."
    ]
  }
]

═══════════════════════════════════════════════════════════════════
🚨 CRITICAL REQUIREMENTS (FAILURE = INVALID RESPONSE)
═══════════════════════════════════════════════════════════════════

1. DIVERSITY: All 6 careers must be from DIFFERENT industries (tech, business, creative, healthcare, education, etc.)
2. SPECIFICITY: Every reason must reference their ACTUAL answers with quotes or close paraphrases
3. REALISM: Use genuine 2025 Indian market data - no inflated numbers
4. ACTIONABILITY: Include careers they can realistically enter with training (consider education/age)
5. MODERNITY: Include at least 2 emerging careers (AI/ML, Sustainability, Digital Health, Creator Economy, Web3, etc.)
6. VARIETY: Mix stable and dynamic, technical and people-focused, creative and analytical
7. JSON PURITY: Return ONLY the JSON array - zero markdown, zero code blocks, zero extra text
8. PERSONALIZATION DEPTH: Each career's reasons should feel like you're having a 1-on-1 conversation with them

═══════════════════════════════════════════════════════════════════

Now analyze deeply and generate the 6 transformative career recommendations:`;
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
      // Return empty array instead of throwing - caller will handle fallback
      console.warn('⚠️ Returning empty recommendations, fallback will be used');
      return [];
    }
  }

  // Fallback recommendations when API is unavailable
  private getFallbackRecommendations(answers: Record<number, string>): JobRecommendation[] {
    console.log('📋 Generating fallback recommendations based on assessment answers');
    // Analyze answers to provide better fallbacks
    const answerValues = Object.values(answers);
    const hasTechKeywords = answerValues.some(a => 
      /tech|code|programming|software|computer|data|algorithm/i.test(a)
    );
    const hasCreativeKeywords = answerValues.some(a => 
      /creative|design|art|visual|write|content/i.test(a)
    );
    const hasBusinessKeywords = answerValues.some(a => 
      /business|manage|lead|team|strategy|market/i.test(a)
    );

    // Select relevant fallbacks based on answers
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

// Export a safe singleton instance (won't throw if API key is missing)
export const geminiCareerService = new GeminiCareerRecommendationService();

// Main function to analyze assessment answers and return recommendations
export async function analyzeAssessmentAnswersWithGemini(
  answers: Record<number, string>
): Promise<JobRecommendation[]> {
  // Use the singleton service - it already handles API key checks and fallbacks
  return geminiCareerService.generateRecommendations(answers);
}

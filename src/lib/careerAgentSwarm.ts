/**
 * AI Career Agent Swarm - Multi-Agent System
 * Coordinates 4 specialized agents working together to help users achieve career goals
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import geminiService from './geminiService';
import { searchJobs, type JobListing } from './adzunaService';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

// ==================== TYPES ====================

export interface UserProfile {
  fullName: string;
  currentRole?: string;
  targetRole?: string;
  skills: string[];
  experience: Array<{
    position: string;
    company: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
  }>;
  location?: string;
  preferences?: {
    salaryMin?: number;
    remotePreference?: 'remote' | 'hybrid' | 'onsite' | 'any';
    industries?: string[];
  };
}

export interface WeeklyPlan {
  week: number;
  startDate: string;
  endDate: string;
  goals: {
    applications: number;
    networking: number;
    skillDevelopment: string[];
    interviewPrep: number;
  };
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    assignedAgent: 'planner' | 'recruiter' | 'coach' | 'interviewer';
    status: 'pending' | 'in-progress' | 'completed';
    dueDate: string;
  }>;
}

export interface AgentMessage {
  agentId: string;
  agentName: string;
  timestamp: Date;
  message: string;
  actionItems?: string[];
  data?: Record<string, unknown>;
}

export interface UserProgress {
  applicationsSubmitted: number;
  interviewsCompleted: number;
  networkingEvents: number;
  skillsLearned: string[];
  readinessScore: number;
}

export interface WeeklyGoals {
  applications: number;
  networking: number;
  skillDevelopment: string[];
  interviewPrep: number;
}

export interface ReadinessAssessment {
  score: number;
  strengths: string[];
  improvements: string[];
  recommendedTopics: string[];
}

export interface SwarmState {
  userId: string;
  currentWeek: number;
  weeklyPlans: WeeklyPlan[];
  agentConversation: AgentMessage[];
  lastUpdated: Date;
  userProgress: UserProgress;
}

// ==================== INDIVIDUAL AGENTS ====================

class PlannerAgent {
  private model;
  private agentId = 'planner';
  private agentName = 'Career Planner';

  constructor() {
    this.model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 2048,
      }
    });
  }

  // Analyze skill gaps based on target role
  private analyzeSkillGaps(currentSkills: string[], targetRole?: string): string[] {
    if (!targetRole) return [];
    
    const roleSkillMap: Record<string, string[]> = {
      'software engineer': ['System Design', 'Data Structures', 'Algorithms', 'Testing'],
      'data scientist': ['Machine Learning', 'Statistics', 'Python', 'SQL', 'Data Visualization'],
      'product manager': ['Product Strategy', 'User Research', 'Roadmapping', 'Stakeholder Management'],
      'designer': ['UI/UX Design', 'Prototyping', 'User Research', 'Design Systems'],
      'marketing': ['SEO', 'Content Marketing', 'Analytics', 'Social Media'],
      'sales': ['Lead Generation', 'CRM', 'Negotiation', 'Relationship Building']
    };

    const normalizedRole = targetRole.toLowerCase();
    let requiredSkills: string[] = [];
    
    for (const [role, skills] of Object.entries(roleSkillMap)) {
      if (normalizedRole.includes(role)) {
        requiredSkills = skills;
        break;
      }
    }

    const normalizedCurrentSkills = currentSkills.map(s => s.toLowerCase());
    const gaps = requiredSkills.filter(
      skill => !normalizedCurrentSkills.some(cs => cs.includes(skill.toLowerCase()))
    );

    return gaps.slice(0, 3); // Return top 3 gaps
  }

  async createWeeklyPlan(
    profile: UserProfile,
    currentProgress: UserProgress,
    weekNumber: number
  ): Promise<WeeklyPlan> {
    // Calculate intelligent metrics based on progress
    const successRate = currentProgress.applicationsSubmitted > 0 
      ? (currentProgress.interviewsCompleted / currentProgress.applicationsSubmitted * 100).toFixed(1)
      : 0;
    
    const skillGaps = profile.targetRole 
      ? this.analyzeSkillGaps(profile.skills, profile.targetRole)
      : [];

    const prompt = `You are an expert Career Planner AI Agent with deep knowledge of job market trends, hiring practices, and career development strategies.

USER PROFILE:
- Name: ${profile.fullName}
- Current Role: ${profile.currentRole || 'Job Seeker'}
- Target Role: ${profile.targetRole || 'Not specified'}
- Skills: ${profile.skills.join(', ')}
- Years of Experience: ${profile.experience.length} positions
- Location: ${profile.location || 'Remote/Flexible'}
- Salary Expectation: ${profile.preferences?.salaryMin ? '$' + profile.preferences.salaryMin.toLocaleString() : 'Not specified'}

PERFORMANCE METRICS:
- Applications Submitted: ${currentProgress.applicationsSubmitted || 0}
- Interviews Secured: ${currentProgress.interviewsCompleted || 0}
- Success Rate: ${successRate}%
- Current Readiness: ${currentProgress.readinessScore || 0}/100
- Skills Learned This Month: ${currentProgress.skillsLearned?.length || 0}
- Week Number: ${weekNumber}

IDENTIFIED SKILL GAPS: ${skillGaps.length > 0 ? skillGaps.join(', ') : 'None identified'}

MARKET INSIGHTS:
- November 2025: Tech hiring is strong, companies focusing on AI/ML skills
- Remote work still prevalent (65% of tech jobs)
- Average time-to-hire: 3-4 weeks

STRATEGIC OBJECTIVES:
1. Increase application-to-interview conversion rate (target: >15%)
2. Build strategic network connections (quality over quantity)
3. Address skill gaps with targeted learning
4. Maintain consistent momentum (avoid burnout)

Create a highly personalized, data-driven weekly plan that:
- Adjusts goals based on past performance (increase if successful, maintain if struggling)
- Prioritizes high-impact activities (targeted applications vs. spray-and-pray)
- Includes specific company types and roles to target
- Schedules skill development for identified gaps
- Balances intensity with sustainability

Return ONLY valid JSON in this exact format:
{
  "week": ${weekNumber},
  "startDate": "2025-11-01",
  "endDate": "2025-11-08",
  "goals": {
    "applications": 8,
    "networking": 4,
    "skillDevelopment": ["${skillGaps[0] || 'Communication Skills'}", "${skillGaps[1] || 'Technical Interview Prep'}"],
    "interviewPrep": 3
  },
  "tasks": [
    {
      "id": "task-1",
      "title": "Apply to 5 senior positions at FAANG/unicorn startups",
      "description": "Target companies: Google, Amazon, OpenAI, Anthropic. Use AI-optimized resume.",
      "priority": "high",
      "assignedAgent": "recruiter",
      "status": "pending",
      "dueDate": "2025-11-04"
    },
    {
      "id": "task-2",
      "title": "Apply to 3 mid-size tech companies with strong culture",
      "description": "Research companies on Glassdoor. Focus on work-life balance and growth.",
      "priority": "high",
      "assignedAgent": "recruiter",
      "status": "pending",
      "dueDate": "2025-11-06"
    },
    {
      "id": "task-3",
      "title": "Complete 2-hour course on ${skillGaps[0] || 'System Design'}",
      "description": "Use Coursera, Udemy, or freeCodeCamp. Focus on practical projects.",
      "priority": "medium",
      "assignedAgent": "coach",
      "status": "pending",
      "dueDate": "2025-11-05"
    },
    {
      "id": "task-4",
      "title": "Connect with 4 ${profile.targetRole || 'industry'} professionals on LinkedIn",
      "description": "Personalize connection requests. Comment on their posts before reaching out.",
      "priority": "medium",
      "assignedAgent": "coach",
      "status": "pending",
      "dueDate": "2025-11-07"
    },
    {
      "id": "task-5",
      "title": "Practice 3 mock interviews with focus on behavioral questions",
      "description": "Use STAR method. Record yourself. Focus on storytelling and confidence.",
      "priority": "high",
      "assignedAgent": "interviewer",
      "status": "pending",
      "dueDate": "2025-11-06"
    },
    {
      "id": "task-6",
      "title": "Update resume and LinkedIn with recent accomplishments",
      "description": "Add quantifiable metrics. Optimize for ATS. Use action verbs.",
      "priority": "medium",
      "assignedAgent": "planner",
      "status": "pending",
      "dueDate": "2025-11-03"
    },
    {
      "id": "task-7",
      "title": "Research salary ranges for ${profile.targetRole || 'target role'} in ${profile.location || 'your area'}",
      "description": "Use Levels.fyi, Glassdoor, Blind. Prepare negotiation strategy.",
      "priority": "low",
      "assignedAgent": "coach",
      "status": "pending",
      "dueDate": "2025-11-08"
    }
  ]
}

Make tasks SPECIFIC with company names, exact timeframes, and measurable outcomes. Be strategic and actionable.`;

    try {
      const result = await this.model.generateContent(prompt);
      let responseText = result.response.text().trim();
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const plan = JSON.parse(responseText);
      console.log('✅ Planner Agent: Created weekly plan', plan);
      return plan;
    } catch (error) {
      console.error('❌ Planner Agent error:', error);
      // Fallback plan
      const today = new Date();
      const weekStart = new Date(today);
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);

      return {
        week: weekNumber,
        startDate: weekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0],
        goals: {
          applications: 7,
          networking: 3,
          skillDevelopment: profile.skills.slice(0, 2),
          interviewPrep: 2
        },
        tasks: [
          {
            id: 'task-1',
            title: `Apply to 7 ${profile.targetRole || 'relevant'} positions`,
            description: 'Focus on companies matching your skills and experience',
            priority: 'high',
            assignedAgent: 'recruiter',
            status: 'pending',
            dueDate: weekEnd.toISOString().split('T')[0]
          },
          {
            id: 'task-2',
            title: 'Update LinkedIn and connect with 3 professionals',
            description: 'Network in your target industry',
            priority: 'medium',
            assignedAgent: 'coach',
            status: 'pending',
            dueDate: weekEnd.toISOString().split('T')[0]
          },
          {
            id: 'task-3',
            title: 'Practice 2 mock interviews',
            description: 'Prepare for behavioral and technical questions',
            priority: 'high',
            assignedAgent: 'interviewer',
            status: 'pending',
            dueDate: weekEnd.toISOString().split('T')[0]
          }
        ]
      };
    }
  }

  async generateMessage(context: string): Promise<AgentMessage> {
    return {
      agentId: this.agentId,
      agentName: this.agentName,
      timestamp: new Date(),
      message: `📋 Weekly plan created! I've designed a balanced schedule focusing on job applications, skill development, and interview prep. Let's make this week count!`,
      actionItems: [
        'Review your weekly goals',
        'Check tasks assigned by other agents',
        'Track progress daily'
      ]
    };
  }
}

class RecruiterAgent {
  private model;
  private agentId = 'recruiter';
  private agentName = 'Job Recruiter';

  constructor() {
    this.model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.6,
        topP: 0.9,
        maxOutputTokens: 1024,
      }
    });
  }

  async findRelevantJobs(profile: UserProfile, count: number = 10): Promise<JobListing[]> {
    try {
      const searchParams = {
        what: profile.targetRole || profile.currentRole || 'software engineer',
        where: profile.location || '',
        results_per_page: count,
        sort_by: 'relevance' as const,
        max_days_old: 7
      };

      console.log('🔍 Recruiter Agent: Searching for jobs...', searchParams);
      const response = await searchJobs(searchParams);
      console.log(`✅ Recruiter Agent: Found ${response.results.length} jobs`);
      return response.results;
    } catch (error) {
      console.error('❌ Recruiter Agent error:', error);
      return [];
    }
  }

  async analyzeJobMatch(job: JobListing, profile: UserProfile): Promise<number> {
    // Enhanced AI-powered matching algorithm (0-100 score)
    let score = 0;
    const jobText = `${job.title} ${job.description} ${job.category.label}`.toLowerCase();
    
    // 1. Skill matching (40 points)
    const matchingSkills = profile.skills.filter(skill => 
      jobText.includes(skill.toLowerCase())
    );
    score += (matchingSkills.length / Math.max(profile.skills.length, 1)) * 40;
    
    // 2. Title matching (30 points)
    const targetRole = (profile.targetRole || profile.currentRole || '').toLowerCase();
    const jobTitle = job.title.toLowerCase();
    if (targetRole && jobTitle.includes(targetRole)) {
      score += 30;
    } else if (targetRole && jobText.includes(targetRole)) {
      score += 15;
    }
    
    // 3. Experience level matching (15 points)
    const yearsExp = profile.experience.length;
    const isEntry = jobText.includes('entry') || jobText.includes('junior');
    const isMid = jobText.includes('mid-level') || jobText.includes('intermediate');
    const isSenior = jobText.includes('senior') || jobText.includes('lead') || jobText.includes('principal');
    
    if ((yearsExp < 2 && isEntry) || (yearsExp >= 2 && yearsExp <= 5 && isMid) || (yearsExp > 5 && isSenior)) {
      score += 15;
    } else if ((yearsExp >= 2 && isEntry) || (yearsExp > 5 && isMid)) {
      score += 7; // Partial match for overqualified
    }
    
    // 4. Location matching (10 points)
    const isRemote = jobText.includes('remote') || jobText.includes('work from home');
    if (isRemote) {
      score += 10;
    } else if (profile.location && job.location.display_name.toLowerCase().includes(profile.location.toLowerCase())) {
      score += 10;
    } else if (profile.location) {
      score += 3; // Partial for willing to relocate
    }
    
    // 5. Salary alignment (5 points)
    if (job.salary_min && profile.preferences?.salaryMin) {
      if (job.salary_min >= profile.preferences.salaryMin) {
        score += 5;
      } else if (job.salary_min >= profile.preferences.salaryMin * 0.8) {
        score += 2;
      }
    }
    
    return Math.min(100, Math.round(score));
  }

  async generateMessage(jobCount: number, topMatch?: JobListing): Promise<AgentMessage> {
    const companyName = topMatch?.company || 'Unknown Company';
    
    const actionItems = topMatch ? [
      `🎯 Priority: Apply to ${companyName} - ${topMatch.title}`,
      'Customize resume with keywords from job description',
      'Research company culture and recent news'
    ] : [
      'Review recommended jobs on Job Listings page',
      'Tailor your resume for each application',
      'Apply to at least 5 positions this week'
    ];

    const salaryInfo = topMatch?.salary_min && topMatch?.salary_max 
      ? `Salary range: $${Math.round(topMatch.salary_min/1000)}k-$${Math.round(topMatch.salary_max/1000)}k.`
      : 'Competitive salary.';

    return {
      agentId: this.agentId,
      agentName: this.agentName,
      timestamp: new Date(),
      message: `💼 Analyzed ${jobCount} opportunities! ${topMatch ? `Top recommendation: ${topMatch.title} at ${companyName} - excellent match for your background. ${salaryInfo} Apply ASAP!` : 'Check Job Listings for curated opportunities.'}`,
      actionItems: actionItems.slice(0, 3),
      data: { jobCount }
    };
  }
}

class CoachAgent {
  private model;
  private agentId = 'coach';
  private agentName = 'Career Coach';

  constructor() {
    this.model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
  }

  async generateMotivation(profile: UserProfile, progress: UserProgress): Promise<string> {
    const successRate = progress.applicationsSubmitted > 0 
      ? parseFloat(((progress.interviewsCompleted / progress.applicationsSubmitted) * 100).toFixed(1))
      : 0;
    
    const ratingText = successRate > 15 ? '(Excellent!)' : successRate > 10 ? '(Good)' : '(Needs improvement)';
    
    const prompt = `You are an expert Career Coach AI with psychology background. Generate a highly personalized, data-driven motivational message.

CANDIDATE PROFILE:
- Name: ${profile.fullName}
- Current Role: ${profile.currentRole || 'Job Seeker'}
- Target Role: ${profile.targetRole || 'Career Transition'}
- Experience Level: ${profile.experience.length} positions

PERFORMANCE METRICS:
- Applications Submitted: ${progress.applicationsSubmitted || 0}
- Interviews Secured: ${progress.interviewsCompleted || 0}
- Application-to-Interview Rate: ${successRate}% ${ratingText}
- Interview Readiness: ${progress.readinessScore || 0}/100
- Skills Learned This Month: ${progress.skillsLearned?.length || 0}
- Networking Connections: ${progress.networkingEvents || 0}

CONTEXT:
- Industry standard interview rate: 10-15%
- Average job search duration: 3-6 months
- November 2025: Strong tech hiring market

Generate a motivational message that:
1. Uses specific data points to celebrate wins (be concrete!)
2. Reframes challenges as opportunities
3. Provides ONE specific, actionable next step
4. References their target role by name
5. Maintains professional yet warm tone
6. Ends with an empowering statement

Length: 3-4 sentences (100-120 words). Be authentic and data-driven.`;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      const defaultMotivation = progress.applicationsSubmitted > 5
        ? `${profile.fullName}, you've submitted ${progress.applicationsSubmitted} applications - that's real momentum! Your ${successRate}% interview rate ${successRate > 10 ? 'exceeds' : 'is building toward'} industry standards. Focus on quality applications to ${profile.targetRole || 'your target role'} positions where your ${profile.skills[0] || 'unique skills'} truly shine. You're closer than you think! 🚀`
        : `${profile.fullName}, every career journey starts with action. ${progress.applicationsSubmitted || 0} applications submitted so far - let's build that momentum! Focus on 5-7 targeted applications this week to ${profile.targetRole || 'roles that excite you'}, emphasizing your ${profile.skills.slice(0,2).join(' and ')} expertise. Quality beats quantity every time! 💪`;
      return defaultMotivation;
    }
  }

  async trackProgress(currentProgress: UserProgress, weeklyGoals: WeeklyGoals): Promise<{
    completionRate: number;
    insights: string[];
    recommendations: string[];
  }> {
    const applicationsRate = Math.min(100, (currentProgress.applicationsSubmitted / Math.max(weeklyGoals.applications, 1)) * 100);
    const interviewRate = Math.min(100, (currentProgress.interviewsCompleted / Math.max(weeklyGoals.interviewPrep, 1)) * 100);
    const networkingRate = Math.min(100, (currentProgress.networkingEvents / Math.max(weeklyGoals.networking, 1)) * 100);
    const skillRate = Math.min(100, (currentProgress.skillsLearned.length / Math.max(weeklyGoals.skillDevelopment.length, 1)) * 100);
    
    const avgCompletion = (applicationsRate + interviewRate + networkingRate + skillRate) / 4;

    const insights: string[] = [];
    const recommendations: string[] = [];

    // Application pace analysis
    if (applicationsRate < 30) {
      insights.push('� Critical: Application volume is significantly below target');
      recommendations.push('Block 2-hour focused sessions daily for applications');
      recommendations.push('Use AI resume builder to speed up customization');
    } else if (applicationsRate < 60) {
      insights.push('⚠️ Application pace needs acceleration');
      recommendations.push('Aim for 2-3 quality applications daily');
    } else if (applicationsRate >= 80) {
      insights.push('✅ Outstanding application momentum - keep it up!');
      recommendations.push('Track which job boards yield best responses');
    }

    // Interview conversion analysis
    const conversionRate = currentProgress.applicationsSubmitted > 0
      ? (currentProgress.interviewsCompleted / currentProgress.applicationsSubmitted) * 100
      : 0;
    
    if (conversionRate < 8 && currentProgress.applicationsSubmitted > 10) {
      insights.push('📊 Application-to-interview rate below industry average (10-15%)');
      recommendations.push('Improve resume ATS score and use more targeted keywords');
      recommendations.push('Focus on companies where you have referrals or connections');
    } else if (conversionRate > 15) {
      insights.push('🎯 Excellent interview conversion rate - your applications are well-targeted!');
    }

    // Readiness analysis
    if (currentProgress.readinessScore < 50) {
      insights.push('⚠️ Interview readiness needs urgent attention');
      recommendations.push('Complete 5+ mock interviews this week using our Interview Prep tool');
      recommendations.push('Record yourself answering common questions and review');
    } else if (currentProgress.readinessScore < 70) {
      recommendations.push('Practice 2-3 mock interviews weekly to boost confidence');
    } else if (currentProgress.readinessScore >= 85) {
      insights.push('💪 Interview skills are sharp - you\'re ready for any opportunity!');
    }

    // Skill development analysis
    if (currentProgress.skillsLearned.length === 0 && weeklyGoals.skillDevelopment.length > 0) {
      insights.push('📚 No new skills learned yet this cycle');
      recommendations.push(`Focus on learning: ${weeklyGoals.skillDevelopment.slice(0, 2).join(', ')}`);
    }

    // Networking analysis
    if (networkingRate < 40) {
      recommendations.push('Reach out to 2-3 professionals in your target industry this week');
      recommendations.push('Comment on LinkedIn posts before sending connection requests');
    }

    // Overall momentum
    if (avgCompletion > 75) {
      insights.push('🔥 Exceptional momentum across all areas!');
    } else if (avgCompletion < 40) {
      insights.push('⚡ Let\'s rebuild momentum - start with small wins today');
    }

    return {
      completionRate: Math.round(avgCompletion),
      insights: insights.slice(0, 4),
      recommendations: recommendations.slice(0, 5)
    };
  }

  async generateMessage(progress: UserProgress, motivationalText: string): Promise<AgentMessage> {
    const analysis = await this.trackProgress(progress, { applications: 7, interviewPrep: 2, networking: 3, skillDevelopment: ['skill1', 'skill2'] });
    
    return {
      agentId: this.agentId,
      agentName: this.agentName,
      timestamp: new Date(),
      message: motivationalText,
      actionItems: [
        'Review your weekly progress dashboard',
        'Celebrate small wins',
        'Adjust strategy based on results'
      ],
      data: {
        applicationsSubmitted: progress.applicationsSubmitted,
        interviewsCompleted: progress.interviewsCompleted,
        networkingEvents: progress.networkingEvents,
        skillsLearned: progress.skillsLearned,
        readinessScore: progress.readinessScore
      }
    };
  }
}

class InterviewerAgent {
  private model;
  private agentId = 'interviewer';
  private agentName = 'Interview Coach';

  constructor() {
    this.model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 1536,
      }
    });
  }

  async assessReadiness(profile: UserProfile): Promise<{
    score: number;
    strengths: string[];
    improvements: string[];
    recommendedTopics: string[];
  }> {
    const yearsExp = profile.experience.length;
    const skillCount = profile.skills.length;
    
    const prompt = `You are an expert Interview Coach AI who has helped thousands of candidates succeed. Assess this candidate's interview readiness comprehensively.

CANDIDATE PROFILE:
- Name: ${profile.fullName}
- Current Role: ${profile.currentRole || 'Job Seeker'}
- Target Role: ${profile.targetRole || 'Career transition in progress'}
- Years of Experience: ${yearsExp} positions
- Technical Skills: ${profile.skills.join(', ')}
- Skill Breadth: ${skillCount} distinct skills
- Recent Companies: ${profile.experience.slice(0, 2).map(e => e.company).join(', ')}

ASSESSMENT CRITERIA (100 points total):
1. Technical Skill Alignment (30 pts): How well skills match target role requirements
2. Experience Relevance (25 pts): Position history matches career trajectory
3. Skill Diversity (15 pts): Breadth of technical and soft skills
4. Communication Readiness (15 pts): Ability to articulate experience (inferred from profile completeness)
5. Market Position (15 pts): Competitiveness in current market

SCORING GUIDELINES:
- 90-100: Exceptional - Ready for any interview, including FAANG
- 75-89: Strong - Ready for most interviews with minor prep
- 60-74: Moderate - Needs focused practice on weak areas
- 45-59: Developing - Requires significant interview preparation
- 0-44: Early - Needs foundational skill building

Return ONLY valid JSON:
{
  "score": 82,
  "strengths": [
    "Strong ${profile.targetRole || 'technical'} skills with ${profile.skills[0]}, ${profile.skills[1]}",
    "${yearsExp} years of progressive experience demonstrates growth mindset",
    "Diverse skill set covering ${skillCount} areas shows adaptability"
  ],
  "improvements": [
    "Practice articulating STAR method examples for key achievements",
    "Strengthen knowledge in [specific technical area based on target role]",
    "Prepare compelling answers for 'Why this company?' questions"
  ],
  "recommendedTopics": [
    "System Design Interviews (for ${profile.targetRole || 'target role'})",
    "Behavioral Questions using STAR method",
    "Company Research: Values, products, culture",
    "Salary Negotiation Strategies",
    "Technical Deep-Dive: ${profile.skills.slice(0, 2).join(' and ')}"
  ]
}

Be honest, specific, and actionable. Reference actual profile data.`;

    try {
      const result = await this.model.generateContent(prompt);
      let responseText = result.response.text().trim();
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const assessment = JSON.parse(responseText);
      console.log(`✅ Interviewer Agent: Readiness score ${assessment.score}/100`);
      return assessment;
    } catch (error) {
      console.error('❌ Interviewer assessment error:', error);
      // Intelligent fallback based on profile
      const baseScore = 50;
      const skillBonus = Math.min(20, skillCount * 2);
      const expBonus = Math.min(20, yearsExp * 4);
      const targetRoleBonus = profile.targetRole ? 10 : 0;
      
      return {
        score: Math.min(100, baseScore + skillBonus + expBonus + targetRoleBonus),
        strengths: [
          `${skillCount} technical skills show strong foundation`,
          `${yearsExp} positions demonstrate career progression`,
          profile.targetRole ? `Clear goal: ${profile.targetRole}` : 'Open to opportunities'
        ],
        improvements: [
          'Practice behavioral interview questions using STAR method',
          'Prepare 3-5 achievement stories with metrics',
          'Research target company culture and values'
        ],
        recommendedTopics: [
          `Technical interviews for ${profile.targetRole || profile.currentRole || 'your field'}`,
          'Behavioral questions and storytelling',
          'System design and architecture',
          'Salary negotiation tactics',
          'Follow-up and closing techniques'
        ]
      };
    }
  }

  async generateMockQuestions(profile: UserProfile, count: number = 5): Promise<string[]> {
    const targetRole = profile.targetRole || profile.currentRole || 'professional role';
    const topSkills = profile.skills.slice(0, 3).join(', ');
    
    const prompt = `You are an expert technical interviewer for ${targetRole} positions. Generate ${count} highly relevant, challenging interview questions.

CANDIDATE CONTEXT:
- Target Role: ${targetRole}
- Key Skills: ${topSkills}
- Experience Level: ${profile.experience.length} positions (${profile.experience.length < 2 ? 'Early Career' : profile.experience.length < 5 ? 'Mid-Level' : 'Senior'})

QUESTION MIX:
- 2 Technical/Skills-based questions (specific to ${topSkills})
- 2 Behavioral questions (STAR method format)
- 1 Situational/Problem-solving question

REQUIREMENTS:
- Questions must be role-specific and relevant to ${targetRole}
- Include at least one question that tests deep knowledge of ${profile.skills[0] || 'core skills'}
- One question should assess cultural fit and values
- Questions should match experience level (not too easy, not impossible)
- Be specific, not generic

Return as JSON array of exactly ${count} strings. Make questions realistic and actionable.

EXAMPLE FORMAT:
[
  "Describe a time when you had to optimize ${profile.skills[0]} performance under tight deadlines. What was your approach?",
  "How would you architect a ${targetRole} solution for [specific scenario]?",
  "Tell me about a conflict with a team member and how you resolved it.",
  "If a production system using ${profile.skills[1]} failed at 3am, walk me through your debugging process.",
  "Why are you interested in transitioning to ${targetRole} and what unique value do you bring?"
]`;

    try {
      const result = await this.model.generateContent(prompt);
      let responseText = result.response.text().trim();
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const questions = JSON.parse(responseText);
      console.log(`✅ Interviewer Agent: Generated ${questions.length} mock questions`);
      return questions;
    } catch (error) {
      console.error('❌ Mock question generation error:', error);
      // Intelligent fallback questions based on profile
      return [
        `Describe your experience building applications with ${profile.skills[0] || 'your primary technology'} and how you ensured code quality.`,
        `Tell me about a time when you had to learn ${profile.skills[1] || 'a new technology'} quickly for a project. What was your approach?`,
        `A stakeholder disagrees with your technical approach to implementing ${profile.skills[0] || 'a feature'}. How do you handle this?`,
        `Walk me through how you would design a scalable system for a ${targetRole} position at a high-growth startup.`,
        `Why are you interested in becoming a ${targetRole}, and what specific achievements make you qualified for this role?`
      ].slice(0, count);
    }
  }

  async generateMessage(readiness: ReadinessAssessment): Promise<AgentMessage> {
    const scoreEmoji = readiness.score >= 85 ? '🎯' : readiness.score >= 70 ? '💪' : readiness.score >= 55 ? '📈' : '⚡';
    const readinessLevel = readiness.score >= 85 ? 'Excellent!' : readiness.score >= 70 ? 'Good!' : readiness.score >= 55 ? 'Improving!' : 'Needs work!';
    
    return {
      agentId: this.agentId,
      agentName: this.agentName,
      timestamp: new Date(),
      message: `${scoreEmoji} Interview Readiness: ${readiness.score}/100 (${readinessLevel}). ${readiness.score >= 75 ? "You're well-prepared for interviews!" : readiness.score >= 60 ? "You're on the right track. Focus on these areas:" : "Let's build your confidence with targeted practice."} Key priorities: ${readiness.recommendedTopics.slice(0, 2).join(' and ')}.`,
      actionItems: [
        `Practice ${readiness.recommendedTopics[0] || 'mock interviews'}`,
        'Prepare 5 STAR method achievement stories',
        'Complete 3 mock interviews this week'
      ],
      data: {
        score: readiness.score,
        strengths: readiness.strengths,
        improvements: readiness.improvements,
        recommendedTopics: readiness.recommendedTopics
      }
    };
  }
}

// ==================== NEW SPECIALIZED AGENTS ====================

class ResearchAgent {
  private model;
  private agentId = 'researcher';
  private agentName = 'Market Researcher';

  constructor() {
    this.model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.6,
        topP: 0.85,
        maxOutputTokens: 2048,
      }
    });
  }

  async analyzeCompany(companyName: string, targetRole?: string): Promise<{
    overview: string;
    culture: string[];
    pros: string[];
    cons: string[];
    interviewTips: string[];
    salaryRange?: string;
  }> {
    const prompt = `You are a career research specialist with access to comprehensive company data. Analyze ${companyName} for a candidate interested in ${targetRole || 'professional roles'}.

Provide detailed insights on:
1. Company Overview: Business model, products, market position
2. Culture: Work environment, values, employee sentiment
3. Pros: Benefits, growth opportunities, reputation
4. Cons: Common challenges, areas to be aware of
5. Interview Tips: Specific preparation advice for ${companyName}
6. Salary Range: Typical compensation for ${targetRole || 'this role'}

Return ONLY valid JSON:
{
  "overview": "Brief 2-3 sentence company summary",
  "culture": ["Culture trait 1", "Culture trait 2", "Culture trait 3"],
  "pros": ["Pro 1", "Pro 2", "Pro 3"],
  "cons": ["Con 1", "Con 2"],
  "interviewTips": ["Tip 1 specific to ${companyName}", "Tip 2", "Tip 3"],
  "salaryRange": "$XXX,XXX - $XXX,XXX"
}`;

    try {
      const result = await this.model.generateContent(prompt);
      let responseText = result.response.text().trim();
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(responseText);
    } catch (error) {
      return {
        overview: `${companyName} is a growing company in the tech industry.`,
        culture: ['Collaborative environment', 'Innovation-focused', 'Work-life balance'],
        pros: ['Growth opportunities', 'Competitive compensation', 'Modern tech stack'],
        cons: ['Fast-paced environment', 'Limited documentation'],
        interviewTips: [
          'Research their products and recent news',
          'Prepare questions about team structure',
          'Showcase relevant project experience'
        ],
        salaryRange: 'Competitive market rates'
      };
    }
  }

  async analyzeTrends(industry: string, role: string): Promise<{
    currentTrends: string[];
    emergingSkills: string[];
    marketDemand: string;
    futureOutlook: string;
    recommendations: string[];
  }> {
    const prompt = `You are an industry analyst tracking career trends for November 2025. Analyze the ${industry} industry for ${role} positions.

Provide data-driven insights on:
1. Current Trends: What's hot right now
2. Emerging Skills: Skills gaining importance
3. Market Demand: High/Medium/Low and why
4. Future Outlook: 12-18 month forecast
5. Recommendations: Actionable advice for job seekers

Return ONLY valid JSON:
{
  "currentTrends": ["Trend 1", "Trend 2", "Trend 3"],
  "emergingSkills": ["Skill 1", "Skill 2", "Skill 3"],
  "marketDemand": "High - detailed explanation with data",
  "futureOutlook": "2-3 sentence forecast",
  "recommendations": ["Rec 1", "Rec 2", "Rec 3"]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      let responseText = result.response.text().trim();
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(responseText);
    } catch (error) {
      return {
        currentTrends: ['AI/ML integration', 'Remote-first culture', 'Focus on user experience'],
        emergingSkills: ['Generative AI', 'Cloud architecture', 'Data analysis'],
        marketDemand: 'High - Tech hiring remains strong with emphasis on AI skills',
        futureOutlook: 'Continued growth in tech sector with AI-related roles leading demand.',
        recommendations: [
          'Build projects showcasing AI/ML capabilities',
          'Network with professionals in target companies',
          'Stay updated on latest industry tools'
        ]
      };
    }
  }

  async generateMessage(researchType: string, data: Record<string, unknown>): Promise<AgentMessage> {
    return {
      agentId: this.agentId,
      agentName: this.agentName,
      timestamp: new Date(),
      message: `Research complete: ${researchType}`,
      actionItems: [
        'Review company insights before applying',
        'Tailor your resume to company culture',
        'Prepare company-specific interview questions'
      ],
      data
    };
  }
}

class NetworkingAgent {
  private model;
  private agentId = 'networker';
  private agentName = 'Networking Strategist';

  constructor() {
    this.model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.8,
        topP: 0.9,
        maxOutputTokens: 1536,
      }
    });
  }

  async generateLinkedInMessage(targetRole: string, targetPerson: string, context: string): Promise<{
    subject: string;
    message: string;
    tips: string[];
  }> {
    const prompt = `You are a networking expert who has helped thousands build meaningful professional relationships. Create a compelling LinkedIn outreach message.

TARGET CONTEXT:
- Role: ${targetRole}
- Person: ${targetPerson}
- Context: ${context}

BEST PRACTICES:
- Personalize based on their recent activity or achievements
- Be concise (150-200 words)
- Show genuine interest, not just asking for help
- Include a clear, low-pressure call-to-action
- Professional but warm tone

Return ONLY valid JSON:
{
  "subject": "Brief, engaging subject line",
  "message": "Full personalized message",
  "tips": ["Tip 1 for follow-up", "Tip 2 for building relationship", "Tip 3 for next steps"]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      let responseText = result.response.text().trim();
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(responseText);
    } catch (error) {
      return {
        subject: `Interested in ${targetRole} opportunities`,
        message: `Hi ${targetPerson},\n\nI came across your profile and was impressed by your work in ${targetRole}. ${context}\n\nI'm currently exploring similar opportunities and would love to learn from your experience. Would you be open to a brief 15-minute virtual coffee chat?\n\nBest regards`,
        tips: [
          'Comment on their recent posts before reaching out',
          'Send follow-up after 5-7 days if no response',
          'Offer value - share relevant articles or insights'
        ]
      };
    }
  }

  async generateNetworkingPlan(profile: UserProfile): Promise<{
    weeklyGoals: {
      newConnections: number;
      messagesPerWeek: number;
      eventAttendance: number;
    };
    targetGroups: string[];
    strategies: string[];
    templates: { situation: string; template: string }[];
  }> {
    const prompt = `You are a career networking strategist. Create a personalized networking plan for someone targeting ${profile.targetRole || profile.currentRole} positions.

PROFILE:
- Current Role: ${profile.currentRole || 'Job Seeker'}
- Target Role: ${profile.targetRole || 'Career advancement'}
- Skills: ${profile.skills.slice(0, 5).join(', ')}
- Location: ${profile.location || 'Remote/Flexible'}

Create a strategic networking plan with:
1. Weekly Goals: Realistic targets for connections and engagement
2. Target Groups: LinkedIn groups, communities, events to join
3. Strategies: Specific tactics for building meaningful connections
4. Templates: Message templates for different scenarios

Return ONLY valid JSON:
{
  "weeklyGoals": {
    "newConnections": 5,
    "messagesPerWeek": 8,
    "eventAttendance": 2
  },
  "targetGroups": ["Group 1", "Group 2", "Group 3"],
  "strategies": ["Strategy 1", "Strategy 2", "Strategy 3"],
  "templates": [
    {"situation": "Informational interview request", "template": "Message template"},
    {"situation": "Following up after event", "template": "Message template"},
    {"situation": "Asking for referral", "template": "Message template"}
  ]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      let responseText = result.response.text().trim();
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(responseText);
    } catch (error) {
      return {
        weeklyGoals: {
          newConnections: 5,
          messagesPerWeek: 8,
          eventAttendance: 2
        },
        targetGroups: [
          `${profile.targetRole || 'Tech'} Professionals Network`,
          'Industry-specific LinkedIn groups',
          'Local tech meetups and events'
        ],
        strategies: [
          'Engage with content before reaching out',
          'Offer value in initial messages',
          'Follow up consistently but not aggressively',
          'Attend virtual and in-person industry events'
        ],
        templates: [
          {
            situation: 'Informational interview request',
            template: 'Hi [Name], I admire your work in [specific area]. I\'m exploring [target role] and would love 15 minutes of your insights. Available for a quick call?'
          },
          {
            situation: 'Following up after event',
            template: 'Great meeting you at [event]! Enjoyed our discussion about [topic]. Would love to continue the conversation over coffee.'
          },
          {
            situation: 'Asking for referral',
            template: 'Hi [Name], I noticed [Company] is hiring for [role]. Given my experience in [skills], do you think I\'d be a good fit? I\'d appreciate any insights.'
          }
        ]
      };
    }
  }

  async generateMessage(actionType: string, data: Record<string, unknown>): Promise<AgentMessage> {
    return {
      agentId: this.agentId,
      agentName: this.agentName,
      timestamp: new Date(),
      message: `Networking guidance ready: ${actionType}`,
      actionItems: [
        'Start with low-pressure connections',
        'Engage authentically with content',
        'Track all networking activities'
      ],
      data
    };
  }
}

class NegotiationAgent {
  private model;
  private agentId = 'negotiator';
  private agentName = 'Salary Negotiator';

  constructor() {
    this.model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.6,
        topP: 0.85,
        maxOutputTokens: 1536,
      }
    });
  }

  async analyzeSalaryOffer(offer: {
    baseSalary: number;
    bonus?: number;
    equity?: string;
    benefits?: string[];
    location: string;
    role: string;
    company: string;
  }, profile: UserProfile): Promise<{
    analysis: string;
    marketComparison: string;
    totalCompensation: string;
    negotiationPower: 'Strong' | 'Moderate' | 'Limited';
    recommendations: string[];
    counterOfferScript: string;
  }> {
    const yearsExp = profile.experience.length;
    const prompt = `You are an expert salary negotiation coach. Analyze this job offer for a ${offer.role} position.

OFFER DETAILS:
- Base Salary: $${offer.baseSalary.toLocaleString()}
- Bonus: ${offer.bonus ? '$' + offer.bonus.toLocaleString() : 'Not specified'}
- Equity: ${offer.equity || 'Not specified'}
- Benefits: ${offer.benefits?.join(', ') || 'Standard package'}
- Company: ${offer.company}
- Location: ${offer.location}

CANDIDATE PROFILE:
- Years Experience: ${yearsExp}
- Skills: ${profile.skills.slice(0, 5).join(', ')}
- Current Role: ${profile.currentRole || 'Job Seeker'}
- Target Role: ${profile.targetRole || offer.role}

Provide comprehensive analysis:
1. Is this offer competitive for November 2025?
2. Market comparison for ${offer.role} in ${offer.location}
3. Total compensation estimate
4. Negotiation power assessment
5. Specific recommendations
6. Counter-offer script

Return ONLY valid JSON:
{
  "analysis": "Detailed 3-4 sentence analysis",
  "marketComparison": "This offer is [above/at/below] market. Typical range: $XXX-$XXX",
  "totalCompensation": "Total package worth approximately $XXX,XXX annually",
  "negotiationPower": "Strong|Moderate|Limited",
  "recommendations": ["Rec 1", "Rec 2", "Rec 3"],
  "counterOfferScript": "Professional counter-offer script"
}`;

    try {
      const result = await this.model.generateContent(prompt);
      let responseText = result.response.text().trim();
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(responseText);
    } catch (error) {
      const isCompetitive = offer.baseSalary >= 80000;
      return {
        analysis: `The base salary of $${offer.baseSalary.toLocaleString()} ${isCompetitive ? 'appears competitive' : 'may be below market'} for a ${offer.role} with ${yearsExp} years of experience. Consider the total package including benefits and growth potential.`,
        marketComparison: `Based on ${offer.location} market data, typical ${offer.role} salaries range from $${Math.round(offer.baseSalary * 0.85).toLocaleString()} to $${Math.round(offer.baseSalary * 1.25).toLocaleString()}.`,
        totalCompensation: `Total package approximately $${Math.round(offer.baseSalary + (offer.bonus || 0) * 1.1).toLocaleString()} annually`,
        negotiationPower: isCompetitive ? 'Moderate' : 'Strong',
        recommendations: [
          'Research comparable salaries on Levels.fyi and Glassdoor',
          'Consider long-term growth potential and learning opportunities',
          'Negotiate for sign-on bonus if base is firm',
          'Discuss performance review timeline and raise structure'
        ],
        counterOfferScript: `Thank you for the offer. I'm excited about this opportunity. Based on my ${yearsExp} years of experience and market research for ${offer.role} roles in ${offer.location}, I was hoping for a base closer to $${Math.round(offer.baseSalary * 1.15).toLocaleString()}. Is there flexibility here?`
      };
    }
  }

  async generateNegotiationStrategy(profile: UserProfile, offerStage: 'pre-offer' | 'offer-received' | 'negotiating'): Promise<{
    stage: string;
    keyPoints: string[];
    scripts: { scenario: string; script: string }[];
    mistakes: string[];
    timing: string;
  }> {
    const prompt = `You are a salary negotiation expert. Create a strategy for ${offerStage} stage.

CANDIDATE:
- Role: ${profile.targetRole || profile.currentRole}
- Experience: ${profile.experience.length} positions
- Skills: ${profile.skills.slice(0, 5).join(', ')}

Provide:
1. Key negotiation points for this stage
2. Scripts for common scenarios
3. Mistakes to avoid
4. Timing guidance

Return ONLY valid JSON:
{
  "stage": "${offerStage}",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "scripts": [
    {"scenario": "Scenario 1", "script": "What to say"},
    {"scenario": "Scenario 2", "script": "What to say"}
  ],
  "mistakes": ["Mistake 1", "Mistake 2"],
  "timing": "When to negotiate"
}`;

    try {
      const result = await this.model.generateContent(prompt);
      let responseText = result.response.text().trim();
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(responseText);
    } catch (error) {
      const strategies = {
        'pre-offer': {
          stage: 'pre-offer',
          keyPoints: [
            'Delay salary discussion until offer stage',
            'Focus on demonstrating value first',
            'Research market rates thoroughly'
          ],
          scripts: [
            {
              scenario: 'Asked for salary expectations',
              script: 'I\'m focused on finding the right fit first. I\'m confident we can agree on fair compensation once we determine I\'m the right candidate.'
            },
            {
              scenario: 'Pressed for a number',
              script: 'Based on my research and experience, I\'m targeting $XXX-$XXX range. However, I\'m open to discussing the full package once we move forward.'
            }
          ],
          mistakes: ['Giving a number too early', 'Underselling yourself', 'Not researching market rates'],
          timing: 'Avoid specific numbers until formal offer'
        },
        'offer-received': {
          stage: 'offer-received',
          keyPoints: [
            'Thank them and ask for time to review',
            'Evaluate total compensation, not just base',
            'Identify your negotiation leverage'
          ],
          scripts: [
            {
              scenario: 'Receiving the offer',
              script: 'Thank you so much! I\'m excited about this opportunity. I\'d like 24-48 hours to review everything carefully. Can we schedule a follow-up call?'
            },
            {
              scenario: 'Researching before response',
              script: 'I\'ve reviewed the offer thoroughly. While I\'m very interested, I was hoping we could discuss the compensation given my [specific skills/experience].'
            }
          ],
          mistakes: ['Accepting immediately', 'Negotiating via email only', 'Not expressing enthusiasm'],
          timing: 'Within 24-48 hours of receiving offer'
        },
        'negotiating': {
          stage: 'negotiating',
          keyPoints: [
            'Be confident but collaborative',
            'Use market data, not personal needs',
            'Consider non-salary benefits'
          ],
          scripts: [
            {
              scenario: 'Making counter-offer',
              script: 'Based on my [X years] experience and market rates for this role, I was hoping for $XXX. Is there flexibility here?'
            },
            {
              scenario: 'If base is firm',
              script: 'I understand budget constraints. Could we explore a sign-on bonus or earlier performance review instead?'
            },
            {
              scenario: 'Closing negotiation',
              script: 'I appreciate you working with me. If we can agree on [terms], I\'m ready to accept and start on [date].'
            }
          ],
          mistakes: ['Being aggressive', 'Negotiating too long', 'Making ultimatums', 'Not knowing your walk-away point'],
          timing: 'Complete negotiation within 5-7 days'
        }
      };

      return strategies[offerStage];
    }
  }

  async generateMessage(analysis: Record<string, unknown>): Promise<AgentMessage> {
    return {
      agentId: this.agentId,
      agentName: this.agentName,
      timestamp: new Date(),
      message: 'Salary analysis and negotiation strategy ready',
      actionItems: [
        'Review market data before negotiating',
        'Practice your negotiation script',
        'Know your walk-away number'
      ],
      data: analysis
    };
  }
}

class BrandingAgent {
  private model;
  private agentId = 'branding';
  private agentName = 'Personal Brand Strategist';

  constructor() {
    this.model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });
  }

  async analyzePersonalBrand(profile: UserProfile): Promise<{
    currentBrand: string;
    strengths: string[];
    gaps: string[];
    targetBrand: string;
    actionPlan: string[];
  }> {
    const prompt = `You are a personal branding expert for tech professionals. Analyze and improve this candidate's professional brand.

PROFILE:
- Name: ${profile.fullName}
- Current Role: ${profile.currentRole || 'Job Seeker'}
- Target Role: ${profile.targetRole || 'Career transition'}
- Skills: ${profile.skills.join(', ')}
- Experience: ${profile.experience.length} positions
- Recent Companies: ${profile.experience.slice(0, 2).map(e => e.company).join(', ')}

Analyze:
1. Current Brand: How they're likely perceived
2. Strengths: What stands out positively
3. Gaps: What's missing or unclear
4. Target Brand: What they should project for ${profile.targetRole}
5. Action Plan: Specific steps to build brand

Return ONLY valid JSON:
{
  "currentBrand": "2-3 sentence brand assessment",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "gaps": ["Gap 1", "Gap 2"],
  "targetBrand": "Ideal professional positioning",
  "actionPlan": ["Action 1", "Action 2", "Action 3", "Action 4"]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      let responseText = result.response.text().trim();
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(responseText);
    } catch (error) {
      return {
        currentBrand: `${profile.fullName} is positioned as a ${profile.currentRole || 'professional'} with expertise in ${profile.skills.slice(0, 3).join(', ')}.`,
        strengths: [
          `Strong technical foundation in ${profile.skills[0]}`,
          `${profile.experience.length} positions show career progression`,
          'Diverse skill set demonstrates adaptability'
        ],
        gaps: [
          'Online presence could be stronger',
          'Professional narrative needs refinement',
          'Thought leadership opportunities untapped'
        ],
        targetBrand: `${profile.fullName} should position as an experienced ${profile.targetRole || 'professional'} who delivers measurable results through ${profile.skills.slice(0, 2).join(' and ')} expertise.`,
        actionPlan: [
          'Update LinkedIn with compelling headline and summary',
          'Share 2-3 posts per week on industry topics',
          'Create portfolio showcasing 3-5 best projects',
          'Collect and display testimonials/recommendations',
          'Start a technical blog or contribute to publications'
        ]
      };
    }
  }

  async generateLinkedInProfile(profile: UserProfile): Promise<{
    headline: string;
    summary: string;
    keywordOptimization: string[];
    callToAction: string;
  }> {
    const prompt = `You are a LinkedIn optimization expert. Create a compelling profile for ${profile.targetRole || profile.currentRole} role.

CANDIDATE:
- Name: ${profile.fullName}
- Target Role: ${profile.targetRole || profile.currentRole}
- Skills: ${profile.skills.join(', ')}
- Experience: ${profile.experience.length} positions

Create:
1. Compelling headline (under 120 characters)
2. Engaging summary (3 paragraphs, 200-250 words)
3. Keywords for SEO optimization
4. Clear call-to-action

Return ONLY valid JSON:
{
  "headline": "Compelling headline with role + key skills",
  "summary": "3-paragraph summary highlighting value proposition",
  "keywordOptimization": ["Keyword 1", "Keyword 2", "Keyword 3"],
  "callToAction": "Clear next step for profile visitors"
}`;

    try {
      const result = await this.model.generateContent(prompt);
      let responseText = result.response.text().trim();
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(responseText);
    } catch (error) {
      const topSkills = profile.skills.slice(0, 2).join(' & ');
      return {
        headline: `${profile.targetRole || profile.currentRole} | ${topSkills} Expert | Helping Companies Build Better Products`,
        summary: `Experienced ${profile.targetRole || profile.currentRole} with a proven track record of delivering impactful solutions using ${topSkills}. ${profile.experience.length}+ years of experience across ${profile.experience.slice(0, 2).map(e => e.company).join(' and ')}.\n\nI specialize in ${profile.skills.slice(0, 3).join(', ')}, helping teams build scalable, user-focused products. My approach combines technical expertise with strategic thinking to solve complex business challenges.\n\nOpen to ${profile.targetRole || 'exciting opportunities'} where I can leverage my skills in ${topSkills} to drive meaningful results. Let's connect!`,
        keywordOptimization: profile.skills.slice(0, 10),
        callToAction: `Looking for ${profile.targetRole || 'new opportunities'}? Let's connect and explore how we can work together.`
      };
    }
  }

  async generateMessage(brandType: string, data: Record<string, unknown>): Promise<AgentMessage> {
    return {
      agentId: this.agentId,
      agentName: this.agentName,
      timestamp: new Date(),
      message: `Personal brand strategy ready: ${brandType}`,
      actionItems: [
        'Update all professional profiles consistently',
        'Start creating content in your niche',
        'Engage authentically with your network'
      ],
      data
    };
  }
}

// ==================== CAREER AGENT SWARM ORCHESTRATOR ====================

class CareerAgentSwarm {
  private plannerAgent: PlannerAgent;
  private recruiterAgent: RecruiterAgent;
  private coachAgent: CoachAgent;
  private interviewerAgent: InterviewerAgent;
  private researchAgent: ResearchAgent;
  private networkingAgent: NetworkingAgent;
  private negotiationAgent: NegotiationAgent;
  private brandingAgent: BrandingAgent;

  constructor() {
    this.plannerAgent = new PlannerAgent();
    this.recruiterAgent = new RecruiterAgent();
    this.coachAgent = new CoachAgent();
    this.interviewerAgent = new InterviewerAgent();
    this.researchAgent = new ResearchAgent();
    this.networkingAgent = new NetworkingAgent();
    this.negotiationAgent = new NegotiationAgent();
    this.brandingAgent = new BrandingAgent();
  }

  /**
   * Main orchestration method - runs all agents and creates a coordinated plan
   */
  async runSwarm(profile: UserProfile, currentState?: Partial<SwarmState>): Promise<SwarmState> {
    console.log('🚀 Starting Career Agent Swarm...');
    const startTime = Date.now();

    const conversation: AgentMessage[] = [];
    const weekNumber = (currentState?.currentWeek || 0) + 1;
    const currentProgress: UserProgress = currentState?.userProgress || {
      applicationsSubmitted: 0,
      interviewsCompleted: 0,
      networkingEvents: 0,
      skillsLearned: [],
      readinessScore: 0
    };

    try {
      // Phase 1: Planner creates weekly plan
      console.log('📋 Phase 1: Planner Agent creating weekly plan...');
      const weeklyPlan = await this.plannerAgent.createWeeklyPlan(profile, currentProgress, weekNumber);
      const plannerMsg = await this.plannerAgent.generateMessage('plan created');
      conversation.push(plannerMsg);

      // Phase 2: Recruiter finds relevant jobs
      console.log('💼 Phase 2: Recruiter Agent searching for jobs...');
      const jobs = await this.recruiterAgent.findRelevantJobs(profile, weeklyPlan.goals.applications);
      const recruiterMsg = await this.recruiterAgent.generateMessage(jobs.length, jobs[0]);
      conversation.push(recruiterMsg);

      // Phase 3: Interviewer assesses readiness
      console.log('🎯 Phase 3: Interviewer Agent assessing readiness...');
      const readiness = await this.interviewerAgent.assessReadiness(profile);
      currentProgress.readinessScore = readiness.score;
      const interviewerMsg = await this.interviewerAgent.generateMessage(readiness);
      conversation.push(interviewerMsg);

      // Phase 4: Coach tracks progress and motivates
      console.log('💪 Phase 4: Coach Agent analyzing progress...');
      const motivation = await this.coachAgent.generateMotivation(profile, currentProgress);
      const progressAnalysis = await this.coachAgent.trackProgress(currentProgress, weeklyPlan.goals);
      const coachMsg = await this.coachAgent.generateMessage(currentProgress, motivation);
      conversation.push(coachMsg);

      const endTime = Date.now();
      console.log(`✅ Swarm completed in ${endTime - startTime}ms`);

      return {
        userId: profile.fullName,
        currentWeek: weekNumber,
        weeklyPlans: [weeklyPlan, ...(currentState?.weeklyPlans || [])],
        agentConversation: conversation,
        lastUpdated: new Date(),
        userProgress: currentProgress
      };

    } catch (error) {
      console.error('❌ Swarm error:', error);
      throw new Error(`Agent swarm failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get individual agent responses
   */
  async getAgentInsight(agentType: 'planner' | 'recruiter' | 'coach' | 'interviewer' | 'researcher' | 'networker' | 'negotiator' | 'branding', profile: UserProfile, context?: Record<string, unknown>): Promise<AgentMessage> {
    switch (agentType) {
      case 'planner':
        return this.plannerAgent.generateMessage('insight requested');
      case 'recruiter': {
        const jobs = await this.recruiterAgent.findRelevantJobs(profile, 5);
        return this.recruiterAgent.generateMessage(jobs.length, jobs[0]);
      }
      case 'coach': {
        const defaultProgress: UserProgress = {
          applicationsSubmitted: 0,
          interviewsCompleted: 0,
          networkingEvents: 0,
          skillsLearned: [],
          readinessScore: 0
        };
        const progress = (context?.progress as UserProgress) || defaultProgress;
        const motivation = await this.coachAgent.generateMotivation(profile, progress);
        return this.coachAgent.generateMessage(progress, motivation);
      }
      case 'interviewer': {
        const readiness = await this.interviewerAgent.assessReadiness(profile);
        return this.interviewerAgent.generateMessage(readiness);
      }
      case 'researcher': {
        const companyName = (context?.companyName as string) || 'target company';
        const research = await this.researchAgent.analyzeCompany(companyName, profile.targetRole);
        return this.researchAgent.generateMessage('company-analysis', research);
      }
      case 'networker': {
        const plan = await this.networkingAgent.generateNetworkingPlan(profile);
        return this.networkingAgent.generateMessage('networking-plan', plan);
      }
      case 'negotiator': {
        const offer = context?.offer as {
          baseSalary: number;
          bonus?: number;
          equity?: string;
          benefits?: string[];
          location: string;
          role: string;
          company: string;
        };
        if (offer) {
          const analysis = await this.negotiationAgent.analyzeSalaryOffer(offer, profile);
          return this.negotiationAgent.generateMessage(analysis);
        }
        const strategy = await this.negotiationAgent.generateNegotiationStrategy(profile, 'pre-offer');
        return this.negotiationAgent.generateMessage(strategy);
      }
      case 'branding': {
        const brandAnalysis = await this.brandingAgent.analyzePersonalBrand(profile);
        return this.brandingAgent.generateMessage('brand-analysis', brandAnalysis);
      }
    }
  }

  /**
   * Research Agent: Analyze company or industry trends
   */
  async researchCompany(companyName: string, targetRole?: string) {
    return await this.researchAgent.analyzeCompany(companyName, targetRole);
  }

  async analyzeTrends(industry: string, role: string) {
    return await this.researchAgent.analyzeTrends(industry, role);
  }

  /**
   * Networking Agent: Generate outreach messages and networking plans
   */
  async generateLinkedInMessage(targetRole: string, targetPerson: string, context: string) {
    return await this.networkingAgent.generateLinkedInMessage(targetRole, targetPerson, context);
  }

  async getNetworkingPlan(profile: UserProfile) {
    return await this.networkingAgent.generateNetworkingPlan(profile);
  }

  /**
   * Negotiation Agent: Analyze offers and generate negotiation strategies
   */
  async analyzeSalaryOffer(offer: {
    baseSalary: number;
    bonus?: number;
    equity?: string;
    benefits?: string[];
    location: string;
    role: string;
    company: string;
  }, profile: UserProfile) {
    return await this.negotiationAgent.analyzeSalaryOffer(offer, profile);
  }

  async getNegotiationStrategy(profile: UserProfile, stage: 'pre-offer' | 'offer-received' | 'negotiating') {
    return await this.negotiationAgent.generateNegotiationStrategy(profile, stage);
  }

  /**
   * Branding Agent: Personal brand analysis and LinkedIn optimization
   */
  async analyzePersonalBrand(profile: UserProfile) {
    return await this.brandingAgent.analyzePersonalBrand(profile);
  }

  async generateLinkedInProfile(profile: UserProfile) {
    return await this.brandingAgent.generateLinkedInProfile(profile);
  }

  /**
   * Interviewer Agent: Direct access to interview prep methods
   */
  async assessInterviewReadiness(profile: UserProfile) {
    return await this.interviewerAgent.assessReadiness(profile);
  }

  async generateInterviewQuestions(profile: UserProfile, count: number = 5) {
    return await this.interviewerAgent.generateMockQuestions(profile, count);
  }
}

// Export singleton instance
export const careerAgentSwarm = new CareerAgentSwarm();

/**
 * AI Career Agent Swarm - Multi-Agent System
 * Coordinates 4 specialized agents working together to help users achieve career goals
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
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

// ==================== SWARM ORCHESTRATOR ====================

export class CareerAgentSwarm {
  private plannerAgent: PlannerAgent;
  private recruiterAgent: RecruiterAgent;
  private coachAgent: CoachAgent;
  private interviewerAgent: InterviewerAgent;

  constructor() {
    this.plannerAgent = new PlannerAgent();
    this.recruiterAgent = new RecruiterAgent();
    this.coachAgent = new CoachAgent();
    this.interviewerAgent = new InterviewerAgent();
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
  async getAgentInsight(agentType: 'planner' | 'recruiter' | 'coach' | 'interviewer', profile: UserProfile, context?: Record<string, unknown>): Promise<AgentMessage> {
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
    }
  }
}

// Export singleton instance
export const careerAgentSwarm = new CareerAgentSwarm();

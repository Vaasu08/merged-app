// Multi-Agent Career System using Groq (Browser-Compatible)
// Uses LangChain without LangGraph for browser compatibility

import { ChatGroq } from '@langchain/groq';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { searchJobs, type JobListing } from './adzunaService';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ResumeData {
    fullName: string;
    email?: string;
    phone?: string;
    location?: string;
    summary?: string;
    skills: string[];
    experience: Array<{
        position: string;
        company: string;
        startDate: string;
        endDate?: string;
        isCurrent?: boolean;
        description?: string;
    }>;
    education: Array<{
        degree: string;
        institution: string;
        year: string;
    }>;
    targetRole?: string;
    salaryExpectation?: number;
}

export interface AgentState {
    resume: ResumeData;

    // Planner outputs
    weeklyPlan?: WeeklyPlan;
    skillGaps?: string[];

    // Recruiter outputs
    jobRecommendations?: JobListing[];
    searchQuery?: string;

    // Interviewer outputs
    interviewQuestions?: string[];
    readinessScore?: number;
    strengths?: string[];
    improvements?: string[];

    // Coach outputs
    motivation?: string;
    actionItems?: string[];

    // Final consolidated output
    finalReport?: string;
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
    tasks: Task[];
}

export interface Task {
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    assignedAgent: string;
    status: 'pending' | 'completed';
    dueDate: string;
}

// ============================================================================
// INITIALIZE LLM (Groq with Llama 3.3 70B)
// ============================================================================

const getModel = () => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
    if (!apiKey || apiKey === 'your_groq_api_key_here') {
        throw new Error('❌ VITE_GROQ_API_KEY not configured in .env file');
    }

    return new ChatGroq({
        model: 'llama-3.3-70b-versatile',
        apiKey: apiKey,
        temperature: 0.7,
        maxTokens: 2048,
    });
};

// ============================================================================
// AGENT FUNCTIONS
// ============================================================================

/**
 * PLANNER AGENT
 */
async function runPlannerAgent(resume: ResumeData): Promise<{ weeklyPlan: WeeklyPlan; skillGaps: string[] }> {
    console.log('🎯 Planner Agent: Analyzing resume...');

    const model = getModel();

    const prompt = `You are an expert Career Planning AI. Analyze this resume and create a comprehensive weekly action plan.

RESUME:
- Name: ${resume.fullName}
- Target Role: ${resume.targetRole || 'Not specified'}
- Skills: ${resume.skills.join(', ')}
- Experience: ${resume.experience.length} positions
- Location: ${resume.location || 'Remote'}

TASK:
1. Identify skill gaps for the target role
2. Create a realistic weekly plan (7 days)
3. Set SMART goals (applications, networking, skill development, interview prep)
4. Generate 5-7 specific, actionable tasks

Return ONLY valid JSON:
{
  "skillGaps": ["skill1", "skill2", "skill3"],
  "weeklyPlan": {
    "week": 1,
    "startDate": "2025-11-21",
    "endDate": "2025-11-28",
    "goals": {
      "applications": 7,
      "networking": 3,
      "skillDevelopment": ["skill1", "skill2"],
      "interviewPrep": 2
    },
    "tasks": [
      {
        "id": "task-1",
        "title": "Apply to 7 ${resume.targetRole || 'relevant'} positions",
        "description": "Focus on companies matching your skills",
        "priority": "high",
        "assignedAgent": "recruiter",
        "status": "pending",
        "dueDate": "2025-11-28"
      }
    ]
  }
}`;

    try {
        const response = await model.invoke([new SystemMessage(prompt)]);
        let content = response.content.toString().trim();
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const result = JSON.parse(content);
        return { weeklyPlan: result.weeklyPlan, skillGaps: result.skillGaps };
    } catch (error) {
        console.error('❌ Planner Agent error:', error);

        const today = new Date();
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);

        return {
            skillGaps: ['System Design', 'Advanced Algorithms'],
            weeklyPlan: {
                week: 1,
                startDate: today.toISOString().split('T')[0],
                endDate: weekEnd.toISOString().split('T')[0],
                goals: {
                    applications: 7,
                    networking: 3,
                    skillDevelopment: resume.skills.slice(0, 2),
                    interviewPrep: 2
                },
                tasks: [{
                    id: 'task-1',
                    title: `Apply to 7 ${resume.targetRole || 'relevant'} positions`,
                    description: 'Focus on companies matching your skills',
                    priority: 'high',
                    assignedAgent: 'recruiter',
                    status: 'pending',
                    dueDate: weekEnd.toISOString().split('T')[0]
                }]
            }
        };
    }
}

/**
 * RECRUITER AGENT
 */
async function runRecruiterAgent(resume: ResumeData): Promise<{ searchQuery: string; jobRecommendations: JobListing[] }> {
    console.log('💼 Recruiter Agent: Searching for jobs...');

    const model = getModel();

    const queryPrompt = `You are an expert Technical Recruiter. Generate a highly optimized job search query.

CANDIDATE:
- Target Role: ${resume.targetRole || 'Software Engineer'}
- Top Skills: ${resume.skills.slice(0, 5).join(', ')}
- Experience: ${resume.experience.length} positions
- Location: ${resume.location || 'Remote'}

Create a concise search query (max 5 words) that includes the target role and 2-3 most critical skills.
Example: "Senior React Developer TypeScript"

Return ONLY the search query string, no explanation.`;

    try {
        const queryResponse = await model.invoke([new SystemMessage(queryPrompt)]);
        const searchQuery = queryResponse.content.toString().trim().replace(/['"]/g, '');

        console.log('🔍 Generated AI-optimized search query:', searchQuery);

        // Try to search for jobs via backend (port 3000)
        let rankedJobs: JobListing[] = [];

        try {
            const jobResults = await searchJobs({
                what: searchQuery,
                where: resume.location || '',
                results_per_page: 10,
                sort_by: 'relevance',
                max_days_old: 14
            });

            const jobs = jobResults.results || [];

            rankedJobs = jobs.map(job => {
                let score = 0;
                const jobText = `${job.title} ${job.description}`.toLowerCase();

                const matchingSkills = resume.skills.filter(skill =>
                    jobText.includes(skill.toLowerCase())
                );
                score += matchingSkills.length * 10;

                if (resume.targetRole && jobText.includes(resume.targetRole.toLowerCase())) {
                    score += 30;
                }

                return { ...job, relevanceScore: score };
            }).sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

            console.log(`✅ Found ${rankedJobs.length} jobs!`);
        } catch (jobError) {
            console.warn('⚠️ Job search failed. Backend may be down or RapidAPI key expired.');
            console.warn('💡 To fix: Ensure backend is running on http://localhost:3000');
            console.warn('Error:', jobError);
        }

        return {
            searchQuery,
            jobRecommendations: rankedJobs.slice(0, 10)
        };
    } catch (error) {
        console.error('❌ Recruiter Agent error:', error);
        return {
            searchQuery: resume.targetRole || 'software engineer',
            jobRecommendations: []
        };
    }
}

/**
 * INTERVIEWER AGENT
 */
async function runInterviewerAgent(resume: ResumeData): Promise<{
    readinessScore: number;
    strengths: string[];
    improvements: string[];
    interviewQuestions: string[];
}> {
    console.log('🎤 Interviewer Agent: Assessing readiness...');

    const model = getModel();

    const prompt = `You are an expert Interview Coach. Assess this candidate's interview readiness.

CANDIDATE:
- Target Role: ${resume.targetRole || 'Not specified'}
- Skills: ${resume.skills.join(', ')}
- Experience: ${resume.experience.length} positions

TASK:
1. Assess interview readiness (score 0-100)
2. List 3-5 key strengths
3. List 3-5 areas for improvement
4. Generate 5 highly relevant interview questions

Return ONLY valid JSON:
{
  "readinessScore": 75,
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2"],
  "questions": ["question1", "question2", "question3", "question4", "question5"]
}`;

    try {
        const response = await model.invoke([new SystemMessage(prompt)]);
        let content = response.content.toString().trim();
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const result = JSON.parse(content);

        return {
            readinessScore: result.readinessScore,
            strengths: result.strengths,
            improvements: result.improvements,
            interviewQuestions: result.questions
        };
    } catch (error) {
        console.error('❌ Interviewer Agent error:', error);

        return {
            readinessScore: 65,
            strengths: ['Strong technical foundation', 'Relevant experience'],
            improvements: ['Practice behavioral questions', 'Research target companies'],
            interviewQuestions: [
                `Describe your experience with ${resume.skills[0] || 'your primary technology'}.`,
                `Tell me about a challenging project you worked on.`,
                `How do you handle tight deadlines and pressure?`,
                `What interests you about this ${resume.targetRole || 'role'}?`,
                `Where do you see yourself in 3-5 years?`
            ]
        };
    }
}

/**
 * COACH AGENT
 */
async function runCoachAgent(
    resume: ResumeData,
    weeklyPlan: WeeklyPlan,
    jobCount: number,
    readinessScore: number
): Promise<{ motivation: string; actionItems: string[] }> {
    console.log('💪 Coach Agent: Generating motivation...');

    const model = getModel();

    const prompt = `You are an expert Career Coach. Provide personalized motivation and actionable guidance.

CANDIDATE STATUS:
- Name: ${resume.fullName}
- Target Role: ${resume.targetRole || 'Not specified'}
- Skills: ${resume.skills.slice(0, 5).join(', ')}
- Weekly Plan: ${weeklyPlan.tasks.length} tasks created
- Job Opportunities: ${jobCount} found
- Interview Readiness: ${readinessScore}%

TASK:
1. Write a motivational message (2-3 sentences)
2. Provide 5 specific action items for this week

Return ONLY valid JSON:
{
  "motivation": "Your personalized motivational message here...",
  "actionItems": ["action1", "action2", "action3", "action4", "action5"]
}`;

    try {
        const response = await model.invoke([new SystemMessage(prompt)]);
        let content = response.content.toString().trim();
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const result = JSON.parse(content);

        return {
            motivation: result.motivation,
            actionItems: result.actionItems
        };
    } catch (error) {
        console.error('❌ Coach Agent error:', error);

        return {
            motivation: `${resume.fullName}, your ${resume.skills.length} skills and experience make you a strong candidate for ${resume.targetRole || 'your target role'}. Stay focused, apply consistently, and success will follow!`,
            actionItems: [
                'Apply to at least 5 positions this week',
                'Practice answering the interview questions provided',
                'Update your LinkedIn profile',
                'Research target companies',
                'Network with professionals in your field'
            ]
        };
    }
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Run all agents in sequence
 */
export async function runCareerAgentSwarm(resume: ResumeData): Promise<AgentState> {
    console.log('🚀 Starting Multi-Agent Career Swarm (Powered by Llama 3.3 70B via Groq)...');
    console.log(`📄 Processing resume for: ${resume.fullName}`);

    try {
        // Run agents in sequence
        const plannerResult = await runPlannerAgent(resume);
        const recruiterResult = await runRecruiterAgent(resume);
        const interviewerResult = await runInterviewerAgent(resume);
        const coachResult = await runCoachAgent(
            resume,
            plannerResult.weeklyPlan,
            recruiterResult.jobRecommendations.length,
            interviewerResult.readinessScore
        );

        console.log('✅ All agents completed successfully!');

        return {
            resume,
            ...plannerResult,
            ...recruiterResult,
            ...interviewerResult,
            ...coachResult,
            finalReport: `Career Action Plan for ${resume.fullName} - Generated by AI Agents`
        };
    } catch (error) {
        console.error('❌ Agent Swarm error:', error);
        throw error;
    }
}

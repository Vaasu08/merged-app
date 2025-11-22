// LangGraph Multi-Agent Career System
// Uses LangGraph + LangChain with Groq (Llama 3.3 70B)

import { ChatGroq } from '@langchain/groq';
import { StateGraph, END, START } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
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
    messages: BaseMessage[];
    resume: ResumeData;
    currentStep: string;

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
        model: 'llama-3.3-70b-versatile', // Llama 3.3 70B - most capable model on Groq
        apiKey: apiKey,
        temperature: 0.7,
        maxTokens: 2048,
    });
};

// ============================================================================
// AGENT NODES
// ============================================================================

/**
 * PLANNER AGENT
 * Analyzes resume and creates personalized weekly plan with skill gap analysis
 */
async function plannerAgent(state: AgentState): Promise<Partial<AgentState>> {
    console.log('🎯 Planner Agent: Analyzing resume and creating weekly plan...');

    const model = getModel();
    const { resume } = state;

    const prompt = `You are an expert Career Planning AI. Analyze this resume and create a comprehensive weekly action plan.

RESUME ANALYSIS:
- Name: ${resume.fullName}
- Target Role: ${resume.targetRole || 'Not specified'}
- Current Skills: ${resume.skills.join(', ')}
- Experience: ${resume.experience.length} positions
- Location: ${resume.location || 'Remote'}

TASK:
1. Identify skill gaps for the target role
2. Create a realistic weekly plan (7 days)
3. Set SMART goals (applications, networking, skill development, interview prep)
4. Generate 5-7 specific, actionable tasks

Return ONLY valid JSON in this exact format:
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

        // Clean JSON from markdown
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const result = JSON.parse(content);

        return {
            skillGaps: result.skillGaps,
            weeklyPlan: result.weeklyPlan,
            messages: [...state.messages, new AIMessage({
                content: `📋 Created weekly plan with ${result.weeklyPlan.tasks.length} tasks. Identified ${result.skillGaps.length} skill gaps to address.`
            })],
            currentStep: 'planner_complete'
        };
    } catch (error) {
        console.error('❌ Planner Agent error:', error);

        // Fallback plan
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
                tasks: [
                    {
                        id: 'task-1',
                        title: `Apply to 7 ${resume.targetRole || 'relevant'} positions`,
                        description: 'Focus on companies matching your skills and experience',
                        priority: 'high',
                        assignedAgent: 'recruiter',
                        status: 'pending',
                        dueDate: weekEnd.toISOString().split('T')[0]
                    }
                ]
            },
            messages: [...state.messages, new AIMessage({
                content: '📋 Created basic weekly plan (fallback mode - check API key for full AI features)'
            })],
            currentStep: 'planner_complete'
        };
    }
}

/**
 * RECRUITER AGENT
 * Generates optimized job search query and finds relevant positions
 */
async function recruiterAgent(state: AgentState): Promise<Partial<AgentState>> {
    console.log('💼 Recruiter Agent: Searching for job opportunities...');

    const model = getModel();
    const { resume } = state;

    // Step 1: Generate optimized search query using AI
    const queryPrompt = `You are an expert Technical Recruiter. Generate a highly optimized job search query.

CANDIDATE PROFILE:
- Target Role: ${resume.targetRole || 'Software Engineer'}
- Top Skills: ${resume.skills.slice(0, 5).join(', ')}
- Experience: ${resume.experience.length} positions
- Location: ${resume.location || 'Remote'}

Create a concise search query (max 5 words) that includes the target role and 2-3 most critical skills.
Example: "Senior React Developer TypeScript" or "Full Stack Engineer AWS"

Return ONLY the search query string, no explanation.`;

    try {
        const queryResponse = await model.invoke([new SystemMessage(queryPrompt)]);
        const searchQuery = queryResponse.content.toString().trim().replace(/['"]/g, '');

        console.log('🔍 Generated search query:', searchQuery);

        // Step 2: Search for jobs
        const jobResults = await searchJobs({
            what: searchQuery,
            where: resume.location || '',
            results_per_page: 10,
            sort_by: 'relevance',
            max_days_old: 14
        });

        const jobs = jobResults.results || [];

        // Step 3: Rank jobs by relevance
        const rankedJobs = jobs.map(job => {
            let score = 0;
            const jobText = `${job.title} ${job.description}`.toLowerCase();

            // Skill matching
            const matchingSkills = resume.skills.filter(skill =>
                jobText.includes(skill.toLowerCase())
            );
            score += matchingSkills.length * 10;

            // Title matching
            if (resume.targetRole && jobText.includes(resume.targetRole.toLowerCase())) {
                score += 30;
            }

            return { ...job, relevanceScore: score };
        }).sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

        return {
            searchQuery,
            jobRecommendations: rankedJobs.slice(0, 10),
            messages: [...state.messages, new AIMessage({
                content: `💼 Found ${rankedJobs.length} relevant job opportunities. Top match: ${rankedJobs[0]?.title} at ${rankedJobs[0]?.company}`
            })],
            currentStep: 'recruiter_complete'
        };
    } catch (error) {
        console.error('❌ Recruiter Agent error:', error);
        return {
            searchQuery: resume.targetRole || 'software engineer',
            jobRecommendations: [],
            messages: [...state.messages, new AIMessage({
                content: '💼 Job search encountered an issue. Check Adzuna API configuration.'
            })],
            currentStep: 'recruiter_complete'
        };
    }
}

/**
 * INTERVIEWER AGENT
 * Assesses interview readiness and generates practice questions
 */
async function interviewerAgent(state: AgentState): Promise<Partial<AgentState>> {
    console.log('🎤 Interviewer Agent: Assessing readiness and generating questions...');

    const model = getModel();
    const { resume } = state;

    const prompt = `You are an expert Interview Coach. Assess this candidate's interview readiness and generate practice questions.

CANDIDATE PROFILE:
- Target Role: ${resume.targetRole || 'Not specified'}
- Skills: ${resume.skills.join(', ')}
- Experience: ${resume.experience.length} positions

TASK:
1. Assess interview readiness (score 0-100)
2. List 3-5 key strengths
3. List 3-5 areas for improvement
4. Generate 5 highly relevant interview questions for the target role

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
            interviewQuestions: result.questions,
            messages: [...state.messages, new AIMessage({
                content: `🎤 Interview readiness: ${result.readinessScore}%. Generated ${result.questions.length} practice questions.`
            })],
            currentStep: 'interviewer_complete'
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
            ],
            messages: [...state.messages, new AIMessage({
                content: '🎤 Interview assessment complete (fallback mode).'
            })],
            currentStep: 'interviewer_complete'
        };
    }
}

/**
 * COACH AGENT
 * Provides motivation, action items, and final guidance
 */
async function coachAgent(state: AgentState): Promise<Partial<AgentState>> {
    console.log('💪 Coach Agent: Generating personalized motivation and action plan...');

    const model = getModel();
    const { resume, weeklyPlan, jobRecommendations, readinessScore } = state;

    const prompt = `You are an expert Career Coach. Provide personalized motivation and actionable guidance.

CANDIDATE STATUS:
- Name: ${resume.fullName}
- Target Role: ${resume.targetRole || 'Not specified'}
- Skills: ${resume.skills.slice(0, 5).join(', ')}
- Weekly Plan: ${weeklyPlan?.tasks.length} tasks created
- Job Opportunities: ${jobRecommendations?.length || 0} found
- Interview Readiness: ${readinessScore}%

TASK:
1. Write a motivational message (2-3 sentences) that celebrates strengths and addresses challenges
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
            actionItems: result.actionItems,
            messages: [...state.messages, new AIMessage({
                content: `💪 ${result.motivation}`
            })],
            currentStep: 'coach_complete'
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
            ],
            messages: [...state.messages, new AIMessage({
                content: '💪 Motivation and action items generated (fallback mode).'
            })],
            currentStep: 'coach_complete'
        };
    }
}

/**
 * FINAL REPORT GENERATOR
 * Consolidates all agent outputs into a final report
 */
async function generateFinalReport(state: AgentState): Promise<Partial<AgentState>> {
    console.log('📊 Generating final consolidated report...');

    const report = `
# 🎯 Career Action Plan for ${state.resume.fullName}

## 📋 Weekly Plan (Week ${state.weeklyPlan?.week})
- **Applications Goal**: ${state.weeklyPlan?.goals.applications}
- **Networking Goal**: ${state.weeklyPlan?.goals.networking}
- **Skills to Develop**: ${state.weeklyPlan?.goals.skillDevelopment?.join(', ')}

## 💼 Job Opportunities
Found ${state.jobRecommendations?.length || 0} relevant positions.
**Top Recommendation**: ${state.jobRecommendations?.[0]?.title} at ${state.jobRecommendations?.[0]?.company}

## 🎤 Interview Readiness
**Score**: ${state.readinessScore}%
**Strengths**: ${state.strengths?.join(', ')}
**Improvements**: ${state.improvements?.join(', ')}

## 💪 Coach's Message
${state.motivation}

## ✅ Action Items
${state.actionItems?.map((item, i) => `${i + 1}. ${item}`).join('\n')}
`;

    return {
        finalReport: report,
        messages: [...state.messages, new AIMessage({
            content: '✅ Career action plan complete! All agents have provided their recommendations.'
        })],
        currentStep: 'complete'
    };
}

// ============================================================================
// LANGGRAPH WORKFLOW
// ============================================================================

/**
 * Build the multi-agent workflow graph
 */
function buildAgentGraph() {
    const workflow = new StateGraph<any>({
        channels: {
            messages: {
                reducer: (prev: any, next: any) => [...prev, ...next],
                default: () => []
            },
            resume: {
                reducer: (prev: any, next: any) => next || prev,
                default: () => ({})
            },
            currentStep: {
                reducer: (prev: any, next: any) => next || prev,
                default: () => 'start'
            },
            weeklyPlan: { reducer: (prev: any, next: any) => next || prev },
            skillGaps: { reducer: (prev: any, next: any) => next || prev },
            jobRecommendations: { reducer: (prev: any, next: any) => next || prev },
            searchQuery: { reducer: (prev: any, next: any) => next || prev },
            interviewQuestions: { reducer: (prev: any, next: any) => next || prev },
            readinessScore: { reducer: (prev: any, next: any) => next !== undefined ? next : prev },
            strengths: { reducer: (prev: any, next: any) => next || prev },
            improvements: { reducer: (prev: any, next: any) => next || prev },
            motivation: { reducer: (prev: any, next: any) => next || prev },
            actionItems: { reducer: (prev: any, next: any) => next || prev },
            finalReport: { reducer: (prev: any, next: any) => next || prev }
        }
    });

    // Add agent nodes
    (workflow as any).addNode('planner', plannerAgent);
    (workflow as any).addNode('recruiter', recruiterAgent);
    (workflow as any).addNode('interviewer', interviewerAgent);
    (workflow as any).addNode('coach', coachAgent);
    (workflow as any).addNode('finalize', generateFinalReport);

    // Define the flow: Planner → Recruiter → Interviewer → Coach → Finalize
    (workflow as any).addEdge('__start__', 'planner');
    (workflow as any).addEdge('planner', 'recruiter');
    (workflow as any).addEdge('recruiter', 'interviewer');
    (workflow as any).addEdge('interviewer', 'coach');
    (workflow as any).addEdge('coach', 'finalize');
    (workflow as any).addEdge('finalize', '__end__');

    return workflow.compile();
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Run the complete multi-agent career swarm
 * @param resume - User's resume data
 * @returns Complete agent state with all recommendations
 */
export async function runCareerAgentSwarm(resume: ResumeData): Promise<AgentState> {
    console.log('🚀 Starting LangGraph Career Agent Swarm (Powered by Llama 3.3 70B via Groq)...');
    console.log(`📄 Processing resume for: ${resume.fullName}`);

    const graph = buildAgentGraph();

    const initialState = {
        messages: [new HumanMessage({ content: `Analyze resume for ${resume.fullName} targeting ${resume.targetRole || 'career advancement'}` })],
        resume,
        currentStep: 'start'
    };

    try {
        const result = await graph.invoke(initialState);
        console.log('✅ Agent Swarm completed successfully!');
        return result as AgentState;
    } catch (error) {
        console.error('❌ Agent Swarm error:', error);
        throw error;
    }
}

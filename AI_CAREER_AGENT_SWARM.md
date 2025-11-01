# AI Career Agent Swarm - Implementation Guide

## Overview

A sophisticated multi-agent AI system where 4 specialized agents work together to provide comprehensive career guidance. Each agent has a unique role and they coordinate to create personalized weekly action plans.

## Architecture

### Agent Team Structure

```
CareerAgentSwarm (Orchestrator)
├── PlannerAgent: Designs weekly SMART goals
├── RecruiterAgent: Finds relevant job opportunities
├── CoachAgent: Tracks progress and motivates
└── InterviewerAgent: Assesses interview readiness
```

### Agent Responsibilities

#### 1. Planner Agent 🎯

- **Role**: Strategic planning and goal setting
- **Functions**:
  - `createWeeklyPlan()` - Generates SMART goals for the week
  - `generateMessage()` - Communicates plan to user
- **Output**:
  - Applications target (e.g., 7 per week)
  - Networking goals (e.g., 5 connections)
  - Interview prep sessions (e.g., 2 mock interviews)
  - Skills to develop (prioritized list)
  - Daily task breakdown with priorities

#### 2. Recruiter Agent 💼

- **Role**: Job search and matching
- **Functions**:
  - `findRelevantJobs()` - Uses Adzuna API for job search
  - `analyzeJobMatch()` - Scores job relevance (0-100)
  - `generateMessage()` - Reports job findings
- **Integration**: Leverages existing `/src/lib/adzunaService.ts`
- **Output**:
  - Top 5 matched jobs with scores
  - Application recommendations
  - Market insights

#### 3. Coach Agent 💪

- **Role**: Progress tracking and motivation
- **Functions**:
  - `generateMotivation()` - AI-powered personalized encouragement
  - `trackProgress()` - Analyzes completion rates
  - `generateMessage()` - Progress updates
- **Output**:
  - Weekly progress analysis
  - Insights on strengths/weaknesses
  - Motivational messaging
  - Recommendations for improvement

#### 4. Interviewer Agent 🎤

- **Role**: Interview preparation and assessment
- **Functions**:
  - `assessReadiness()` - Scores preparedness (0-100)
  - `generateMockQuestions()` - Creates role-specific questions
  - `generateMessage()` - Readiness feedback
- **Output**:
  - Readiness score (0-100)
  - 5 mock interview questions
  - Preparation recommendations
  - Confidence assessment

## Data Flow

### 1. User Input

```typescript
UserProfile {
  fullName: string;
  currentRole?: string;
  targetRole?: string;
  skills: string[];
  experience: Experience[];
  location?: string;
  preferences: {
    salaryMin?: number;
    remotePreference: 'remote' | 'hybrid' | 'onsite' | 'any';
  };
}
```

### 2. Swarm Execution

```typescript
async runSwarm(profile: UserProfile): Promise<SwarmState>
```

**Execution Sequence:**

1. **Planner** creates weekly plan based on profile and progress
2. **Recruiter** searches for jobs matching target role
3. **Interviewer** assesses readiness and generates questions
4. **Coach** analyzes progress and generates motivation
5. **Return** coordinated SwarmState with all outputs

### 3. Output Structure

```typescript
SwarmState {
  currentWeek: number;
  weeklyPlans: WeeklyPlan[];
  agentConversation: AgentMessage[];
  userProgress: {
    applicationsSubmitted: number;
    interviewsCompleted: number;
    networkingEvents: number;
    skillsLearned: string[];
    readinessScore: number;
  };
  lastUpdated: Date;
}
```

## UI Components

### Main Page: `/agent-swarm`

**File**: `/src/pages/AgentSwarm.tsx`

#### Features:

- **Agent Team Overview**: 4 cards showing each agent's role
- **Activate Button**: Triggers swarm execution
- **Progress Dashboard**:
  - Applications progress bar
  - Interviews completed
  - Readiness score gauge
  - Skills learned counter
- **Agent Conversation Feed**:
  - Chat-like interface
  - Color-coded by agent
  - Action items displayed as badges
  - Timestamps
- **Weekly Plan Display**:
  - Weekly goals summary
  - Task list with priorities
  - Status tracking (completed/pending)
  - Quick action buttons

#### Agent Visual Identity:

- **Planner**: Blue 🎯 (Target icon)
- **Recruiter**: Green 💼 (Briefcase icon)
- **Coach**: Purple 💪 (TrendingUp icon)
- **Interviewer**: Orange 🎤 (MessageSquare icon)

## AI Integration

### Google Gemini API

**Model**: `gemini-2.0-flash-exp`

#### Agent Prompts:

**Planner Prompt:**

```
Create a weekly career development plan for [user].
Goals: applications, networking, interview prep, skill development
Format: SMART goals with daily tasks
```

**Recruiter Integration:**

```typescript
// Uses existing Adzuna service
const jobs = await searchJobs({
  what: targetRole,
  where: location,
  results_per_page: 20,
});
```

**Coach Prompt:**

```
Generate motivational message for [user].
Context: Progress data, goals, completion rates
Tone: Encouraging, specific, actionable
```

**Interviewer Prompt:**

```
Assess interview readiness for [targetRole].
Generate 5 role-specific mock questions
Provide preparedness score and recommendations
```

## State Management

### localStorage Storage

```typescript
// Save state
localStorage.setItem(`swarm_state_${userId}`, JSON.stringify(state));

// Load state
const saved = localStorage.getItem(`swarm_state_${userId}`);
const state = JSON.parse(saved);
```

### State Persistence

- User progress tracked across weeks
- Weekly plans stored in array
- Agent conversations accumulated
- Last update timestamp maintained

## Usage Flow

### First Time User:

1. Click "Activate AI Agents" button
2. System fetches user profile and skills
3. All 4 agents execute in sequence
4. Weekly plan displayed with tasks
5. Progress tracking initialized

### Returning User:

1. Click "Run Weekly Update"
2. Previous state loaded from localStorage
3. Agents analyze progress since last week
4. New weekly plan generated
5. Progress metrics updated
6. Agent conversation extended

## Integration Points

### Existing Services:

- **Profile System**: `/src/lib/profile.ts`
  - `getUserProfile()` - Fetch user data
  - `getUserSkills()` - Get skill list
- **Job Search**: `/src/lib/adzunaService.ts`
  - `searchJobs()` - Find job listings
- **AI Service**: `@google/generative-ai`
  - Gemini API for agent intelligence

### Navigation:

- Route: `/agent-swarm` (protected)
- Header: "🤖 AI Agents" link (auth required)
- Homepage: Feature card (position #1)

## Future Enhancements

### Potential Improvements:

1. **Database Integration**:

   - Supabase tables for swarm state
   - Historical tracking over months
   - Analytics dashboard

2. **Real-time Updates**:

   - WebSocket for live agent communication
   - Streaming AI responses
   - Progressive task updates

3. **Agent Collaboration**:

   - Inter-agent messaging
   - Shared context optimization
   - Conflict resolution

4. **Advanced Features**:

   - Custom agent personalities
   - User feedback loop
   - A/B testing on strategies
   - Goal adjustment algorithms

5. **Notifications**:
   - Daily reminders for tasks
   - Weekly plan emails
   - Achievement celebrations

## API Keys Required

### Environment Variables:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_ADZUNA_APP_ID=your_adzuna_app_id
VITE_ADZUNA_API_KEY=your_adzuna_api_key
```

## Performance Considerations

### Optimization:

- **Parallel API Calls**: Where possible (non-dependent agents)
- **Caching**: Job listings cached for 1 hour
- **Lazy Loading**: Agent insights loaded on-demand
- **Error Handling**: Fallback content if AI fails
- **Rate Limiting**: Respect API quotas

### Average Response Times:

- Planner Agent: ~2-3 seconds
- Recruiter Agent: ~3-5 seconds (API dependent)
- Coach Agent: ~2-3 seconds
- Interviewer Agent: ~2-4 seconds
- **Total Swarm Execution**: ~10-15 seconds

## Testing

### Manual Testing:

1. Login as user with complete profile
2. Click "Activate AI Agents"
3. Verify all 4 agents generate messages
4. Check weekly plan tasks created
5. Verify progress metrics initialized
6. Test "Run Weekly Update" with modified progress
7. Check localStorage persistence

### Edge Cases:

- Empty profile (redirects to /profile)
- No target role (uses current role)
- No skills (generic recommendations)
- API failures (fallback content)
- Rate limiting (error handling)

## Credits

**Implementation Date**: January 2025
**AI Models Used**: Google Gemini 2.0 Flash
**Frameworks**: React, TypeScript, LangChain concepts
**Design Pattern**: Multi-agent orchestration

---

**Status**: ✅ Core implementation complete
**Next Steps**: Database integration, real-time updates, notifications

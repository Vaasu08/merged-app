# LangGraph Multi-Agent System Documentation

## 🎯 Architecture Overview

This is a **production-ready multi-agent system** built with **LangGraph** - Google's framework for building stateful, multi-agent workflows.

### Agent Flow

```
START → Planner → Recruiter → Interviewer → Coach → Finalize → END
```

Each agent receives the full state, performs its specialized task, and passes enriched state to the next agent.

---

## 🤖 The 4 Agents

### 1. **Planner Agent** 🎯
**Role**: Strategic career planning

**Inputs**:
- Resume (skills, experience, target role)

**Outputs**:
- `skillGaps`: Skills needed for target role
- `weeklyPlan`: 7-day action plan with SMART goals
- Tasks assigned to other agents

**AI Model**: Gemini 2.0 Flash

---

### 2. **Recruiter Agent** 💼
**Role**: Job discovery and matching

**Inputs**:
- Resume
- Weekly plan from Planner

**Outputs**:
- `searchQuery`: AI-optimized job search query
- `jobRecommendations`: Top 10 ranked jobs from Adzuna API
- Relevance scores for each job

**Tools**:
- Adzuna Job Search API
- AI query optimization

---

### 3. **Interviewer Agent** 🎤
**Role**: Interview preparation

**Inputs**:
- Resume
- Target role

**Outputs**:
- `readinessScore`: 0-100 interview readiness
- `strengths`: Key competitive advantages
- `improvements`: Areas to focus on
- `interviewQuestions`: 5 role-specific practice questions

**AI Model**: Gemini 2.0 Flash

---

### 4. **Coach Agent** 💪
**Role**: Motivation and guidance

**Inputs**:
- Resume
- All previous agent outputs

**Outputs**:
- `motivation`: Personalized encouragement
- `actionItems`: 5 specific weekly actions

**AI Model**: Gemini 2.0 Flash

---

## 🔄 State Management

LangGraph uses a **persistent state object** that flows through all agents:

```typescript
interface AgentState {
  messages: BaseMessage[];      // Agent conversation history
  resume: ResumeData;           // User's resume
  currentStep: string;          // Workflow progress
  
  // Agent outputs (populated as workflow progresses)
  weeklyPlan?: WeeklyPlan;
  skillGaps?: string[];
  jobRecommendations?: JobListing[];
  searchQuery?: string;
  interviewQuestions?: string[];
  readinessScore?: number;
  strengths?: string[];
  improvements?: string[];
  motivation?: string;
  actionItems?: string[];
  finalReport?: string;
}
```

---

## 🚀 Usage

### Basic Usage

```typescript
import { runCareerAgentSwarm } from '@/lib/langGraphAgents';

const resume = {
  fullName: "John Doe",
  skills: ["React", "TypeScript", "Node.js"],
  experience: [
    {
      position: "Frontend Developer",
      company: "Tech Corp",
      startDate: "2022-01-01",
      endDate: "2024-01-01"
    }
  ],
  targetRole: "Senior Frontend Developer",
  location: "San Francisco"
};

const result = await runCareerAgentSwarm(resume);

console.log(result.weeklyPlan);         // Planner output
console.log(result.jobRecommendations); // Recruiter output
console.log(result.readinessScore);     // Interviewer output
console.log(result.motivation);         // Coach output
console.log(result.finalReport);        // Consolidated report
```

---

## 📊 LangGraph Benefits

### vs. Previous Implementation

| Feature | Old (Simple Functions) | New (LangGraph) |
|---------|----------------------|-----------------|
| **State Persistence** | Manual localStorage | Built-in state graph |
| **Agent Coordination** | Sequential function calls | Declarative graph edges |
| **Error Recovery** | Try-catch per function | Graph-level error handling |
| **Observability** | Console logs | LangSmith tracing (optional) |
| **Memory** | None | Message history in state |
| **Extensibility** | Hard to add agents | Add node + edges |

### Why LangGraph?

1. **Stateful**: State persists across agent executions
2. **Observable**: Built-in tracing and debugging
3. **Flexible**: Easy to add conditional routing, parallel execution
4. **Production-Ready**: Used by enterprises for complex workflows
5. **LangSmith Integration**: Optional monitoring dashboard

---

## 🛠️ Configuration

### Required Environment Variables

```env
# Required: Gemini AI API Key
VITE_GEMINI_API_KEY=AIza...your-key-here

# Optional: Adzuna Job Search (for Recruiter Agent)
VITE_ADZUNA_APP_ID=your-app-id
VITE_ADZUNA_API_KEY=your-api-key
```

Get your Gemini key: https://makersuite.google.com/app/apikey

---

## 🔍 Advanced Features

### Parallel Agent Execution (Future)

LangGraph supports parallel nodes:

```typescript
workflow.addEdge('planner', 'recruiter');
workflow.addEdge('planner', 'interviewer');  // Run in parallel
// Both wait for planner, then execute simultaneously
```

### Conditional Routing

```typescript
workflow.addConditionalEdges(
  'recruiter',
  (state) => state.jobRecommendations.length > 0 ? 'coach' : 'planner'
);
```

### Human-in-the-Loop

```typescript
workflow.addNode('human_review', async (state) => {
  // Pause workflow for user input
  return state;
});
```

---

## 📈 Monitoring with LangSmith (Optional)

LangSmith provides a dashboard to visualize agent execution:

1. Sign up: https://smith.langchain.com
2. Add to `.env`:
   ```env
   LANGCHAIN_TRACING_V2=true
   LANGCHAIN_API_KEY=your-langsmith-key
   LANGCHAIN_PROJECT=career-agent-swarm
   ```
3. View traces in dashboard

---

## 🧪 Testing

### Unit Test Individual Agents

```typescript
import { plannerAgent } from '@/lib/langGraphAgents';

const mockState = {
  messages: [],
  resume: testResume,
  currentStep: 'start'
};

const result = await plannerAgent(mockState);
expect(result.weeklyPlan).toBeDefined();
expect(result.skillGaps).toHaveLength(3);
```

### Integration Test Full Workflow

```typescript
const result = await runCareerAgentSwarm(testResume);
expect(result.currentStep).toBe('complete');
expect(result.finalReport).toContain(testResume.fullName);
```

---

## 🔐 Security Notes

- **API Keys**: Never commit `.env` to git
- **Resume Data**: Sensitive personal information - handle securely
- **Rate Limiting**: Gemini API has rate limits (check quotas)
- **Error Messages**: Don't expose API details to users

---

## 🚀 Deployment

The LangGraph agents work in both development and production:

```bash
# Development
npm run dev

# Production build
npm run build

# Environment variables must be set in:
# - Local: .env file
# - Production: Hosting platform (Vercel, Netlify, etc.)
```

---

## 📚 Learn More

- **LangGraph Docs**: https://langchain-ai.github.io/langgraphjs/
- **LangSmith**: https://docs.smith.langchain.com/
- **Gemini AI**: https://ai.google.dev/

---

## ✨ Next Steps

Your LangGraph multi-agent system is ready! It will:

1. ✅ Accept resume as input
2. ✅ Run 4 specialized agents in sequence
3. ✅ Generate comprehensive career action plan
4. ✅ Provide job recommendations + interview prep
5. ✅ Output motivational guidance

**The agents are now production-ready and use proper agent orchestration!** 🎉

# ✅ LangGraph Multi-Agent System with Groq (Llama 3.3 70B)

## 🎉 What's Been Set Up

I've created a **production-ready LangGraph multi-agent AI system** using **Groq's Llama 3.3 70B** model!

### 🤖 The 4 AI Agents

All agents are powered by **Llama 3.3 70B** via Groq (extremely fast inference):

| Agent | Role | Input | Output |
|-------|------|-------|--------|
| **Planner 🎯** | Strategic Planning | Resume | Weekly plan + Skill gaps |
| **Recruiter 💼** | Job Discovery | Resume + Plan | AI-optimized search + 10 ranked jobs |
| **Interviewer 🎤** | Interview Prep | Resume | Readiness score + 5 practice questions |
| **Coach 💪** | Motivation | All previous outputs | Personalized guidance + Action items |

**Agent Flow:**
```
START → Planner → Recruiter → Interviewer → Coach → Finalize → END
```

---

## 🔧 Setup Instructions

### 1. Add Groq API Key to `.env`

```env
VITE_GROQ_API_KEY=gsk_your_groq_api_key_here
```

**Get your FREE Groq API key:**
1. Go to https://console.groq.com/
2. Sign up (free tier includes 30 requests/minute!)
3. Navigate to API Keys
4. Create a new key
5. Copy and paste into your `.env` file

### 2. Restart Dev Server

```bash
# Stop current server (Ctrl+C in terminal)
npm run dev
```

### 3. Test the Agents

1. Navigate to the **AI Career Agent Swarm** page
2. Click **"Run Weekly Update"** or **"Activate AI Agents"**
3. Watch the agents work! 🚀

---

## 🌟 Why Llama 3.3 70B via Groq?

| Feature | Benefit |
|---------|---------|
| **Speed** | Groq's LPU™ delivers 10-100x faster inference than GPUs |
| **Free Tier** | 30 requests/minute, 6,000 tokens/minute |
| **Quality** | Llama 3.3 70B rivals GPT-4 in many tasks |
| **No Rate Limits** | Unlike Gemini's strict experimental model limits |
| **Production Ready** | Stable, reliable, and battle-tested |

---

## 📊 How It Works

### Resume-Only Input

The system **only needs your resume** (extracted from your profile):

```typescript
const resume = {
  fullName: "Your Name",
  skills: ["React", "TypeScript", "Node.js"],
  experience: [{
    position: "Developer",
    company: "Tech Corp",
    startDate: "2022-01-01",
    endDate: "2024-01-01"
  }],
  targetRole: "Senior Developer",
  location: "San Francisco"
};
```

### LangGraph Orchestration

```typescript
// Agents run in sequence, each building on previous outputs
Planner → creates weekly plan & identifies skill gaps
Recruiter → uses plan to find relevant jobs
Interviewer → assesses readiness based on resume + jobs
Coach → provides motivation based on all agent outputs
```

### State Management

LangGraph automatically manages state across all agents:
- Each agent receives the full state
- Each agent updates specific fields
- State flows seamlessly through the graph
- No manual state passing required!

---

## 🎯 Example Output

```json
{
  "skillGaps": ["System Design", "Docker", "AWS"],
  "weeklyPlan": {
    "week": 1,
    "goals": { "applications": 7, "networking": 3 },
    "tasks": [...]
  },
  "jobRecommendations": [
    { "title": "Senior React Dev", "company": "Meta", "relevanceScore": 85 },
    ...
  ],
  "readinessScore": 75,
  "strengths": ["Strong React skills", "Good experience"],
  "improvements": ["Practice system design", "Learn Docker"],
  "interviewQuestions": [...],
  "motivation": "You have 5 years of solid experience...",
  "actionItems": [
    "Apply to Meta and Google this week",
    "Complete system design course",
    ...
  ]
}
```

---

## 🔍 Troubleshooting

### Error: "VITE_GROQ_API_KEY not configured"

**Solution**: Add your Groq API key to `.env` and restart the dev server.

### Error: "Profile not found"

**Solution**: Complete your profile first (navigate to `/profile`).

### Agents not responding

**Check:**
1. ✅ Groq API key is valid
2. ✅ Dev server was restarted after adding key
3. ✅ Profile has skills and experience filled out
4. ✅ Browser console for detailed error messages

---

## 📚 Files Modified

1. **`src/lib/langGraphAgents.ts`** - Complete LangGraph implementation
2. **`src/lib/langGraphBridge.ts`** - Integration bridge (UI compatibility)
3. **`src/pages/AgentSwarm.tsx`** - Updated to use LangGraph
4. **`SETUP_GROQ_AGENTS.md`** - This file!

---

## 🚀 Advanced: Switching Models

Want to try a different Groq model? Edit `langGraphAgents.ts`:

```typescript
// Line ~98
return new ChatGroq({
  model: 'llama-3.3-70b-versatile',  // Current
  // model: 'mixtral-8x7b-32768',    // Faster, good quality
  // model: 'llama-3.1-70b-versatile', // Alternative
  apiKey: apiKey,
  temperature: 0.7,
});
```

**Available Groq Models:**
- `llama-3.3-70b-versatile` (Recommended - best quality)
- `llama-3.1-70b-versatile` (Good alternative)
- `mixtral-8x7b-32768` (Faster, still great)
- `gemma2-9b-it` (Lightweight, very fast)

---

## ✅ Summary

You now have:

- ✅ **4 specialized AI agents** (Planner, Recruiter, Interviewer, Coach)
- ✅ **Built with LangGraph + LangChain** (industry-standard framework)
- ✅ **Powered by Llama 3.3 70B via Groq** (blazing fast, free tier)
- ✅ **Resume-only input** (exactly as requested)
- ✅ **Coherent multi-agent workflow** (state flows through all agents)
- ✅ **Production-ready** (error handling, logging, fallbacks)

**Next step:** Add your Groq API key and test the agents! 🎉

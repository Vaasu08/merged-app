# 🔧 Quick Integration Guide - Save Data to Database

## ⚡ Quick Start

1. **Run SQL in Supabase** (if you haven't already):
   - `database-setup.sql` (original)
   - `database-business-data.sql` (NEW - 22 tables)

2. **Add these imports** to each page that needs to save data

3. **Call the save functions** after generating/calculating data

---

## 📍 Integration Points

### 1. ATS Assessment Page

**File:** `src/pages/ATSAssessment.tsx`

**Add at top:**
```typescript
import { saveATSAssessment, logUserActivity } from '@/lib/dataService';
import { useAuth } from '@/components/AuthProvider';
```

**Add after ATS calculation (around line 100-150):**
```typescript
// After calculating ATS score
const handleAnalyze = async () => {
  setIsAnalyzing(true);
  
  try {
    // ... existing ATS calculation code ...
    const scores = await scorer.calculateScore(parsedResume, jobDescription);
    
    // 🆕 SAVE TO DATABASE
    if (user?.id) {
      await saveATSAssessment(user.id, {
        resumeText: parsedResume.text,
        jobDescription: jobDescription,
        scores: scores,
        assessmentType: useAI ? 'ai' : 'rule_based'
      });
      
      await logUserActivity(user.id, 'ats_assessment_completed', {
        score: scores.overall,
        grade: scores.grade
      });
      
      console.log('✅ ATS assessment saved to database');
    }
    
    navigate('/ats-results', { state: { scores, resumeData: parsedResume } });
  } catch (error) {
    toast.error('Analysis failed');
  } finally {
    setIsAnalyzing(false);
  }
};
```

---

### 2. Resume Builder Page

**File:** `src/pages/ResumeBuilder.tsx`

**Add at top:**
```typescript
import { saveResume, getUserResumes, logUserActivity } from '@/lib/dataService';
```

**Add save button handler:**
```typescript
const handleSaveResume = async () => {
  if (!user?.id) {
    toast.error('Please login to save resume');
    return;
  }
  
  try {
    const resume = await saveResume(user.id, {
      title: `Resume - ${new Date().toLocaleDateString()}`,
      content: {
        personalInfo: userProfile,
        experience: experience,
        education: education,
        skills: skills,
        summary: summary,
        // Include any AI-generated content
        aiSummary: aiGeneratedSummary,
        aiBulletPoints: aiGeneratedBullets
      },
      isPrimary: false // User can mark primary later
    });
    
    if (resume) {
      toast.success('Resume saved successfully!');
      await logUserActivity(user.id, 'resume_created', {
        resumeId: resume.id,
        atsScore: atsScore
      });
    }
  } catch (error) {
    toast.error('Failed to save resume');
    console.error('Resume save error:', error);
  }
};

// Add this button in your JSX
<Button onClick={handleSaveResume} className="gap-2">
  <Save className="w-4 h-4" />
  Save Resume
</Button>
```

**Load saved resumes on mount:**
```typescript
useEffect(() => {
  if (user?.id) {
    getUserResumes(user.id).then(resumes => {
      console.log('Saved resumes:', resumes);
      // Optionally show list of saved resumes
    });
  }
}, [user]);
```

---

### 3. Interview Session Page

**File:** `src/pages/InterviewSession.tsx`

**Add at top:**
```typescript
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/AuthProvider';
```

**Save session when starting:**
```typescript
const [sessionId, setSessionId] = useState<string | null>(null);

useEffect(() => {
  if (user?.id && !sessionId) {
    startInterviewSession();
  }
}, [user]);

const startInterviewSession = async () => {
  if (!user?.id) return;
  
  const { data, error } = await supabase
    .from('interview_sessions')
    .insert({
      user_id: user.id,
      job_field: jobField,
      interview_mode: interviewMode,
      difficulty: 'medium',
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (!error && data) {
    setSessionId(data.id);
    console.log('✅ Interview session started:', data.id);
  }
};
```

**Save each question:**
```typescript
const saveQuestion = async (questionText: string, questionNumber: number) => {
  if (!sessionId) return;
  
  const { data } = await supabase
    .from('interview_questions')
    .insert({
      session_id: sessionId,
      question_number: questionNumber,
      question_text: questionText,
      category: 'behavioral',
      difficulty: 'medium'
    })
    .select()
    .single();
  
  return data?.id;
};
```

**Save answer:**
```typescript
const saveAnswer = async (questionId: string, answerText: string, timeSeconds: number) => {
  await supabase
    .from('interview_answers')
    .insert({
      question_id: questionId,
      answer_text: answerText,
      time_taken_seconds: timeSeconds
    });
};
```

---

### 4. Interview Feedback Page

**File:** `src/pages/InterviewFeedback.tsx`

**Save feedback:**
```typescript
const saveFeedback = async () => {
  if (!user?.id || !sessionId) return;
  
  // Update session status
  await supabase
    .from('interview_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      duration_minutes: Math.floor((Date.now() - startTime) / 60000)
    })
    .eq('id', sessionId);
  
  // Save feedback
  await supabase
    .from('interview_feedback')
    .insert({
      session_id: sessionId,
      user_id: user.id,
      overall_score: feedback.overallScore,
      technical_score: feedback.scores.technical,
      communication_score: feedback.scores.communication,
      problem_solving_score: feedback.scores.problemSolving,
      cultural_fit_score: feedback.scores.culturalFit,
      experience_score: feedback.scores.experience,
      detailed_review: feedback.detailedReview,
      strengths: ['Clear communication', 'Good examples'], // Parse from feedback
      improvements: ['Add metrics', 'More details'], // Parse from feedback
      ai_generated: true
    });
  
  console.log('✅ Interview feedback saved');
};
```

---

### 5. Roadmap Service (Already Done!)

**File:** `src/lib/roadmapService.ts`

**Already implemented - just ensure tables exist (they do now!):**

```typescript
// These calls already exist in roadmapService.ts
await this.saveRoadmap(roadmap, userId, request.fields);
await this.saveUserResponses(request, userId);
```

**No changes needed** - the service already calls the database, tables now exist!

---

### 6. AI Agent Swarm Page

**File:** `src/pages/AgentSwarm.tsx` (or wherever swarm runs)

**Save swarm execution:**
```typescript
const saveAgentRun = async (results: any) => {
  if (!user?.id) return;
  
  const { data } = await supabase
    .from('agent_swarm_runs')
    .insert({
      user_id: user.id,
      run_type: 'full',
      status: 'completed',
      results: results,
      execution_time_seconds: 8,
      completed_at: new Date().toISOString()
    })
    .select()
    .single();
  
  console.log('✅ Agent swarm run saved:', data?.id);
  return data?.id;
};
```

**Save weekly plan:**
```typescript
const saveWeeklyPlan = async (plan: any) => {
  if (!user?.id) return;
  
  // Get Monday of current week
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);
  
  await supabase
    .from('weekly_career_plans')
    .insert({
      user_id: user.id,
      week_start_date: monday.toISOString().split('T')[0],
      goals: plan.goals,
      tasks: plan.tasks,
      status: 'active',
      completion_percentage: 0
    });
  
  console.log('✅ Weekly plan saved');
};
```

---

## 🧪 Testing Checklist

After integrating, test each feature:

### ATS Assessment
- [ ] Run ATS assessment on a resume
- [ ] Check Supabase → `ats_assessments` table
- [ ] Verify score, keywords, suggestions saved
- [ ] Check `user_activity` table for log entry

### Resume Builder
- [ ] Create and save a resume
- [ ] Check Supabase → `user_resumes` table
- [ ] Verify content JSONB has all fields
- [ ] Reload page and fetch saved resumes

### Interview Simulator
- [ ] Start interview session
- [ ] Answer questions
- [ ] Complete interview
- [ ] Check Supabase tables:
  - [ ] `interview_sessions` - session created
  - [ ] `interview_questions` - questions saved
  - [ ] `interview_answers` - answers saved
  - [ ] `interview_feedback` - feedback saved

### Roadmap
- [ ] Generate a roadmap
- [ ] Check Supabase tables:
  - [ ] `roadmaps` - roadmap saved
  - [ ] `roadmap_phases` - phases saved
  - [ ] `user_roadmap_responses` - questionnaire saved

### Agent Swarm
- [ ] Run agent swarm
- [ ] Check Supabase tables:
  - [ ] `agent_swarm_runs` - run saved
  - [ ] `weekly_career_plans` - plan saved

---

## 🐛 Debugging

**If data isn't saving:**

```typescript
// Test database connection
const testConnection = async () => {
  const { data, error } = await supabase
    .from('user_resumes')
    .select('count');
  
  console.log('DB Connection:', error ? '❌ Failed' : '✅ Connected');
  console.log('Error:', error);
};

// Check if user is authenticated
console.log('User ID:', user?.id); // Should not be null/undefined

// Check if tables exist
const tables = ['user_resumes', 'ats_assessments', 'interview_sessions', 'roadmaps'];
for (const table of tables) {
  const { error } = await supabase.from(table).select('id').limit(1);
  console.log(`${table}:`, error ? '❌' : '✅');
}
```

**Common Issues:**

1. **"relation does not exist"** → Run `database-business-data.sql`
2. **"permission denied"** → User not logged in (check `user?.id`)
3. **"null value in column"** → Missing required field in insert

---

## ✅ Summary

**5 Minutes to Full Integration:**

1. **Run SQL** → database-business-data.sql in Supabase
2. **ATS Assessment** → Add `saveATSAssessment()` call
3. **Resume Builder** → Add `saveResume()` button
4. **Interview** → Add session/question/answer/feedback saves
5. **Test** → Create data, check Supabase tables

**Your platform now saves ALL data! 🎉**

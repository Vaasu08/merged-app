-- Horizon Career Platform - Production Database Schema
-- Run in Supabase SQL Editor

-- =====================================================
-- USER MANAGEMENT
-- =====================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  bio TEXT,
  website TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  current_position TEXT,
  current_company TEXT,
  experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead', 'executive')),
  availability TEXT CHECK (availability IN ('available', 'busy', 'not_looking')),
  salary_expectation NUMERIC,
  currency TEXT DEFAULT 'USD',
  work_preference TEXT CHECK (work_preference IN ('remote', 'hybrid', 'onsite')),
  education JSONB DEFAULT '[]'::jsonb,
  experience JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  languages JSONB DEFAULT '[]'::jsonb,
  interests JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_skills (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- RESUME MANAGEMENT
-- =====================================================

CREATE TABLE IF NOT EXISTS user_resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ats_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resume_id UUID REFERENCES user_resumes(id) ON DELETE CASCADE,
  job_description TEXT,
  overall_score INTEGER NOT NULL,
  keyword_match INTEGER NOT NULL,
  skills_match INTEGER NOT NULL,
  experience_score INTEGER NOT NULL,
  education_score INTEGER NOT NULL,
  formatting_score INTEGER NOT NULL,
  grade TEXT NOT NULL,
  matched_keywords JSONB DEFAULT '[]'::jsonb,
  missing_keywords JSONB DEFAULT '[]'::jsonb,
  suggestions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ROADMAP & CAREER PLANNING
-- =====================================================

CREATE TABLE IF NOT EXISTS roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  target_role TEXT NOT NULL,
  current_level TEXT,
  timeline_weeks INTEGER DEFAULT 12,
  status TEXT CHECK (status IN ('active', 'completed', 'paused')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roadmap_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID REFERENCES roadmaps(id) ON DELETE CASCADE NOT NULL,
  phase_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER NOT NULL,
  resources JSONB DEFAULT '[]'::jsonb,
  milestones JSONB DEFAULT '[]'::jsonb,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INTERVIEW PREPARATION
-- =====================================================

CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_role TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  question_count INTEGER DEFAULT 5,
  duration_minutes INTEGER,
  overall_score NUMERIC(5,2),
  technical_score NUMERIC(5,2),
  communication_score NUMERIC(5,2),
  confidence_score NUMERIC(5,2),
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interview_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE NOT NULL,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  user_answer TEXT,
  audio_url TEXT,
  video_url TEXT,
  ai_feedback TEXT,
  score NUMERIC(5,2),
  strengths JSONB DEFAULT '[]'::jsonb,
  improvements JSONB DEFAULT '[]'::jsonb,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CAREER ASSESSMENT
-- =====================================================

CREATE TABLE IF NOT EXISTS career_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assessment_type TEXT NOT NULL,
  responses JSONB NOT NULL,
  results JSONB NOT NULL,
  recommended_careers JSONB DEFAULT '[]'::jsonb,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- JOB APPLICATIONS TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_url TEXT,
  status TEXT CHECK (status IN ('saved', 'applied', 'interviewing', 'offered', 'rejected', 'accepted')) DEFAULT 'saved',
  applied_date DATE,
  response_date DATE,
  notes TEXT,
  resume_id UUID REFERENCES user_resumes(id),
  salary_range TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON user_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles(location);
CREATE INDEX IF NOT EXISTS idx_user_profiles_experience_level ON user_profiles(experience_level);
CREATE INDEX IF NOT EXISTS idx_user_resumes_user_id ON user_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_resumes_is_primary ON user_resumes(is_primary);
CREATE INDEX IF NOT EXISTS idx_ats_scores_user_id ON ats_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_ats_scores_resume_id ON ats_scores(resume_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_phases_roadmap_id ON roadmap_phases(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_responses_session_id ON interview_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_career_assessments_user_id ON career_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ats_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete their own profile" ON user_profiles
  FOR DELETE USING (auth.uid() = id);

-- User Skills Policies
CREATE POLICY "Users can view their own skills" ON user_skills
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own skills" ON user_skills
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own skills" ON user_skills
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own skills" ON user_skills
  FOR DELETE USING (auth.uid() = user_id);

-- Profiles Policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- Resumes Policies
CREATE POLICY "Users can view their own resumes" ON user_resumes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own resumes" ON user_resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own resumes" ON user_resumes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own resumes" ON user_resumes
  FOR DELETE USING (auth.uid() = user_id);

-- ATS Scores Policies
CREATE POLICY "Users can view their own ATS scores" ON ats_scores
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own ATS scores" ON ats_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own ATS scores" ON ats_scores
  FOR DELETE USING (auth.uid() = user_id);

-- Roadmaps Policies
CREATE POLICY "Users can view their own roadmaps" ON roadmaps
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own roadmaps" ON roadmaps
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own roadmaps" ON roadmaps
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own roadmaps" ON roadmaps
  FOR DELETE USING (auth.uid() = user_id);

-- Roadmap Phases Policies
CREATE POLICY "Users can view their roadmap phases" ON roadmap_phases
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM roadmaps WHERE roadmaps.id = roadmap_phases.roadmap_id AND roadmaps.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert their roadmap phases" ON roadmap_phases
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM roadmaps WHERE roadmaps.id = roadmap_phases.roadmap_id AND roadmaps.user_id = auth.uid()
  ));
CREATE POLICY "Users can update their roadmap phases" ON roadmap_phases
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM roadmaps WHERE roadmaps.id = roadmap_phases.roadmap_id AND roadmaps.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete their roadmap phases" ON roadmap_phases
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM roadmaps WHERE roadmaps.id = roadmap_phases.roadmap_id AND roadmaps.user_id = auth.uid()
  ));

-- Interview Sessions Policies
CREATE POLICY "Users can view their own interview sessions" ON interview_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own interview sessions" ON interview_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own interview sessions" ON interview_sessions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own interview sessions" ON interview_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Interview Responses Policies
CREATE POLICY "Users can view their interview responses" ON interview_responses
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM interview_sessions WHERE interview_sessions.id = interview_responses.session_id AND interview_sessions.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert their interview responses" ON interview_responses
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM interview_sessions WHERE interview_sessions.id = interview_responses.session_id AND interview_sessions.user_id = auth.uid()
  ));
CREATE POLICY "Users can update their interview responses" ON interview_responses
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM interview_sessions WHERE interview_sessions.id = interview_responses.session_id AND interview_sessions.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete their interview responses" ON interview_responses
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM interview_sessions WHERE interview_sessions.id = interview_responses.session_id AND interview_sessions.user_id = auth.uid()
  ));

-- Career Assessments Policies
CREATE POLICY "Users can view their own assessments" ON career_assessments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own assessments" ON career_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own assessments" ON career_assessments
  FOR DELETE USING (auth.uid() = user_id);

-- Job Applications Policies
CREATE POLICY "Users can view their own applications" ON job_applications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own applications" ON job_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own applications" ON job_applications
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own applications" ON job_applications
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_resumes_updated_at
  BEFORE UPDATE ON user_resumes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roadmaps_updated_at
  BEFORE UPDATE ON roadmaps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_sessions_updated_at
  BEFORE UPDATE ON interview_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_profiles TO anon, authenticated;
GRANT ALL ON public.user_skills TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.user_resumes TO anon, authenticated;
GRANT ALL ON public.ats_scores TO anon, authenticated;
GRANT ALL ON public.roadmaps TO anon, authenticated;
GRANT ALL ON public.roadmap_phases TO anon, authenticated;
GRANT ALL ON public.interview_sessions TO anon, authenticated;
GRANT ALL ON public.interview_responses TO anon, authenticated;
GRANT ALL ON public.career_assessments TO anon, authenticated;
GRANT ALL ON public.job_applications TO anon, authenticated;
GRANT USAGE ON SEQUENCE user_skills_id_seq TO anon, authenticated;

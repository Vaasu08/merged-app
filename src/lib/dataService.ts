import { supabase } from './supabaseClient';
import { ParsedCV } from './cvParser';

// ATSScores interface (matching atsScorerAI.ts)
interface ATSScores {
  overall: number;
  keywordMatch: number;
  skillsMatch: number;
  experience: number;
  education: number;
  formatting: number;
  grade: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: Array<{
    type: string;
    priority: string;
    message: string;
  }>;
}

// =====================================================
// RESUME MANAGEMENT
// =====================================================

export interface SavedResume {
  id?: string;
  user_id: string;
  title: string;
  content: Record<string, unknown>; // Full resume data
  version: number;
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function saveResume(userId: string, resumeData: {
  title: string;
  content: Record<string, unknown>;
  isPrimary?: boolean;
}): Promise<SavedResume | null> {
  try {
    // If this is marked as primary, unset any existing primary resume
    if (resumeData.isPrimary) {
      await supabase
        .from('user_resumes')
        .update({ is_primary: false })
        .eq('user_id', userId)
        .eq('is_primary', true);
    }

    const { data, error } = await supabase
      .from('user_resumes')
      .insert({
        user_id: userId,
        title: resumeData.title,
        content: resumeData.content,
        is_primary: resumeData.isPrimary || false,
        version: 1,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving resume:', error);
      return null;
    }

    console.log('✅ Resume saved successfully:', data.id);
    return data;
  } catch (e) {
    console.error('Failed to save resume:', e);
    return null;
  }
}

export async function getUserResumes(userId: string): Promise<SavedResume[]> {
  try {
    const { data, error } = await supabase
      .from('user_resumes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching resumes:', error);
      return [];
    }

    return data || [];
  } catch (e) {
    console.error('Failed to fetch resumes:', e);
    return [];
  }
}

export async function updateResume(resumeId: string, userId: string, updates: Partial<SavedResume>): Promise<boolean> {
  try {
    // If marking as primary, unset others first
    if (updates.is_primary) {
      await supabase
        .from('user_resumes')
        .update({ is_primary: false })
        .eq('user_id', userId)
        .eq('is_primary', true);
    }

    const { error } = await supabase
      .from('user_resumes')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', resumeId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating resume:', error);
      return false;
    }

    console.log('✅ Resume updated successfully');
    return true;
  } catch (e) {
    console.error('Failed to update resume:', e);
    return false;
  }
}

export async function deleteResume(resumeId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_resumes')
      .delete()
      .eq('id', resumeId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting resume:', error);
      return false;
    }

    console.log('✅ Resume deleted successfully');
    return true;
  } catch (e) {
    console.error('Failed to delete resume:', e);
    return false;
  }
}

// =====================================================
// ATS ASSESSMENT TRACKING
// =====================================================

export interface ATSAssessment {
  id?: string;
  user_id: string;
  resume_id?: string;
  resume_text: string;
  job_description?: string;
  overall_score: number;
  keyword_match: number;
  skills_match: number;
  experience_score: number;
  education_score: number;
  formatting_score: number;
  grade: string;
  matched_keywords: string[];
  missing_keywords: string[];
  suggestions: Array<{
    type: string;
    priority: string;
    message: string;
  }>;
  assessment_type: 'ai' | 'rule_based';
  created_at?: string;
}

export async function saveATSAssessment(userId: string, assessmentData: {
  resumeId?: string;
  resumeText: string;
  jobDescription?: string;
  scores: ATSScores;
  assessmentType?: 'ai' | 'rule_based';
}): Promise<ATSAssessment | null> {
  try {
    const { data, error } = await supabase
      .from('ats_assessments')
      .insert({
        user_id: userId,
        resume_id: assessmentData.resumeId || null,
        resume_text: assessmentData.resumeText,
        job_description: assessmentData.jobDescription || null,
        overall_score: assessmentData.scores.overall,
        keyword_match: assessmentData.scores.keywordMatch,
        skills_match: assessmentData.scores.skillsMatch,
        experience_score: assessmentData.scores.experience,
        education_score: assessmentData.scores.education,
        formatting_score: assessmentData.scores.formatting,
        grade: assessmentData.scores.grade,
        matched_keywords: assessmentData.scores.matchedKeywords || [],
        missing_keywords: assessmentData.scores.missingKeywords || [],
        suggestions: assessmentData.scores.suggestions || [],
        assessment_type: assessmentData.assessmentType || 'ai',
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving ATS assessment:', error);
      return null;
    }

    console.log('✅ ATS assessment saved successfully:', data.id);
    return data;
  } catch (e) {
    console.error('Failed to save ATS assessment:', e);
    return null;
  }
}

export async function getUserATSAssessments(userId: string, limit = 10): Promise<ATSAssessment[]> {
  try {
    const { data, error } = await supabase
      .from('ats_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching ATS assessments:', error);
      return [];
    }

    return data || [];
  } catch (e) {
    console.error('Failed to fetch ATS assessments:', e);
    return [];
  }
}

export async function getATSAssessmentHistory(userId: string): Promise<{
  assessments: ATSAssessment[];
  averageScore: number;
  improvementTrend: number;
  totalAssessments: number;
}> {
  try {
    const assessments = await getUserATSAssessments(userId, 50);
    
    if (assessments.length === 0) {
      return {
        assessments: [],
        averageScore: 0,
        improvementTrend: 0,
        totalAssessments: 0,
      };
    }

    const averageScore = Math.round(
      assessments.reduce((sum, a) => sum + a.overall_score, 0) / assessments.length
    );

    // Calculate improvement trend (last 5 vs previous 5)
    let improvementTrend = 0;
    if (assessments.length >= 10) {
      const recent5 = assessments.slice(0, 5);
      const previous5 = assessments.slice(5, 10);
      const recentAvg = recent5.reduce((sum, a) => sum + a.overall_score, 0) / 5;
      const previousAvg = previous5.reduce((sum, a) => sum + a.overall_score, 0) / 5;
      improvementTrend = Math.round(recentAvg - previousAvg);
    }

    return {
      assessments,
      averageScore,
      improvementTrend,
      totalAssessments: assessments.length,
    };
  } catch (e) {
    console.error('Failed to get ATS assessment history:', e);
    return {
      assessments: [],
      averageScore: 0,
      improvementTrend: 0,
      totalAssessments: 0,
    };
  }
}

// =====================================================
// USER ACTIVITY LOGGING
// =====================================================

export async function logUserActivity(userId: string, activityType: string, activityData?: Record<string, unknown>): Promise<void> {
  try {
    await supabase
      .from('user_activity')
      .insert({
        user_id: userId,
        activity_type: activityType,
        activity_data: activityData || null,
      });
    console.log(`📊 User activity logged: ${activityType}`);
  } catch (e) {
    console.warn('Failed to log user activity:', e);
    // Non-critical, don't throw
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export async function getResumeById(resumeId: string, userId: string): Promise<SavedResume | null> {
  try {
    const { data, error } = await supabase
      .from('user_resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching resume:', error);
      return null;
    }

    return data;
  } catch (e) {
    console.error('Failed to fetch resume:', e);
    return null;
  }
}

export async function getPrimaryResume(userId: string): Promise<SavedResume | null> {
  try {
    const { data, error } = await supabase
      .from('user_resumes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No primary resume found
        return null;
      }
      console.error('Error fetching primary resume:', error);
      return null;
    }

    return data;
  } catch (e) {
    console.error('Failed to fetch primary resume:', e);
    return null;
  }
}

import { supabase } from '@/lib/supabaseClient';

export type Profile = {
  id: string; // user id (auth.users.id)
  created_at: string;
};

export type UserProfile = {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  bio?: string;
  website?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  current_position?: string;
  current_company?: string;
  experience_level?: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  availability?: 'available' | 'busy' | 'not_looking';
  salary_expectation?: number;
  currency?: string;
  work_preference?: 'remote' | 'hybrid' | 'onsite';
  education?: Education[];
  experience?: Experience[];
  certifications?: Certification[];
  languages?: Language[];
  interests?: string[];
  created_at?: string;
  updated_at?: string;
};

export type Education = {
  id?: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date?: string;
  gpa?: number;
  description?: string;
  is_current?: boolean;
};

export type Experience = {
  id?: string;
  company: string;
  position: string;
  start_date: string;
  end_date?: string;
  description: string;
  location?: string;
  is_current?: boolean;
  achievements?: string[];
};

export type Certification = {
  id?: string;
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
};

export type Language = {
  id?: string;
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
};

// Ensure a profile row exists for the given user id
export async function ensureProfile(userId: string): Promise<void> {
  // Try to fetch profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  if (profile) return; // already exists

  const { error: insertError } = await supabase.from('profiles').insert({ id: userId });
  if (insertError) throw insertError;
}

// Get user's complete profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Supabase error getting user profile:', error);
      return null;
    }

    if (data) {
      // Parse JSON fields
      return {
        ...data,
        education: data.education ? JSON.parse(data.education) : [],
        experience: data.experience ? JSON.parse(data.experience) : [],
        certifications: data.certifications ? JSON.parse(data.certifications) : [],
        languages: data.languages ? JSON.parse(data.languages) : [],
        interests: data.interests ? JSON.parse(data.interests) : [],
      };
    }

    return null;
  } catch (e) {
    console.warn('Failed to get user profile, using localStorage fallback:', e);
    // Fallback to localStorage
    const stored = localStorage.getItem(`profile_${userId}`);
    return stored ? JSON.parse(stored) : null;
  }
}

// Save user's complete profile
export async function saveUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
  try {
    console.log(`Saving profile for user ${userId}`);
    
    // Always save to localStorage immediately as backup
    localStorage.setItem(`profile_${userId}`, JSON.stringify(profile));
    
    // Prepare data for Supabase (stringify JSON fields)
    const profileData = {
      ...profile,
      education: profile.education ? JSON.stringify(profile.education) : null,
      experience: profile.experience ? JSON.stringify(profile.experience) : null,
      certifications: profile.certifications ? JSON.stringify(profile.certifications) : null,
      languages: profile.languages ? JSON.stringify(profile.languages) : null,
      interests: profile.interests ? JSON.stringify(profile.interests) : null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('user_profiles')
      .upsert({ id: userId, ...profileData }, { onConflict: 'id' });

    if (error) {
      console.error('Supabase error saving profile:', error);
      throw new Error(`Failed to save profile: ${error.message}`);
    }

    console.log('Profile successfully saved to Supabase');
    
  } catch (e) {
    console.warn('Failed to save profile to Supabase, localStorage backup saved:', e);
    throw e;
  }
}

// Get current user's saved skills (array of skill ids)
export async function getUserSkills(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('user_skills')
      .select('skill_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase error getting user skills:', error);
      // Return empty array if database isn't available rather than throwing
      return [];
    }
    return (data || []).map((row: { skill_id: string }) => row.skill_id);
  } catch (e) {
    console.warn('Failed to get user skills, using local storage fallback:', e);
    // Fallback to localStorage if Supabase isn't configured
    const stored = localStorage.getItem(`skills_${userId}`);
    return stored ? JSON.parse(stored) : [];
  }
}

// Replace the user's skills with the provided set (idempotent)
export async function saveUserSkills(userId: string, skills: string[]): Promise<void> {
  try {
    console.log(`Saving ${skills.length} skills for user ${userId}:`, skills.slice(0, 5));
    
    // Always save to localStorage immediately as backup
    localStorage.setItem(`skills_${userId}`, JSON.stringify(skills));
    
    // Fetch existing
    const { data: existing, error: fetchErr } = await supabase
      .from('user_skills')
      .select('skill_id')
      .eq('user_id', userId);
    
    if (fetchErr) {
      console.error('Supabase error fetching existing skills:', fetchErr);
      console.log('Using localStorage fallback due to fetch error');
      return; // localStorage already saved above
    }

    const existingSet = new Set((existing || []).map((r) => r.skill_id));
    const targetSet = new Set(skills);

    // Determine inserts and deletes
    const toInsert = skills.filter((s) => !existingSet.has(s)).map((s) => ({ user_id: userId, skill_id: s }));
    const toDelete = (existing || []).filter((r) => !targetSet.has(r.skill_id)).map((r) => r.skill_id);

    console.log(`Skills to insert: ${toInsert.length}, to delete: ${toDelete.length}`);

    if (toInsert.length > 0) {
      const { error: insertErr } = await supabase.from('user_skills').insert(toInsert);
      if (insertErr) {
        console.error('Supabase error inserting skills:', insertErr);
        throw new Error(`Failed to add ${toInsert.length} new skills`);
      }
      console.log(`Successfully inserted ${toInsert.length} skills`);
    }

    if (toDelete.length > 0) {
      const { error: deleteErr } = await supabase
        .from('user_skills')
        .delete()
        .eq('user_id', userId)
        .in('skill_id', toDelete);
      if (deleteErr) {
        console.error('Supabase error deleting skills:', deleteErr);
        throw new Error(`Failed to remove ${toDelete.length} skills`);
      }
      console.log(`Successfully deleted ${toDelete.length} skills`);
    }
    
    console.log('Skills successfully saved to Supabase');
    
  } catch (e) {
    console.warn('Failed to save to Supabase, localStorage backup already saved:', e);
    // Re-throw so UI can show error, but localStorage is already saved
    throw e;
  }
}

// Convenience: merge a delta skill in/out and persist
export async function toggleUserSkill(userId: string, skillId: string, shouldHave: boolean): Promise<void> {
  if (shouldHave) {
    const { error } = await supabase.from('user_skills').upsert({ user_id: userId, skill_id: skillId }, { onConflict: 'user_id,skill_id' });
    if (error) throw error;
  } else {
    const { error } = await supabase.from('user_skills').delete().eq('user_id', userId).eq('skill_id', skillId);
    if (error) throw error;
  }
}

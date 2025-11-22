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
  try {
    // Check if user_profiles entry exists
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" which is fine, other errors should be logged
      console.warn('Error checking user profile:', error);
    }
    
    if (profile) return; // already exists

    // Create a new user_profiles entry if it doesn't exist
    const { error: insertError } = await supabase
      .from('user_profiles')
      .insert({ id: userId });
    
    if (insertError) {
      // Ignore duplicate key errors (profile already created by another process)
      if (insertError.code === '23505') {
        return;
      }
      console.warn('Error creating user profile:', insertError);
    }
  } catch (e) {
    // Non-fatal - profile might be created later or by trigger
    console.warn('ensureProfile failed:', e);
  }
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
      // JSONB fields are already parsed by Supabase client
      // Ensure all array fields are actually arrays
      return {
        ...data,
        education: Array.isArray(data.education) ? data.education : [],
        experience: Array.isArray(data.experience) ? data.experience : [],
        certifications: Array.isArray(data.certifications) ? data.certifications : [],
        languages: Array.isArray(data.languages) ? data.languages : [],
        interests: Array.isArray(data.interests) ? data.interests : [],
      };
    }

    return null;
  } catch (e) {
    console.warn('Failed to get user profile, using localStorage fallback:', e);
    // Fallback to localStorage
    const stored = localStorage.getItem(`profile_${userId}`);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    // Ensure array fields are actually arrays even from localStorage
    return {
      ...parsed,
      education: Array.isArray(parsed.education) ? parsed.education : [],
      experience: Array.isArray(parsed.experience) ? parsed.experience : [],
      certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
      languages: Array.isArray(parsed.languages) ? parsed.languages : [],
      interests: Array.isArray(parsed.interests) ? parsed.interests : [],
    };
  }
}

// Save user's complete profile
export async function saveUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
  try {
    console.log(`Saving profile for user ${userId}`, profile);
    
    // Always save to localStorage immediately as backup
    localStorage.setItem(`profile_${userId}`, JSON.stringify(profile));
    
    // Prepare data for Supabase
    // JSONB columns accept arrays directly, no need to stringify
    const profileData = {
      ...profile,
      id: userId, // Ensure ID is always set
      education: profile.education || [],
      experience: profile.experience || [],
      certifications: profile.certifications || [],
      languages: profile.languages || [],
      interests: profile.interests || [],
      updated_at: new Date().toISOString(),
    };

    console.log('Upserting profile data to Supabase:', profileData);

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(profileData, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('Supabase error saving profile:', error);
      throw new Error(`Failed to save profile: ${error.message}`);
    }

    console.log('Profile successfully saved to Supabase:', data);
    
  } catch (e) {
    console.error('Failed to save profile to Supabase:', e);
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
        console.warn('⚠️ Supabase error inserting skills (non-fatal, localStorage saved):', insertErr);
        // Don't throw - localStorage already saved, so operation succeeded locally
        return;
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
        console.warn('⚠️ Supabase error deleting skills (non-fatal, localStorage saved):', deleteErr);
        // Don't throw - localStorage already saved
        return;
      }
      console.log(`Successfully deleted ${toDelete.length} skills`);
    }
    
    console.log('Skills successfully saved to Supabase');
    
  } catch (e) {
    console.warn('⚠️ Failed to save to Supabase, localStorage backup already saved (non-fatal):', e);
    // Don't throw - localStorage save is sufficient fallback
  }
}

// Convenience: merge a delta skill in/out and persist
export async function toggleUserSkill(userId: string, skillId: string, shouldHave: boolean): Promise<void> {
  try {
    // Save to localStorage first as fallback
    const currentSkills = await getUserSkills(userId);
    const updatedSkills = shouldHave 
      ? [...new Set([...currentSkills, skillId])]
      : currentSkills.filter(s => s !== skillId);
    localStorage.setItem(`skills_${userId}`, JSON.stringify(updatedSkills));
    
    if (shouldHave) {
      const { error } = await supabase.from('user_skills').upsert({ user_id: userId, skill_id: skillId }, { onConflict: 'user_id,skill_id' });
      if (error) {
        console.warn('⚠️ Supabase error toggling skill (non-fatal, localStorage saved):', error);
        // Don't throw - localStorage already saved
      }
    } else {
      const { error } = await supabase.from('user_skills').delete().eq('user_id', userId).eq('skill_id', skillId);
      if (error) {
        console.warn('⚠️ Supabase error removing skill (non-fatal, localStorage saved):', error);
        // Don't throw - localStorage already saved
      }
    }
  } catch (e) {
    console.warn('⚠️ Error toggling skill (non-fatal):', e);
    // Don't throw - localStorage save is sufficient fallback
  }
}

import { supabase } from '@/lib/supabaseClient';

export interface DatabaseStatus {
  user_profiles: boolean;
  user_skills: boolean;
  profiles: boolean;
  errors: string[];
}

export async function checkDatabaseSetup(): Promise<DatabaseStatus> {
  const status: DatabaseStatus = {
    user_profiles: false,
    user_skills: false,
    profiles: false,
    errors: []
  };

  try {
    // Check user_profiles table
    try {
      const { error } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);
      
      if (error) {
        status.errors.push(`user_profiles table error: ${error.message}`);
      } else {
        status.user_profiles = true;
      }
    } catch (e) {
      status.errors.push(`user_profiles table doesn't exist or is not accessible`);
    }

    // Check user_skills table
    try {
      const { error } = await supabase
        .from('user_skills')
        .select('id')
        .limit(1);
      
      if (error) {
        status.errors.push(`user_skills table error: ${error.message}`);
      } else {
        status.user_skills = true;
      }
    } catch (e) {
      status.errors.push(`user_skills table doesn't exist or is not accessible`);
    }

    // Check profiles table
    try {
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (error) {
        status.errors.push(`profiles table error: ${error.message}`);
      } else {
        status.profiles = true;
      }
    } catch (e) {
      status.errors.push(`profiles table doesn't exist or is not accessible`);
    }

  } catch (e) {
    status.errors.push(`Database connection error: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }

  return status;
}

export async function createTablesIfNotExist(): Promise<{ success: boolean; message: string }> {
  try {
    // This would require running the SQL script
    // For now, just return instructions
    return {
      success: false,
      message: "Please run the database-setup.sql script in your Supabase SQL Editor to create the required tables."
    };
  } catch (e) {
    return {
      success: false,
      message: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`
    };
  }
}

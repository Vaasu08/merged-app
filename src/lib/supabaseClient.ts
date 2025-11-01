import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Use fallback values that won't cause errors but will clearly show the issue
const FALLBACK_URL = 'https://placeholder.supabase.co';
const FALLBACK_KEY = 'placeholder-key';

if (!supabaseUrl || !supabaseAnonKey) {
  // Non-fatal warning so the app can render while keys are pending
  // eslint-disable-next-line no-console
  console.warn(
    '⚠️ Supabase env keys missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. ' +
    'App will continue but authentication features may not work.'
  );
}

export const supabase = createClient(
  supabaseUrl || FALLBACK_URL, 
  supabaseAnonKey || FALLBACK_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);



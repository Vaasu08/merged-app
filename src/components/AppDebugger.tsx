/**
 * App Debugger Component
 * Logs critical information to help diagnose blank page issues
 */
import { useEffect } from 'react';

export const AppDebugger = () => {
  useEffect(() => {
    console.log('✅ React is mounting');
    console.log('✅ AppDebugger component rendered');
    console.log('Environment:', {
      NODE_ENV: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing',
      VITE_GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY ? 'Set' : 'Missing',
    });
  }, []);

  return null; // This component doesn't render anything
};


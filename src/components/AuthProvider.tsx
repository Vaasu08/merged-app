import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { ensureProfile } from '@/lib/profile';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Return safe defaults instead of throwing to prevent app crashes
    console.warn('useAuth called outside AuthProvider, returning default values');
    return {
      user: null,
      session: null,
      loading: false,
      signOut: async () => {},
    };
  }
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Auth session error (non-fatal):', error.message);
        }
        setSession(data?.session ?? null);
        setUser(data?.session?.user ?? null);
        try {
          const uid = data?.session?.user?.id;
          if (uid) await ensureProfile(uid);
        } catch (e) {
          // non-fatal: profile ensure failed
          // eslint-disable-next-line no-console
          console.warn('ensureProfile (init) failed', e);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Don't block app from rendering if auth fails
      } finally {
        setLoading(false);
      }
    };
    init();

    try {
      const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
        setSession(sess);
        setUser(sess?.user ?? null);
        // Best-effort ensure profile exists
        if (sess?.user?.id) {
          ensureProfile(sess.user.id).catch((e) => {
            // eslint-disable-next-line no-console
            console.warn('ensureProfile (onAuthStateChange) failed', e);
          });
        }
      });
      return () => {
        sub?.subscription?.unsubscribe();
      };
    } catch (error) {
      console.error('Auth state change listener error:', error);
      return () => {}; // Return empty cleanup function
    }
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      // Clear local state even if signOut fails
      setSession(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};



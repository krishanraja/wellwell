import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logger.debug('AuthProvider: Setting up auth state listener');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        logger.info(`Auth state changed: ${event}`, { 
          userId: session?.user?.id,
          event 
        });
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (session?.user) {
          logger.setUserContext(session.user.id);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      logger.debug('Initial session check', { hasSession: !!session });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        logger.setUserContext(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    logger.interaction('Sign up attempt', { email });
    const endTimer = logger.startTimer('signUp');
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName || email.split('@')[0],
          },
        },
      });

      if (error) {
        logger.error('Sign up failed', { error: error.message });
        return { error };
      }

      logger.info('Sign up successful', { email });
      endTimer();
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      logger.error('Sign up exception', { error: error.message });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    logger.interaction('Sign in attempt', { email });
    const endTimer = logger.startTimer('signIn');
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error('Sign in failed', { error: error.message });
        return { error };
      }

      logger.info('Sign in successful', { email });
      endTimer();
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      logger.error('Sign in exception', { error: error.message });
      return { error };
    }
  };

  const signOut = async () => {
    logger.interaction('Sign out');
    
    try {
      await supabase.auth.signOut();
      logger.info('Sign out successful');
    } catch (err) {
      logger.error('Sign out failed', { error: err instanceof Error ? err.message : 'Unknown' });
    }
  };

  const deleteAccount = async () => {
    logger.interaction('Delete account attempt');
    
    if (!user?.id) {
      const error = new Error('No user logged in');
      logger.error('Delete account failed', { error: error.message });
      return { error };
    }

    if (!session?.access_token) {
      const error = new Error('No session token available');
      logger.error('Delete account failed', { error: error.message });
      return { error };
    }
    
    try {
      // Get Supabase URL from environment to construct edge function URL
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('VITE_SUPABASE_URL not configured');
      }

      // Extract project reference from URL (e.g., https://xxx.supabase.co -> xxx)
      const projectRef = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1];
      if (!projectRef) {
        throw new Error('Invalid Supabase URL format');
      }

      // Call edge function to delete account
      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/delete-account`;
      
      logger.debug('Calling delete-account edge function', { url: edgeFunctionUrl });
      
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || `Failed to delete account: ${response.statusText}`);
        logger.error('Delete account failed', { 
          error: error.message,
          status: response.status,
          response: data 
        });
        return { error };
      }

      // Sign out locally after successful deletion
      await supabase.auth.signOut();
      
      logger.info('Account deleted successfully');
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      logger.error('Delete account exception', { error: error.message });
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

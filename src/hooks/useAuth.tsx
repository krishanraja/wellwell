import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, validateSupabaseConfig } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  sessionExpired: boolean;
  configError: Error | null;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error: Error | null }>;
  refreshSession: () => Promise<{ error: Error | null }>;
  dismissSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [configError, setConfigError] = useState<Error | null>(null);
  const previousSessionRef = useRef<Session | null>(null);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuth.tsx:useEffect',message:'useEffect entry',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    logger.debug('AuthProvider: Setting up auth state listener');
    
    // Validate configuration - set error state instead of throwing
    try {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuth.tsx:useEffect',message:'Before validateSupabaseConfig call',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      validateSupabaseConfig();
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuth.tsx:useEffect',message:'After validateSupabaseConfig - success',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      setConfigError(null);
      console.log('[useAuth] Configuration validated successfully');
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuth.tsx:useEffect',message:'Caught error in try-catch - setting error state',data:{errorMessage:error instanceof Error ? error.message : 'Unknown',errorName:error instanceof Error ? error.name : 'Unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.error('[useAuth] Configuration validation failed:', error);
      const configErr = error instanceof Error ? error : new Error('Configuration validation failed');
      setConfigError(configErr);
      setLoading(false);
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuth.tsx:useEffect',message:'Error state set, NOT throwing',data:{errorMessage:configErr.message},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // Don't throw - set error state instead so ErrorBoundary doesn't need to catch it
      // Return early to prevent setting up auth listeners with invalid config
      return;
    }
    
    // Set up auth state listener (wrap in try-catch in case client creation fails)
    let subscription: { unsubscribe: () => void };
    try {
      const { data } = supabase.auth.onAuthStateChange(
        (event, session) => {
        logger.info(`Auth state changed: ${event}`, { 
          userId: session?.user?.id,
          event 
        });
        
        // Detect session expiry: had session before, now don't, and it wasn't explicit sign out
        if (previousSessionRef.current && !session && event !== 'SIGNED_OUT') {
          logger.warn('Session expired unexpectedly', { event });
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuth.tsx:onAuthStateChange',message:'Session expired detected',data:{event,hadPreviousSession:!!previousSessionRef.current},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F'})}).catch(()=>{});
          // #endregion
          setSessionExpired(true);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Session refreshed successfully
          setSessionExpired(false);
          logger.info('Session refreshed successfully');
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuth.tsx:onAuthStateChange',message:'Token refreshed successfully',data:{userId:session.user.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F'})}).catch(()=>{});
          // #endregion
        } else if (event === 'SIGNED_OUT' && previousSessionRef.current) {
          // Explicit sign out or session expired
          setSessionExpired(true);
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuth.tsx:onAuthStateChange',message:'User signed out',data:{event},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F'})}).catch(()=>{});
          // #endregion
        } else if (session) {
          // Session restored or created
          setSessionExpired(false);
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuth.tsx:onAuthStateChange',message:'Session active',data:{event,userId:session.user.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F'})}).catch(()=>{});
          // #endregion
        }
        
        previousSessionRef.current = session;
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (session?.user) {
          logger.setUserContext(session.user.id);
        }
      }
      );
      subscription = data.subscription;
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuth.tsx:useEffect',message:'Failed to set up auth listener',data:{errorMessage:error instanceof Error ? error.message : 'Unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.error('[useAuth] Failed to set up auth state listener:', error);
      const configErr = error instanceof Error ? error : new Error('Failed to initialize Supabase client');
      setConfigError(configErr);
      setLoading(false);
      return;
    }

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      logger.debug('Initial session check', { hasSession: !!session });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        logger.setUserContext(session.user.id);
      }
    }).catch((error) => {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuth.tsx:useEffect',message:'Failed to get initial session',data:{errorMessage:error instanceof Error ? error.message : 'Unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.error('[useAuth] Failed to get initial session:', error);
      setLoading(false);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    logger.authFunnel('auth_signup_started');
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
        logger.authFunnel('auth_signup_failed', { error_type: error.message });
        return { error };
      }

      logger.info('Sign up successful', { email });
      logger.authFunnel('auth_signup_completed');
      
      // #region agent log
      console.log('[DEBUG] Signup successful, sending lead email...', { email: email.substring(0, 3) + '***' });
      fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuth.tsx:signUp',message:'Signup successful, sending lead email',data:{email:email.substring(0,3)+'***'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      // Send lead notification email (fire and forget - don't block signup)
      sendLeadEmail(email, displayName).catch((err) => {
        console.error('[DEBUG] Lead email FAILED:', err instanceof Error ? err.message : 'Unknown');
        logger.error('Lead email failed', { error: err instanceof Error ? err.message : 'Unknown' });
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuth.tsx:signUp',message:'Lead email FAILED',data:{error:err instanceof Error ? err.message : 'Unknown'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
      });
      
      endTimer();
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      logger.error('Sign up exception', { error: error.message });
      return { error };
    }
  };

  // Helper function to send lead notification emails
  const sendLeadEmail = async (email: string, name?: string) => {
    // #region agent log
    console.log('[DEBUG] Calling send-lead-email edge function...');
    fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuth.tsx:sendLeadEmail',message:'Calling send-lead-email edge function',data:{email:email.substring(0,3)+'***'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    const { data, error } = await supabase.functions.invoke('send-lead-email', {
      body: {
        type: 'signup',
        email,
        name: name || email.split('@')[0],
        source: 'auth_signup'
      }
    });
    
    console.log('[DEBUG] send-lead-email response:', { data, error: error?.message });
    
    if (error) {
      // #region agent log
      console.error('[DEBUG] Edge function returned error:', error.message);
      fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuth.tsx:sendLeadEmail',message:'Edge function returned error',data:{error:error.message},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      throw error;
    }
    
    // #region agent log
    console.log('[DEBUG] Lead email sent successfully:', data);
    fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuth.tsx:sendLeadEmail',message:'Lead email sent successfully',data:{emailId:data?.emailId},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    logger.info('Lead email sent', { emailId: data?.emailId });
    return data;
  };

  const signIn = async (email: string, password: string) => {
    logger.authFunnel('auth_signin_started');
    logger.interaction('Sign in attempt', { email });
    const endTimer = logger.startTimer('signIn');
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error('Sign in failed', { error: error.message });
        logger.authFunnel('auth_signin_failed', { error_type: error.message });
        return { error };
      }

      logger.info('Sign in successful', { email });
      logger.authFunnel('auth_signin_completed');
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

  const refreshSession = async () => {
    logger.interaction('Refresh session attempt');
    
    try {
      const { data: { session: newSession }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        logger.error('Session refresh failed', { error: error.message });
        return { error };
      }
      
      if (newSession) {
        logger.info('Session refreshed successfully');
        setSessionExpired(false);
        return { error: null };
      }
      
      // No session after refresh - user needs to sign in again
      logger.warn('No session after refresh');
      return { error: new Error('Session could not be refreshed. Please sign in again.') };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      logger.error('Session refresh exception', { error: error.message });
      return { error };
    }
  };

  const dismissSessionExpired = () => {
    setSessionExpired(false);
    logger.info('Session expired modal dismissed');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      sessionExpired,
      configError,
      signUp, 
      signIn, 
      signOut, 
      deleteAccount,
      refreshSession,
      dismissSessionExpired,
    }}>
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

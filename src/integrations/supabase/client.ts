// WellWell Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { secureStorage } from '@/lib/secureStorage';

// Verify secureStorage is available
console.log('[SUPABASE_CLIENT] secureStorage imported:', typeof secureStorage);
if (!secureStorage) {
  console.error('[SUPABASE_CLIENT] secureStorage is null/undefined!');
}

/**
 * SECURITY NOTE: Token Storage
 * 
 * Current implementation uses a secure storage adapter that:
 * - Stores tokens in sessionStorage (cleared on tab close)
 * - Stores non-sensitive data in localStorage
 * 
 * This reduces XSS risk compared to pure localStorage, but tokens are still
 * accessible to JavaScript. For maximum security, consider:
 * 
 * 1. Using httpOnly cookies via an edge function proxy
 * 2. Implementing Content Security Policy (CSP) headers
 * 3. Using Subresource Integrity (SRI) for scripts
 * 
 * See: src/lib/secureStorage.ts for implementation details
 */

/**
 * Validate environment variables.
 * This function should be called from React components (useEffect).
 * Errors should be caught and set as error state rather than thrown, since
 * errors thrown in useEffect don't propagate to ErrorBoundary.
 * 
 * Checks for both VITE_SUPABASE_PUBLISHABLE_KEY and VITE_SUPABASE_ANON_KEY
 * to be resilient to different environment variable naming conventions.
 * 
 * @throws {Error} If environment variables are missing or invalid
 */
export function validateSupabaseConfig() {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:validateSupabaseConfig',message:'Function entry',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  console.log('[SUPABASE_CLIENT] validateSupabaseConfig called');
  
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:validateSupabaseConfig',message:'Env vars checked',data:{hasUrl:!!SUPABASE_URL,hasPublishableKey:!!SUPABASE_PUBLISHABLE_KEY,hasAnonKey:!!SUPABASE_ANON_KEY},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'B'})}).catch(()=>{});
  // #endregion

  // Log env vars (masked for security)
  const SUPABASE_KEY = SUPABASE_PUBLISHABLE_KEY || SUPABASE_ANON_KEY;
  console.log('[SUPABASE_CLIENT] Env vars check:', {
    hasUrl: !!SUPABASE_URL,
    urlLength: SUPABASE_URL?.length || 0,
    urlPreview: SUPABASE_URL ? SUPABASE_URL.substring(0, 30) + '...' : 'MISSING',
    hasPublishableKey: !!SUPABASE_PUBLISHABLE_KEY,
    hasAnonKey: !!SUPABASE_ANON_KEY,
    hasKey: !!SUPABASE_KEY,
    keyLength: SUPABASE_KEY?.length || 0,
    keyPreview: SUPABASE_KEY ? SUPABASE_KEY.substring(0, 10) + '...' : 'MISSING',
    usingKey: SUPABASE_PUBLISHABLE_KEY ? 'VITE_SUPABASE_PUBLISHABLE_KEY' : SUPABASE_ANON_KEY ? 'VITE_SUPABASE_ANON_KEY' : 'NONE',
  });

  if (!SUPABASE_URL) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:validateSupabaseConfig',message:'About to throw - missing URL',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    const error = new Error(
      '❌ Missing VITE_SUPABASE_URL environment variable.\n\n' +
      'Please ensure your .env file contains:\n' +
      '  VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co\n\n' +
      'Get your project URL from: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api'
    );
    console.error('[SUPABASE_CLIENT] Validation failed - missing URL:', error);
    throw error;
  }

  // Check for both PUBLISHABLE_KEY and ANON_KEY (fallback)
  const SUPABASE_KEY = SUPABASE_PUBLISHABLE_KEY || SUPABASE_ANON_KEY;
  if (!SUPABASE_KEY) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:validateSupabaseConfig',message:'About to throw - missing key',data:{checkedPublishable:!!SUPABASE_PUBLISHABLE_KEY,checkedAnon:!!SUPABASE_ANON_KEY},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    const error = new Error(
      '❌ Missing VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY environment variable.\n\n' +
      'Please ensure your .env file contains the correct publishable (anon) key.\n' +
      'Get it from: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api\n' +
      'Look for the "anon public" key (it should be a JWT token starting with "eyJ...")'
    );
    console.error('[SUPABASE_CLIENT] Validation failed - missing key:', error);
    throw error;
  }

  // Validate URL format
  const urlPattern = /^https:\/\/([^.]+)\.supabase\.co\/?$/;
  if (!urlPattern.test(SUPABASE_URL)) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:validateSupabaseConfig',message:'About to throw - invalid URL format',data:{url:SUPABASE_URL?.substring(0,50)},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    const error = new Error(
      `❌ Invalid VITE_SUPABASE_URL format: "${SUPABASE_URL}"\n\n` +
      'Expected format: https://YOUR_PROJECT_ID.supabase.co\n' +
      'Example: https://abcdefghijklmnop.supabase.co'
    );
    console.error('[SUPABASE_CLIENT] Validation failed - invalid URL format:', error);
    throw error;
  }

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:validateSupabaseConfig',message:'Validation passed - function exit',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  console.log('[SUPABASE_CLIENT] Validation passed');
}

/**
 * Supabase client instance.
 * 
 * Client is created immediately with environment variables (no validation at module level).
 * Validation should be called from React components (useEffect) so errors are caught by ErrorBoundary.
 * 
 * Usage:
 * ```typescript
 * import { supabase, validateSupabaseConfig } from "@/integrations/supabase/client";
 * 
 * // In useEffect:
 * useEffect(() => {
 *   validateSupabaseConfig(); // Throws if invalid, caught by ErrorBoundary
 *   const { data } = await supabase.auth.getSession();
 * }, []);
 * ```
 */
export const supabase = (() => {
  console.log('[SUPABASE_CLIENT] Creating supabase client (module evaluation)');
  
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
  // Check for both env var names (resilient to Vercel naming)
  const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const SUPABASE_KEY = SUPABASE_PUBLISHABLE_KEY || SUPABASE_ANON_KEY || 'placeholder-key';
  
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:supabase',message:'Creating client with env vars',data:{hasUrl:!!SUPABASE_URL,hasPublishableKey:!!SUPABASE_PUBLISHABLE_KEY,hasAnonKey:!!SUPABASE_ANON_KEY,usingKey:SUPABASE_PUBLISHABLE_KEY ? 'PUBLISHABLE' : SUPABASE_ANON_KEY ? 'ANON' : 'PLACEHOLDER'},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  // Create client immediately (no validation - that happens in validateSupabaseConfig)
  // This ensures module evaluation doesn't throw
  const client = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      storage: secureStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  });
  
  console.log('[SUPABASE_CLIENT] Client created successfully');
  return client;
})();
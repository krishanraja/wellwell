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
 * Internal client instance (lazy initialization)
 * Only created after validation passes to prevent errors with invalid credentials
 */
let _supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Get or create the Supabase client instance.
 * Client is created lazily only when first accessed and after validation.
 * This prevents errors from being thrown at module evaluation time.
 */
function getSupabaseClient(): ReturnType<typeof createClient<Database>> {
  if (_supabaseClient) {
    return _supabaseClient;
  }

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:getSupabaseClient',message:'Creating client lazily',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  console.log('[SUPABASE_CLIENT] Creating supabase client (lazy initialization)');
  
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  // Check for both env var names (resilient to Vercel naming)
  const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const SUPABASE_KEY = SUPABASE_PUBLISHABLE_KEY || SUPABASE_ANON_KEY;

  // Validate before creating client
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    const error = new Error(
      '❌ Cannot create Supabase client: Missing environment variables.\n\n' +
      'Required: VITE_SUPABASE_URL and (VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY)\n\n' +
      'Please ensure your environment variables are set correctly.'
    );
    console.error('[SUPABASE_CLIENT] Cannot create client:', error);
    throw error;
  }

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:getSupabaseClient',message:'Creating client with validated env vars',data:{hasUrl:!!SUPABASE_URL,hasPublishableKey:!!SUPABASE_PUBLISHABLE_KEY,hasAnonKey:!!SUPABASE_ANON_KEY,usingKey:SUPABASE_PUBLISHABLE_KEY ? 'PUBLISHABLE' : 'ANON'},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
  // #endregion

  try {
    _supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        storage: secureStorage,
        persistSession: true,
        autoRefreshToken: true,
      }
    });
    
    console.log('[SUPABASE_CLIENT] Client created successfully');
    return _supabaseClient;
  } catch (error) {
    console.error('[SUPABASE_CLIENT] Failed to create client:', error);
    throw error;
  }
}

/**
 * Supabase client instance (lazy proxy).
 * 
 * Client is created lazily when first accessed, only after validation passes.
 * This ensures module evaluation doesn't throw and prevents errors with invalid credentials.
 * 
 * Usage:
 * ```typescript
 * import { supabase, validateSupabaseConfig } from "@/integrations/supabase/client";
 * 
 * // In useEffect:
 * useEffect(() => {
 *   validateSupabaseConfig(); // Validates env vars
 *   const { data } = await supabase.auth.getSession(); // Client created here if valid
 * }, []);
 * ```
 */
export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_target, prop) {
    try {
      const client = getSupabaseClient();
      const value = (client as any)[prop];
      // If it's a function, bind it to the client
      if (typeof value === 'function') {
        return value.bind(client);
      }
      // If it's an object (like auth, from, etc.), return it as-is
      return value;
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:supabase-proxy',message:'Error accessing supabase property',data:{prop:String(prop),errorMessage:error instanceof Error ? error.message : 'Unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.error(`[SUPABASE_CLIENT] Error accessing supabase.${String(prop)}:`, error);
      throw error;
    }
  }
});
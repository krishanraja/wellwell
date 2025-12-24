// WellWell Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { secureStorage } from '@/lib/secureStorage';


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
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const SUPABASE_KEY = SUPABASE_PUBLISHABLE_KEY || SUPABASE_ANON_KEY;

  if (!SUPABASE_URL) {
    const error = new Error(
      '❌ Missing VITE_SUPABASE_URL environment variable.\n\n' +
      'Please ensure your .env file contains:\n' +
      '  VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co\n\n' +
      'Get your project URL from: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api'
    );
    throw error;
  }

  if (!SUPABASE_KEY) {
    const error = new Error(
      '❌ Missing VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY environment variable.\n\n' +
      'Please ensure your .env file contains the correct publishable (anon) key.\n' +
      'Get it from: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api\n' +
      'Look for the "anon public" key (it should be a JWT token starting with "eyJ...")'
    );
    throw error;
  }

  // Validate URL format
  const urlPattern = /^https:\/\/([^.]+)\.supabase\.co\/?$/;
  if (!urlPattern.test(SUPABASE_URL)) {
    const error = new Error(
      `❌ Invalid VITE_SUPABASE_URL format: "${SUPABASE_URL}"\n\n` +
      'Expected format: https://YOUR_PROJECT_ID.supabase.co\n' +
      'Example: https://abcdefghijklmnop.supabase.co'
    );
    throw error;
  }
}

/**
 * Supabase client instance.
 * 
 * Client is created with environment variables. If env vars are missing, uses placeholders
 * that won't cause createClient to throw. Validation should be called before using the client.
 * 
 * Usage:
 * ```typescript
 * import { supabase, validateSupabaseConfig } from "@/integrations/supabase/client";
 * 
 * // In useEffect:
 * useEffect(() => {
 *   validateSupabaseConfig(); // Validates env vars - throws if invalid
 *   const { data } = await supabase.auth.getSession(); // Use client after validation
 * }, []);
 * ```
 */
export const supabase = (() => {
  // Use actual env vars or safe placeholders that won't cause createClient to throw
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
  // Check for both env var names (resilient to Vercel naming)
  const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const SUPABASE_KEY = SUPABASE_PUBLISHABLE_KEY || SUPABASE_ANON_KEY || 'placeholder-key';
  
  // Create client with actual or placeholder values
  // createClient doesn't validate credentials at creation time, so this is safe
  // Validation happens in validateSupabaseConfig() before the client is used
  try {
    const client = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        storage: secureStorage,
        persistSession: true,
        autoRefreshToken: true,
      }
    });
    
    return client;
  } catch (error) {
    // Even if creation fails, return a minimal client to prevent module-level errors
    // The validation in validateSupabaseConfig will catch this
    return createClient<Database>('https://placeholder.supabase.co', 'placeholder-key', {
      auth: {
        storage: secureStorage,
        persistSession: false,
        autoRefreshToken: false,
      }
    });
  }
})();
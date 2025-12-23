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
 * Initialize Supabase client with runtime validation.
 * 
 * This function performs validation at runtime (when called), not during module evaluation.
 * This allows React ErrorBoundary to catch and display errors gracefully.
 * 
 * @throws {Error} If environment variables are missing or invalid
 */
function initializeSupabaseClient() {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;

  // Runtime validation (can be caught by ErrorBoundary)
  if (!SUPABASE_URL) {
    throw new Error(
      '❌ Missing VITE_SUPABASE_URL environment variable.\n\n' +
      'Please ensure your .env file contains:\n' +
      '  VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co\n\n' +
      'Get your project URL from: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api'
    );
  }

  if (!SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      '❌ Missing VITE_SUPABASE_PUBLISHABLE_KEY environment variable.\n\n' +
      'Please ensure your .env file contains the correct publishable (anon) key.\n' +
      'Get it from: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api\n' +
      'Look for the "anon public" key (it should be a JWT token starting with "eyJ...")'
    );
  }

  // Validate URL format
  const urlPattern = /^https:\/\/([^.]+)\.supabase\.co\/?$/;
  if (!urlPattern.test(SUPABASE_URL)) {
    throw new Error(
      `❌ Invalid VITE_SUPABASE_URL format: "${SUPABASE_URL}"\n\n` +
      'Expected format: https://YOUR_PROJECT_ID.supabase.co\n' +
      'Example: https://abcdefghijklmnop.supabase.co'
    );
  }

  // Extract project ID from URL
  const projectIdFromUrl = SUPABASE_URL.match(urlPattern)?.[1];

  // Optional validation: warn if project ID doesn't match (only if explicitly set)
  if (SUPABASE_PROJECT_ID && projectIdFromUrl && SUPABASE_PROJECT_ID !== projectIdFromUrl) {
    console.warn(
      `⚠️  Warning: Supabase URL project ID (${projectIdFromUrl}) does not match ` +
      `VITE_SUPABASE_PROJECT_ID (${SUPABASE_PROJECT_ID}). Using project ID from URL.`
    );
  }

  // Validate publishable key format (Supabase anon keys are JWTs starting with 'eyJ')
  if (!SUPABASE_PUBLISHABLE_KEY.startsWith('eyJ')) {
    const errorMessage = 
      '❌ AUTHENTICATION ERROR: Invalid Supabase publishable key format.\n\n' +
      `Current key starts with: "${SUPABASE_PUBLISHABLE_KEY.substring(0, 20)}..."\n\n` +
      'Expected format: JWT token starting with "eyJ..."\n' +
      'This will cause all authentication to fail.\n\n' +
      'To fix:\n' +
      '1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api\n' +
      '2. Copy the "anon public" key (not the service_role key)\n' +
      '3. Update VITE_SUPABASE_PUBLISHABLE_KEY in your .env file\n' +
      '4. Restart your development server';
    
    console.error(errorMessage);
    // Don't throw here - let it fail at runtime so user can see the actual error
  }

  // Create and return client
  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: secureStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  });
}

// Lazy initialization: client is created on first access
// This ensures validation happens at runtime (when ErrorBoundary can catch it)
// rather than during module evaluation (which bypasses ErrorBoundary)
let _supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Supabase client instance.
 * 
 * The client is lazily initialized on first access. This allows:
 * 1. ErrorBoundary to catch initialization errors
 * 2. Graceful error handling instead of complete app failure
 * 3. Runtime validation instead of module-level throws
 * 
 * Usage:
 * ```typescript
 * import { supabase } from "@/integrations/supabase/client";
 * 
 * const { data, error } = await supabase.auth.signInWithPassword({ email, password });
 * ```
 */
export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_target, prop) {
    // Initialize client on first access
    if (!_supabaseClient) {
      _supabaseClient = initializeSupabaseClient();
    }
    // Return the property from the actual client
    const value = (_supabaseClient as any)[prop];
    // If it's a function, bind it to maintain 'this' context
    if (typeof value === 'function') {
      return value.bind(_supabaseClient);
    }
    return value;
  }
});
// WellWell Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;

// Validate environment variables
if (!SUPABASE_URL) {
  throw new Error(
    'Missing VITE_SUPABASE_URL environment variable. ' +
    'Please ensure your .env file contains: VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co'
  );
}

if (!SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    'Missing VITE_SUPABASE_PUBLISHABLE_KEY environment variable. ' +
    'Please ensure your .env file contains the correct publishable key from your Supabase project settings.'
  );
}

// Extract project ID from URL if not explicitly provided
const projectIdFromUrl = SUPABASE_URL.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1];
const expectedProjectId = SUPABASE_PROJECT_ID || projectIdFromUrl;

// Optional validation: warn if project ID doesn't match (only if explicitly set)
if (SUPABASE_PROJECT_ID && projectIdFromUrl && SUPABASE_PROJECT_ID !== projectIdFromUrl) {
  console.warn(
    `⚠️  Warning: Supabase URL project ID (${projectIdFromUrl}) does not match VITE_SUPABASE_PROJECT_ID (${SUPABASE_PROJECT_ID}).`
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
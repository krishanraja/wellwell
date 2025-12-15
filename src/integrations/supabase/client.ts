// WellWell Supabase Client Configuration
// Project: WellWell
// Project ID: zioacippbtcbctexywgc
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Validate environment variables
if (!SUPABASE_URL) {
  throw new Error(
    'Missing VITE_SUPABASE_URL environment variable. ' +
    'Please ensure your .env file contains: VITE_SUPABASE_URL=https://zioacippbtcbctexywgc.supabase.co'
  );
}

if (!SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    'Missing VITE_SUPABASE_PUBLISHABLE_KEY environment variable. ' +
    'Please ensure your .env file contains the correct publishable key.'
  );
}

// Verify we're using the correct WellWell project
if (!SUPABASE_URL.includes('zioacippbtcbctexywgc')) {
  console.warn(
    '⚠️  Warning: Supabase URL does not match WellWell project ID (zioacippbtcbctexywgc). ' +
    'Expected URL: https://zioacippbtcbctexywgc.supabase.co'
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
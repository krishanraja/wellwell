# Production Error Diagnosis

## Problem Statement
Production site (https://wellwell.ai) shows "Something went wrong" error page. Console shows uncaught React error during component tree initialization.

## Observed Error

### Browser Console:
```
Error
    at Et (https://www.wellwell.ai/assets/index-8wqtf2Wp.js:49:660)
    at Zz (https://www.wellwell.ai/assets/index-8wqtf2Wp.js:58:922)
    ...
[CRITICAL] Uncaught error in React component tree
```

### Error Boundary Display:
- Shows generic "Something went wrong" message
- Error details only visible in dev mode (line 71 of ErrorBoundary.tsx)
- Production shows no error details to user

## Architecture Map

### Module Initialization Chain:
```
1. App.tsx (entry point)
   ↓ imports
2. AuthProvider (from useAuth.tsx)
   ↓ imports
3. supabase client (from @/integrations/supabase/client)
   ↓ THROWS ERROR HERE (module-level)
4. Error propagates up → React bundle fails to load
```

### Critical Code Path:

**File: `src/integrations/supabase/client.ts`**
- **Lines 10-16**: Throws if `VITE_SUPABASE_URL` missing
- **Lines 19-26**: Throws if `VITE_SUPABASE_PUBLISHABLE_KEY` missing
- **Lines 30-36**: Throws if URL format invalid
- **Line 89**: Creates Supabase client (only reached if no throws above)

**Problem**: These are **module-level throws** that execute during import, BEFORE React renders. ErrorBoundary cannot catch them.

### Import Chain Analysis:

1. **App.tsx** (line 5): `import { AuthProvider } from "@/hooks/useAuth"`
2. **useAuth.tsx** (line 3): `import { supabase } from '@/integrations/supabase/client'`
3. **client.ts** (lines 10-26): **THROWS DURING IMPORT**

**Also imports client.ts directly:**
- `src/pages/Landing.tsx` (line 8)
- Any component that imports `useAuth` or uses `supabase` directly

## Root Cause Analysis

### Primary Root Cause: **Module-Level Error Throws Bypass ErrorBoundary**

**Why this fails:**
1. Vite bundles the code, and during module evaluation, `client.ts` executes
2. If env vars are missing, it throws immediately
3. This happens **before** React's ErrorBoundary can catch it
4. The entire bundle fails to initialize
5. React shows a generic error because the error occurred outside the component tree

### Secondary Issues:

1. **No Graceful Degradation**: App completely fails if env vars missing
2. **No Runtime Validation**: Validation happens at import time, not runtime
3. **Production Error Obfuscation**: Minified errors hide the real problem
4. **Missing Environment Variable Detection**: No way to detect missing vars in production

## Environment Variable Status

### Required Variables:
- `VITE_SUPABASE_URL` - Must be set in Vercel
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Must be set in Vercel

### Current Status (Unknown):
- Cannot verify without Vercel dashboard access
- Error suggests one or both are missing/incorrect

## Conditional Rendering Branches

### ErrorBoundary.tsx:
- **Line 48**: If `hasError === true` → Show error UI
- **Line 71**: If `import.meta.env.DEV` → Show error details
- **Line 106**: Otherwise → Render children

**Problem**: ErrorBoundary never catches the error because it happens before React renders.

## Verification Steps Needed

1. **Check Vercel Environment Variables**:
   - Go to Vercel Dashboard → WellWell project → Settings → Environment Variables
   - Verify `VITE_SUPABASE_URL` is set for Production
   - Verify `VITE_SUPABASE_PUBLISHABLE_KEY` is set for Production

2. **Check Vercel Build Logs**:
   - Look for build-time errors
   - Check if env vars are available during build

3. **Check Runtime Environment**:
   - Add logging to capture actual env var values (without exposing secrets)
   - Verify Vite is injecting env vars correctly

4. **Test Local Production Build**:
   ```bash
   npm run build
   npm run preview
   ```
   - See if same error occurs locally

## Call Graph

```
App.tsx:51
  ↓
ErrorBoundary (wraps everything)
  ↓
HelmetProvider
  ↓
QueryClientProvider
  ↓
AuthProvider:21
  ↓
useAuth.tsx:3 (imports supabase client)
  ↓
client.ts:5-26 (VALIDATION THROWS HERE)
  ❌ ERROR: Cannot catch with ErrorBoundary
```

## Files Involved

1. **src/integrations/supabase/client.ts** (lines 5-95)
   - Environment variable validation
   - Supabase client creation
   - **CRITICAL**: Module-level throws

2. **src/App.tsx** (lines 51-98)
   - ErrorBoundary wrapper
   - AuthProvider initialization

3. **src/hooks/useAuth.tsx** (line 3)
   - Imports supabase client
   - Triggers client.ts evaluation

4. **src/components/wellwell/ErrorBoundary.tsx** (lines 16-108)
   - Catches React component errors
   - **CANNOT** catch module-level errors

5. **src/pages/Landing.tsx** (line 8)
   - Also imports supabase client directly

## Expected vs Actual Behavior

### Expected:
- If env vars missing → Show helpful error message in UI
- ErrorBoundary catches and displays error
- User sees actionable error message

### Actual:
- If env vars missing → App crashes during module load
- ErrorBoundary never catches error
- User sees generic "Something went wrong"
- No actionable information

## Impact Assessment

### Severity: **CRITICAL (P0)**
- Production site completely broken
- No way for users to access the app
- No way to diagnose without Vercel access

### Affected Users:
- All production users
- Anyone visiting wellwell.ai

### Affected Features:
- Entire application (cannot initialize)

## Next Steps

1. **Immediate**: Verify Vercel environment variables are set
2. **Short-term**: Refactor client.ts to use lazy initialization
3. **Long-term**: Add runtime validation with graceful degradation


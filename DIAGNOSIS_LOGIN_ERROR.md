# Login Error Diagnosis - Phase 1: Complete Problem Scope

## Problem Statement
User sees ErrorBoundary "Something went wrong" page when clicking Sign In button on the Auth page. Error occurs during form submission, not on page load.

## User-Reported Symptoms
- **Error Type**: ErrorBoundary "Something went wrong" page (red triangle icon, "Reload Page" button)
- **When**: On form submit (clicking Sign In button after entering credentials)
- **Not**: Not on page load, not a config error UI, not an auth error modal

## Call Graph

```
User Action: Click "Sign In" button
  ↓
Auth.tsx:handleSubmit (line 58)
  ↓
Auth.tsx:signIn(email, password) (line 68)
  ↓
useAuth.tsx:signIn() (line 234-260)
  ↓
supabase.auth.signInWithPassword() (line 240)
  ↓
Supabase Client (src/integrations/supabase/client.ts:136-179)
  ↓
[ERROR THROWN HERE - NOT CAUGHT]
  ↓
ErrorBoundary catches unhandled error
  ↓
ErrorBoundary renders "Something went wrong" page
```

## Architecture Map

```
┌─────────────────────────────────────────────────────────┐
│                    App.tsx                               │
│  <ErrorBoundary>                                         │
│    <AuthProvider>                                         │
│      <BrowserRouter>                                      │
│        <Route path="/auth" element={<Auth />} />          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Auth.tsx (UI Layer)                   │
│  - Form with email/password inputs                       │
│  - handleSubmit() calls useAuth().signIn()               │
│  - Error handling: showError() for auth errors           │
│  - NO try-catch around signIn call                      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              useAuth.tsx (Logic Layer)                  │
│  - signIn() function (lines 234-260)                     │
│  - Calls supabase.auth.signInWithPassword()             │
│  - Has try-catch, returns { error } object              │
│  - BUT: If supabase client throws during call...        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│        supabase client (Integration Layer)              │
│  - Created at module level (line 136)                   │
│  - Uses placeholder values if env vars missing          │
│  - createClient() doesn't validate at creation time     │
│  - BUT: signInWithPassword() WILL fail with invalid key │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Error Propagation Path                      │
│  - signInWithPassword() throws error                     │
│  - Error might not be caught properly                   │
│  - Error propagates to ErrorBoundary                    │
└─────────────────────────────────────────────────────────┘
```

## File + Line References

### 1. src/pages/Auth.tsx
- **Line 58**: `handleSubmit` function - calls `signIn()` without try-catch wrapper
- **Line 68**: `const { error } = await signIn(email, password);` - awaits signIn
- **Line 66-77**: try-catch block exists BUT only handles returned error object, not thrown errors
- **Line 98-117**: configError check - shows config error UI (not the issue)

### 2. src/hooks/useAuth.tsx
- **Line 234-260**: `signIn()` function
- **Line 240**: `supabase.auth.signInWithPassword()` - potential error source
- **Line 239-259**: Has try-catch, but only catches errors from the API call itself
- **Line 255-258**: catch block returns `{ error }` - doesn't throw

### 3. src/integrations/supabase/client.ts
- **Line 136-179**: Supabase client creation
- **Line 140**: Uses placeholder URL if env var missing
- **Line 144**: Uses placeholder key if env vars missing
- **Line 154**: `createClient()` called with potentially invalid credentials
- **Line 164-177**: Fallback creates another placeholder client if creation fails

### 4. src/components/wellwell/ErrorBoundary.tsx
- **Line 22-26**: `getDerivedStateFromError` - catches React errors
- **Line 29-62**: `componentDidCatch` - logs error details
- **Line 77-157**: Renders "Something went wrong" UI

## Conditional Rendering Branches

### Auth.tsx Rendering Logic:
1. **Line 98-117**: If `configError` exists → Show config error UI
2. **Line 119-125**: If `loading` is true → Show loading spinner
3. **Line 127-224**: Otherwise → Show auth form

### Error Handling in handleSubmit:
1. **Line 66-77**: If `isLogin` and `error` exists → Show error modal (NOT ErrorBoundary)
2. **Line 77**: If `isLogin` and no error → Navigate to '/'
3. **Line 79-91**: If signup and `error` exists → Show error modal
4. **Line 91**: If signup and no error → Navigate to '/onboarding'

### Critical Gap:
- **NO try-catch around the `signIn()` call itself**
- If `signIn()` throws an error (not returns `{ error }`), it will propagate to ErrorBoundary
- The try-catch in `useAuth.signIn()` only catches errors from the Supabase API call
- If the supabase client itself throws (e.g., invalid client state), it might not be caught

## Observed Errors

### Expected Error Scenarios:
1. **Invalid credentials**: Returns `{ error }` object → Shows error modal (correct)
2. **Network error**: Returns `{ error }` object → Shows error modal (correct)
3. **Invalid Supabase client**: Throws error → Propagates to ErrorBoundary (PROBLEM)

### Potential Error Sources:
1. **Supabase client created with placeholder values**:
   - If env vars are missing, client is created with 'placeholder-key'
   - `signInWithPassword()` will fail immediately
   - Error might be thrown instead of returned

2. **Client state corruption**:
   - If client was created but then env vars changed
   - Client might be in invalid state

3. **Async error not caught**:
   - If `signInWithPassword()` throws synchronously before the promise resolves
   - The try-catch in `useAuth.signIn()` might not catch it

## Environment Variables Status

### Required Variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` OR `VITE_SUPABASE_ANON_KEY`

### Current Behavior:
- If missing, client is created with placeholders
- `validateSupabaseConfig()` should catch this, but only if called
- If validation passes but client still has placeholders, signIn will fail

## Next Steps for Root Cause Investigation

1. **Check browser console** for actual error message and stack trace
2. **Check network tab** for Supabase API call status
3. **Verify environment variables** are actually set in production
4. **Check if error is thrown vs returned** from signIn function
5. **Add logging** to trace exact error path


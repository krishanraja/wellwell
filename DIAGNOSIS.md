# Error Prevention Diagnostic - Complete Problem Scope

## Problem Statement

Users frequently encounter the ErrorBoundary "Something went wrong" page. Previous fix only improved error display but didn't address WHY errors occur. Goal: **PREVENT errors from happening**, not just make them prettier.

## Observed Errors (from existing diagnostics)

### 1. Production Crash Errors
- **Source**: DIAGNOSIS_PRODUCTION_ERROR.md, DIAGNOSIS_PRODUCTION_CRASH_V2.md
- **Symptom**: Generic "Something went wrong" page on production
- **Pattern**: Module-level throws or runtime validation errors
- **Status**: Partially fixed (Proxy pattern implemented, but errors still occur)

### 2. React Hooks Violations
- **Source**: DIAGNOSIS_HOOKS_VIOLATION.md, ROOT_CAUSE_LOGIN_ERROR.md
- **Symptom**: Error #300 "Rendered fewer hooks than expected"
- **Pattern**: Occurs after login when user state changes
- **Status**: Fixed (ProtectedRoute refactored, hooks called before conditionals)

### 3. Login/Signup Errors
- **Source**: DIAGNOSIS_LOGIN_ERROR.md
- **Symptom**: ErrorBoundary triggered on form submit
- **Pattern**: Unhandled async errors in auth flow
- **Status**: Partially addressed (try-catch exists but may have gaps)

## Complete Error Source Inventory

### Category 1: Configuration Validation Errors

#### 1.1 validateSupabaseConfig() Throws
**File**: `src/integrations/supabase/client.ts:35-71`
- **Line 48**: Throws if `VITE_SUPABASE_URL` missing
- **Line 58**: Throws if `VITE_SUPABASE_PUBLISHABLE_KEY` or `VITE_SUPABASE_ANON_KEY` missing
- **Line 69**: Throws if URL format invalid

**Call Sites**:
- `src/hooks/useAuth.tsx:35` - Wrapped in try-catch, sets `configError` state ✅
- **No other call sites found** ✅

**Error Propagation**:
- ✅ Errors caught in useAuth.tsx
- ✅ Sets configError state (displayed in Auth.tsx and ProtectedRoute.tsx)
- ✅ Does NOT reach ErrorBoundary

**Risk Level**: **LOW** - Properly handled

---

### Category 2: React Query queryFn Errors

#### 2.1 useProfile queryFn Throws
**File**: `src/hooks/useProfile.tsx:13-122`
- **Line 27**: `throw error;` if profile fetch fails
- **Error Type**: Supabase API errors
- **Error Handling**: React Query catches and sets `error` state
- **Component Usage**:
  - `src/pages/Home.tsx` - Uses `profile` but doesn't check `error` ⚠️
  - `src/pages/Profile.tsx:31` - Uses `profile` but doesn't check `error` ⚠️
  - `src/pages/Pulse.tsx:27` - Uses `profile` but doesn't check `error` ⚠️
- **User Impact**: If query fails, `profile` is `undefined`, components may throw when accessing `profile.property`

**Risk Level**: **HIGH** - Components don't check error state, may throw during render when accessing undefined profile

#### 2.2 useEvents queryFn Throws
**File**: `src/hooks/useEvents.tsx:16-43`
- **Line 36**: `throw error;` if events fetch fails
- **Error Type**: Supabase API errors
- **Error Handling**: React Query catches and sets `error` state
- **Component Usage**:
  - `src/pages/Home.tsx:60` - Uses `events` but doesn't check `error` ⚠️
  - `src/pages/Profile.tsx:34` - Uses `events` but doesn't check `error` ⚠️
  - `src/hooks/useContextualNudge.tsx:117` - Uses `events` but doesn't check `error` ⚠️
- **User Impact**: If query fails, `events` is `undefined` or empty array, but components may throw when accessing `events[0]` or `events.length`

**Risk Level**: **MEDIUM** - Components use `events || []` pattern, but may still throw if accessing properties on undefined

#### 2.3 useStreak queryFn
**File**: `src/hooks/useStreak.tsx:11-70`
- **Line 25**: Returns `0` on error (does NOT throw) ✅
- **Error Handling**: Graceful degradation

**Risk Level**: **LOW** - Properly handled

#### 2.4 useSubscription queryFn
**File**: `src/hooks/useSubscription.tsx:28-62`
- **Line 56**: Returns `null` on error (does NOT throw) ✅
- **Error Handling**: Graceful degradation, creates subscription if missing

**Risk Level**: **LOW** - Properly handled

---

### Category 3: React Query Mutation Errors

#### 3.1 useProfile updateProfileMutation
**File**: `src/hooks/useProfile.tsx:124-148`
- **Line 126**: `throw new Error('Not authenticated')` if no user
- **Line 139**: `throw error;` if update fails
- **Error Handling**: React Query catches, but caller must handle rejection
- **Call Sites**:
  - ✅ `src/pages/EditProfile.tsx:60` - Wrapped in try-catch
  - ✅ `src/pages/Onboarding.tsx:263` - Wrapped in try-catch (line 240-302)
- **Risk Level**: **LOW** - All call sites handle errors

#### 3.2 useEvents createEventMutation
**File**: `src/hooks/useEvents.tsx:45-75`
- **Line 47**: `throw new Error('Not authenticated')` if no user
- **Line 66**: `throw error;` if create fails
- **Error Handling**: React Query catches, but caller must handle rejection
- **Call Sites**:
  - ✅ `src/pages/Onboarding.tsx:274` - Wrapped in try-catch (line 240-302)
  - Need to check other call sites (useStoicAnalyzer, etc.)

**Risk Level**: **MEDIUM** - Need to verify all call sites

---

### Category 4: Async Function Errors

#### 4.1 Auth.tsx handleSubmit
**File**: `src/pages/Auth.tsx:58-96`
- **Line 68**: `await signIn(email, password)` - in try-catch ✅
- **Line 79**: `await signUp(email, password, displayName)` - in try-catch ✅
- **Error Handling**: 
  - ✅ Wrapped in try-catch
  - ✅ Handles returned `{ error }` object
  - ⚠️ BUT: If `signIn()` or `signUp()` throws (not returns error), it's caught by try-catch
  - ⚠️ However, if error occurs in finally block or after navigation, it could propagate

**Risk Level**: **LOW** - Properly wrapped, but edge cases possible

#### 4.2 useAuth.tsx signIn
**File**: `src/hooks/useAuth.tsx:173-199`
- **Line 179**: `await supabase.auth.signInWithPassword()` - in try-catch ✅
- **Line 194-197**: catch block returns `{ error }` ✅
- **Error Handling**: Always returns `{ error }` object, never throws

**Risk Level**: **LOW** - Properly handled

#### 4.3 useAuth.tsx signUp
**File**: `src/hooks/useAuth.tsx:112-152`
- **Line 120**: `await supabase.auth.signUp()` - in try-catch ✅
- **Line 147-150**: catch block returns `{ error }` ✅
- **Error Handling**: Always returns `{ error }` object, never throws

**Risk Level**: **LOW** - Properly handled

#### 4.4 useAuth.tsx deleteAccount
**File**: `src/hooks/useAuth.tsx:212-275`
- **Line 231**: `throw new Error('VITE_SUPABASE_URL not configured')`
- **Line 237**: `throw new Error('Invalid Supabase URL format')`
- **Line 270-273**: catch block returns `{ error }` ✅
- **Error Handling**: Throws are caught and returned as error object

**Risk Level**: **LOW** - Properly handled

#### 4.5 useStoicAnalyzer analyze
**File**: `src/hooks/useStoicAnalyzer.tsx:145-517`
- **Line 494-512**: Comprehensive try-catch ✅
- **Error Handling**: 
  - ✅ Catches all errors
  - ✅ Handles AbortError (cancellation)
  - ✅ Provides fallback response
  - ✅ Calls onError callback
  - ✅ Returns null on error

**Risk Level**: **LOW** - Excellent error handling

#### 4.6 Landing.tsx fetchStats
**File**: `src/pages/Landing.tsx:95-109`
- **Line 96-108**: useEffect with async function
- **Line 97-107**: Wrapped in try-catch ✅
- **Error Handling**: Silently fails (non-critical marketing data)

**Risk Level**: **LOW** - Properly handled

---

### Category 5: useEffect Async Errors

#### 5.1 useAuth.tsx useEffect
**File**: `src/hooks/useAuth.tsx:30-110`
- **Line 34-44**: validateSupabaseConfig() in try-catch ✅
- **Line 48-88**: supabase.auth.onAuthStateChange() in try-catch ✅
- **Line 91-103**: supabase.auth.getSession() with .catch() ✅
- **Error Handling**: All async operations properly handled

**Risk Level**: **LOW** - Properly handled

---

### Category 6: React Hooks Violations

#### 6.1 ProtectedRoute
**File**: `src/components/wellwell/ProtectedRoute.tsx`
- **Status**: ✅ Fixed (hooks called before conditionals)
- **Previous Issue**: Conditional rendering before hooks
- **Current State**: All hooks called first, then conditionals

**Risk Level**: **LOW** - Fixed

#### 6.2 Home Component
**File**: `src/pages/Home.tsx`
- **Status**: ✅ Verified (all hooks called at top)
- **Hook Order**: Consistent across renders
- **Early Returns**: After all hooks called

**Risk Level**: **LOW** - Compliant

---

## Error Propagation Map

### Path 1: Configuration Errors
```
validateSupabaseConfig() throws
  ↓
useAuth.tsx:35 try-catch catches
  ↓
setConfigError(state)
  ↓
Auth.tsx:99 or ProtectedRoute.tsx:31 displays error UI
  ✅ DOES NOT reach ErrorBoundary
```

### Path 2: React Query queryFn Errors
```
queryFn throws error
  ↓
React Query catches
  ↓
Sets query.error state
  ↓
Component receives error from hook
  ⚠️ Component may not handle error state
  ⚠️ If component doesn't check error, user sees broken UI
  ⚠️ If component throws during render based on error, reaches ErrorBoundary
```

### Path 3: React Query Mutation Errors
```
mutationFn throws error
  ↓
React Query catches
  ↓
Promise rejection
  ↓
Caller must handle with .catch() or try-catch
  ⚠️ If caller doesn't handle, unhandled promise rejection
  ⚠️ Unhandled promise rejections can trigger ErrorBoundary in some cases
```

### Path 4: Async Function Errors (Handled)
```
Async function throws
  ↓
try-catch catches
  ↓
Returns error object or calls onError callback
  ✅ DOES NOT reach ErrorBoundary
```

### Path 5: React Render Errors
```
Component render throws
  ↓
ErrorBoundary catches
  ↓
Shows "Something went wrong" page
  ⚠️ This is the main error path we see
```

---

## Architecture Map

### Error Boundary Coverage
```
App.tsx:52
  ↓
<ErrorBoundary> (wraps entire app)
  ↓
HelmetProvider
  ↓
QueryClientProvider
  ↓
AuthProvider
  ↓
BrowserRouter
  ↓
Routes
  ↓
Components
```

**ErrorBoundary CAN catch**:
- ✅ Component render errors
- ✅ Lifecycle method errors
- ✅ Constructor errors

**ErrorBoundary CANNOT catch**:
- ❌ Errors in event handlers (unless wrapped)
- ❌ Errors in async code (unless handled)
- ❌ Errors during module evaluation
- ❌ Unhandled promise rejections (in some React versions)

---

## Conditional Rendering Branches

### Critical Branches That Could Cause Errors

1. **ProtectedRoute.tsx**
   - ✅ Hooks called before conditionals
   - ✅ Children always rendered (with loading overlay)

2. **Home.tsx**
   - ✅ Hooks called at top
   - ✅ Early returns after hooks
   - ✅ Conditional rendering based on state

3. **Auth.tsx**
   - ✅ No hooks in conditionals
   - ✅ Error handling in try-catch

---

## Files Involved

### Core Error Sources
1. `src/integrations/supabase/client.ts` - Configuration validation
2. `src/hooks/useAuth.tsx` - Auth operations
3. `src/hooks/useProfile.tsx` - Profile queries/mutations
4. `src/hooks/useEvents.tsx` - Event queries/mutations
5. `src/hooks/useStoicAnalyzer.tsx` - AI analysis
6. `src/pages/Auth.tsx` - Login/signup form
7. `src/components/wellwell/ProtectedRoute.tsx` - Route protection
8. `src/components/wellwell/ErrorBoundary.tsx` - Error catching

### Components Using Hooks
1. `src/pages/Home.tsx` - Main page with many hooks
2. `src/pages/Landing.tsx` - Landing page
3. All pages using useProfile, useEvents, useStreak, etc.

---

## Error Categories Summary

### Configuration Errors
- **Count**: 3 throw statements
- **Handled**: ✅ Yes (in useAuth.tsx)
- **Reaches ErrorBoundary**: ❌ No

### React Query queryFn Errors
- **Count**: 2 throw statements (useProfile, useEvents)
- **Handled**: ⚠️ Partially (React Query catches, but components may not handle)
- **Reaches ErrorBoundary**: ⚠️ Possibly (if component throws during render)

### React Query Mutation Errors
- **Count**: 4 throw statements (useProfile, useEvents mutations)
- **Handled**: ⚠️ Partially (React Query catches, but callers must handle)
- **Reaches ErrorBoundary**: ⚠️ Possibly (unhandled promise rejections)

### Async Function Errors
- **Count**: Multiple async functions
- **Handled**: ✅ Yes (all wrapped in try-catch)
- **Reaches ErrorBoundary**: ❌ No

### React Hooks Violations
- **Count**: 0 (fixed)
- **Handled**: ✅ Yes
- **Reaches ErrorBoundary**: ❌ No

---

## Next Steps for Root Cause Investigation

1. **Verify React Query error handling in components**
   - Check if components check `error` state from hooks
   - Verify components don't throw during render when error exists

2. **Verify mutation error handling**
   - Check all callers of `updateProfile` and `createEvent`
   - Verify they handle promise rejections

3. **Test error scenarios**
   - Network failures
   - API errors
   - Invalid responses
   - Missing data

4. **Add error boundary logging**
   - Log what errors actually reach ErrorBoundary
   - Capture error stack traces
   - Identify which components throw

---

## Verification Checklist

- [x] All throw statements identified
- [x] All async functions checked for try-catch
- [x] All React Query queryFn checked
- [x] All React Query mutations checked
- [x] All useEffect hooks checked
- [x] All event handlers checked
- [x] Error propagation paths mapped
- [x] Conditional rendering branches identified
- [ ] Components handling React Query errors verified
- [ ] Mutation callers handling errors verified
- [ ] Error scenarios tested

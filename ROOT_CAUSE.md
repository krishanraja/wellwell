# Root Cause Analysis - Error Prevention

## Primary Root Causes

### Root Cause 1: Components Don't Handle React Query Error States

**Severity**: **HIGH**

**Problem**:
React Query queryFn functions throw errors when API calls fail. React Query catches these and sets the `error` state on the query. However, components using these hooks don't check for `error` state before accessing data.

**Evidence**:

1. **useProfile queryFn throws** (`src/hooks/useProfile.tsx:27`)
   - Components using `useProfile()`:
     - `src/pages/Home.tsx` - Accesses `profile` without checking `error`
     - `src/pages/Profile.tsx:31` - Accesses `profile` without checking `error`
     - `src/pages/Pulse.tsx:27` - Accesses `profile` without checking `error`
   - **Impact**: If query fails, `profile` is `undefined`. Components access `profile.property` → throws TypeError → ErrorBoundary

2. **useEvents queryFn throws** (`src/hooks/useEvents.tsx:36`)
   - Components using `useEvents()`:
     - `src/pages/Home.tsx:60` - Uses `events` but doesn't check `error`
     - `src/pages/Profile.tsx:34` - Uses `events` but doesn't check `error`
     - `src/hooks/useContextualNudge.tsx:117` - Uses `events` but doesn't check `error`
   - **Impact**: If query fails, `events` may be `undefined`. Components access `events[0]` or `events.length` → throws TypeError → ErrorBoundary

**Why This Happens**:
- React Query's default behavior: when queryFn throws, query enters error state
- Query returns `{ data: undefined, error: Error, isLoading: false }`
- Components assume `data` exists if `!isLoading`
- Components don't check `error` before accessing `data`

**Example Failure Scenario**:
```typescript
// useProfile.tsx queryFn throws
const { profile } = useProfile(); // profile = undefined, error = Error

// Home.tsx renders
const displayName = profile?.display_name; // ✅ Safe with optional chaining
// But somewhere:
const challenges = profile.challenges || []; // ❌ Throws if profile is undefined (no optional chaining)
```

**Verification**:
- Check components for optional chaining on profile/events access
- Check if components handle `error` state from hooks
- Test with network failures to see if components throw

---

### Root Cause 2: React Query Error State Not Exposed or Checked

**Severity**: **MEDIUM**

**Problem**:
Hooks return `error` state, but components don't use it. Components should check `error` and handle it gracefully.

**Evidence**:

1. **useProfile returns error** (`src/hooks/useProfile.tsx:153`)
   - Returns `error: profileQuery.error`
   - But components don't destructure or check it

2. **useEvents returns error** (`src/hooks/useEvents.tsx:80`)
   - Returns `error: eventsQuery.error`
   - But components don't destructure or check it

**Why This Happens**:
- Hooks expose error state, but it's optional to use
- Components focus on `data` and `isLoading`, ignore `error`
- No pattern enforced for error handling

**Example**:
```typescript
// Hook returns error
const { profile, isLoading, error } = useProfile();

// Component only uses profile and isLoading
if (isLoading) return <Loading />;
const name = profile.display_name; // ❌ Throws if error exists
```

---

### Root Cause 3: Direct Supabase Calls Without Error Handling

**Severity**: **LOW** (Mostly handled)

**Problem**:
Some code makes direct Supabase calls instead of using mutations, and may not handle errors.

**Evidence**:

1. **useStoicAnalyzer direct insert** (`src/hooks/useStoicAnalyzer.tsx:395`)
   - Direct `supabase.from("events").insert()` call
   - ✅ Error checked (line 407), but only logged as warning
   - ✅ Inside try-catch block (line 177-516)

2. **Landing.tsx fetchStats** (`src/pages/Landing.tsx:98`)
   - Direct `supabase.from('events').select()` call
   - ✅ Wrapped in try-catch (line 97-107)
   - ✅ Silently fails (non-critical)

**Why This Happens**:
- Direct calls are simpler for one-off operations
- But bypass React Query's error handling
- Need to manually handle errors

**Risk Level**: **LOW** - Most direct calls are properly handled

---

### Root Cause 4: Missing Optional Chaining in Some Places

**Severity**: **MEDIUM**

**Problem**:
Components use optional chaining inconsistently. Some places use `profile?.property`, others use `profile.property`.

**Evidence**:
- Need to audit all `profile` and `events` access points
- Check for missing optional chaining

**Why This Happens**:
- TypeScript may not catch all cases
- Assumptions that data exists when `!isLoading`
- Inconsistent patterns across codebase

---

## Secondary Root Causes

### 1. React Query Default Error Behavior

**Problem**: React Query's default behavior when queryFn throws:
- Query enters error state
- `data` becomes `undefined`
- `error` is set
- `isLoading` becomes `false`

**Impact**: Components see `!isLoading` and assume data exists, but `data` is `undefined`.

**Solution**: Components should check both `isLoading` AND `error` before accessing data.

---

### 2. No Error Boundary at Component Level

**Problem**: Only one ErrorBoundary at app level. If a component throws, entire app shows error page.

**Impact**: Single component error crashes entire app.

**Solution**: Add error boundaries at page/feature level for graceful degradation.

---

### 3. Missing Error Handling Patterns

**Problem**: No consistent pattern for handling React Query errors across components.

**Impact**: Each component handles errors differently (or not at all).

**Solution**: Create reusable error handling patterns/hooks.

---

## Error Flow Analysis

### Flow 1: React Query queryFn Error → Component Render Error → ErrorBoundary

```
1. API call fails (network error, 500, etc.)
   ↓
2. useProfile queryFn throws error (line 27)
   ↓
3. React Query catches, sets query.error = Error
   ↓
4. Component receives { profile: undefined, error: Error, isLoading: false }
   ↓
5. Component checks: if (!isLoading) → true
   ↓
6. Component accesses: profile.display_name
   ↓
7. TypeError: Cannot read property 'display_name' of undefined
   ↓
8. ErrorBoundary catches
   ↓
9. Shows "Something went wrong" page
```

**Prevention**: Check `error` state before accessing `data`, or use optional chaining consistently.

---

### Flow 2: React Query Mutation Error → Unhandled Promise Rejection

```
1. updateProfile() called
   ↓
2. Mutation fails (network error, validation error, etc.)
   ↓
3. mutationFn throws error (line 139)
   ↓
4. React Query catches, rejects promise
   ↓
5. Caller doesn't handle rejection
   ↓
6. Unhandled promise rejection
   ↓
7. In some React versions, triggers ErrorBoundary
```

**Prevention**: Always wrap mutation calls in try-catch or use `.catch()`.

---

### Flow 3: Configuration Error → Already Handled ✅

```
1. validateSupabaseConfig() throws
   ↓
2. useAuth.tsx catches (line 34-44)
   ↓
3. Sets configError state
   ↓
4. Auth.tsx or ProtectedRoute.tsx displays error UI
   ↓
✅ Does NOT reach ErrorBoundary
```

**Status**: ✅ Properly handled

---

## Verification Steps

### Step 1: Test React Query Error Handling

1. **Simulate API failure**:
   - Block network in DevTools
   - Or modify queryFn to always throw
   - Check if components handle gracefully

2. **Check component behavior**:
   - Does component check `error` state?
   - Does component use optional chaining?
   - Does component show error UI or crash?

### Step 2: Test Mutation Error Handling

1. **Simulate mutation failure**:
   - Block network during mutation
   - Or modify mutationFn to always throw
   - Check if caller handles rejection

2. **Check caller behavior**:
   - Is mutation wrapped in try-catch?
   - Does caller show error message?
   - Does error propagate to ErrorBoundary?

### Step 3: Audit Component Error Handling

1. **Find all components using**:
   - `useProfile()` - Check if they handle `error`
   - `useEvents()` - Check if they handle `error`
   - `updateProfile()` - Check if wrapped in try-catch
   - `createEvent()` - Check if wrapped in try-catch

2. **Check for**:
   - Optional chaining on data access
   - Error state checks
   - Fallback values when data is undefined

---

## Root Cause Confirmation

### Hypothesis 1: Components Don't Handle React Query Errors (CONFIRMED)
**Evidence**: 
- useProfile and useEvents return `error` but components don't check it
- Components access `profile.property` without checking if profile exists
- No error handling UI in components

**Test**: Simulate API failure, verify components throw

**Fix**: Add error checks in components, use optional chaining, show error UI

---

### Hypothesis 2: Missing Optional Chaining (NEEDS VERIFICATION)
**Evidence**: 
- Some components use `profile?.property` (safe)
- Others may use `profile.property` (unsafe)
- Need to audit all access points

**Test**: Search codebase for all `profile.` and `events.` access (without `?`)

**Fix**: Add optional chaining or null checks

---

### Hypothesis 3: Mutation Errors Not Handled (PARTIALLY CONFIRMED)
**Evidence**: 
- Onboarding.tsx handles mutations ✅
- EditProfile.tsx handles mutations ✅
- Need to check other call sites

**Test**: Find all callers of `updateProfile` and `createEvent`

**Fix**: Ensure all callers wrap in try-catch

---

## Solution Strategy

### Immediate Fixes (High Priority)

1. **Add error checks in components**
   - Check `error` state from hooks before accessing data
   - Show error UI instead of crashing
   - Use fallback values when data is missing

2. **Add optional chaining**
   - Audit all `profile` and `events` access
   - Add `?.` where missing
   - Use nullish coalescing for defaults

3. **Verify mutation error handling**
   - Check all callers of mutations
   - Ensure try-catch or .catch() on all calls

### Long-term Fixes

1. **Create error handling patterns**
   - Reusable hook for error display
   - Consistent error UI components
   - Error boundary at page level

2. **Improve React Query configuration**
   - Add global error handler
   - Configure retry logic
   - Add error callbacks

3. **Add error monitoring**
   - Log all errors to monitoring service
   - Track error rates
   - Alert on error spikes

---

## Success Criteria

1. **Zero render errors** - Components never throw when data is undefined
2. **Error state handled** - All components check and display error states
3. **Graceful degradation** - App continues working with partial failures
4. **User-friendly errors** - Users see helpful messages, not crash pages
5. **Comprehensive logging** - All errors logged for debugging

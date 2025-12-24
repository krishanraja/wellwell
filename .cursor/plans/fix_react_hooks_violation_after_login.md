# Fix React Hooks Violation After Login

## Problem
React Error #300 occurs after successful login when navigating to '/'. Error message: "Rendered more hooks than during the previous render".

## Root Cause Analysis
- Login is successful (user authenticated, session created)
- Error occurs when Home component renders after navigation
- React detects different number of hooks between renders
- This violates Rules of Hooks

## Hypothesis
When `user` changes from `null` to a user object, a component or hook conditionally calls hooks, causing the hook count to change. Most likely during the transition when:
1. `navigate('/')` is called immediately after signIn
2. Home component mounts before auth state fully settles
3. Hooks are called with `user = null`
4. Then `user` becomes available, causing re-render
5. If any hook conditionally calls other hooks, violation occurs

## Solution Strategy

### Step 1: Add Enhanced Error Logging
**File**: `src/components/wellwell/ErrorBoundary.tsx`
- Parse component stack to extract component names
- Log component name in production
- This will identify the exact violating component

### Step 2: Add Loading Guard
**File**: `src/components/wellwell/ProtectedRoute.tsx`
- Ensure `user` is fully available before rendering children
- Add small delay or check that session is fully established
- Prevent Home from rendering during auth state transition

### Step 3: Defensive Hook Calls
**Files**: All hooks used in Home
- Ensure hooks are always called in same order
- Use `enabled` flags instead of conditional hook calls
- Add null checks but don't skip hook calls

## Implementation Details

### Change 1: Enhanced ErrorBoundary Logging
**File**: `src/components/wellwell/ErrorBoundary.tsx`
**Lines**: 29-62 (componentDidCatch)

Add component name extraction from componentStack:
```typescript
// Extract component name from componentStack
const componentMatch = errorInfo.componentStack.match(/at (\w+)/);
const componentName = componentMatch ? componentMatch[1] : 'Unknown';
console.error('[ERROR_BOUNDARY] Component:', componentName);
```

### Change 2: ProtectedRoute Loading Guard
**File**: `src/components/wellwell/ProtectedRoute.tsx`
**Lines**: 32-38

Add check to ensure user is fully established:
```typescript
if (loading) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Additional guard: ensure user is fully available
if (!user) {
  return <Navigate to="/landing" replace />;
}

// Small delay to ensure auth state is fully settled
// This prevents race condition during login
```

Actually, the loading check should be sufficient. The issue might be that `loading` becomes false before `user` is fully set.

### Change 3: Ensure Consistent Hook Order
**File**: `src/pages/Home.tsx`
**Lines**: 38-69

All hooks are already called unconditionally at the top. No changes needed here.

## Verification Checkpoints

**CP0: Plan approved**
- Review approach: enhanced logging + loading guard

**CP1: Enhanced logging deployed**
- ErrorBoundary logs component names
- Can identify violating component in production

**CP2: Loading guard added**
- ProtectedRoute ensures user is available before rendering
- Prevents premature Home rendering

**CP3: Fix verified**
- Login flow works without error
- No ErrorBoundary triggered
- Home page renders correctly

## Risk Assessment
- **Low risk**: Adding logging and guards, no logic changes
- **No breaking changes**: Only defensive improvements
- **Potential side effects**: None expected

## Files to Modify
1. `src/components/wellwell/ErrorBoundary.tsx` - Enhanced logging
2. `src/components/wellwell/ProtectedRoute.tsx` - Loading guard (if needed)


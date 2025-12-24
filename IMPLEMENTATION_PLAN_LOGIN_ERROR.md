# Implementation Plan - Fix React Hooks Violation After Login

## Problem Summary

**React Error #300**: "Rendered more hooks than during the previous render"
- Occurs AFTER successful login when navigating to '/'
- Login is successful (user authenticated, session created)
- Error happens during Home page render
- ErrorBoundary catches it and shows "Something went wrong" page

## Root Cause

A component or hook in the Home page render tree conditionally calls hooks based on `user` state. When `user` changes from `null` to a user object after login, the number of hooks called changes, violating React's Rules of Hooks.

## Investigation Strategy

Since the error is minified in production, we need to:

1. **Add comprehensive error logging** to identify the exact component
2. **Check for conditional hook calls** in all components used by Home
3. **Ensure all hooks are called unconditionally** at the top of components

## Files to Investigate

### Primary Suspects (components used in Home):
1. `src/pages/Home.tsx` - Main component
2. `src/hooks/useContextualNudge.tsx` - Called in Home
3. `src/hooks/usePendingActions.ts` - Called in Home
4. `src/hooks/useStoicAnalyzer.tsx` - Called in Home
5. `src/components/wellwell/UsageLimitGate.tsx` - Wraps Home content
6. `src/components/wellwell/Layout.tsx` - Wraps Home
7. `src/components/wellwell/Header.tsx` - Used in Layout
8. `src/components/wellwell/BottomNav.tsx` - Used in Layout

### Secondary Suspects:
- Any component conditionally rendered based on `user`
- Any hook that conditionally calls other hooks

## Implementation Steps

### Phase 1: Enhanced Error Logging

**File**: `src/components/wellwell/ErrorBoundary.tsx`

**Changes**:
- Add component stack parsing to identify the exact component
- Log component names from errorInfo.componentStack
- Add development-only detailed error display

**Expected Outcome**: Identify the exact component causing the violation

### Phase 2: Audit All Hooks in Home Render Tree

**Files**: All hooks and components listed above

**Checks**:
1. All hooks called at top level (before any returns)
2. No conditional hook calls (no `if (user) { useHook() }`)
3. No hooks in loops
4. No hooks after early returns

**Expected Outcome**: Find the violation point

### Phase 3: Fix the Violation

**Strategy**:
- Move any conditional hook calls to always be called
- Use `enabled` flags in React Query instead of conditional calls
- Ensure hooks are called in same order every render

**Expected Outcome**: Hooks called in consistent order

### Phase 4: Add Defensive Checks

**File**: `src/pages/Home.tsx` and related components

**Changes**:
- Add error boundary around Home component
- Add null checks before using hook return values
- Ensure all hooks are called even if user is null

**Expected Outcome**: Graceful handling of state transitions

## Verification Checkpoints

**CP0: Plan approved**
- Review investigation strategy
- Confirm approach to finding violation

**CP1: Enhanced logging deployed**
- ErrorBoundary logs component names
- Can identify exact component in production

**CP2: Violation identified**
- Found the component/hook causing the issue
- Confirmed it's a hooks order violation

**CP3: Fix implemented**
- All hooks called unconditionally
- No conditional hook calls
- Hooks order consistent across renders

**CP4: Verification**
- Login flow works without error
- No ErrorBoundary triggered
- Home page renders correctly after login

## Risk Assessment

- **Low risk**: Fixing hooks violations is straightforward
- **No breaking changes**: Only fixing hook call order
- **Potential side effects**: None expected

## Next Steps

1. Deploy enhanced error logging to production
2. Reproduce error and capture component name
3. Fix the identified violation
4. Verify fix works


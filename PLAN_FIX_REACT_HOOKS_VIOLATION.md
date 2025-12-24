# Plan: Fix React Hooks Violation After Login

## Problem
React Error #300 occurs after successful login when navigating to '/'. This is a "Rendered more hooks than during the previous render" violation.

## Root Cause Hypothesis
When `user` changes from `null` to a user object after login, a component or hook conditionally calls hooks, causing the number of hooks to change between renders.

## Investigation & Fix Strategy

### Step 1: Add Enhanced Error Logging
**File**: `src/components/wellwell/ErrorBoundary.tsx`
- Parse component stack to identify exact component
- Log component name in production
- This will help identify the violating component

### Step 2: Audit Conditional Hook Calls
Check all components in Home render tree for:
- Hooks called after early returns
- Hooks called conditionally (if statements)
- Hooks called in loops
- Components conditionally rendered that have hooks

### Step 3: Fix the Violation
Once identified, ensure:
- All hooks called at top level
- No conditional hook calls
- Consistent hook order across renders

### Step 4: Add Defensive Checks
- Ensure hooks are called even when user is null
- Use `enabled` flags in React Query instead of conditional calls

## Files to Check
1. `src/pages/Home.tsx`
2. `src/hooks/useContextualNudge.tsx`
3. `src/hooks/usePendingActions.ts`
4. `src/hooks/useStoicAnalyzer.tsx`
5. `src/components/wellwell/UsageLimitGate.tsx`
6. `src/components/wellwell/ActionFollowUp.tsx`
7. All child components of Home

## Expected Outcome
After fix, login should complete without triggering ErrorBoundary, and Home page should render correctly.


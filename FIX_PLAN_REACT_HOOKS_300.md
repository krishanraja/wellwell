# Fix Plan: React Error #300 After Login

## Problem
React Error #300 ("Rendered more hooks than during the previous render") occurs after successful login when navigating to '/'.

## Root Cause
When `user` changes from `null` to a user object, a component or hook in the Home render tree conditionally calls hooks, causing the number of hooks to change between renders.

## Investigation Findings
- All hooks in Home.tsx are called unconditionally at the top ✅
- All hooks use `enabled` flags in React Query (correct pattern) ✅
- `WelcomeBackScreen` is conditionally rendered but has hooks called at top ✅
- `ActionFollowUp` is conditionally rendered but has hooks called at top ✅

## Most Likely Cause
The error occurs during the transition when `user` changes. The issue might be:
1. A component that conditionally renders based on hook return values
2. A hook that conditionally calls other hooks (not found yet)
3. A race condition during navigation where Home renders before auth state settles

## Fix Strategy

### Option 1: Add Error Boundary with Component Identification
Enhance ErrorBoundary to log the exact component causing the violation.

### Option 2: Ensure Consistent Hook Calls
Ensure all hooks are called even when user is null, using `enabled` flags.

### Option 3: Add Loading State Guard
Prevent Home from rendering until user is fully available.

## Recommended Approach
Combine all three:
1. Add enhanced error logging to identify exact component
2. Add defensive checks to ensure hooks are always called
3. Add loading guard in ProtectedRoute to prevent premature rendering

## Files to Modify
1. `src/components/wellwell/ErrorBoundary.tsx` - Enhanced logging
2. `src/components/wellwell/ProtectedRoute.tsx` - Loading guard
3. `src/pages/Home.tsx` - Defensive hook calls (if needed)

## Verification
After fix:
- Login completes successfully
- No ErrorBoundary triggered
- Home page renders correctly
- No console errors


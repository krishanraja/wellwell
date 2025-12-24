# Root Cause Analysis - Login Error Page (UPDATED)

## Primary Root Cause

**REACT HOOKS ORDER VIOLATION (Error #300) AFTER SUCCESSFUL LOGIN**

### Evidence:

1. **Login is successful** - Logs show:
   - "Sign in successful"
   - "Auth state changed: SIGNED_IN"
   - User ID is set: `d8c9485a-ed8d-4773-99db-6fe4ce98892e`

2. **Error occurs AFTER login** - React error #300 happens when navigating to '/' after successful authentication

3. **React Error #300** means: "Rendered more hooks than during the previous render"
   - This is a Rules of Hooks violation
   - Hooks must be called in the same order on every render
   - Cannot call hooks conditionally, in loops, or after early returns

### Error Location:

The error occurs in the component tree when rendering the Home page (`/`) after login:
- Component stack shows: `oK`, `sK`, `_t` (minified names)
- Error happens during React render cycle
- ErrorBoundary catches it and shows "Something went wrong" page

### Root Cause Hypothesis:

**When user logs in, the `user` object changes from `null` to a user object. This causes components/hooks that depend on `user` to re-render. If any component or hook conditionally calls hooks based on `user` state, it violates the Rules of Hooks.**

### Potential Violation Points:

1. **ProtectedRoute** - Calls `useAuth()` at top, then has conditional returns
   - ✅ This is CORRECT - hooks called before any returns

2. **Home component** - Uses many hooks that depend on `user`:
   - `useContextualNudge()` → calls `useEvents()`, `useStreak()`, `useProfile()`
   - `useStoicAnalyzer()` → depends on `user`
   - `useEvents()` → depends on `user`
   - `useStreak()` → depends on `user`
   - `usePendingActions()` → depends on `user`

3. **React Query hooks** - Many use `enabled: !!user?.id`
   - ✅ This is CORRECT - `useQuery` is always called, just disabled

4. **Conditional hook calls** - If any component conditionally calls hooks based on `user`:
   - ❌ This would cause the violation

### Most Likely Cause:

A component in the Home page render tree conditionally calls hooks based on whether `user` exists. When `user` changes from `null` to a user object, the number of hooks called changes, causing React error #300.

### Verification Needed:

1. Check if any component conditionally calls hooks
2. Check if `useContextualNudge` or its dependencies have conditional hooks
3. Check if any child components of Home have conditional hook calls
4. Build in dev mode to see unmangled component names in error

### Fix Strategy:

1. **Ensure all hooks are called unconditionally** at the top of components
2. **Use `enabled` flags in React Query** instead of conditional hook calls
3. **Move conditional logic inside hooks** rather than conditionally calling hooks
4. **Add error boundary** around Home component to catch and log the exact component

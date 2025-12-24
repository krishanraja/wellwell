# Complete Problem Scope - React Hooks Violation

## Problem Statement
App loads but immediately shows ErrorBoundary with message: "Rendered fewer hooks than expected. This may be caused by an accidental early return statement."

This is a continuation of:
1. App not loading (fixed - missing dependencies)
2. Infinite loading spinner (fixed - ProtectedRoute isReady logic)
3. Current: React Hooks violation error

## Observed Error

### Browser Console (from user):
- Error: "Rendered fewer hooks than expected. This may be caused by an accidental early return statement."
- ErrorBoundary catches and displays error
- App shows "Something went wrong" page

### Error Type
React Error - Rules of Hooks violation
- Hooks must be called in the same order on every render
- Cannot call hooks conditionally, in loops, or after early returns
- "Fewer hooks" means: on render N, fewer hooks were called than on render N-1

## Architecture Map

### Component Render Chain
```
index.html
  ↓
main.tsx (createRoot)
  ↓
App.tsx
  ↓
ErrorBoundary (wraps everything)
  ↓
HelmetProvider
  ↓
QueryClientProvider
  ↓
AuthProvider (useAuth hook)
  ↓
TooltipProvider
  ↓
BrowserRouter
  ↓
Routes
  ↓
ProtectedRoute (for "/")
  ↓
Index component
  ↓
Home component
  ↓
[HOOKS VIOLATION OCCURS HERE]
```

### Critical Files Involved

1. **src/components/wellwell/ProtectedRoute.tsx** (64 lines)
   - Wraps protected routes
   - Calls `useAuth()` hook
   - Has conditional rendering based on `loading`, `configError`, `user`
   - **Line 12**: `const { user, loading, configError } = useAuth();`
   - **Line 13**: `const [isReady, setIsReady] = useState(false);`
   - **Line 15-26**: `useEffect` that sets `isReady`
   - **Line 30-47**: Early return if `configError`
   - **Line 50-55**: Early return if `loading || !isReady`
   - **Line 58-59**: Early return if `!user` (Navigate)
   - **Line 62**: Render children

2. **src/pages/Home.tsx** (382 lines)
   - Main home page component
   - **Lines 39-69**: Multiple hooks called at top level
   - **Line 124-130**: Early return if `showWelcome && isReturningUser`
   - **Line 134-382**: Conditional rendering based on `response`, `hasCommitted`, etc.

3. **src/hooks/useAuth.tsx** (335 lines)
   - Provides auth context
   - **Line 22**: `AuthProvider` component
   - **Line 30-110**: `useEffect` that sets up auth listeners
   - **Line 309-325**: Returns context provider

4. **src/hooks/useContextualNudge.tsx** (242 lines)
   - Called in Home.tsx line 48
   - **Line 116**: `useContextualNudge()` function
   - **Line 117**: `const { events } = useEvents();`
   - **Line 118**: `const { streak } = useStreak();`
   - **Line 119**: `const { profile } = useProfile();`
   - **Line 121-240**: `useMemo` that returns contextual state

5. **src/hooks/useEvents.tsx** (85 lines)
   - Called by useContextualNudge
   - **Line 10**: `useEvents()` function
   - **Line 11**: `const { user } = useAuth();`
   - **Line 14-43**: `useQuery` hook

6. **src/hooks/useStreak.tsx** (76 lines)
   - Called by useContextualNudge
   - **Line 6**: `useStreak()` function
   - Uses `useAuth()` and `useQuery()`

7. **src/hooks/useProfile.tsx** (157 lines)
   - Called by useContextualNudge
   - Uses `useAuth()` and `useQuery()`

8. **src/hooks/usePendingActions.ts** (133 lines)
   - Called in Home.tsx line 61
   - **Line 15**: `usePendingActions()` function
   - **Line 16**: `const { user } = useAuth();`
   - **Line 17-18**: `useState` hooks
   - **Line 21-41**: `useEffect` hook
   - **Line 44-105**: `useCallback` hooks
   - **Line 108-123**: `useEffect` hook

9. **src/components/wellwell/UsageLimitGate.tsx** (49 lines)
   - Wraps Home content
   - **Line 13**: Component function
   - **Line 14**: `const { canUse, usedToday, dailyLimit, isLoading: usageLoading } = useUsageLimit(toolName);`
   - **Line 15**: `const { isPro, isLoading: subLoading } = useSubscription();`
   - **Line 19-25**: Early return if `isLoading`
   - **Line 28-29**: Early return if `isPro`
   - **Line 33-34**: Early return if `canUse`

## Call Graph (Detailed)

```
App.tsx:51
  ↓
ErrorBoundary.render()
  ↓
HelmetProvider
  ↓
QueryClientProvider
  ↓
AuthProvider:22 (useAuth.tsx)
  ↓
useAuth.tsx:30 - useEffect runs
  ↓
useAuth.tsx:49 - supabase.auth.onAuthStateChange
  ↓
useAuth.tsx:91 - supabase.auth.getSession()
  ↓
[Auth state determined: loading = false, user = null or User]
  ↓
TooltipProvider
  ↓
BrowserRouter
  ↓
Routes
  ↓
ProtectedRoute:9 (for "/")
  ↓
ProtectedRoute:12 - useAuth() called
  ↓
ProtectedRoute:13 - useState(false) called
  ↓
ProtectedRoute:15 - useEffect called
  ↓
[If loading = false, isReady set to true after 50ms]
  ↓
ProtectedRoute:50 - Check: if (loading || !isReady) return spinner
  ↓
ProtectedRoute:58 - Check: if (!user) return <Navigate>
  ↓
ProtectedRoute:62 - return <>{children}</>
  ↓
Index:3
  ↓
Home:38
  ↓
Home:39-69 - ALL HOOKS CALLED:
  - useState (input, voiceInputKey, hasCommitted, showWelcome, isFirstLoad, showTimeModal)
  - useContextualNudge() → calls useEvents(), useStreak(), useProfile()
  - useErrorModal()
  - useUsageLimit()
  - useStoicAnalyzer()
  - useEvents()
  - useStreak()
  - usePendingActions()
  - useEffect()
  ↓
Home:71 - useEffect called
  ↓
Home:124 - Early return if (showWelcome && isReturningUser)
  ↓
[IF EARLY RETURN, fewer hooks called in child components]
  ↓
Home:134 - Early return if (response)
  ↓
[IF EARLY RETURN, fewer hooks called in child components]
  ↓
Home:287 - <Layout> renders
  ↓
Home:288 - <UsageLimitGate> renders
  ↓
UsageLimitGate:14-15 - Hooks called
  ↓
UsageLimitGate:19 - Early return if isLoading
  ↓
[IF EARLY RETURN, children (Home content) don't render]
```

## Conditional Rendering Branches

### ProtectedRoute.tsx
1. **Line 30-47**: If `configError` → return error UI (NO CHILDREN RENDERED)
2. **Line 50-55**: If `loading || !isReady` → return spinner (NO CHILDREN RENDERED)
3. **Line 58-59**: If `!user` → return `<Navigate>` (NO CHILDREN RENDERED)
4. **Line 62**: Otherwise → return children

### Home.tsx
1. **Line 124-130**: If `showWelcome && isReturningUser` → return WelcomeBackScreen (EARLY RETURN)
2. **Line 134-382**: If `response` → return response view (EARLY RETURN)
3. **Line 274-381**: Otherwise → return main home view

### UsageLimitGate.tsx
1. **Line 19-25**: If `isLoading` → return spinner (NO CHILDREN RENDERED)
2. **Line 28-29**: If `isPro` → return children
3. **Line 33-34**: If `canUse` → return children
4. **Line 38-46**: Otherwise → return upgrade prompt (NO CHILDREN RENDERED)

## Potential Violation Points

### Hypothesis 1: ProtectedRoute Conditional Rendering
**Likelihood**: Medium
**Evidence**:
- ProtectedRoute has early returns before rendering children
- If `configError` or `loading || !isReady` or `!user`, children never render
- On first render: might show spinner (children don't render)
- On second render: might render children (Home component)
- **Problem**: Home's hooks are called on render 2, but not on render 1
- **This violates Rules of Hooks**: hooks must be called on every render

**Test**: Check if Home component's hooks are called when ProtectedRoute shows spinner

### Hypothesis 2: Home Early Returns
**Likelihood**: Low
**Evidence**:
- Home has early returns (lines 124, 134)
- BUT all hooks are called BEFORE early returns (lines 39-69)
- Early returns happen AFTER all hooks
- **This should be fine**: hooks are called unconditionally

**Test**: Verify all hooks in Home are called before any early returns

### Hypothesis 3: UsageLimitGate Conditional Rendering
**Likelihood**: Medium
**Evidence**:
- UsageLimitGate wraps Home content
- Has early returns if `isLoading` (line 19)
- If `isLoading` is true on first render, children don't render
- If `isLoading` is false on second render, children render
- **Problem**: Home's hooks might be called on render 2, but not on render 1
- **This violates Rules of Hooks**: hooks must be called on every render

**Test**: Check if Home's hooks are called when UsageLimitGate shows spinner

### Hypothesis 4: useContextualNudge Conditional Hook Calls
**Likelihood**: Low
**Evidence**:
- useContextualNudge calls useEvents(), useStreak(), useProfile()
- These hooks use `enabled: !!user?.id` in useQuery
- BUT the hooks themselves are always called (just disabled)
- **This should be fine**: hooks are called, queries are just disabled

**Test**: Verify hooks in useContextualNudge are always called

### Hypothesis 5: Component Mount/Unmount Race Condition
**Likelihood**: High
**Evidence**:
- ProtectedRoute might render/unrender Home component
- UsageLimitGate might render/unrender Home content
- When component unmounts and remounts, React might get confused about hook counts
- **Problem**: If Home unmounts before all hooks are called, then remounts, hook count changes

**Test**: Check component lifecycle - does Home unmount/remount?

## Files + Line References

### Critical Path Files:
1. `src/components/wellwell/ProtectedRoute.tsx` (lines 9-63)
   - Conditional rendering based on auth state
   - Early returns prevent children from rendering

2. `src/pages/Home.tsx` (lines 38-382)
   - All hooks called at top (lines 39-69)
   - Early returns after hooks (lines 124, 134)

3. `src/components/wellwell/UsageLimitGate.tsx` (lines 13-48)
   - Wraps Home content
   - Early returns prevent children from rendering

4. `src/hooks/useContextualNudge.tsx` (lines 116-241)
   - Called in Home
   - Calls multiple hooks

5. `src/hooks/usePendingActions.ts` (lines 15-133)
   - Called in Home
   - Multiple hooks

### Hook Call Order in Home.tsx:
1. Line 39: `useState("")` - input
2. Line 40: `useState(0)` - voiceInputKey
3. Line 41: `useState(false)` - hasCommitted
4. Line 43: `useState(() => ...)` - showWelcome
5. Line 46: `useState(true)` - isFirstLoad
6. Line 48: `useContextualNudge()` - calls useEvents(), useStreak(), useProfile()
7. Line 56: `useErrorModal()` - calls useState(), useEffect()
8. Line 57: `useUsageLimit("unified")` - calls useQuery(), useMutation()
9. Line 58: `useStoicAnalyzer()` - calls useAuth(), useProfile(), useState(), useEffect()
10. Line 59: `useEvents()` - calls useAuth(), useQuery()
11. Line 60: `useStreak()` - calls useAuth(), useQuery()
12. Line 61: `usePendingActions()` - calls useAuth(), useState(), useEffect(), useCallback()
13. Line 69: `useState(false)` - showTimeModal
14. Line 71: `useEffect()` - events loading effect

**Total: 14+ hook calls (some hooks call other hooks)**

## Verification Steps Needed

### Step 1: Add Hook Call Logging
- Add console.log at start of Home component
- Add console.log for each hook call
- Add console.log before/after early returns
- Verify hooks are called in same order on every render

### Step 2: Check Component Lifecycle
- Add console.log in Home componentDidMount/useEffect
- Check if Home unmounts/remounts
- Verify Home renders consistently

### Step 3: Check ProtectedRoute Behavior
- Add console.log in ProtectedRoute
- Log when children render vs when spinner/redirect shows
- Verify children render consistently

### Step 4: Check UsageLimitGate Behavior
- Add console.log in UsageLimitGate
- Log when children render vs when spinner shows
- Verify children render consistently

### Step 5: Check React DevTools
- Use React DevTools Profiler
- Check component render counts
- Identify which component causes hook count change

## Expected vs Actual Behavior

### Expected:
- Home component always renders (or always doesn't render)
- All hooks in Home called on every render
- Same number of hooks called on every render
- No conditional hook calls

### Actual:
- Error: "Rendered fewer hooks than expected"
- Suggests: On one render, fewer hooks were called than on previous render
- Likely cause: Component conditionally renders, causing hook count to change

## Next Steps

1. **Add comprehensive logging** to identify exact render sequence
2. **Check component lifecycle** - does Home unmount/remount?
3. **Verify hook call order** - are hooks always called in same order?
4. **Identify conditional rendering** that causes hook count to change
5. **Fix the root cause** - ensure hooks are always called consistently



# Root Cause Analysis - React Hooks Violation

## Primary Root Cause

**CONDITIONAL COMPONENT RENDERING CAUSES INCONSISTENT HOOK CALLS**

### Technical Explanation

The error "Rendered fewer hooks than expected" occurs because:

1. **ProtectedRoute conditionally renders children**:
   - Render 1: `loading=true` or `isReady=false` → returns spinner (Home doesn't render)
   - Render 2: `loading=false` and `isReady=true` and `user exists` → returns children (Home renders)
   - **Problem**: Home's hooks are called on render 2, but not on render 1

2. **UsageLimitGate conditionally renders children**:
   - Render 1: `isLoading=true` → returns spinner (Home content doesn't render)
   - Render 2: `isLoading=false` → returns children (Home content renders)
   - **Problem**: If UsageLimitGate wraps Home's content, the content's hooks might not be called consistently

3. **React's Rules of Hooks**:
   - Hooks must be called in the same order on every render
   - If a component doesn't render, its hooks aren't called
   - If a component conditionally renders, hook count changes between renders
   - **This violates the Rules of Hooks**

### Evidence

**File: `src/components/wellwell/ProtectedRoute.tsx`**
- Line 51-56: Early return if `loading || !isReady` (children don't render)
- Line 59-60: Early return if `!user` (children don't render)
- Line 63: Returns children only when all conditions pass

**File: `src/components/wellwell/UsageLimitGate.tsx`**
- Line 19-24: Early return if `isLoading` (children don't render)
- Line 28-29: Returns children if `isPro`
- Line 33-34: Returns children if `canUse`
- Line 38-46: Returns upgrade prompt if limit reached (children don't render)

**File: `src/pages/Home.tsx`**
- Lines 39-69: All hooks called at top level (CORRECT)
- Lines 124-130: Early return after hooks (CORRECT - hooks already called)
- Lines 134-382: Early return after hooks (CORRECT - hooks already called)

### Why This Causes the Error

**Render Sequence:**
```
Render 1:
  ProtectedRoute: loading=true → return spinner
  Home: DOES NOT RENDER
  Home hooks: NOT CALLED

Render 2 (after 50ms delay):
  ProtectedRoute: loading=false, isReady=true, user exists → return children
  Home: RENDERS
  Home hooks: CALLED (14+ hooks)

React sees: Render 1 had 0 hooks from Home, Render 2 had 14+ hooks from Home
Error: "Rendered fewer hooks than expected"
```

**OR:**

```
Render 1:
  ProtectedRoute: returns children
  Home: RENDERS
  UsageLimitGate: isLoading=true → return spinner
  Home content: DOES NOT RENDER (wrapped by UsageLimitGate)
  Some hooks in Home content: NOT CALLED

Render 2:
  ProtectedRoute: returns children
  Home: RENDERS
  UsageLimitGate: isLoading=false → return children
  Home content: RENDERS
  All hooks in Home content: CALLED

React sees: Different hook counts between renders
Error: "Rendered fewer hooks than expected"
```

### Root Cause Confirmation

**Hypothesis 1: ProtectedRoute Conditional Rendering (MOST LIKELY)**
- ProtectedRoute prevents Home from rendering until auth is ready
- Home's hooks are called on render 2, but not on render 1
- This causes hook count mismatch
- **Confidence: High**

**Hypothesis 2: UsageLimitGate Conditional Rendering (POSSIBLE)**
- UsageLimitGate wraps Home content (not Home itself)
- If UsageLimitGate shows spinner, Home content doesn't render
- But Home component itself still renders and calls hooks
- This might cause issues if Home has conditional rendering based on content
- **Confidence: Medium**

**Hypothesis 3: Home Early Returns (UNLIKELY)**
- Home has early returns, but all hooks are called before returns
- This is correct pattern
- **Confidence: Low**

## Solution Strategy

### Option A: Ensure Home Always Renders (Recommended)
- Remove conditional rendering in ProtectedRoute
- Always render Home, but show loading state inside Home
- This ensures hooks are always called in same order

### Option B: Prevent Home from Rendering Until Ready
- Keep ProtectedRoute conditional rendering
- But ensure Home NEVER renders until all conditions are met
- This ensures hooks are never called until component is ready
- **Problem**: Still causes hook count mismatch if conditions change

### Option C: Move Conditional Logic Inside Home
- ProtectedRoute always renders Home
- Home handles its own loading/auth states
- All hooks called unconditionally
- Conditional rendering happens after hooks

## Recommended Fix

**Option C is best** because:
1. Ensures hooks are always called in same order
2. Follows React best practices
3. Prevents hook count mismatches
4. Makes component lifecycle predictable

### Implementation Approach

1. **ProtectedRoute**: Always render children, but pass loading/auth state as props
2. **Home**: Handle loading/auth states internally, but always call all hooks
3. **UsageLimitGate**: Keep conditional rendering (it wraps content, not component)

## Verification Plan

### Step 1: Add Hook Call Logging
- Log when Home component renders
- Log when each hook is called
- Verify hooks are called on every render

### Step 2: Test Render Sequence
- Check ProtectedRoute render sequence
- Verify Home renders consistently
- Check hook call counts match between renders

### Step 3: Test Auth State Changes
- Test with no user (should redirect)
- Test with user (should render Home)
- Verify no hook violations

## Success Criteria

1. ✅ Home component always renders (or always doesn't render) consistently
2. ✅ All hooks in Home called on every render
3. ✅ Same number of hooks called on every render
4. ✅ No "Rendered fewer hooks" error
5. ✅ App loads and works correctly



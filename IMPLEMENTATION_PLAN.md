# Implementation Plan - Error Prevention Fixes

## Overview

This plan addresses the root causes identified in ROOT_CAUSE.md to prevent errors from reaching ErrorBoundary. Focus: **PREVENT errors**, not just display them better.

## Root Causes to Fix

1. **Components don't handle React Query error states** (HIGH)
2. **Missing optional chaining** (MEDIUM)
3. **React Query error state not checked** (MEDIUM)

## Fix Strategy

### Phase 1: Fix React Query Error Handling in Hooks
Make hooks return safe defaults and handle errors gracefully.

### Phase 2: Fix Components to Handle Error States
Add error checks and optional chaining in components.

### Phase 3: Add Error Boundaries at Page Level
Add granular error boundaries for graceful degradation.

---

## Fix 1: Make useProfile Return Safe Defaults

**File**: `src/hooks/useProfile.tsx`

**Problem**: When queryFn throws, `profile` becomes `undefined`. Components access `profile.property` → throws.

**Solution**: 
1. Don't throw in queryFn - return null and log error
2. Or: Return safe default profile object
3. Expose error state clearly

**Changes**:

```typescript
// Current (line 25-28):
if (error) {
  logger.error('Failed to fetch profile', { error: error.message });
  throw error; // ❌ This causes React Query error state
}

// Fix Option A: Return null instead of throwing
if (error) {
  logger.error('Failed to fetch profile', { error: error.message });
  // Don't throw - return null to allow graceful degradation
  endTimer();
  return null; // ✅ Safe default
}

// Fix Option B: Return error in query result (better)
// But React Query doesn't support this pattern well
// Best: Don't throw, return null, expose error separately
```

**Recommended**: Option A - Return null, don't throw. Components should handle null profile.

**Lines to modify**: `src/hooks/useProfile.tsx:25-28`

---

## Fix 2: Make useEvents Return Safe Defaults

**File**: `src/hooks/useEvents.tsx`

**Problem**: When queryFn throws, `events` becomes `undefined`. Components access `events[0]` → throws.

**Solution**: Return empty array instead of throwing.

**Changes**:

```typescript
// Current (line 34-37):
if (error) {
  logger.error('Failed to fetch events', { error: error.message });
  throw error; // ❌ This causes React Query error state
}

// Fix: Return empty array instead of throwing
if (error) {
  logger.error('Failed to fetch events', { error: error.message });
  return []; // ✅ Safe default - empty array
}
```

**Lines to modify**: `src/hooks/useEvents.tsx:34-37`

---

## Fix 3: Fix useContextualNudge to Handle Undefined Events

**File**: `src/hooks/useContextualNudge.tsx`

**Problem**: Line 130 calls `events.filter()` without checking if `events` exists.

**Changes**:

```typescript
// Current (line 130):
const todayEvents = events.filter(e => new Date(e.created_at) >= todayStart);

// Fix: Add null check
const todayEvents = (events || []).filter(e => new Date(e.created_at) >= todayStart);
```

**Also fix**:
- Line 137: `if (events.length > 0)` → `if (events && events.length > 0)`
- Line 143: `const isReturningUser = events.length > 0;` → `const isReturningUser = events && events.length > 0;`

**Lines to modify**: 
- `src/hooks/useContextualNudge.tsx:130`
- `src/hooks/useContextualNudge.tsx:137`
- `src/hooks/useContextualNudge.tsx:143`

---

## Fix 4: Fix Profile.tsx to Handle Undefined Events

**File**: `src/pages/Profile.tsx`

**Problem**: Line 60 accesses `events[0]` without checking if `events` exists.

**Changes**:

```typescript
// Current (line 60):
const lastEvent = events[0];

// Fix: Add optional chaining or null check
const lastEvent = events?.[0];
```

**Also check**:
- Line 59: `const topPattern = patterns[0];` - Check if patterns is safe
- Line 61: `profile?.display_name` - Already safe ✅

**Lines to modify**: `src/pages/Profile.tsx:60`

---

## Fix 5: Add Error State Checks in Components

**Files**: All components using `useProfile()` and `useEvents()`

**Problem**: Components don't check `error` state before accessing data.

**Solution**: Add error UI or fallback when error exists.

**Example Pattern**:

```typescript
// Current:
const { profile, isLoading } = useProfile();
if (isLoading) return <Loading />;
const name = profile.display_name; // ❌ Throws if error

// Fix:
const { profile, isLoading, error } = useProfile();
if (isLoading) return <Loading />;
if (error) return <ErrorState message="Failed to load profile" />;
const name = profile?.display_name || 'User'; // ✅ Safe
```

**Files to update**:
1. `src/pages/Home.tsx` - Check profile/events errors
2. `src/pages/Profile.tsx` - Check profile/events errors
3. `src/pages/Pulse.tsx` - Check profile error
4. `src/hooks/useContextualNudge.tsx` - Handle events error

---

## Fix 6: Verify All Mutation Callers Handle Errors

**Files**: All callers of `updateProfile()` and `createEvent()`

**Problem**: Need to verify all mutation calls are wrapped in try-catch.

**Verification**:
- ✅ `src/pages/EditProfile.tsx:60` - Has try-catch
- ✅ `src/pages/Onboarding.tsx:263` - Has try-catch
- Need to check: `useStoicAnalyzer.tsx` direct insert (line 395) - Already handled ✅

**Action**: Search for all `updateProfile(` and `createEvent(` calls, verify try-catch

---

## Implementation Order

### Step 1: Fix Hooks (Prevent Errors at Source)
1. Fix `useProfile.tsx` - Return null instead of throwing
2. Fix `useEvents.tsx` - Return [] instead of throwing
3. Test: Verify hooks return safe defaults

### Step 2: Fix Hook Usage (Handle Errors in Components)
4. Fix `useContextualNudge.tsx` - Handle undefined events
5. Fix `Profile.tsx` - Handle undefined events
6. Add error checks in components using hooks
7. Test: Verify components handle error states

### Step 3: Add Error Boundaries (Graceful Degradation)
8. Add error boundary at page level (optional, for future)
9. Test: Verify errors don't crash entire app

---

## Detailed File Changes

### File 1: `src/hooks/useProfile.tsx`

**Change 1**: Lines 25-28
```typescript
// BEFORE:
if (error) {
  logger.error('Failed to fetch profile', { error: error.message });
  throw error;
}

// AFTER:
if (error) {
  logger.error('Failed to fetch profile', { error: error.message });
  endTimer();
  return null; // Return null instead of throwing - allows graceful degradation
}
```

**Rationale**: 
- Components can check `if (!profile)` instead of checking `error`
- Prevents React Query from entering error state
- Components already use optional chaining in most places

---

### File 2: `src/hooks/useEvents.tsx`

**Change 1**: Lines 34-37
```typescript
// BEFORE:
if (error) {
  logger.error('Failed to fetch events', { error: error.message });
  throw error;
}

// AFTER:
if (error) {
  logger.error('Failed to fetch events', { error: error.message });
  return []; // Return empty array instead of throwing
}
```

**Rationale**:
- Empty array is safe default for events
- Components can use `events || []` pattern
- Prevents React Query from entering error state

---

### File 3: `src/hooks/useContextualNudge.tsx`

**Change 1**: Line 130
```typescript
// BEFORE:
const todayEvents = events.filter(e => new Date(e.created_at) >= todayStart);

// AFTER:
const todayEvents = (events || []).filter(e => new Date(e.created_at) >= todayStart);
```

**Change 2**: Line 137
```typescript
// BEFORE:
if (events.length > 0) {

// AFTER:
if (events && events.length > 0) {
```

**Change 3**: Line 143
```typescript
// BEFORE:
const isReturningUser = events.length > 0;

// AFTER:
const isReturningUser = events && events.length > 0;
```

**Rationale**: Prevents TypeError when events is undefined

---

### File 4: `src/pages/Profile.tsx`

**Change 1**: Line 60
```typescript
// BEFORE:
const lastEvent = events[0];

// AFTER:
const lastEvent = events?.[0];
```

**Rationale**: Prevents TypeError when events is undefined

---

### File 5: `src/pages/Home.tsx`

**Change 1**: Add error checks (if needed)
- Check if components access profile/events without optional chaining
- Add error state handling if necessary

**Note**: Home.tsx uses hooks but may already be safe. Need to verify.

---

## Checkpoints

### CP0: Plan Approved
- Review all proposed changes
- Verify changes won't break existing functionality
- Confirm approach aligns with React Query best practices

### CP1: Hooks Fixed
**Action**: Apply changes to useProfile.tsx and useEvents.tsx
**Expected**: 
- Hooks return safe defaults (null, []) instead of throwing
- No React Query error states for API failures
**Verification**:
- Test with network failure
- Verify hooks return null/[] instead of error state
- Check console for errors

### CP2: Hook Usage Fixed
**Action**: Apply changes to useContextualNudge.tsx and Profile.tsx
**Expected**:
- No TypeError when events/profile is undefined
- Components handle missing data gracefully
**Verification**:
- Test with network failure
- Verify no console errors
- Verify components render without crashing

### CP3: Error State Handling Added
**Action**: Add error checks in components (if needed)
**Expected**:
- Components check error state or use optional chaining
- Error UI shown when appropriate
**Verification**:
- Test with network failure
- Verify error UI appears (if implemented)
- Verify no ErrorBoundary triggers

### CP4: Full Regression Test
**Action**: Test all user flows
**Expected**:
- No ErrorBoundary triggers
- App continues working with partial failures
- User-friendly error messages
**Verification**:
- Test login flow
- Test data fetching
- Test mutations
- Test with network failures
- Test with API errors

---

## Testing Plan

### Test 1: Network Failure During Profile Fetch
1. Open DevTools → Network tab
2. Block network requests
3. Navigate to Home page
4. **Expected**: Component handles missing profile gracefully, no ErrorBoundary
5. **Verify**: No console errors, component renders

### Test 2: Network Failure During Events Fetch
1. Block network requests
2. Navigate to Home page
3. **Expected**: Component handles missing events gracefully (empty array)
4. **Verify**: No console errors, component renders

### Test 3: API Error (500) During Profile Fetch
1. Mock API to return 500 error
2. Navigate to Home page
3. **Expected**: Component handles error gracefully
4. **Verify**: No ErrorBoundary, error logged

### Test 4: Mutation Failure
1. Block network during profile update
2. Try to update profile
3. **Expected**: Error shown to user, no ErrorBoundary
4. **Verify**: Error modal appears, no crash

---

## Risk Assessment

### Low Risk Changes
- Returning null/[] instead of throwing (hooks)
- Adding optional chaining (components)
- Adding null checks (useContextualNudge)

### Medium Risk Changes
- Changing React Query error behavior (may affect error handling UI)
- Need to verify components handle null/[] correctly

### Mitigation
- Test thoroughly with network failures
- Keep error logging for debugging
- Add error UI where appropriate

---

## Success Criteria

1. **Zero ErrorBoundary triggers** from React Query errors
2. **Components handle missing data** gracefully
3. **No TypeError** when data is undefined
4. **User-friendly error messages** (where appropriate)
5. **App continues working** with partial failures

---

## Files to Modify

1. `src/hooks/useProfile.tsx` - Return null instead of throwing
2. `src/hooks/useEvents.tsx` - Return [] instead of throwing
3. `src/hooks/useContextualNudge.tsx` - Handle undefined events
4. `src/pages/Profile.tsx` - Handle undefined events
5. `src/pages/Home.tsx` - Verify error handling (if needed)
6. `src/pages/Pulse.tsx` - Verify error handling (if needed)

---

## Dependencies

- React Query behavior (error states)
- Component error handling patterns
- TypeScript type safety

---

## Notes

- This approach prevents errors at the source (hooks) rather than catching them later
- Components become more resilient to API failures
- Error logging still happens for debugging
- User experience improves (no crash pages)

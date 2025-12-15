# Implementation Plan - Authentication Fix

## Problem Summary
Authentication fails due to invalid Supabase publishable key format. Current key `sb_publishable_PzNwPfmzOwwJpdh2A6_ufw_liFByjVO` is not a valid JWT format required by Supabase.

## Files to Modify

### 1. `.env` (Root directory)
**Action**: Update publishable key with correct JWT from Supabase dashboard
**Line**: Line 2 (VITE_SUPABASE_PUBLISHABLE_KEY)
**Change**: Replace invalid key with correct anon key from Supabase dashboard

### 2. `src/integrations/supabase/client.ts`
**Action**: Add key format validation and better error messages
**Lines**: 17-22 (after existing validation)
**Change**: Add JWT format check for publishable key

### 3. `src/pages/Auth.tsx`
**Action**: Improve error messages to distinguish key errors from credential errors
**Lines**: 69-77 (error handling in handleSubmit)
**Change**: Add specific error message for API key issues

## Proposed Diffs

### Diff 1: Update .env file
```diff
- VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_PzNwPfmzOwwJpdh2A6_ufw_liFByjVO
+ VITE_SUPABASE_PUBLISHABLE_KEY=<CORRECT_JWT_KEY_FROM_DASHBOARD>
```

**Note**: User must get correct key from: https://supabase.com/dashboard/project/zioacippbtcbctexywgc/settings/api

### Diff 2: Add key format validation in client.ts
```typescript
// After line 22, add:
// Validate key format (Supabase anon keys are JWTs starting with 'eyJ')
if (SUPABASE_PUBLISHABLE_KEY && !SUPABASE_PUBLISHABLE_KEY.startsWith('eyJ')) {
  console.error(
    '⚠️  Invalid Supabase publishable key format. ' +
    'Expected JWT format (starts with "eyJ"). ' +
    'Get your anon key from: https://supabase.com/dashboard/project/zioacippbtcbctexywgc/settings/api'
  );
  // Don't throw - allow app to start but log warning
  // This helps catch the issue early without breaking dev experience
}
```

### Diff 3: Improve error messages in Auth.tsx
```typescript
// Replace lines 69-77 with:
if (error) {
  let message = error.message;
  let title = 'Sign in failed';
  
  // Check for API key related errors
  if (error.message.includes('Invalid API key') || 
      error.message.includes('api key') ||
      error.status === 401) {
    title = 'Configuration Error';
    message = 'Invalid API configuration. Please contact support.';
    logger.error('API key error detected', { error: error.message });
  } else if (error.message === 'Invalid login credentials') {
    message = 'Invalid email or password. Please try again.';
  }
  
  toast({
    title,
    description: message,
    variant: 'destructive',
  });
  return;
}
```

## Checkpoints

### CP0: Plan Approval
**Action**: Review implementation plan
**Expected Outcome**: 
- Plan approved by user
- User confirms they can access Supabase dashboard to get correct key
**Verification**: User approval

### CP1: Environment + Config Checks
**Action**: 
1. User retrieves correct anon key from Supabase dashboard
2. Update .env file with correct key
3. Restart dev server
4. Check browser console for errors

**Expected Outcome**:
- No console errors about missing/invalid environment variables
- Supabase client initializes successfully
- No "Invalid API key" warnings

**Verification Method**:
- Browser console (F12) - check for errors
- Network tab - verify Supabase client can connect
- Application loads without ErrorBoundary triggering

### CP2: Core Feature Fix Proven
**Action**: 
1. Navigate to /auth page
2. Enter valid test credentials (or create new account)
3. Attempt to sign in
4. Verify successful authentication

**Expected Outcome**:
- Sign in succeeds with valid credentials
- User is redirected to home page (/)
- User session is established
- Protected routes are accessible

**Verification Method**:
- Browser console - check for "Sign in successful" log
- Network tab - verify POST to /auth/v1/token returns 200
- Application state - user object is populated
- URL redirects to / after successful login

### CP3: Secondary Integrations Validated
**Action**: 
1. Test sign up flow (new account creation)
2. Test sign out functionality
3. Test session persistence (refresh page, verify still logged in)
4. Test protected route access
5. Test navigation between protected routes

**Expected Outcome**:
- Sign up creates new account successfully
- Sign out clears session and redirects
- Session persists across page reloads
- Protected routes require authentication
- Navigation works correctly

**Verification Method**:
- Browser console - check for success logs
- Network tab - verify API calls succeed
- Application state - verify auth state changes correctly
- Local storage - verify session token is stored
- URL navigation - verify redirects work

### CP4: Regression Test
**Action**: 
1. Run full authentication flow 3+ times
2. Test with invalid credentials (should show error)
3. Test with valid credentials (should succeed)
4. Test edge cases (empty fields, special characters)
5. Verify no console errors accumulate

**Expected Outcome**:
- All flows work consistently
- Error handling works correctly
- No memory leaks or error accumulation
- Application remains stable

**Verification Method**:
- Browser console - no errors after multiple attempts
- Network tab - all requests complete successfully
- Application performance - no slowdowns
- User experience - smooth and responsive

## Risk Assessment

### Low Risk:
- Updating .env file (user action, reversible)
- Adding console warning (non-breaking, informative only)

### Medium Risk:
- Improving error messages (UI change, needs testing)
- Key format validation (could break if key format changes in future)

### Mitigation:
- Key format validation is warning-only (doesn't throw)
- Error message improvements are backward compatible
- All changes are additive (no breaking changes)

## Rollback Plan

If issues occur:
1. Revert .env to previous value (if backed up)
2. Remove key format validation (lines added in Diff 2)
3. Revert error message changes (Diff 3)

## Dependencies

### External:
- User must have access to Supabase dashboard
- User must retrieve correct anon key from API settings
- Dev server must be restarted after .env changes

### Internal:
- No code dependencies - changes are isolated

## Success Criteria

✅ Authentication works with valid credentials
✅ Clear error messages for invalid credentials
✅ Warning logged for invalid key format (helps future debugging)
✅ All authentication flows (sign in, sign up, sign out) work
✅ Session management works correctly
✅ No console errors or warnings (after fix)

## Next Steps

1. **User Action Required**: Get correct anon key from Supabase dashboard
   - URL: https://supabase.com/dashboard/project/zioacippbtcbctexywgc/settings/api
   - Look for "anon" or "public" key (JWT format, starts with `eyJ...`)

2. **After User Provides Key**: 
   - Update .env file
   - Apply code improvements (Diffs 2 & 3)
   - Restart dev server
   - Test authentication

3. **If Key Cannot Be Retrieved**:
   - Check Supabase project access
   - Verify project ID is correct
   - Contact Supabase support if needed


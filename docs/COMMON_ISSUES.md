# WellWell Common Issues & Troubleshooting

This document provides solutions for common issues encountered during development and in production.

---

## Quick Fixes

| Symptom | Likely Cause | Quick Fix |
|---------|--------------|-----------|
| "Configuration Problem" after login | Hooks violation | Check wrapper components always render children |
| ErrorBoundary showing frequently | API errors not handled | Check hooks return safe defaults |
| Welcome screen shows every time | localStorage not persisting | Check `handleWelcomeComplete` is called |
| AI analysis stuck loading | No cancel mechanism | Kill browser tab, refresh |
| Virtue scores not updating | RLS policy issue | Check profile_id matches |

---

## Authentication Issues

### Issue: "Configuration Problem" error after login (React Error #300)

**Status**: ✅ Resolved (January 2026)

**Symptoms**: 
- User sees "Configuration Problem" error page after successful login
- Error occurs when navigating to home page
- Login itself succeeds (authentication works)

**Root Cause**: 
- React hooks violation caused by conditional rendering in `ProtectedRoute` and `UsageLimitGate`
- ErrorBoundary mis-categorized hooks violations as configuration errors

**Solution**: 
- Modified `ProtectedRoute.tsx` to always render children with overlay pattern
- Modified `UsageLimitGate.tsx` to always render children with overlay pattern
- Fixed ErrorBoundary to detect hooks violations before config errors
- Enhanced error logging for better debugging

**Full Details**: See [Issue History: Login Hooks Violation](./ISSUE_HISTORY_LOGIN_HOOKS_VIOLATION.md)

---

### Issue: User can't sign up
**Symptoms**: Sign up button doesn't respond or shows error

**Possible Causes**:
1. Invalid email format
2. Password too short (min 6 characters)
3. Email already registered

**Solutions**:
- Validate email format client-side
- Show password requirements
- Check for existing account and suggest login

### Issue: User logged out unexpectedly
**Symptoms**: Redirected to login after short session

**Possible Causes**:
1. Token expired
2. Browser cleared storage
3. Auth state listener not set up correctly

**Solutions**:
- Ensure `onAuthStateChange` listener is in place
- Check `getSession()` on app load
- Verify session persistence settings

---

## Data Not Appearing

### Issue: Profile data not loading
**Symptoms**: Profile page shows empty or loading forever

**Possible Causes**:
1. RLS policy blocking read
2. Profile not created on signup
3. Network error

**Debug Steps**:
```typescript
// Check if profile exists
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

console.log({ data, error });
```

**Solutions**:
- Verify trigger `on_auth_user_created` exists
- Check RLS policy allows SELECT for own profile
- Add error handling with user-friendly messages

### Issue: Virtue scores not updating
**Symptoms**: Scores stay at default 50

**Possible Causes**:
1. INSERT RLS policy missing
2. `recorded_at` not being set
3. Edge function error

**Debug Steps**:
```typescript
// Check recent virtue scores
const { data } = await supabase
  .from('virtue_scores')
  .select('*')
  .eq('profile_id', userId)
  .order('recorded_at', { ascending: false })
  .limit(10);
```

---

## AI/Edge Function Issues

### Issue: AI analysis returns error
**Symptoms**: Toast shows "Analysis failed" or similar

**Possible Causes**:
1. Edge function not deployed
2. `GOOGLE_AI_API_KEY` not configured
3. Rate limit exceeded
4. Invalid request payload
5. Google Gemini API quota exceeded

**Debug Steps**:
1. Check edge function logs in Supabase dashboard
2. Verify `GOOGLE_AI_API_KEY` exists in secrets
3. Test with minimal payload
4. Check Google AI API quota/usage

**Solutions**:
- Redeploy edge function
- Add `GOOGLE_AI_API_KEY` to Supabase secrets
- Add retry logic with exponential backoff
- Show specific error message to user
- Verify Google AI API key has sufficient quota

### Issue: AI response doesn't follow schema
**Symptoms**: Missing fields in response, app crashes

**Possible Causes**:
1. LLM hallucination
2. Prompt not strict enough
3. Response parsing error

**Solutions**:
- Use tool calling for structured output
- Add Zod validation on response
- Provide fallback values

---

## UI/UX Issues

### Issue: Animations not smooth
**Symptoms**: Janky transitions, delayed renders

**Possible Causes**:
1. Too many re-renders
2. Heavy DOM operations
3. Blocking main thread

**Solutions**:
- Use `React.memo` for expensive components
- Move animations to CSS/GPU
- Lazy load non-critical components

### Issue: Mobile layout broken
**Symptoms**: Overlapping elements, cut-off text

**Possible Causes**:
1. Fixed widths instead of fluid
2. Missing viewport meta
3. Bottom nav overlapping content

**Solutions**:
- Use `w-full` and `max-w-*` instead of fixed widths
- Ensure `pb-24` on Layout for bottom nav clearance
- Test with actual device or devtools mobile view

---

## Performance Issues

### Issue: Slow initial load
**Symptoms**: White screen for 2+ seconds

**Possible Causes**:
1. Large bundle size
2. Render-blocking resources
3. Slow database query

**Solutions**:
- Code-split routes with `lazy()`
- Preload critical assets
- Add loading skeleton

### Issue: Queries hitting 1000 row limit
**Symptoms**: Data appears truncated

**Solution**:
```typescript
// Paginate queries
const { data } = await supabase
  .from('events')
  .select('*')
  .range(0, 49) // First 50
  .order('created_at', { ascending: false });
```

---

## Development Issues

### Issue: Types out of sync
**Symptoms**: TypeScript errors about missing columns

**Cause**: Database schema changed but types not regenerated

**Solution**: Types auto-regenerate on next deploy. If urgent, reference the actual column names from `supabase/migrations/`.

### Issue: Hot reload not working
**Symptoms**: Changes don't appear

**Solutions**:
1. Hard refresh (Cmd+Shift+R)
2. Clear Vite cache
3. Restart dev server

---

## Logging Issues

### Issue: Logs not appearing
**Symptoms**: Logger calls but no output

**Possible Causes**:
1. Log level filtering
2. Console collapsed groups
3. Production mode filtering

**Solutions**:
- Check `LOG_LEVEL` environment
- Expand console groups
- Ensure logger not disabled in prod

### Issue: Too many logs
**Symptoms**: Console overwhelmed

**Solutions**:
- Filter by level in console
- Use trace IDs to filter sessions
- Reduce DEBUG level logging

---

## React Errors

### Issue: React Error #300 (Hooks Violation)

**Symptoms**: 
- "Rendered fewer hooks than expected" error
- ErrorBoundary triggered after navigation
- App crashes on state transitions

**Root Causes**:
1. Wrapper components conditionally rendering children
2. Early returns before all hooks are called
3. Hooks inside conditionals

**Common Violators**:
- `ProtectedRoute` — Must always render children
- `UsageLimitGate` — Must always render children
- Any component with `if (loading) return <Spinner />`

**Solution Pattern**:
```typescript
// ❌ WRONG - Violates hooks rules
if (isLoading) {
  return <Spinner />;
}
return <>{children}</>;

// ✅ CORRECT - Always render children
if (isLoading) {
  return (
    <>
      <LoadingOverlay />
      {children}
    </>
  );
}
return <>{children}</>;
```

**Full Details**: See [Issue History: Login Hooks Violation](./ISSUE_HISTORY_LOGIN_HOOKS_VIOLATION.md)

---

### Issue: ErrorBoundary Triggered Frequently

**Status**: ✅ Resolved (January 2026)

**Symptoms**:
- "Something went wrong" page appears often
- ErrorBoundary catches TypeError exceptions
- Happens after API failures

**Root Cause**:
- Components don't check for undefined data
- React Query enters error state when queryFn throws
- Components access `data.property` without null check

**Solution**:
```typescript
// ❌ WRONG - Throws when data is undefined
const { data } = useProfile();
return <div>{data.display_name}</div>;

// ✅ CORRECT - Handle undefined data
const { data } = useProfile();
return <div>{data?.display_name ?? 'Loading...'}</div>;
```

**Prevention in Hooks**:
```typescript
// Return safe defaults instead of throwing
if (error) {
  logger.error('Failed to fetch', { error });
  return null; // or [] for arrays
}
```

**Full Details**: See [Issue History: Error Prevention](./ISSUE_HISTORY_ERROR_PREVENTION.md)

---

## State Management Issues

### Issue: Welcome Screen Shows Every Refresh

**Symptoms**: Welcome back screen appears on every page load

**Root Cause**: 
- Using `sessionStorage` (cleared on tab close)
- Or `handleWelcomeComplete` not being called

**Solution**:
- Use `localStorage` for persistence across sessions
- Verify `handleWelcomeComplete` is called on all dismiss paths

**Code Location**: `src/pages/Home.tsx`

---

### Issue: AI Analysis State Lost on Navigation

**Symptoms**:
- User navigates away during AI call
- State lost, must re-enter input
- No way to recover previous analysis

**Status**: ✅ Resolved (January 2026)

**Solution**:
- Analysis state saved to `sessionStorage`
- State restored on component mount (if < 5 minutes old)
- Cancel mechanism added with AbortController

**Code Location**: `src/hooks/useStoicAnalyzer.tsx`

---

### Issue: Usage Tracked Before AI Success

**Symptoms**:
- User loses quota even when AI fails
- Unfair quota consumption

**Status**: ✅ Resolved (January 2026)

**Solution**:
- `trackUsage()` moved to after successful `analyze()` response
- Wrapped in try-catch to prevent blocking on tracking failure

**Code Location**: All tool pages (`Pulse.tsx`, `Intervene.tsx`, `Debrief.tsx`, `Home.tsx`)

---

## Deployment Issues

### Issue: Edge Function Returns 401 Unauthorized

**Symptoms**: AI analysis fails with 401 error

**Causes**:
1. Auth token not passed to edge function
2. Supabase anon key invalid
3. User session expired

**Solutions**:
1. Verify `Authorization: Bearer <token>` header is included
2. Check Supabase anon key format (should start with `eyJ...`)
3. Implement session refresh logic

---

### Issue: Environment Variables Not Loading

**Symptoms**: 
- Supabase client shows undefined URL/key
- Console error about missing config

**Solutions**:
1. Restart dev server (Vite caches env vars)
2. Verify `.env` file exists and has correct format
3. Check variable names start with `VITE_`

```bash
# Verify env vars
Get-Content .env | Select-String "VITE_SUPABASE"
```

---

*Last Updated: January 3, 2026*

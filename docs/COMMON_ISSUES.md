# WellWell Common Issues & Troubleshooting

## Authentication Issues

### Issue: "Configuration Problem" error after login (React Error #300)

**Status**: ✅ Resolved (2025-01-XX)

**Symptoms**: 
- User sees "Configuration Problem" error page after successful login
- Error occurs when navigating to home page
- Login itself succeeds (authentication works)

**Root Cause**: 
- React hooks violation caused by conditional rendering in `UsageLimitGate`
- ErrorBoundary mis-categorized hooks violations as configuration errors

**Solution**: 
- Fixed `UsageLimitGate` to always render children (use overlay for loading)
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

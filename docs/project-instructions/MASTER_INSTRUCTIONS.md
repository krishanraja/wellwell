# WellWell Master Instructions for AI Assistants

## Overview

AI assistant behavior guidelines for development, including diagnostic protocols, quality rules, and operational standards.

---

## Core Principles

### 1. User Data Isolation is Non-Negotiable
- **Rule:** All database queries must respect RLS (Row Level Security)
- **Check:** Every table query uses `profile_id` from `auth.uid()`
- **Never:** Access data across users, even for debugging

### 2. Always Render Children Pattern
- **Rule:** Wrapper components (ProtectedRoute, UsageLimitGate) must ALWAYS render children
- **Check:** No conditional rendering that skips children
- **Pattern:** Use overlay pattern for loading/error states, not conditional rendering

### 3. Safe Defaults in Hooks
- **Rule:** Hooks return safe defaults (`null`, `[]`) instead of throwing
- **Check:** All hooks handle errors gracefully
- **Never:** Throw errors from hooks (causes ErrorBoundary triggers)

### 4. Mobile-First Always
- **Rule:** Design and test for mobile viewport (375px) first
- **Check:** Touch targets are 44x44px minimum
- **Never:** Assume desktop viewport

### 5. Events Saved After Success
- **Rule:** Events saved only after successful AI analysis
- **Check:** Event creation happens after `analyze()` succeeds
- **Never:** Save events before AI call completes

---

## Diagnostic Protocols

### When User Reports Error

#### Step 1: Gather Information
1. **Error Message:** Exact error text from user
2. **Steps to Reproduce:** What user did before error
3. **Browser/Device:** User's browser and device
4. **Console Logs:** Any errors in browser console
5. **Network Tab:** Failed requests (if applicable)

#### Step 2: Check Common Issues
1. **React Hooks Violation (#300):**
   - Check wrapper components (ProtectedRoute, UsageLimitGate)
   - Verify children always render
   - Check for conditional rendering before hooks

2. **ErrorBoundary Triggered:**
   - Check hooks return safe defaults
   - Verify components handle undefined data
   - Check for TypeError from undefined access

3. **Profile Not Loading:**
   - Check `ensure_profile_exists` function exists
   - Verify RLS policies allow user access
   - Check profile creation trigger

4. **AI Analysis Fails:**
   - Check `GOOGLE_AI_API_KEY` in Supabase secrets
   - Verify edge function is deployed
   - Check edge function logs

#### Step 3: Create Diagnostic Document
If issue is complex, create diagnostic document:
- **File Name:** `DIAGNOSIS_[ISSUE_NAME].md`
- **Structure:**
  1. Problem description
  2. Steps to reproduce
  3. Root cause analysis
  4. Solution
  5. Prevention

#### Step 4: Implement Fix
1. Fix the issue
2. Test on mobile device
3. Verify no regressions
4. Update [COMMON_ISSUES.md](./COMMON_ISSUES.md) if recurring

---

## Quality Rules

### Code Quality

#### TypeScript
- **Rule:** Strict mode enabled, no `any` types
- **Check:** All functions have proper types
- **Exception:** Third-party library types (use `@ts-ignore` sparingly)

#### React Hooks
- **Rule:** Hooks called in same order every render
- **Check:** No hooks in conditionals, loops, or nested functions
- **Pattern:** All hooks at top of component

#### Error Handling
- **Rule:** All async operations have error handling
- **Check:** Try-catch blocks, error states, user feedback
- **Pattern:** Toast notifications for user-facing errors

#### Performance
- **Rule:** Limit queries to 50 rows (paginate if needed)
- **Check:** No N+1 queries, use React.memo for expensive components
- **Pattern:** Code split routes with `React.lazy()`

### UI/UX Quality

#### Mobile Viewport
- **Rule:** Test on actual mobile device, not just browser devtools
- **Check:** Touch targets 44x44px, no horizontal scroll
- **Pattern:** Mobile-first CSS, then enhance for desktop

#### Loading States
- **Rule:** All async operations show loading state
- **Check:** Skeleton screens, spinners, progress indicators
- **Pattern:** Optimistic UI updates where appropriate

#### Error States
- **Rule:** All errors show user-friendly message
- **Check:** No technical jargon, actionable next steps
- **Pattern:** ErrorBoundary for React errors, toast for API errors

#### Accessibility
- **Rule:** WCAG AA compliance (4.5:1 contrast, keyboard navigation)
- **Check:** Focus indicators, ARIA labels, semantic HTML
- **Pattern:** Test with screen reader

---

## Development Workflow

### Before Starting Work
1. **Read Relevant Docs:**
   - [PURPOSE.md](./PURPOSE.md) for product context
   - [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for styling
   - [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
   - [COMMON_ISSUES.md](./COMMON_ISSUES.md) for known problems

2. **Understand the Problem:**
   - What is the user trying to do?
   - What is the expected behavior?
   - What is the actual behavior?

3. **Plan the Solution:**
   - What files need to change?
   - What are the edge cases?
   - How will this be tested?

### During Development
1. **Follow Patterns:**
   - Use existing component patterns
   - Follow naming conventions
   - Match code style

2. **Test Continuously:**
   - Test on mobile viewport
   - Test error states
   - Test edge cases

3. **Check for Regressions:**
   - Does existing functionality still work?
   - Are there new console errors?
   - Do tests still pass?

### After Completing Work
1. **Update Documentation:**
   - [DECISIONS_LOG.md](./DECISIONS_LOG.md) if architectural change
   - [COMMON_ISSUES.md](./COMMON_ISSUES.md) if fixing bug
   - [FEATURES.md](./FEATURES.md) if adding feature

2. **Verify Quality:**
   - No console errors
   - No TypeScript errors
   - Mobile viewport works
   - Error handling in place

---

## Specific Guidelines

### Adding New Features

#### 1. Database Changes
- Create migration file in `supabase/migrations/`
- Include RLS policies
- Test on local database first
- Document in [ARCHITECTURE.md](./ARCHITECTURE.md)

#### 2. New Components
- Follow existing component patterns
- Use design system tokens
- Test on mobile viewport
- Add to [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) if reusable

#### 3. New Hooks
- Return safe defaults (never throw)
- Handle loading and error states
- Document in code comments
- Test with various data states

#### 4. New Pages
- Use correct Layout pattern (scrollable vs. manual)
- Test on mobile viewport
- Add to navigation if needed
- Test error states

### Fixing Bugs

#### 1. Identify Root Cause
- Reproduce the bug
- Check browser console
- Check network tab
- Check Supabase logs

#### 2. Implement Fix
- Fix the root cause (not just symptoms)
- Test the fix
- Test for regressions
- Update [COMMON_ISSUES.md](./COMMON_ISSUES.md)

#### 3. Prevent Recurrence
- Add guards/validation
- Add error handling
- Document in [COMMON_ISSUES.md](./COMMON_ISSUES.md)

### Refactoring

#### 1. Plan Refactor
- Identify what needs refactoring
- Understand dependencies
- Plan incremental changes

#### 2. Execute Refactor
- Make small, incremental changes
- Test after each change
- Keep functionality identical

#### 3. Document Changes
- Update [DECISIONS_LOG.md](./DECISIONS_LOG.md)
- Update affected documentation
- Note breaking changes (if any)

---

## Code Patterns

### Safe Data Access
```typescript
// ❌ WRONG - Throws if data is undefined
const { data } = useProfile();
return <div>{data.display_name}</div>;

// ✅ CORRECT - Handles undefined
const { data } = useProfile();
return <div>{data?.display_name ?? 'Loading...'}</div>;
```

### Always Render Children
```typescript
// ❌ WRONG - Conditional rendering violates hooks rules
if (isLoading) {
  return <Spinner />;
}
return <>{children}</>;

// ✅ CORRECT - Always render children with overlay
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

### Safe Hook Returns
```typescript
// ❌ WRONG - Throws on error
if (error) {
  throw error;
}

// ✅ CORRECT - Returns safe default
if (error) {
  logger.error('Failed to fetch', { error });
  return null; // or [] for arrays
}
```

### Event Saving After Success
```typescript
// ❌ WRONG - Saves before AI succeeds
await saveEvent(input);
const analysis = await analyze(input);

// ✅ CORRECT - Saves after AI succeeds
const analysis = await analyze(input);
if (analysis) {
  await saveEvent(input);
}
```

---

## Testing Checklist

### Before Committing
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Tested on mobile viewport (375px)
- [ ] Tested error states
- [ ] Tested loading states
- [ ] Tested empty states
- [ ] No regressions in existing features

### Before Deploying
- [ ] All tests pass
- [ ] No security issues (RLS, auth)
- [ ] Performance acceptable (no slow queries)
- [ ] Mobile UX verified
- [ ] Error handling verified
- [ ] Documentation updated

---

## Communication Guidelines

### When Reporting Issues
1. **Be Specific:** Exact error message, steps to reproduce
2. **Include Context:** Browser, device, user actions
3. **Provide Logs:** Console errors, network failures
4. **Suggest Solution:** If you have ideas, share them

### When Implementing Fixes
1. **Explain the Problem:** What was wrong and why
2. **Explain the Solution:** How the fix works
3. **Note Side Effects:** Any implications or trade-offs
4. **Update Docs:** Relevant documentation updated

---

## Emergency Procedures

### Production Error
1. **Assess Impact:** How many users affected?
2. **Check Logs:** Supabase logs, Vercel logs, browser console
3. **Identify Root Cause:** What changed recently?
4. **Implement Fix:** Hotfix if critical, or schedule fix
5. **Verify Fix:** Test on production
6. **Document:** Update [COMMON_ISSUES.md](./COMMON_ISSUES.md)

### Data Issue
1. **Assess Scope:** How many users affected?
2. **Check RLS:** Verify policies are correct
3. **Check Migrations:** Were migrations run correctly?
4. **Fix Data:** If possible, create migration to fix
5. **Prevent Recurrence:** Add guards/validation

---

## Resources

### Documentation
- **Master Index:** [README.md](./README.md)
- **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Design System:** [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
- **Common Issues:** [COMMON_ISSUES.md](./COMMON_ISSUES.md)
- **Decisions:** [DECISIONS_LOG.md](./DECISIONS_LOG.md)

### External Resources
- **React Docs:** https://react.dev
- **Supabase Docs:** https://supabase.com/docs
- **Tailwind Docs:** https://tailwindcss.com/docs
- **TypeScript Docs:** https://www.typescriptlang.org/docs

---

*Last Updated: January 16, 2026*

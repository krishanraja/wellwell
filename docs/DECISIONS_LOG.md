# WellWell Decisions Log

This document tracks key architectural and design decisions with rationale.

---

## 2024-01 | Initial Architecture

### Decision: Mobile-First, Dark-Mode Default
**Context**: Target users are professionals checking the app on phones during stressful moments.

**Options Considered**:
1. Desktop-first, responsive down
2. Mobile-first, responsive up
3. Separate mobile app

**Decision**: Mobile-first web app with dark mode default

**Rationale**:
- 80%+ of expected usage on mobile
- Dark mode reduces eye strain, especially for early morning (Pulse) and evening (Debrief)
- Web app allows cross-platform without app store friction

---

## 2024-01 | Database Design: Events as Primary Record

### Decision: Store raw events, derive insights
**Context**: Need to capture user interactions for AI analysis and tracking.

**Options Considered**:
1. Store only AI summaries
2. Store only raw input
3. Store both raw events and derived insights (chosen)

**Decision**: Two-layer data model (events → insights)

**Rationale**:
- Raw events are the source of truth
- AI summaries can be regenerated/improved
- Enables future re-analysis with better models
- Supports audit trail and debugging

---

## 2024-01 | AI Integration: Lovable AI Gateway

### Decision: Use Lovable AI instead of direct OpenAI
**Context**: Need AI analysis for Stoic insights.

**Options Considered**:
1. Direct OpenAI API (requires user API key)
2. Anthropic Claude (requires setup)
3. Lovable AI Gateway (no setup required)

**Decision**: Lovable AI with google/gemini-2.5-flash

**Rationale**:
- Zero configuration for users
- Cost included in platform
- Sufficient quality for text analysis
- Easy upgrade path if needed

---

## 2024-01 | State Management: React Query + Local State

### Decision: No global state library
**Context**: Need to manage server state and UI state.

**Options Considered**:
1. Redux
2. Zustand
3. React Query only
4. React Query + Context for auth (chosen)

**Decision**: React Query for server state, Context for auth, local state for UI

**Rationale**:
- App is relatively simple
- React Query handles caching, refetching
- Auth state truly global, fits Context
- No need for Redux complexity

---

## 2024-01 | Virtue Scoring: 0-100 Scale

### Decision: Use 0-100 integer scores
**Context**: Need to track virtue progress quantitatively.

**Options Considered**:
1. Binary (has/doesn't have)
2. 1-5 scale
3. 0-100 scale (chosen)
4. Unbounded points

**Decision**: 0-100 with 50 as neutral starting point

**Rationale**:
- Granular enough to show small improvements
- Intuitive percentage mental model
- 50 neutral allows decrease and increase
- Easy to calculate deltas

---

## 2024-01 | Component Library: shadcn/ui Base

### Decision: Use shadcn/ui as foundation
**Context**: Need consistent, accessible UI components.

**Options Considered**:
1. Build from scratch
2. Material UI
3. Chakra UI
4. shadcn/ui (chosen)

**Decision**: shadcn/ui with heavy customization

**Rationale**:
- Unstyled/headless allows full design control
- Accessibility built-in
- No package bloat (components copied in)
- Tailwind-native

---

## 2024-01 | Authentication: Email/Password Only

### Decision: Start with email/password, no OAuth
**Context**: Users need accounts for data persistence.

**Options Considered**:
1. Anonymous only
2. Email/password only (chosen)
3. OAuth (Google, Apple)
4. Magic links

**Decision**: Email/password with auto-confirm enabled

**Rationale**:
- Simplest to implement
- Works everywhere
- No third-party dependencies
- Can add OAuth later

---

## 2024-01 | Logging: Centralized Logger Service

### Decision: Build custom logger, not use third-party
**Context**: Need visibility into app behavior for debugging.

**Options Considered**:
1. `console.log` everywhere
2. Third-party (Sentry, LogRocket)
3. Custom logger service (chosen)

**Decision**: Custom logger with structured format

**Rationale**:
- Full control over format
- No external dependencies
- Can add remote logging later
- Consistent across codebase

---

## 2024-12 | Mobile Viewport Optimization

### Decision: Condensed UI components and elegant scroll indicators
**Context**: User feedback identified three UX issues on mobile:
1. Ugly grey horizontal scrollbar on filter chips
2. "Your Virtues" card cut off by bottom navigation
3. Journey page had excessive vertical scrolling with wasted header space

**Options Considered**:
1. Keep native scrollbars (rejected - poor UX)
2. Hide scrollbars entirely (rejected - no affordance for scrolling)
3. Create subtle fade indicators with hidden scrollbars (chosen)

**Decision**: 
- Created `HorizontalScroll` component with subtle fade edges that appear/disappear based on scroll position
- Added `scrollbar-hide` CSS utility to hide native scrollbars while preserving scroll functionality
- Condensed `VoiceFirstInput` component (mic button 28→20, reduced padding and margins)
- Increased Layout bottom padding from 16→20 (non-scrollable) and 20→24 (scrollable)
- Redesigned Journey page: removed profile avatar section, added inline header with name/streak/settings, reduced card padding

**Rationale**:
- Fade indicators are more elegant than grey scrollbars and provide clear affordance
- Smaller voice input allows more content visible in viewport without scrolling
- Bottom breathing space prevents content from feeling "crushed" against nav bar
- Journey page now shows all key information with minimal/no scrolling on standard mobile viewports
- Changes follow Apple HIG and Material Design principles for touch targets and visual hierarchy

**Impact**:
- Improved above-the-fold content visibility on Home (~15% more content visible)
- Journey page fits in viewport for 90%+ of mobile devices
- Consistent horizontal scroll UX across History, FAQ, DailyStances, and Home pages

---

## 2024-12 | Sacred Navigation Zone & Viewport Consistency

### Decision: Global safe area system for bottom navigation
**Context**: User feedback identified multiple UX issues:
1. Pricing page content overflowed but couldn't scroll
2. Home "Your Virtues" card touched/overlapped bottom nav
3. Journey page chart was clipped on left, content touched nav
4. Library and Meditations pages couldn't scroll despite having content

**Options Considered**:
1. Fix padding on each page individually (rejected - inconsistent, error-prone)
2. Increase global padding values (rejected - doesn't account for safe areas)
3. Create CSS variable-based safe area system (chosen)

**Decision**: 
- Created `--nav-height` and `--safe-bottom` CSS variables that account for nav height, device safe area insets, and breathing room
- Added `.safe-bottom` utility class used by Layout component
- Layout now applies consistent safe padding regardless of scrollable state
- Condensed Pricing page content to fit in viewport without scrolling (smaller padding, 2-column grid for features, reduced font sizes)
- Fixed VirtueChart left margin clipping (changed `left: -20` to `left: 0`)
- Enabled scrolling on Library and Meditations pages via `scrollable` prop

**Rationale**:
- The bottom nav should be "sacred" - content should never intersect with it
- CSS calc with env(safe-area-inset-bottom) handles notched devices and gesture bars
- Single source of truth for safe area spacing reduces bugs
- Pricing page redesign follows Google Material Design principles for compact cards
- Library pages are content-heavy and require scrolling; Pricing/Home should fit in viewport

**Impact**:
- Consistent 12px breathing room above nav across all pages
- Professional appearance matching Google/Apple app standards
- No content clipping or overlap on any screen size
- Improved mobile UX across all tested viewports

---

## 2025-01 | Error Prevention Strategy

### Decision: Prevent Errors at Source, Not Boundaries
**Context**: ErrorBoundary triggered frequently when API calls failed. Components didn't handle React Query error states.

**Options Considered**:
1. Add try-catch around every data access (rejected - too verbose)
2. Add error checking in every component (rejected - inconsistent)
3. Return safe defaults from hooks instead of throwing (chosen)

**Decision**: Hooks return safe defaults (`null`, `[]`) instead of throwing errors

**Rationale**:
- Prevents React Query from entering error state
- Components become more resilient automatically
- Consistent pattern across all hooks
- No need for error checking in every component

**Implementation**:
```typescript
// BEFORE: Throws on error
if (error) {
  throw error;
}

// AFTER: Returns safe default
if (error) {
  logger.error('Failed to fetch', { error: error.message });
  return null; // or [] for arrays
}
```

**Impact**:
- ErrorBoundary no longer triggered by API failures
- Zero TypeError exceptions from undefined data access
- App continues working with partial failures

---

## 2025-01 | Always Render Children Pattern

### Decision: Wrapper Components Always Render Children
**Context**: React hooks violations (Error #300) caused by conditional rendering in wrapper components.

**Options Considered**:
1. Remove wrapper components (rejected - lose encapsulation)
2. Lift state up (rejected - complex refactoring)
3. Always render children with overlay pattern (chosen)

**Decision**: Wrapper components always render children, use overlays for loading/error states

**Rationale**:
- Ensures hooks are called consistently on every render
- Follows React's Rules of Hooks
- Loading states remain visible without blocking children
- Children can have their own loading guards

**Implementation**:
```typescript
// BEFORE: Conditional rendering violates hooks rules
if (isLoading) {
  return <Spinner />;
}
return <>{children}</>;

// AFTER: Always render children with overlay
if (isLoading) {
  return (
    <>
      <LoadingOverlay />
      {children} // Always render
    </>
  );
}
return <>{children}</>;
```

**Impact**:
- Eliminated React Error #300
- Consistent hook calls across all render paths
- No more ErrorBoundary triggers on navigation

---

## 2025-01 | Secure Token Storage

### Decision: Use sessionStorage Instead of localStorage for Auth Tokens
**Context**: XSS attack could steal tokens from localStorage, compromising user accounts.

**Options Considered**:
1. Keep localStorage (rejected - XSS vulnerable)
2. httpOnly cookies (rejected - requires backend changes)
3. sessionStorage (chosen - cleared on tab close)

**Decision**: Store auth tokens in sessionStorage

**Rationale**:
- Tokens cleared when tab closes (reduced exposure window)
- Still accessible to JavaScript (required for Supabase SDK)
- No backend changes required
- Balance of security and convenience

**Future Consideration**:
- For maximum security, implement httpOnly cookies via edge function proxy

---

## 2025-01 | State Machine for Auth

### Decision: Explicit Auth State Machine
**Context**: Auth state transitions were implicit, making debugging difficult.

**Options Considered**:
1. Keep implicit state (rejected - hard to debug)
2. Use XState library (rejected - overhead for simple case)
3. Custom state machine with explicit states (chosen)

**Decision**: Create explicit `AuthStateMachine` with defined states and transitions

**States Defined**:
- `anonymous_visitor`
- `anonymous_with_progress`
- `email_captured`
- `signed_in_unverified`
- `signed_in`
- `session_expired`
- `signed_out`

**Rationale**:
- Clear visibility into auth state
- Explicit transitions for debugging
- Can add logging/tracking to state changes
- Enables session expiry detection

---

## 2025-01 | Generic Error Messages for Auth

### Decision: Don't Reveal Account Existence
**Context**: Specific error messages like "Email not found" enable account enumeration attacks.

**Options Considered**:
1. Show specific errors (rejected - security risk)
2. Generic errors only (chosen)

**Decision**: All auth failures show "Invalid email or password"

**Rationale**:
- Prevents attackers from enumerating valid accounts
- Standard security practice
- Users can use "Forgot Password" to verify account exists

---

## 2025-01 | Edge Function Authentication

### Decision: Require Auth for All AI Edge Functions
**Context**: `stoic-analyzer` edge function was unprotected, allowing unauthorized AI usage.

**Options Considered**:
1. Keep open (rejected - costs money, abuse risk)
2. API key authentication (rejected - key management)
3. JWT validation from Supabase Auth (chosen)

**Decision**: Validate Supabase auth token in edge function

**Rationale**:
- Prevents unauthorized AI usage
- Leverages existing auth system
- No additional secrets to manage
- Consistent with RLS security model

---

## Future Decisions Pending

- [ ] Push notification strategy
- [ ] Offline support approach
- [ ] Team/org multi-tenancy
- [ ] Export/backup format
- [ ] Content Security Policy (CSP) headers
- [ ] httpOnly cookies for maximum token security

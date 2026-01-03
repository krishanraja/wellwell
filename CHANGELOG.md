# Changelog

All notable changes to WellWell are documented in this file. This includes major features, bug fixes, security updates, and architectural decisions made by various AI agents working on this project.

---

## [Unreleased]

### Pending
- Push notification strategy
- Offline support with service worker
- Team/org multi-tenancy
- Export/backup format
- Weekly Review feature (flag: `WEEKLY_REVIEW`)
- Drift Detection alerts (flag: `DRIFT_ALERTS`)

---

## [1.5.0] - January 2026

### Documentation Overhaul
- **Complete README rewrite** — Comprehensive project overview with proper structure
- **Created CHANGELOG.md** — Consolidated version history and agent contributions
- **Updated docs/README.md** — Complete documentation index
- **Cleaned up root folder** — Organized temporary diagnosis files

---

## [1.4.0] - January 2026

### React Hooks Violation Fix (Error #300)
**Issue ID**: `LOGIN-HOOKS-300`  
**Commits**: `a37b71b`, `c0e0628`, `40eb65b`

#### Problem
Users experienced "Configuration Problem" error after successful login. The actual error was React Error #300 (hooks violation: "Rendered fewer hooks than expected").

#### Root Cause
- `ProtectedRoute` conditionally rendered children based on loading state
- `UsageLimitGate` conditionally rendered children based on loading state
- This violated React's Rules of Hooks — hooks must be called on every render

#### Solution
- Modified `ProtectedRoute.tsx` to always render children with overlay pattern
- Modified `UsageLimitGate.tsx` to always render children with overlay pattern
- Fixed ErrorBoundary to detect hooks violations before config errors
- Enhanced error logging with component stack details

#### Files Modified
- `src/components/wellwell/ProtectedRoute.tsx`
- `src/components/wellwell/UsageLimitGate.tsx`
- `src/components/wellwell/ErrorBoundary.tsx`

**Full Details**: [Issue History: Login Hooks Violation](./docs/ISSUE_HISTORY_LOGIN_HOOKS_VIOLATION.md)

---

### Error Prevention Fixes
**Commit**: `40eb65b`

#### Problem
ErrorBoundary triggered frequently when API calls failed. Components didn't handle React Query error states.

#### Root Cause
When React Query's `queryFn` throws, the hook sets `error` state but `data` becomes undefined. Components accessed `data` without checking, causing TypeError.

#### Solution
- `useProfile.tsx` — Return `null` instead of throwing on API errors
- `useEvents.tsx` — Return empty array `[]` instead of throwing
- `useContextualNudge.tsx` — Add null checks for events array operations
- `Profile.tsx` — Add optional chaining for events access

**Full Details**: [Issue History: Error Prevention](./docs/ISSUE_HISTORY_ERROR_PREVENTION.md)

---

## [1.3.0] - January 2026

### Auth & Onboarding Security Audit Implementation

#### P0 Security Fixes
- ✅ Added authentication to `stoic-analyzer` Edge Function
- ✅ Secure token storage using sessionStorage (reduces XSS risk)
- ✅ Created RLS verification tests (`supabase/tests/rls_verification.sql`)

#### State Machine Implementation
- ✅ Created `src/lib/authStateMachine.ts` with explicit states
- ✅ States: `anonymous_visitor`, `email_captured`, `signed_in`, `session_expired`, etc.
- ✅ Onboarding progress persistence to localStorage
- ✅ Session expiry detection and modal handling

#### UX Improvements
- ✅ Generic error messages to prevent account enumeration
- ✅ Auth debug panel (dev only) for troubleshooting
- ✅ Enhanced logging with funnel tracking

**Full Details**: [Auth Audit Implementation Summary](./AUTH_AUDIT_IMPLEMENTATION_SUMMARY.md)

---

### Adversarial Audit Fixes
**Status**: All 10 priority fixes implemented

1. ✅ **Cancel mechanism for AI calls** — AbortController with cancel button UI
2. ✅ **State persistence for AI analysis** — sessionStorage with 5-minute recovery
3. ✅ **Guard against concurrent AI calls** — isLoading check prevents duplicates
4. ✅ **Fair usage tracking** — trackUsage called after AI success only
5. ✅ **Idempotency protection** — requestId prevents duplicate events
6. ✅ **AI fallback mechanism** — Default Stoic guidance when AI fails
7. ✅ **Batch virtue updates** — Single insert operation prevents partial state
8. ✅ **Fresh profile context** — Profile refreshed before AI call
9. ✅ **Specific error messages** — Rate limit, usage limit, network errors
10. ✅ **Persistent welcome screen** — Changed to localStorage

**Full Details**: [Fixes Implemented](./docs/FIXES_IMPLEMENTED.md)

---

## [1.2.0] - December 2025

### Mobile Viewport Optimization

#### Issues Fixed
1. Grey horizontal scrollbar on filter chips
2. "Your Virtues" card cut off by bottom navigation
3. Journey page excessive vertical scrolling

#### Solutions
- Created `HorizontalScroll` component with subtle fade indicators
- Added `scrollbar-hide` CSS utility
- Condensed `VoiceFirstInput` component (mic button 28→20px)
- Increased Layout bottom padding (16→20, 20→24)
- Redesigned Journey page with inline header

---

### Sacred Navigation Zone System

#### Issues Fixed
1. Pricing page content overflow
2. Home virtues card overlapping bottom nav
3. Journey chart clipped on left
4. Library/Meditations pages couldn't scroll

#### Solutions
- Created `--nav-height` and `--safe-bottom` CSS variables
- Added `.safe-bottom` utility class
- Layout applies consistent safe padding
- Fixed VirtueChart left margin clipping
- Enabled scrolling on Library pages

---

## [1.1.0] - December 2025

### Production Readiness Audit
**Audit Date**: December 13, 2025  
**Status**: Production Ready

#### Security
- ✅ RLS enforced on all tables (10/10)
- ✅ User isolation complete
- ✅ No cross-user data access possible

#### UX/UI Improvements
- ✅ Sign-out confirmation dialog
- ✅ Global ErrorBoundary with contextual messages
- ✅ Persona consistency between EditProfile and Onboarding
- ✅ Welcome Back Screen for returning users

#### Data Flow Fixes
- ✅ Events saved only after successful AI analysis
- ✅ Usage tracking corrected (3x/day not 1x)
- ✅ Landing page graceful fallback on query failure

#### New Components
- `src/components/wellwell/ErrorBoundary.tsx`
- `src/components/wellwell/SignOutDialog.tsx`
- `src/components/wellwell/WelcomeBackScreen.tsx`

**Full Details**: [Production Audit](./docs/PRODUCTION_AUDIT.md)

---

### Contextual Home Experience
- Time-based primary nudge (morning → Pulse, evening → Debrief)
- Daily progress indicators with checkmarks
- Secondary quick actions always accessible
- Smart nav indicators with pulsing dot
- `useContextualNudge` hook for context logic

---

### SEO Infrastructure
- FAQ page with 20+ optimized questions and FAQ schema
- Blog with 5 SEO-optimized articles and Article schema
- Enhanced structured data (Organization, SoftwareApplication)
- Updated sitemap.xml and robots.txt

---

## [1.0.0] - December 2025

### Initial Release

#### Core Features
- Morning Pulse — Pre-load mental stance
- Intervene — Real-time emotional recalibration
- Evening Debrief — Daily reflection and virtue tracking
- Profile — User preferences and progress tracking
- Onboarding — Personalized Stoic experience setup

#### Technical Foundation
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui + Framer Motion
- Supabase (PostgreSQL, Auth, Edge Functions)
- Google Gemini 2.5 Flash for AI analysis
- React Query for server state management

#### Database Schema
- `profiles` — User anchor
- `sessions` — Tool usage grouping
- `events` — Raw interactions
- `insights` — AI-generated meaning layer
- `virtue_scores` — Aggregated tracking

#### AI Integration
- `stoic-analyzer` Edge Function
- Tool-specific analysis (pulse, intervene, debrief, decision, conflict)
- Structured JSON output with control maps and virtue scoring

---

## Architecture Decisions

### 2024-01 | Initial Architecture
- **Mobile-first, dark-mode default** — 80%+ expected mobile usage
- **Events as primary record** — Two-layer data model (events → insights)
- **Lovable AI Gateway** — Zero configuration, cost included
- **React Query + Context** — No Redux complexity needed
- **0-100 virtue scoring** — Granular, intuitive percentage scale
- **shadcn/ui base** — Unstyled, accessible, Tailwind-native
- **Email/password only** — Simple, works everywhere
- **Custom logger service** — Full control, consistent format

### 2024-12 | Viewport Optimization
- **HorizontalScroll component** — Elegant fade indicators
- **Sacred navigation zone** — CSS variable-based safe areas
- **Condensed UI components** — Better mobile content visibility

### 2025-01 | Error Handling
- **Prevention over catching** — Fix at source (hooks), not boundaries
- **Safe defaults** — Return null/[] instead of throwing
- **Overlay pattern** — Always render children, overlay for loading

---

## Issue History Index

| Issue | Status | Document |
|-------|--------|----------|
| React Hooks Violation #300 | ✅ Resolved | [ISSUE_HISTORY_LOGIN_HOOKS_VIOLATION.md](./docs/ISSUE_HISTORY_LOGIN_HOOKS_VIOLATION.md) |
| ErrorBoundary Triggers | ✅ Resolved | [ISSUE_HISTORY_ERROR_PREVENTION.md](./docs/ISSUE_HISTORY_ERROR_PREVENTION.md) |
| Adversarial Audit Findings | ✅ Resolved | [ADVERSARIAL_AUDIT.md](./docs/ADVERSARIAL_AUDIT.md), [FIXES_IMPLEMENTED.md](./docs/FIXES_IMPLEMENTED.md) |
| Auth Security Issues | ✅ Resolved | [AUTH_AUDIT_IMPLEMENTATION_SUMMARY.md](./AUTH_AUDIT_IMPLEMENTATION_SUMMARY.md) |

---

## Contributors

This project has been developed with AI assistance from:
- **Lovable** — Initial development and feature implementation
- **Cursor (Claude)** — Bug fixes, security audits, documentation
- **Various AI Agents** — Specialized fixes and improvements

---

*Last Updated: January 3, 2026*



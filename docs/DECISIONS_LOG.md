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

## Future Decisions Pending

- [ ] Push notification strategy
- [ ] Offline support approach
- [ ] Team/org multi-tenancy
- [ ] Export/backup format

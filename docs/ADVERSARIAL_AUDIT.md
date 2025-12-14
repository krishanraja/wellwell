# WellWell - Adversarial Full-Stack Audit

**Date**: 2025-01-XX  
**Auditor Role**: Chief UX Designer, Senior Full-Stack Engineer, Data Architect, AI Systems Auditor, Adversarial Power User  
**Standard**: Zero dead ends. Zero silent failures. Zero ambiguous next steps. Every state must resolve deterministically.

---

## 1. SYSTEM & STATE MAP

### 1.1 User Modes & Concurrency

#### Explicitly Enumerated Usage Modes

| Mode | Supported | Implementation | Issues |
|------|-----------|---------------|--------|
| **Solo user** | ✅ Yes | Primary use case | None identified |
| **Multiple concurrent users** | ⚠️ Partial | RLS enforces isolation, but no explicit concurrency testing | **P1**: No race condition testing for simultaneous operations |
| **Asynchronous collaboration** | ❌ No | App is single-user by design | N/A - not applicable |
| **Sequential hand-offs** | ❌ No | No multi-user workflows | N/A - not applicable |
| **Read-only participants** | ❌ No | All users require auth | N/A - not applicable |
| **Returning users after inactivity** | ⚠️ Partial | Session persists, but state recovery untested | **P1**: No recovery mechanism for mid-analysis state |
| **Users joining mid-flow** | ❌ No | Single-user app | N/A - not applicable |

#### State Diagram

```
[Unauthenticated]
    │
    ├─> [Sign Up] ──> [Profile Auto-Created] ──> [Virtue Scores Initialized] ──> [Authenticated]
    │
    └─> [Sign In] ────────────────────────────────────────────────────────────> [Authenticated]
                                                                                        │
                                                                                        ├─> [Onboarding] ──> [Home]
                                                                                        │
                                                                                        ├─> [Home] ──> [Pulse/Intervene/Debrief]
                                                                                        │
                                                                                        └─> [Profile/Settings/More]
```

#### Valid State Combinations

| State | Valid Transitions | Invalid Transitions | Detection |
|-------|------------------|---------------------|-----------|
| Unauthenticated | Sign Up, Sign In | Access protected routes | ✅ ProtectedRoute redirects |
| Authenticated (no profile) | Onboarding | Use tools | ⚠️ **P2**: No check for profile existence before tool use |
| Authenticated (profile exists) | All app features | None | ✅ |
| AI Analysis in progress | Wait, Cancel (not implemented) | Navigate away | ⚠️ **P0**: Navigation during AI call loses state |
| Usage limit reached | Upgrade prompt | Use tool | ✅ UsageLimitGate blocks |
| Network error | Retry, Error message | Continue silently | ⚠️ **P1**: Some errors only show toast, no recovery UI |

#### Unsupported States (CRITICAL GAPS)

1. **P0 - Mid-Analysis Navigation**: User starts AI analysis, navigates away, returns → Analysis state lost, no recovery
   - **Location**: `src/hooks/useStoicAnalyzer.tsx:26-230`
   - **Impact**: User loses work, must re-enter input

2. **P0 - Concurrent AI Calls**: User triggers multiple analyses simultaneously → Race condition, undefined behavior
   - **Location**: `src/hooks/useStoicAnalyzer.tsx:32` (no guard against concurrent calls)
   - **Impact**: Multiple API calls, potential data corruption

3. **P1 - Profile Creation Race**: User signs up, immediately navigates before profile created → Profile may not exist
   - **Location**: `supabase/migrations/20251212021713_25d9bac3-d0eb-41f3-8ee4-d554e8ce7ea1.sql:112-139`
   - **Impact**: User sees "no profile" errors

4. **P1 - Session Expiry During Operation**: User's session expires mid-analysis → No graceful handling
   - **Location**: `src/hooks/useAuth.tsx:26-41` (auth listener doesn't handle mid-operation expiry)
   - **Impact**: Silent failure or abrupt logout

### 1.2 Lifecycle Coverage

| Lifecycle State | Handled | Recovery Mechanism | Issues |
|----------------|---------|-------------------|--------|
| **First-time user** | ✅ Yes | Onboarding flow | None |
| **Partially onboarded** | ⚠️ Partial | Can skip onboarding | **P2**: No enforcement of required onboarding steps |
| **Fully active** | ✅ Yes | Normal app usage | None |
| **Idle** | ✅ Yes | Session persists | None |
| **Returning after long gap** | ⚠️ Partial | Welcome screen shown | **P2**: Welcome screen logic depends on sessionStorage, lost on refresh |
| **Logged out mid-flow** | ❌ No | No state preservation | **P0**: All in-progress work lost |
| **App refresh or crash recovery** | ❌ No | No state persistence | **P0**: AI analysis state lost on refresh |
| **Version mismatch or cached state** | ❌ No | No version checking | **P2**: Potential stale data issues |

#### State Reconstruction Reliability

**CRITICAL FINDING**: The app **CANNOT** reliably reconstruct state after:
- Browser refresh during AI analysis
- App crash mid-operation
- Network interruption during data save
- Tab duplication (state not shared)

**Location**: No state persistence mechanism found in codebase.

---

## 2. UI & UX AUDIT

### 2.1 Screen-Level Contract

#### Pulse Screen (`src/pages/Pulse.tsx`)

| Question | Answer | Status |
|----------|--------|--------|
| **Primary action** | Voice input → AI analysis | ✅ Clear |
| **Secondary actions** | Reset, Navigate away | ✅ Available |
| **Primary action failure** | Toast error, no recovery UI | ⚠️ **P1**: Generic error, no retry button |
| **Missing data** | Shows loading spinner | ⚠️ **P2**: No timeout, can spin forever |
| **Empty data** | Shows empty state | ✅ Handled |
| **Delayed data** | Loading spinner | ⚠️ **P1**: No progress indicator, no cancel |
| **Partially available** | Shows partial data | ⚠️ **P2**: No indication of partial state |
| **User waiting without context** | Yes - during AI call | ⚠️ **P0**: "Finding your Stoic stance..." with no progress or cancel |

**P0 BUG**: Loader without guaranteed exit path
- **Location**: `src/pages/Pulse.tsx:115` - `isProcessing={isLoading}` with no cancel mechanism
- **Impact**: User stuck if AI call hangs

#### Intervene Screen (`src/pages/Intervene.tsx`)

| Question | Answer | Status |
|----------|--------|--------|
| **Primary action** | Voice input → AI analysis | ✅ Clear |
| **Secondary actions** | Reset | ✅ Available |
| **Primary action failure** | Toast error | ⚠️ **P1**: Same as Pulse - no recovery UI |
| **Missing data** | Loading spinner | ⚠️ **P2**: Same timeout issue |
| **User waiting without context** | Yes - during AI call | ⚠️ **P0**: Same loader issue |

#### Debrief Screen (`src/pages/Debrief.tsx`)

| Question | Answer | Status |
|----------|--------|--------|
| **Primary action** | Voice input → AI analysis | ✅ Clear |
| **Secondary actions** | Reset | ✅ Available |
| **Primary action failure** | Toast error | ⚠️ **P1**: Same pattern |
| **User waiting without context** | Yes - during AI call | ⚠️ **P0**: Same loader issue |

#### Home Screen (`src/pages/Home.tsx`)

| Question | Answer | Status |
|----------|--------|--------|
| **Primary action** | Contextual nudge → Voice input | ✅ Clear |
| **Secondary actions** | Navigate to specific tools | ✅ Available |
| **Primary action failure** | Toast error | ⚠️ **P1**: Same pattern |
| **Welcome screen logic** | Uses sessionStorage | ⚠️ **P2**: Lost on refresh, no persistence |

**P0 BUG**: Welcome screen state in sessionStorage
- **Location**: `src/pages/Home.tsx:37-39` - `sessionStorage.getItem(WELCOME_SHOWN_KEY)`
- **Impact**: Welcome shown again on refresh, disrupting UX

### 2.2 Multi-User & Parallel Usage

#### Simulated Scenarios

| Scenario | What User Sees | System Consistent? | Feedback Explicit? | Issues |
|----------|----------------|-------------------|-------------------|--------|
| **Two users same account** | Both see same data (by design) | ✅ Yes (RLS enforced) | ⚠️ No indication of concurrent access | **P2**: No conflict detection |
| **One user ahead, one behind** | N/A - single user | N/A | N/A | N/A |
| **One user retries action** | Second attempt may duplicate | ⚠️ No idempotency | ⚠️ No "already processing" feedback | **P1**: Double-submit possible |
| **Conflicting edits** | N/A - no multi-user edits | N/A | N/A | N/A |
| **Read-while-write** | May see stale data | ⚠️ React Query cache | ⚠️ No indication of staleness | **P2**: Cache invalidation timing issues |

**P1 CRITICAL**: Double-submit vulnerability
- **Location**: `src/hooks/useStoicAnalyzer.tsx:32` - No guard against concurrent `analyze()` calls
- **Impact**: Multiple API calls, duplicate events, wasted usage quota

### 2.3 Navigation & Recovery

| Navigation Action | Handled | Recovery | Issues |
|------------------|---------|----------|--------|
| **Back button** | Browser default | Loses state | ⚠️ **P0**: AI analysis state lost |
| **Refresh** | Browser default | Loses all state | ⚠️ **P0**: No state persistence |
| **Deep links** | React Router | Works if authenticated | ✅ Handled |
| **App reopen after crash** | Browser default | Loses state | ⚠️ **P0**: No crash recovery |
| **Browser tab duplication** | New session | Independent state | ⚠️ **P2**: Can trigger duplicate operations |

**P0 CRITICAL**: Navigation during AI analysis
- **Location**: All pages using `useStoicAnalyzer` - no cleanup on unmount
- **Impact**: API call continues, state lost, potential memory leak

---

## 3. DATA PIPELINE AUDIT

### 3.1 Source of Truth

| Data Type | Canonical Store | Derived Data | Cached Data | Reconciliation |
|-----------|----------------|--------------|-------------|----------------|
| **User Profile** | `profiles` table | None | React Query cache | ✅ Invalidate on update |
| **Virtue Scores** | `virtue_scores` table | Aggregated from insights | React Query cache | ⚠️ **P1**: Race condition in updates |
| **Events** | `events` table | None | React Query cache (50 limit) | ✅ Append-only, no conflicts |
| **Insights** | `insights` table | Derived from AI analysis | None | ⚠️ **P2**: No regeneration mechanism |
| **Usage Tracking** | `usage_tracking` table | Counted daily | React Query (30s stale) | ⚠️ **P1**: Race condition in counting |

#### DATA INTEGRITY RISKS

1. **P1 - Virtue Score Race Condition**
   - **Location**: `src/hooks/useStoicAnalyzer.tsx:179-207` - Multiple virtue updates in loop, no transaction
   - **Impact**: If one update fails, partial state, inconsistent scores

2. **P1 - Usage Tracking Race Condition**
   - **Location**: `src/hooks/useUsageLimit.tsx:54-75` - `trackUsage` called before AI success check
   - **Impact**: Usage counted even if AI fails, user loses quota unfairly

3. **P2 - No Event Regeneration**
   - **Location**: Events saved after AI success, but if AI response is lost, event still saved
   - **Impact**: Events without corresponding insights, data inconsistency

### 3.2 Event Safety

| Action | Write | Read | Failure | Recovery | Issues |
|--------|-------|-----|----------|----------|--------|
| **AI Analysis** | Event + Insights | Profile, Events | Toast error | Manual retry | ⚠️ **P1**: No idempotency, double-submit possible |
| **Virtue Update** | Insert new score | Latest score | Silent fail (warn only) | None | ⚠️ **P1**: No recovery, partial updates possible |
| **Usage Tracking** | Insert record | Count today | Silent fail | None | ⚠️ **P1**: Usage counted before success |
| **Profile Update** | Update row | Cached query | Error thrown | Manual retry | ✅ Handled |
| **Event Creation** | Insert row | Query with limit | Silent fail (warn only) | None | ⚠️ **P2**: Event may not save, no user feedback |

**P1 CRITICAL**: Usage tracking before AI success
- **Location**: `src/pages/Pulse.tsx:49-55` - `trackUsage()` called before `analyze()`
- **Impact**: User loses quota even if AI fails

**P1 CRITICAL**: No idempotency for AI calls
- **Location**: `src/hooks/useStoicAnalyzer.tsx:32` - No request deduplication
- **Impact**: Double-click or network retry creates duplicate events

### 3.3 Time, Order, and Sync

| Dependency | Handled | Issues |
|------------|---------|--------|
| **Time-based queries** | Date calculations client-side | ⚠️ **P2**: Timezone issues possible |
| **Order of operations** | Sequential async/await | ⚠️ **P1**: No transaction boundaries |
| **Session tracking** | `sessions` table exists but unused | ⚠️ **P2**: Sessions table not populated |
| **Background jobs** | None | N/A |
| **Sync conflicts** | N/A - single user | N/A |

**P2 ISSUE**: Sessions table unused
- **Location**: `supabase/migrations/20251212021713_25d9bac3-d0eb-41f3-8ee4-d554e8ce7ea1.sql:16-23`
- **Impact**: Designed for session tracking but never populated, dead schema

---

## 4. AI SYSTEMS AUDIT

### 4.1 AI Dependency Map

| AI Invocation | Inputs Required | Can Be Empty/Stale | Output Usage | Classification | Fallback |
|---------------|----------------|-------------------|--------------|---------------|----------|
| **stoic-analyzer (pulse)** | challenge, profile_context | ⚠️ profile_context can be stale | Display stance, update virtues | **BLOCKING** | ❌ None |
| **stoic-analyzer (intervene)** | trigger, intensity, profile_context | ⚠️ profile_context can be stale | Display reframe, update virtues | **BLOCKING** | ❌ None |
| **stoic-analyzer (debrief)** | challenge_faced, response_given, profile_context | ⚠️ profile_context can be stale | Display summary, update virtues | **BLOCKING** | ❌ None |
| **stoic-analyzer (unified)** | input, profile_context | ⚠️ profile_context can be stale | Route to appropriate tool | **BLOCKING** | ❌ None |
| **stoic-analyzer (decision)** | dilemma, profile_context | ⚠️ profile_context can be stale | Display framework | **BLOCKING** | ❌ None |
| **stoic-analyzer (conflict)** | situation, profile_context | ⚠️ profile_context can be stale | Display resolution | **BLOCKING** | ❌ None |

**P0 CRITICAL**: All AI calls are BLOCKING with NO FALLBACK
- **Location**: `src/hooks/useStoicAnalyzer.tsx:133-137` - Error returns null, user sees generic error
- **Impact**: App becomes unusable if AI service is down

**P1 ISSUE**: Profile context can be stale
- **Location**: `src/hooks/useStoicAnalyzer.tsx:45-49` - Profile fetched once, not refreshed
- **Impact**: AI receives outdated persona/challenges/goals

### 4.2 Determinism & Recovery

| Question | Answer | Issues |
|----------|--------|--------|
| **Can outputs be regenerated?** | ⚠️ Partial - Events saved, but insights not regenerated | **P2**: No regeneration mechanism |
| **Can app continue if AI fails?** | ❌ No - User sees error, must retry | **P0**: No fallback, app blocked |
| **Can user retry without corruption?** | ⚠️ Partial - Retry creates new event | **P1**: No idempotency, duplicate events possible |

**P0 CRITICAL**: App unusable without AI
- **Location**: All tool pages depend on AI analysis
- **Impact**: Complete app failure if AI service unavailable

**P1 ISSUE**: No idempotency on retry
- **Location**: `src/hooks/useStoicAnalyzer.tsx:32` - Each call creates new event
- **Impact**: Retry creates duplicate events, wastes quota

### 4.3 Safety & Containment

| Safety Check | Implemented | Issues |
|--------------|--------------|--------|
| **Prompt injection** | ⚠️ Partial - User input passed directly | **P2**: No input sanitization |
| **Cross-user data leakage** | ✅ Yes - RLS enforced | None |
| **Overreach into advice** | ⚠️ Partial - AI provides guidance | **P2**: No content filtering |
| **Unexpected tone shifts** | ⚠️ Partial - System prompt controls tone | **P2**: No output validation |
| **Uncontrolled AI output** | ⚠️ Partial - JSON format enforced | **P1**: Malformed JSON not handled gracefully |

**P2 ISSUE**: No input sanitization
- **Location**: `supabase/functions/stoic-analyzer/index.ts:632` - User input passed directly to AI
- **Impact**: Potential prompt injection, though limited by JSON format

**P1 ISSUE**: Malformed AI response handling
- **Location**: `supabase/functions/stoic-analyzer/index.ts:723-726` - JSON parse with try-catch, but error handling unclear
- **Impact**: User sees generic error if AI returns invalid JSON

---

## 5. FAILURE MODE REGISTER

### P0 - Critical (System Blocking)

| # | Failure Description | Trigger | User Impact | Detectability | Severity | File & Function |
|---|---------------------|---------|-------------|---------------|----------|-----------------|
| **F001** | AI analysis state lost on navigation | User navigates away during AI call | Work lost, must re-enter | ⚠️ Silent | P0 | `src/hooks/useStoicAnalyzer.tsx:26-230` - No cleanup on unmount |
| **F002** | App unusable if AI service down | AI gateway returns error | Complete app failure | ✅ Error toast | P0 | `src/hooks/useStoicAnalyzer.tsx:133-137` - No fallback |
| **F003** | Concurrent AI calls possible | User double-clicks or rapid actions | Duplicate API calls, wasted quota | ⚠️ Silent | P0 | `src/hooks/useStoicAnalyzer.tsx:32` - No guard |
| **F004** | No state recovery after refresh | Browser refresh during operation | All in-progress work lost | ⚠️ Silent | P0 | No state persistence mechanism |
| **F005** | Loader without exit path | AI call hangs or times out | User stuck, no cancel option | ⚠️ Silent | P0 | `src/pages/Pulse.tsx:115` - No cancel mechanism |

### P1 - High (User Impact)

| # | Failure Description | Trigger | User Impact | Detectability | Severity | File & Function |
|---|---------------------|---------|-------------|---------------|----------|-----------------|
| **F006** | Usage counted before AI success | `trackUsage()` called before `analyze()` | User loses quota on AI failure | ⚠️ Silent | P1 | `src/pages/Pulse.tsx:49-55` - Order issue |
| **F007** | Virtue score race condition | Multiple virtue updates in loop | Partial updates, inconsistent state | ⚠️ Silent | P1 | `src/hooks/useStoicAnalyzer.tsx:179-207` - No transaction |
| **F008** | No idempotency on retry | User retries failed AI call | Duplicate events created | ⚠️ Silent | P1 | `src/hooks/useStoicAnalyzer.tsx:32` - No deduplication |
| **F009** | Profile context can be stale | Profile fetched once, not refreshed | AI receives outdated context | ⚠️ Silent | P1 | `src/hooks/useStoicAnalyzer.tsx:45-49` - No refresh |
| **F010** | Session expiry during operation | Token expires mid-analysis | Abrupt logout or silent failure | ⚠️ Silent | P1 | `src/hooks/useAuth.tsx:26-41` - No mid-operation handling |
| **F011** | Generic error messages | All errors show same toast | User doesn't know what failed | ✅ Visible but vague | P1 | `src/hooks/useStoicAnalyzer.tsx:135` - Generic error |

### P2 - Medium (UX/Data Quality)

| # | Failure Description | Trigger | User Impact | Detectability | Severity | File & Function |
|---|---------------------|---------|-------------|---------------|----------|-----------------|
| **F012** | Welcome screen lost on refresh | Uses sessionStorage | Welcome shown again | ✅ Visible | P2 | `src/pages/Home.tsx:37-39` - sessionStorage |
| **F013** | Sessions table unused | Designed but never populated | Dead schema, confusion | ⚠️ Silent | P2 | `supabase/migrations/20251212021713_25d9bac3-d0eb-41f3-8ee4-d554e8ce7ea1.sql:16-23` |
| **F014** | No input sanitization | User input passed directly to AI | Potential prompt injection | ⚠️ Silent | P2 | `supabase/functions/stoic-analyzer/index.ts:632` |
| **F015** | No regeneration mechanism | Insights can't be regenerated | Data inconsistency if AI improves | ⚠️ Silent | P2 | No regeneration endpoint |
| **F016** | Timezone issues possible | Date calculations client-side | Incorrect day boundaries | ⚠️ Silent | P2 | `src/hooks/useUsageLimit.tsx:26-27` - Client-side date |

---

## 6. FIX PRIORITISATION

### Top 10 Fixes by Risk Reduction

| Rank | Fix | Risk Reduction | User Clarity | Structural Stability | Category | Estimated Impact |
|------|-----|----------------|--------------|---------------------|----------|------------------|
| **1** | Add cancel mechanism to AI calls | 🔴 High | 🟢 High | 🟡 Medium | UX | Prevents stuck states |
| **2** | Implement state persistence for AI analysis | 🔴 High | 🟢 High | 🟢 High | State Logic | Enables recovery |
| **3** | Add guard against concurrent AI calls | 🔴 High | 🟡 Medium | 🟢 High | State Logic | Prevents race conditions |
| **4** | Move usage tracking after AI success | 🟡 Medium | 🟢 High | 🟡 Medium | Data Model | Fair quota usage |
| **5** | Add idempotency to AI calls | 🟡 Medium | 🟡 Medium | 🟢 High | API | Prevents duplicates |
| **6** | Implement fallback for AI failures | 🔴 High | 🟢 High | 🟡 Medium | AI Dependency | App remains usable |
| **7** | Add transaction for virtue score updates | 🟡 Medium | 🟡 Medium | 🟢 High | Data Model | Ensures consistency |
| **8** | Refresh profile context before AI call | 🟡 Medium | 🟡 Medium | 🟡 Medium | Data Model | Accurate AI context |
| **9** | Add specific error messages | 🟡 Medium | 🟢 High | 🟡 Medium | UX | Better user feedback |
| **10** | Persist welcome screen state | 🟢 Low | 🟡 Medium | 🟡 Medium | UX | Better UX consistency |

### Fix Details

#### Fix #1: Add Cancel Mechanism to AI Calls
- **File**: `src/hooks/useStoicAnalyzer.tsx`
- **Change**: Add AbortController, expose cancel function, update UI to show cancel button
- **Impact**: Users can exit stuck AI calls

#### Fix #2: Implement State Persistence
- **Files**: `src/hooks/useStoicAnalyzer.tsx`, `src/pages/*.tsx`
- **Change**: Save analysis state to sessionStorage, restore on mount
- **Impact**: Users can recover after refresh

#### Fix #3: Guard Against Concurrent Calls
- **File**: `src/hooks/useStoicAnalyzer.tsx`
- **Change**: Add `isLoading` check, disable button during call
- **Impact**: Prevents duplicate API calls

#### Fix #4: Move Usage Tracking
- **Files**: `src/pages/Pulse.tsx`, `src/pages/Intervene.tsx`, `src/pages/Debrief.tsx`, `src/pages/Home.tsx`
- **Change**: Call `trackUsage()` after successful `analyze()` response
- **Impact**: Fair quota usage

#### Fix #5: Add Idempotency
- **File**: `src/hooks/useStoicAnalyzer.tsx`
- **Change**: Generate request ID, check for existing event before creating
- **Impact**: Prevents duplicate events on retry

#### Fix #6: Implement AI Fallback
- **Files**: `src/hooks/useStoicAnalyzer.tsx`, `src/pages/*.tsx`
- **Change**: Provide default responses when AI fails, allow manual input
- **Impact**: App remains functional

#### Fix #7: Transaction for Virtue Updates
- **File**: `src/hooks/useStoicAnalyzer.tsx`
- **Change**: Use database transaction or batch update
- **Impact**: Ensures all-or-nothing updates

#### Fix #8: Refresh Profile Context
- **File**: `src/hooks/useStoicAnalyzer.tsx`
- **Change**: Fetch fresh profile before building context
- **Impact**: Accurate AI personalization

#### Fix #9: Specific Error Messages
- **Files**: `src/hooks/useStoicAnalyzer.tsx`, `supabase/functions/stoic-analyzer/index.ts`
- **Change**: Map error types to user-friendly messages
- **Impact**: Better user understanding

#### Fix #10: Persist Welcome State
- **File**: `src/pages/Home.tsx`
- **Change**: Use localStorage or profile flag instead of sessionStorage
- **Impact**: Consistent UX across sessions

---

## 7. SUMMARY

### Critical Issues (P0): 5
- AI state lost on navigation
- App unusable without AI
- Concurrent calls possible
- No state recovery
- Loader without exit

### High Priority (P1): 6
- Usage tracking timing
- Race conditions
- No idempotency
- Stale context
- Session expiry
- Generic errors

### Medium Priority (P2): 5
- Welcome screen persistence
- Unused schema
- Input sanitization
- No regeneration
- Timezone issues

### Total Issues: 16

### Compliance Status
- ❌ **Zero dead ends**: 5 P0 issues create dead ends
- ❌ **Zero silent failures**: Multiple silent failures identified
- ❌ **Zero ambiguous next steps**: Generic errors create ambiguity
- ❌ **Deterministic state resolution**: State can be lost, no recovery

**Overall Assessment**: The app has significant gaps in state management, error recovery, and user experience that prevent it from meeting the "zero dead ends" standard. Critical fixes are required before production readiness.

---

**End of Audit**

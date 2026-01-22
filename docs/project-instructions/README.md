# WellWell Project Instructions - Master Index

> Master index and quick reference for all documentation, including current version info, terminology standards, and critical design rules.

**Last Updated:** January 16, 2026  
**Version:** 1.0.0

---

## Quick Navigation

| I want to... | Read this |
|--------------|-----------|
| Understand what WellWell is | [PURPOSE.md](./PURPOSE.md) |
| Know who we're building for | [ICP.md](./ICP.md) |
| Understand the value proposition | [VALUE_PROP.md](./VALUE_PROP.md) |
| See expected user outcomes | [OUTCOMES.md](./OUTCOMES.md) |
| Review all features | [FEATURES.md](./FEATURES.md) |
| Understand the architecture | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Apply design system | [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) |
| Follow visual guidelines | [VISUAL_GUIDELINES.md](./VISUAL_GUIDELINES.md) |
| Use brand voice | [BRANDING.md](./BRANDING.md) |
| Understand product history | [HISTORY.md](./HISTORY.md) |
| Fix common issues | [COMMON_ISSUES.md](./COMMON_ISSUES.md) |
| Review decisions | [DECISIONS_LOG.md](./DECISIONS_LOG.md) |
| Rebuild from scratch | [REPLICATION_GUIDE.md](./REPLICATION_GUIDE.md) |
| Guide AI development | [MASTER_INSTRUCTIONS.md](./MASTER_INSTRUCTIONS.md) |
| Review production readiness | [PRODUCTION_AUDIT.md](./PRODUCTION_AUDIT.md) |

---

## Current Version Information

### Tech Stack
- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **AI:** Google Gemini 2.5 Flash
- **State:** React Query, React Context

### Key Dependencies
- React 18.3.1
- TypeScript 5.6.3
- Vite 6.0.0
- Supabase JS 2.45.4
- React Query 5.62.0

---

## Terminology Standards

### Core Concepts

| Term | Definition | Usage |
|------|------------|-------|
| **Pulse** | Morning ritual to pre-load mental stance | Always capitalize when referring to the feature |
| **Intervene** | Real-time emotional recalibration tool | Always capitalize when referring to the feature |
| **Debrief** | Evening reflection and virtue tracking | Always capitalize when referring to the feature |
| **Virtue** | One of four cardinal virtues (Courage, Temperance, Justice, Wisdom) | Capitalize when referring to specific virtue |
| **Stance** | Personalized Stoic response statement | Use lowercase in general usage |
| **Control Map** | Separation of controllable vs. uncontrollable factors | Capitalize when referring to the concept |
| **Persona** | User's preferred Stoic guidance style (strategist, monk, commander, friend) | Use lowercase for persona types |

### Technical Terms

| Term | Definition |
|------|------------|
| **Event** | Raw user input stored in database |
| **Insight** | AI-generated analysis derived from events |
| **Session** | Grouping of events for a single tool usage |
| **RLS** | Row Level Security (Supabase security model) |
| **Edge Function** | Serverless function for AI analysis |

---

## Critical Design Rules

### 1. Mobile-First Always
- Design for mobile viewport (375px) first
- Test on actual devices, not just browser devtools
- Touch targets minimum 44x44px
- Bottom navigation is "sacred" - content never overlaps

### 2. Dark Mode Default
- WellWell is dark-mode by default
- All color tokens support dark mode
- Test contrast ratios (minimum 4.5:1)

### 3. React Hooks Rules
- **NEVER** conditionally render children in wrapper components
- Always call hooks in the same order
- Use overlay pattern for loading/error states, not conditional rendering

### 4. Error Handling
- Hooks return safe defaults (`null`, `[]`) instead of throwing
- Components handle undefined data gracefully
- ErrorBoundary is last resort, not primary error handling

### 5. Data Flow
- Events saved only after successful AI analysis
- Usage tracked only after successful operations
- React Query for server state, Context for auth, local state for UI

### 6. Security
- RLS enforced on all tables
- User isolation is non-negotiable
- Auth tokens in sessionStorage (not localStorage)
- Generic error messages for auth (no account enumeration)

### 7. AI Integration
- All edge functions require authentication
- Context includes profile, recent events, virtue scores
- Structured output with Zod validation
- Graceful fallbacks for AI failures

### 8. Performance
- Code split routes with `React.lazy()`
- Limit queries to 50 rows (paginate if needed)
- Use React.memo for expensive components
- Optimize images (PNG logos, consider WebP)

---

## Documentation Structure

### Core Documents
1. **PURPOSE.md** - What WellWell is and isn't, problem statement, target audiences
2. **ICP.md** - Ideal customer profiles with demographics, pain points, buying triggers
3. **VALUE_PROP.md** - Value propositions per audience, differentiation, jobs-to-be-done
4. **OUTCOMES.md** - Expected user outcomes at immediate, 30-day, 90-day intervals
5. **FEATURES.md** - Complete feature inventory with AI schemas and user flows

### Technical Documents
6. **ARCHITECTURE.md** - System architecture, database schema, data flows, AI integration
7. **DESIGN_SYSTEM.md** - Design tokens, typography, spacing, components, animations
8. **VISUAL_GUIDELINES.md** - Visual principles, layout patterns, video specs, audit process

### Brand & Voice
9. **BRANDING.md** - Brand voice, tone, messaging pillars, copy guidelines, visual elements

### History & Operations
10. **HISTORY.md** - Product evolution through phases, pivots, key learnings
11. **COMMON_ISSUES.md** - Recurring bugs, solutions, pipeline failure points, checklists
12. **DECISIONS_LOG.md** - Key architectural and product decisions with rationale
13. **REPLICATION_GUIDE.md** - Step-by-step rebuild instructions with verification
14. **MASTER_INSTRUCTIONS.md** - AI assistant behavior guidelines for development
15. **PRODUCTION_AUDIT.md** - Production readiness audit with issues, fixes, verified features

---

## Design System Quick Reference

### Colors
- **Mint:** `hsl(90 100% 79%)` - Primary accent, success states
- **Aqua:** `hsl(187 100% 60%)` - Secondary accent, CTAs
- **Background:** `hsl(160 20% 98%)` light / `hsl(165 20% 5%)` dark

### Typography
- **Display:** Space Grotesk (headlines)
- **Body:** Inter (content)
- **Mono:** JetBrains Mono (stances, quotes)

### Spacing
- Standard padding: `1rem` (space-4)
- Card padding: `2rem` (space-8)
- Section gaps: `3rem` (space-12)

### Components
- Cards: `StoicCard` with glass background
- Buttons: `brand`, `stoic`, `minimal`, `glow`, `ghost` variants
- Inputs: `MicroInput` for voice-first experience

---

## Development Workflow

### Before Starting
1. Read [PURPOSE.md](./PURPOSE.md) to understand the mission
2. Review [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for styling rules
3. Check [COMMON_ISSUES.md](./COMMON_ISSUES.md) for known problems

### During Development
1. Follow React hooks rules strictly
2. Use safe defaults in hooks (no throwing)
3. Test on mobile viewport
4. Verify RLS policies if touching database
5. Check error handling for all async operations

### Before Committing
1. Verify no hooks violations
2. Test on mobile device
3. Check error states
4. Verify data flow (events → insights)
5. Update [DECISIONS_LOG.md](./DECISIONS_LOG.md) if architectural change

---

## Getting Help

1. **Common Issues:** [COMMON_ISSUES.md](./COMMON_ISSUES.md)
2. **Architecture Questions:** [ARCHITECTURE.md](./ARCHITECTURE.md)
3. **Design Questions:** [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) or [VISUAL_GUIDELINES.md](./VISUAL_GUIDELINES.md)
4. **Product Questions:** [PURPOSE.md](./PURPOSE.md) or [VALUE_PROP.md](./VALUE_PROP.md)
5. **Historical Context:** [HISTORY.md](./HISTORY.md) or [DECISIONS_LOG.md](./DECISIONS_LOG.md)

---

## Document Maintenance

### When to Update
- **PURPOSE.md:** Product direction changes
- **FEATURES.md:** New features added
- **ARCHITECTURE.md:** System changes
- **DESIGN_SYSTEM.md:** New components or tokens
- **DECISIONS_LOG.md:** Architectural decisions
- **COMMON_ISSUES.md:** New bugs or solutions
- **PRODUCTION_AUDIT.md:** Pre-deployment review

### Update Frequency
- After every significant feature
- After architectural changes
- After resolving major bugs
- Before major releases

---

*This master index is the single source of truth for all project documentation. Keep it updated as the project evolves.*

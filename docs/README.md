# WellWell Documentation

> Comprehensive documentation for the WellWell Stoic practice application.

---

## Quick Links

| I want to... | Read this |
|--------------|-----------|
| Understand the app architecture | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| See all features | [FEATURES.md](./FEATURES.md) |
| Fix a bug | [COMMON_ISSUES.md](./COMMON_ISSUES.md) |
| Make design decisions | [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) |
| Deploy the app | [../DEPLOYMENT.md](../DEPLOYMENT.md) |
| Set up Supabase | [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) |

---

## Documentation Index

### Core Documentation

| Document | Description | When to Read |
|----------|-------------|--------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, data flow, database schema, component hierarchy | Understanding the codebase structure |
| [FEATURES.md](./FEATURES.md) | Complete feature specs with AI schemas, user flows, data models | Implementing or modifying features |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Colors, typography, spacing, components, animations | Building or styling UI components |
| [BRANDING.md](./BRANDING.md) | Logo usage, color palette, voice & tone, iconography | Creating marketing materials or copy |
| [PURPOSE.md](./PURPOSE.md) | Mission, philosophy, Stoic principles, success metrics | Understanding product direction |

---

### Operations & Quality

| Document | Description | When to Read |
|----------|-------------|--------------|
| [PRODUCTION_AUDIT.md](./PRODUCTION_AUDIT.md) | Security audit, UX review, code quality, deployment checklist | Pre-deployment review |
| [ADVERSARIAL_AUDIT.md](./ADVERSARIAL_AUDIT.md) | State management gaps, failure modes, edge cases, fix priorities | Finding and fixing edge cases |
| [COMMON_ISSUES.md](./COMMON_ISSUES.md) | Troubleshooting guide for auth, data, AI, UI, performance issues | Debugging problems |
| [FIXES_IMPLEMENTED.md](./FIXES_IMPLEMENTED.md) | All adversarial audit fixes with code changes and impact | Understanding implemented fixes |

---

### Development History

| Document | Description | When to Read |
|----------|-------------|--------------|
| [DECISIONS_LOG.md](./DECISIONS_LOG.md) | Architectural decisions with context, options, and rationale | Making architectural decisions |
| [../CHANGELOG.md](../CHANGELOG.md) | Complete version history, features, fixes, agent contributions | Understanding project history |

---

### Issue Histories

Detailed post-mortems for major issues resolved:

| Issue | Status | Document |
|-------|--------|----------|
| React Hooks Violation #300 | ✅ Resolved | [ISSUE_HISTORY_LOGIN_HOOKS_VIOLATION.md](./ISSUE_HISTORY_LOGIN_HOOKS_VIOLATION.md) |
| ErrorBoundary Frequent Triggers | ✅ Resolved | [ISSUE_HISTORY_ERROR_PREVENTION.md](./ISSUE_HISTORY_ERROR_PREVENTION.md) |

### Root Documentation Index

Working documents in the project root (diagnosis, fixes, plans):

| Document | Description |
|----------|-------------|
| [ROOT_DOCS_INDEX.md](./ROOT_DOCS_INDEX.md) | Complete index of all root-level documentation files |

---

### Setup & Deployment

| Document | Description | Location |
|----------|-------------|----------|
| Deployment Guide | Supabase and Vercel deployment | [../DEPLOYMENT.md](../DEPLOYMENT.md) |
| Edge Functions Setup | AI function deployment and secrets | [../EDGE_FUNCTIONS_SETUP.md](../EDGE_FUNCTIONS_SETUP.md) |
| Supabase Setup | Database configuration and RLS | [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) |
| Quick Start | Development environment setup | [../QUICK_START_CHECKLIST.md](../QUICK_START_CHECKLIST.md) |

---

### Specialized Documentation

| Document | Description |
|----------|-------------|
| [STOIC_PHILOSOPHY_SOURCE.md](./STOIC_PHILOSOPHY_SOURCE.md) | Stoic philosophy reference material |
| [STOICISM_TRAINING.md](./STOICISM_TRAINING.md) | AI training data for Stoic analysis |

---

## Documentation Standards

### File Naming
- Use `SCREAMING_SNAKE_CASE.md` for all documentation files
- Prefix issue histories with `ISSUE_HISTORY_`
- Use descriptive names that indicate content

### Content Structure
1. **Executive Summary** — Brief overview at the top
2. **Table of Contents** — For documents > 100 lines
3. **Sections** — Clear headers with horizontal rules
4. **Code Examples** — Syntax-highlighted with language tags
5. **Tables** — For structured data comparison
6. **Status Indicators** — ✅ ❌ ⚠️ for visual scanning

### Keeping Documentation Updated
- Update after every significant change
- Add to DECISIONS_LOG for architectural changes
- Update CHANGELOG for features and fixes
- Cross-reference related documents

---

## Project Overview

### What is WellWell?

WellWell is a mobile-first web application that operationalizes Stoic philosophy through three daily rituals:

1. **Morning Pulse** — Pre-load mental stance before challenges
2. **Intervene** — Real-time emotional recalibration
3. **Evening Debrief** — Reflect and extract wisdom

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui, Framer Motion |
| Backend | Supabase (PostgreSQL, Auth, Edge Functions) |
| AI | Google Gemini 2.5 Flash |
| State | React Query, React Context |

### Key Directories

```
wellwell/
├── src/
│   ├── components/wellwell/  # App-specific components
│   ├── hooks/                # Custom React hooks
│   ├── pages/                # Route components
│   └── lib/                  # Utilities
├── supabase/
│   ├── functions/            # Edge functions
│   └── migrations/           # Database schema
└── docs/                     # This documentation
```

---

## Getting Help

1. **Check Common Issues** — [COMMON_ISSUES.md](./COMMON_ISSUES.md)
2. **Review Architecture** — [ARCHITECTURE.md](./ARCHITECTURE.md)
3. **Search Issue Histories** — Detailed post-mortems for past problems
4. **Check Changelog** — [../CHANGELOG.md](../CHANGELOG.md) for recent changes

---

*Last Updated: January 3, 2026*

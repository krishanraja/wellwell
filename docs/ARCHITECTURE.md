# WellWell Architecture

## System Overview

WellWell follows a client-server architecture with a React frontend and Lovable Cloud backend.

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐ │
│  │  Pulse  │  │Intervene│  │ Debrief │  │     Profile     │ │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────────┬────────┘ │
│       │            │            │                │          │
│  ┌────▼────────────▼────────────▼────────────────▼────────┐ │
│  │                    Hooks Layer                          │ │
│  │  useAuth / useProfile / useEvents / useVirtues          │ │
│  └─────────────────────────┬──────────────────────────────┘ │
│                            │                                 │
│  ┌─────────────────────────▼──────────────────────────────┐ │
│  │                   Logger Service                        │ │
│  │  Captures: interactions, errors, AI calls, performance  │ │
│  └─────────────────────────┬──────────────────────────────┘ │
└────────────────────────────┼────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                     Lovable Cloud                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Database   │  │  Edge Fns    │  │   AI Gateway     │   │
│  │  PostgreSQL  │  │stoic-analyzer│  │ Gemini 2.5 Flash │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Input Flow

```
User Input → Event Created → AI Analysis → Insight Generated → Virtue Updated
```

1. **User Input**: Raw text captured from forms
2. **Event Created**: Stored with profile_id, session_id, tool_name
3. **AI Analysis**: Edge function calls Lovable AI with context
4. **Insight Generated**: Structured scores and labels stored
5. **Virtue Updated**: Aggregated scores recalculated

### 2. AI Analysis Flow

```
┌─────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client    │───▶│  stoic-analyzer  │───▶│  Lovable AI     │
│   Request   │    │  Edge Function   │    │  Gateway        │
└─────────────┘    └──────────────────┘    └─────────────────┘
                           │
                           ▼
                   ┌──────────────────┐
                   │  Context Build   │
                   │  - Profile data  │
                   │  - Recent events │
                   │  - Virtue scores │
                   └──────────────────┘
```

## Database Schema

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `profiles` | User anchor | id, email, persona, challenges, goals |
| `sessions` | Tool usage grouping | profile_id, tool_name, started_at |
| `events` | Raw interactions | profile_id, tool_name, raw_input, structured_values |
| `insights` | Meaning layer | dimension_name, score, label, llm_summary |
| `virtue_scores` | Aggregated tracking | virtue, score, delta |

### Relationships

```
profiles (1) ──────< sessions (N)
    │                    │
    │                    │
    ▼                    ▼
events (N) ◄──────── (FK: session_id)
    │
    │
    ▼
insights (N)
```

## Security Model

### Row Level Security (RLS)

All tables enforce user isolation:
- Users can only read/write their own data
- Profile ID derived from `auth.uid()`
- No cross-user data access

### Authentication Flow

```
Sign Up → Profile Auto-Created → Virtue Scores Initialized
                                         │
Login ──────────────────────────────────▶│
                                         ▼
                                  Session Token
                                         │
                                         ▼
                                  API Requests (Authenticated)
```

## Logging Architecture

### Log Levels

| Level | Use Case | Example |
|-------|----------|---------|
| DEBUG | Development only | Component render |
| INFO | Normal operations | User completed pulse |
| WARN | Recoverable issues | API retry |
| ERROR | Failures | DB write failed |
| CRITICAL | System failures | Auth provider down |

### Log Format

```typescript
{
  level: 'info',
  message: 'Pulse completed',
  context: {
    userId: 'uuid',
    sessionId: 'uuid',
    toolName: 'pulse',
    duration: 1234
  },
  timestamp: '2024-01-01T00:00:00Z',
  traceId: 'uuid'
}
```

## Component Architecture

### Layout Hierarchy

```
App
└── Layout
    ├── Header
    │   ├── Menu Button → /more
    │   ├── Logo
    │   └── User Button → /profile
    ├── Main Content (Pages)
    └── BottomNav
        ├── Pulse
        ├── Intervene
        ├── Debrief
        └── More
```

### State Management

- **Auth State**: Supabase Auth + React Context
- **Server State**: React Query for data fetching
- **UI State**: Local React state
- **Form State**: Controlled components

## Performance Considerations

1. **Lazy Loading**: Pages loaded on-demand
2. **Optimistic Updates**: UI updates before server confirms
3. **Caching**: React Query caches API responses
4. **Animation**: CSS-based where possible, Framer for complex

## Error Handling Strategy

1. **API Errors**: Toast notification + log
2. **Validation Errors**: Inline form feedback
3. **Auth Errors**: Redirect to login
4. **Network Errors**: Retry with exponential backoff

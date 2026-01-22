# WellWell Feature Specifications

## Core Features

### 0. Contextual Home Experience

**Purpose**: Intelligently surface the right practice at the right time

**Features**:
- **Welcome Back Screen**: Personalized greeting for returning users with streak acknowledgment
- **Time-Based Primary Nudge**:
  - Morning (5am-12pm): Morning Pulse is primary action
  - Midday (12pm-5pm): Freeform "What's on your mind?" 
  - Evening (5pm-9pm): Evening Debrief is primary action
  - Night (9pm-5am): Gentle debrief or rest
- **Daily Progress Indicators**: Visual checkmarks showing Pulse/Debrief completion
- **Secondary Quick Actions**: Intervene, Decision, Conflict always accessible
- **Smart Nav Indicators**: Pulsing dot on Home when daily ritual awaiting

**Context Logic** (in `useContextualNudge`):
```typescript
// Morning without Pulse → Pulse is primary
if (timeContext === 'morning' && !hasCompletedPulseToday) → 'pulse'
// Evening without Debrief → Debrief is primary  
if (timeContext === 'evening' && !hasCompletedDebriefToday) → 'debrief'
// Otherwise → Freeform input
```

---

### 1. Morning Pulse

**Purpose**: Pre-load mental stance before daily challenges

**User Flow**:
1. User identifies "today's hardest moment"
2. AI analyzes and returns:
   - Control map (what's yours vs not yours)
   - Relevant virtue
   - Personalized stance statement
   - Pre-emptive action

**Data Captured**:
- `events.raw_input`: The challenge description
- `events.structured_values`: Parsed challenge type
- `insights`: Virtue scores, composure level

**AI Output Schema**:
```typescript
{
  control_map: {
    yours: string[],
    not_yours: string[]
  },
  virtue: 'courage' | 'temperance' | 'justice' | 'wisdom',
  virtue_rationale: string,
  stance: string,
  pre_action: string
}
```

---

### 2. Intervene

**Purpose**: Real-time emotional recalibration during stress

**User Flow**:
1. User describes trigger
2. User rates intensity (1-10)
3. AI provides:
   - Reality check
   - Virtue-based reframe
   - Immediate action step

**Data Captured**:
- `events.raw_input`: Trigger description
- `events.structured_values`: { intensity: number }
- `insights`: Emotional state, resilience score

**AI Output Schema**:
```typescript
{
  reality_check: string,
  virtue_applicable: string,
  reframe: string,
  immediate_action: string,
  grounding_prompt: string
}
```

---

### 3. Debrief

**Purpose**: Evening reflection and virtue tracking

**User Flow**:
1. Answer: "What challenged your composure?"
2. Answer: "How did you respond?"
3. Answer: "What would you do differently?"
4. AI generates day summary + virtue deltas

**Data Captured**:
- 3 separate `events` for each question
- `insights`: Day synthesis
- `virtue_scores`: Updated with deltas

**AI Output Schema**:
```typescript
{
  day_summary: string,
  virtue_movements: {
    virtue: string,
    delta: number,
    reason: string
  }[],
  tomorrow_focus: string,
  pattern_detected?: string
}
```

---

### 4. Profile

**Purpose**: User preferences and progress tracking

**Sections**:
- Profile header (name, email, persona)
- Virtue summary with trends
- Recent activity feed
- Preferences editor
- Settings

**Data Sources**:
- `profiles` table
- `virtue_scores` aggregated
- `events` recent list

---

### 5. Onboarding

**Purpose**: Personalize the Stoic experience

**Steps**:
1. Welcome + philosophy intro
2. Select challenges (conflict, pressure, uncertainty, overwhelm)
3. Select goals (calm, clarity, composure, decisiveness)
4. Choose persona (strategist, monk, commander, friend)
5. Capture baseline moment

**Data Captured**:
- `profiles.challenges`
- `profiles.goals`
- `profiles.persona`
- `profiles.baseline_moment`
- Initial `events` entry

---

## Future Features (Roadmap)

### Decision Engine
- Complex decision analysis
- Stakeholder mapping
- Option evaluation matrix

### Conflict Copilot
- Relationship context
- Conversation scripts
- De-escalation strategies

### Weekly Review
- 7-day virtue trends
- Pattern recognition
- Weekly stance

### Drift Detection
- Alerts when virtue scores decline
- Re-engagement prompts
- Habit reminders

---

## SEO Infrastructure

### FAQ Page (`/faq`)
- 20+ SEO-optimized FAQs targeting high-volume searches
- Categories: Stoicism, App, Mental Health, Practices, Pricing
- Full-text search functionality
- FAQ schema markup for rich snippets in Google
- Accessible from Settings > Support & Resources

### Blog (`/blog`, `/blog/:slug`)
- 5 initial SEO-optimized articles targeting:
  - "how to stay calm under pressure"
  - "stoic morning routine"
  - "dealing with difficult people"
  - "stoic journaling prompts"
  - "stoicism for beginners"
- Article schema markup for rich snippets
- Previous/Next navigation
- Share functionality
- CTA to sign up on every article

### Technical SEO
- **Structured Data**: WebApplication, Organization, SoftwareApplication, Article, FAQPage schemas
- **Sitemap**: All public pages included with lastmod dates
- **Robots.txt**: Proper directives for public/private routes
- **Meta Tags**: Open Graph, Twitter Cards, canonical URLs
- **HelmetProvider**: Dynamic meta tags per page

---

## Feature Flags

| Flag | Status | Description |
|------|--------|-------------|
| `AI_ENABLED` | On | Use AI for analysis |
| `PERSIST_DATA` | On | Save to database |
| `ONBOARDING_REQUIRED` | On | Force onboarding for new users |
| `WEEKLY_REVIEW` | Off | Weekly summary feature |
| `DRIFT_ALERTS` | Off | Push notifications |

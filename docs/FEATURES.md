# WellWell Feature Specifications

## Core Features

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

## Feature Flags

| Flag | Status | Description |
|------|--------|-------------|
| `AI_ENABLED` | On | Use AI for analysis |
| `PERSIST_DATA` | On | Save to database |
| `ONBOARDING_REQUIRED` | On | Force onboarding for new users |
| `WEEKLY_REVIEW` | Off | Weekly summary feature |
| `DRIFT_ALERTS` | Off | Push notifications |

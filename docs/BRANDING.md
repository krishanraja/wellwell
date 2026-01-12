# WellWell Brand Guidelines

## Brand Identity

### Name
**WellWell** - A play on "wellness" and the acknowledgment phrase "well, well..." suggesting reflection and composed observation.

### Tagline
> Pre-load your Stoic stance before the day destabilises you.

### Mission
To make Stoic philosophy accessible and actionable for modern professionals facing daily pressures.

---

## Logo Usage

### Primary Logo
- File: `src/assets/wellwell-logo.png`
- Use on: Headers, splash screens, marketing
- Min size: 120px width
- Clear space: 20% of logo width on all sides

### Icon
- File: `src/assets/wellwell-icon.png`
- Use on: Favicons, app icons, avatars
- Min size: 32px
- Clear space: 10% of icon width

**Note**: Both logo files are located in `src/assets/` and imported in components using:
```typescript
import wellwellIcon from '@/assets/wellwell-icon.png';
import wellwellLogo from '@/assets/wellwell-logo.png';
```

### Don'ts
- ❌ Don't stretch or distort
- ❌ Don't add effects or shadows
- ❌ Don't place on busy backgrounds
- ❌ Don't use low-resolution versions

---

## Color Palette

### Primary Brand Colors

| Color | Hex (approx) | HSL | Usage |
|-------|---------------|-----|-------|
| Mint | #C8FF7A | 90 100% 79% | Primary accent, success states, virtue highlights |
| Aqua | #00D9FF | 187 100% 60% | Secondary accent, gradients, primary actions |
| Primary | #00A3CC (light) / #00D9FF (dark) | 187 100% 42% / 187 100% 60% | CTAs, links, interactive elements |

### Base Colors (Light Mode)

| Color | Hex (approx) | HSL | Usage |
|-------|---------------|-----|-------|
| Background | #F5FAF8 | 160 20% 98% | App background |
| Foreground | #0D0F0E | 165 20% 5% | Primary text |
| Card | #F2F7F5 | 160 15% 97% | Card backgrounds |
| Secondary | #E8F0ED | 160 30% 95% | Secondary surfaces |
| Muted | #E0E8E5 | 160 15% 93% | Subtle backgrounds |
| Border | #D4E0DB | 160 15% 90% | Borders, dividers |

### Base Colors (Dark Mode)

| Color | Hex (approx) | HSL | Usage |
|-------|---------------|-----|-------|
| Background | #0D0F0E | 165 20% 5% | App background |
| Foreground | #F5FAF8 | 160 20% 98% | Primary text |
| Card | #121514 | 165 15% 8% | Card backgrounds |
| Secondary | #1A1E1D | 165 15% 12% | Secondary surfaces |
| Muted | #1F2322 | 165 15% 15% | Subtle backgrounds |
| Border | #1F2322 | 165 15% 15% | Borders, dividers |

### Semantic

| Color | Usage |
|-------|-------|
| Mint | Success, positive |
| Amber | Warning, caution |
| Rose | Error, danger |
| Blue | Information |

---

## Typography

### Display Font
**Space Grotesk**
- Used for: Headlines, titles, feature text
- Weights: 500 (Medium), 700 (Bold)
- Characteristics: Geometric, modern, confident

### Body Font
**Inter**
- Used for: Body text, labels, UI elements
- Weights: 400 (Regular), 500 (Medium), 600 (SemiBold)
- Characteristics: Highly legible, neutral, professional

### Monospace
**JetBrains Mono**
- Used for: Stance statements, quotes, data
- Weight: 400 (Regular)
- Characteristics: Clear, technical, deliberate

---

## Voice & Tone

### Personality Traits
1. **Composed** - Calm, measured, never panicked
2. **Direct** - Clear instructions, no fluff
3. **Grounded** - Practical wisdom, not abstract philosophy
4. **Supportive** - Firm but kind, like a trusted mentor

### Writing Guidelines

**Do:**
- Use active voice
- Be specific and actionable
- Acknowledge difficulty without dwelling
- Offer one clear next step

**Don't:**
- Use corporate jargon
- Be preachy or lecturing
- Oversimplify complex emotions
- Make generic "just breathe" suggestions

### Example Copy

❌ "Try to stay positive and remember that everything happens for a reason."

✅ "You can't control their reaction. You can control your preparation. Focus there."

---

## Iconography

### Style
- Line icons (Lucide icon set)
- 1.5px stroke weight
- Rounded caps and joins
- Mint accent for active/selected

### Core Icons

| Icon | Usage |
|------|-------|
| Sun | Morning Pulse |
| Zap | Intervene |
| Moon | Debrief |
| Target | Control focus |
| Shield | Virtue |
| Lightbulb | Insight |
| User | Profile |

---

## Photography & Imagery

### Style
- Minimal, abstract
- Dark backgrounds
- Subtle gradients
- Geometric shapes

### AI-Generated Images
When using AI generation:
- Emphasize calm, composed subjects
- Avoid chaotic or busy compositions
- Prefer cool color temperatures
- Include subtle mint/aqua accents

---

## Motion Principles

1. **Purposeful** - Every animation has meaning
2. **Swift** - Quick but not jarring (200-300ms)
3. **Smooth** - Ease-out for entrances, ease-in for exits
4. **Subtle** - Enhance, don't distract

---

## Application Examples

### Onboarding
- Large logo centered
- Gradient glow background
- Staggered text animations

### Daily Use
- Compact header with icon
- Focus on content, minimal chrome
- Quick transitions between tools

### Achievements
- Mint glow emphasis
- Scale-up animation
- Momentary highlight

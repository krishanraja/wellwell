# WellWell Visual Guidelines

## Overview

Visual design principles, layout patterns, video background specs, card/button styles, and the visual testing/audit process.

---

## Visual Design Principles

### 1. Composed Clarity
- **Principle:** Every visual element should convey calm, composed confidence
- **Application:** Clean layouts, generous whitespace, purposeful animations
- **Avoid:** Chaotic compositions, busy backgrounds, jarring transitions

### 2. Mobile-First Hierarchy
- **Principle:** Most important content visible above the fold on mobile
- **Application:** Primary actions at top, secondary actions below
- **Avoid:** Critical content hidden below scroll on mobile viewport

### 3. Dark Mode Default
- **Principle:** WellWell is dark-mode by default for reduced eye strain
- **Application:** All color tokens support dark mode, test contrast ratios
- **Avoid:** Light mode assumptions, poor contrast in dark mode

### 4. Sacred Navigation Zone
- **Principle:** Bottom navigation is "sacred" - content never overlaps
- **Application:** Consistent safe area padding (12px breathing room)
- **Avoid:** Content touching or overlapping bottom navigation

### 5. Purposeful Motion
- **Principle:** Every animation has meaning, enhances understanding
- **Application:** Fade-up for entrances, scale-in for interactions
- **Avoid:** Decorative animations, motion for motion's sake

---

## Layout Patterns

### Pattern 1: Scrollable Pages
**Use when:** Page content may exceed viewport height and needs to scroll.

**Implementation:**
```tsx
<Layout scrollable>
  <div className="space-y-6 pb-4">
    {/* Page content */}
  </div>
</Layout>
```

**Characteristics:**
- Uses `<Layout scrollable>` prop
- Content wrapped in simple container with spacing
- Layout handles overflow with `overflow-y-auto`
- No manual `overflow-y-auto` or `min-h-0` needed

**Examples:** EditProfile, More, Blog, Settings

---

### Pattern 2: Fixed-Height Pages with Manual Scrolling
**Use when:** Page has complex layout with fixed headers/footers and scrollable content area.

**Implementation:**
```tsx
<Layout>
  <div className="flex flex-col h-full overflow-hidden gap-2">
    {/* Fixed header */}
    <div className="shrink-0">
      {/* Header content */}
    </div>
    
    {/* Scrollable content area */}
    <div className="flex-1 min-h-0 overflow-y-auto">
      {/* Scrollable content */}
    </div>
    
    {/* Fixed footer (optional) */}
    <div className="shrink-0">
      {/* Footer content */}
    </div>
  </div>
</Layout>
```

**Characteristics:**
- Uses `<Layout>` (no scrollable prop)
- Manual flex layout with `h-full overflow-hidden` on root
- Scrollable area uses `flex-1 min-h-0 overflow-y-auto`
- Fixed sections use `shrink-0`

**Examples:** History, Intervene (results view)

---

### Pattern 3: Viewport-Fitting Pages
**Use when:** Content always fits in viewport, no scrolling needed.

**Implementation:**
```tsx
<Layout scrollable>
  <div className="flex flex-col h-full justify-center items-center space-y-6">
    {/* Centered content */}
  </div>
</Layout>
```

**Examples:** Home (when no content), Onboarding (step views)

---

## Card Styles

### Standard Card (StoicCard)
```tsx
<StoicCard>
  <StoicCardHeader label="Title" icon={<Icon />} />
  <StoicCardContent>
    {/* Content */}
  </StoicCardContent>
</StoicCard>
```

**Visual Specs:**
- Background: Glass effect (`bg-card/80 backdrop-blur-sm`)
- Border: Subtle border (`border border-border/50`)
- Padding: `p-6` (24px)
- Border Radius: `rounded-xl` (12px)
- Shadow: `shadow-card`

### Bordered Card (Accent)
```tsx
<StoicCard variant="bordered">
  {/* Content */}
</StoicCard>
```

**Visual Specs:**
- Border: Mint accent (`border-mint/30`)
- Background: Same as standard
- Use for: Emphasis, highlights, important content

### Glass Card
```tsx
<div className="bg-card/60 backdrop-blur-md border border-border/30 rounded-xl p-6">
  {/* Content */}
</div>
```

**Visual Specs:**
- Background: Semi-transparent with blur
- Border: Subtle border with transparency
- Use for: Overlays, modals, floating content

---

## Button Styles

### Brand Button (Primary)
```tsx
<Button variant="brand">
  Primary Action
</Button>
```

**Visual Specs:**
- Background: Aqua gradient (`bg-gradient-to-r from-aqua to-primary`)
- Text: White
- Hover: Slight scale (1.02)
- Shadow: `shadow-glow` on hover
- Use for: Primary CTAs, main actions

### Stoic Button (Secondary)
```tsx
<Button variant="stoic">
  Secondary Action
</Button>
```

**Visual Specs:**
- Background: Mint (`bg-mint text-foreground`)
- Text: Dark foreground
- Hover: Slight brightness increase
- Use for: Secondary actions, confirmations

### Minimal Button (Tertiary)
```tsx
<Button variant="minimal">
  Tertiary Action
</Button>
```

**Visual Specs:**
- Background: Transparent with border
- Border: `border-border`
- Text: Foreground color
- Hover: Background fill
- Use for: Less important actions

### Glow Button (Emphasis)
```tsx
<Button variant="glow">
  Emphasized Action
</Button>
```

**Visual Specs:**
- Background: Aqua with glow effect
- Shadow: `shadow-glow` (persistent)
- Animation: Subtle pulse
- Use for: Special actions, achievements

### Ghost Button (Icon)
```tsx
<Button variant="ghost" size="icon">
  <Icon />
</Button>
```

**Visual Specs:**
- Background: Transparent
- Hover: Subtle background
- Size: 44x44px minimum (touch target)
- Use for: Icon-only actions

---

## Video Background Specs

### Landing Page Video
**Requirements:**
- Format: MP4 (H.264 codec)
- Resolution: 1920x1080 (Full HD)
- Duration: 10-30 seconds (looped)
- File Size: < 5MB (optimized)
- Aspect Ratio: 16:9

**Visual Style:**
- Minimal, abstract imagery
- Calm, composed subjects
- Dark backgrounds with subtle gradients
- Mint/aqua accent colors (subtle)
- Slow, purposeful motion

**Implementation:**
```tsx
<video
  autoPlay
  loop
  muted
  playsInline
  className="absolute inset-0 w-full h-full object-cover opacity-30"
>
  <source src="/video/landing-bg.mp4" type="video/mp4" />
</video>
```

**Overlay:**
- Dark overlay: `bg-black/40` for text readability
- Content above video with proper z-index

---

## Typography Hierarchy

### Display (Headlines)
- **Font:** Space Grotesk
- **Size:** `text-4xl` (36px) for hero, `text-2xl` (24px) for page titles
- **Weight:** 700 (Bold)
- **Line Height:** 1.2
- **Use:** Hero text, page titles, major headings

### Body (Content)
- **Font:** Inter
- **Size:** `text-base` (16px) for body, `text-sm` (14px) for secondary
- **Weight:** 400 (Regular) for body, 500 (Medium) for emphasis
- **Line Height:** 1.6
- **Use:** Body text, descriptions, labels

### Monospace (Stances, Quotes)
- **Font:** JetBrains Mono
- **Size:** `text-base` (16px)
- **Weight:** 400 (Regular)
- **Line Height:** 1.5
- **Use:** Stance statements, Stoic quotes, code-like content

---

## Spacing System

### Standard Spacing Scale
- **Tight:** `space-2` (8px) - Icon gaps, tight inline spacing
- **Standard:** `space-4` (16px) - Standard padding, gaps
- **Comfortable:** `space-6` (24px) - Section gaps, card spacing
- **Generous:** `space-8` (32px) - Large sections, page padding
- **Breathing:** `space-12` (48px) - Major sections, page breaks

### Safe Area Spacing
- **Bottom Navigation:** 12px breathing room above nav
- **Top Safe Area:** Respects device notches (iOS)
- **Horizontal Padding:** `px-4` (16px) on mobile, `px-6` (24px) on desktop

---

## Animation System

### Entrance Animations
```tsx
<div className="animate-fade-up">
  {/* Content fades in and slides up */}
</div>
```

**Specs:**
- Duration: 500ms
- Easing: `ease-out`
- Transform: `translateY(20px)` → `translateY(0)`
- Opacity: `0` → `1`

### Interaction Animations
```tsx
<button className="transition-smooth hover:scale-105">
  {/* Button scales on hover */}
</button>
```

**Specs:**
- Duration: 200ms
- Easing: `ease-in-out`
- Scale: `1` → `1.05` (subtle)
- Use for: Buttons, cards, interactive elements

### Loading Animations
```tsx
<div className="animate-pulse">
  {/* Skeleton loader */}
</div>
```

**Specs:**
- Duration: 2s (infinite)
- Easing: `ease-in-out`
- Opacity: `1` → `0.5` → `1`
- Use for: Loading states, skeleton screens

### Staggered Animations
```tsx
<div className="stagger-children">
  <div className="animate-fade-up" style={{ animationDelay: '0ms' }}>Item 1</div>
  <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>Item 2</div>
  <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>Item 3</div>
</div>
```

**Specs:**
- Delay increment: 100ms per child
- Use for: Lists, card grids, sequential reveals

---

## Mobile Viewport Handling

### Viewport Meta
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
```

### Safe Area Insets
```css
--safe-top: env(safe-area-inset-top, 0px);
--safe-bottom: env(safe-area-inset-bottom, 0px);
--safe-left: env(safe-area-inset-left, 0px);
--safe-right: env(safe-area-inset-right, 0px);
```

**Application:**
- Bottom navigation: `padding-bottom: calc(var(--nav-height) + var(--safe-bottom) + 12px)`
- Top content: `padding-top: var(--safe-top)`

### Touch Targets
- **Minimum Size:** 44x44px (Apple HIG, Material Design)
- **Spacing:** 8px minimum between touch targets
- **Visual Feedback:** Scale or brightness change on press

---

## Visual Testing & Audit Process

### Pre-Development Checklist
- [ ] Design follows mobile-first principle
- [ ] Color contrast meets WCAG AA (4.5:1 minimum)
- [ ] Touch targets are 44x44px minimum
- [ ] Safe area insets accounted for
- [ ] Bottom navigation has 12px breathing room

### During Development
- [ ] Test on actual mobile device (not just browser devtools)
- [ ] Verify animations are smooth (60fps)
- [ ] Check dark mode appearance
- [ ] Verify scroll patterns work correctly
- [ ] Test with reduced motion preference

### Visual Audit Checklist
- [ ] All pages follow correct scroll pattern
- [ ] No content overlaps bottom navigation
- [ ] Cards have consistent styling
- [ ] Buttons have proper variants
- [ ] Typography hierarchy is clear
- [ ] Spacing is consistent
- [ ] Animations are purposeful
- [ ] Loading states are present
- [ ] Error states are user-friendly
- [ ] Empty states are helpful

### Device Testing
- [ ] iPhone SE (375px) - Smallest common viewport
- [ ] iPhone 12/13/14 (390px) - Standard mobile
- [ ] iPhone 14 Pro Max (430px) - Large mobile
- [ ] iPad (768px) - Tablet
- [ ] Desktop (1024px+) - Desktop

### Browser Testing
- [ ] Chrome (mobile & desktop)
- [ ] Safari (iOS & macOS)
- [ ] Firefox (mobile & desktop)
- [ ] Edge (desktop)

---

## Common Visual Issues & Fixes

### Issue: Content Overlaps Bottom Nav
**Fix:** Add safe area padding: `pb-[calc(var(--nav-height)+var(--safe-bottom)+12px)]`

### Issue: Horizontal Scrollbar Appears
**Fix:** Use `HorizontalScroll` component with fade indicators, hide native scrollbar with `scrollbar-hide`

### Issue: Cards Cut Off on Mobile
**Fix:** Ensure cards use `w-full` not fixed widths, check container padding

### Issue: Text Too Small on Mobile
**Fix:** Minimum `text-sm` (14px) for body text, `text-base` (16px) preferred

### Issue: Buttons Too Small to Tap
**Fix:** Minimum 44x44px touch target, add padding if needed

### Issue: Animations Janky
**Fix:** Use CSS transforms (not position changes), enable GPU acceleration with `will-change`

---

## Visual Design Tokens Reference

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for complete design tokens including:
- Color palette (HSL values)
- Typography scale
- Spacing system
- Shadow system
- Border radius
- Animation timings

---

*Last Updated: January 16, 2026*

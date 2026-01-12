# WellWell Design System

## Color Palette

### Primary Brand Colors (HSL)

| Token | HSL Value | Hex (approx) | Usage |
|-------|-----------|--------------|-------|
| `--mint` | 90 100% 79% | #C8FF7A | Primary accent, success states, virtue highlights |
| `--aqua` | 187 100% 60% | #00D9FF | Secondary accent, gradients, primary actions |
| `--primary` | 187 100% 42% (light) / 187 100% 60% (dark) | #00A3CC / #00D9FF | CTAs, links, interactive elements |
| `--accent` | 90 100% 79% | #C8FF7A | Highlights, emphasis |

### Base Colors (HSL)

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--background` | 160 20% 98% | 165 20% 5% | App background |
| `--foreground` | 165 20% 5% | 160 20% 98% | Primary text |
| `--card` | 160 15% 97% | 165 15% 8% | Card backgrounds |
| `--secondary` | 160 30% 95% | 165 15% 12% | Secondary surfaces, inputs |
| `--muted` | 160 15% 93% | 165 15% 15% | Subtle backgrounds |
| `--muted-foreground` | 165 10% 45% | 160 10% 60% | Secondary text |
| `--border` | 160 15% 90% | 165 15% 15% | Borders, dividers |
| `--ring` | 187 100% 60% | 187 100% 60% | Focus rings |

### Extended Palette

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--off-white` | 160 20% 98% | Light backgrounds |
| `--ink-black` | 165 20% 5% | Dark text |
| `--sand` | 45 20% 90% | Warm neutral |
| `--cinder` | 200 5% 25% | Dark neutral |
| `--coral` | 8 100% 71% | Error states |
| `--gold` | 45 100% 60% | Warning states |
| `--purple` | 260 80% 65% | Special accents |

### Gradients

```css
--gradient-brand: linear-gradient(135deg, hsl(90 100% 79%) 0%, hsl(187 100% 60%) 100%);
--gradient-glow: radial-gradient(ellipse at center, hsl(187 100% 60% / 0.15) 0%, transparent 70%);
--gradient-glass: linear-gradient(135deg, hsl(160 20% 98% / 0.8) 0%, hsl(160 20% 96% / 0.6) 100%);
```

### Shadows

```css
--shadow-soft: 0 4px 20px -4px hsl(187 100% 60% / 0.15);
--shadow-glow: 0 0 40px hsl(187 100% 60% / 0.2);
--shadow-card: 0 2px 12px -2px hsl(165 20% 5% / 0.05);
--shadow-elevated: 0 8px 30px -8px hsl(165 20% 5% / 0.12);
--shadow-nav: 0 -4px 24px -4px hsl(165 20% 5% / 0.08);
```

---

## Typography

### Font Stack

```css
--font-display: 'Space Grotesk', system-ui, sans-serif;
--font-body: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Scale

| Class | Size | Weight | Usage |
|-------|------|--------|-------|
| `text-4xl` | 2.25rem | 700 | Hero headlines |
| `text-2xl` | 1.5rem | 700 | Page titles |
| `text-xl` | 1.25rem | 600 | Section headers |
| `text-lg` | 1.125rem | 600 | Card titles |
| `text-base` | 1rem | 400 | Body text |
| `text-sm` | 0.875rem | 400 | Labels, captions |
| `text-xs` | 0.75rem | 500 | Badges, chips |

---

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 0.25rem | Tight inline spacing |
| `space-2` | 0.5rem | Icon gaps |
| `space-3` | 0.75rem | Small padding |
| `space-4` | 1rem | Standard padding |
| `space-6` | 1.5rem | Section gaps |
| `space-8` | 2rem | Card padding |
| `space-12` | 3rem | Page sections |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 0.25rem | Small elements |
| `rounded-md` | 0.375rem | Inputs |
| `rounded-lg` | 0.5rem | Cards |
| `rounded-xl` | 0.75rem | Modals |
| `rounded-2xl` | 1rem | Large cards |
| `rounded-full` | 9999px | Pills, avatars |

---

## Shadows

```css
--shadow-glow: 0 0 20px rgba(0, 255, 209, 0.3);
--shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-elevated: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
```

---

## Animation

### Keyframes

| Name | Duration | Easing | Usage |
|------|----------|--------|-------|
| `fade-up` | 500ms | ease-out | Page entrances |
| `fade-in` | 300ms | ease | General reveals |
| `pulse-glow` | 2s | ease-in-out | Attention states |
| `scale-in` | 200ms | ease | Buttons, cards |

### Utility Classes

```css
.animate-fade-up      /* Slide up + fade */
.animate-scale-in     /* Scale from 0.95 */
.stagger-children     /* Delayed child animations */
.transition-smooth    /* 200ms all properties */
```

---

## Component Patterns

### Cards

```tsx
<StoicCard>
  <StoicCardHeader label="Title" icon={<Icon />} />
  <StoicCardContent>
    {/* Content */}
  </StoicCardContent>
</StoicCard>
```

Variants:
- `default`: Subtle glass background
- `bordered`: Mint accent border

### Buttons

| Variant | Usage |
|---------|-------|
| `brand` | Primary actions |
| `stoic` | Secondary actions |
| `minimal` | Tertiary actions |
| `glow` | Emphasized states |
| `ghost` | Icon buttons |

### Inputs

```tsx
<MicroInput
  label="Label text"
  placeholder="Placeholder..."
  value={value}
  onChange={onChange}
/>
```

### Chips

```tsx
<ActionChip
  action="Actionable instruction"
  onComplete={handleComplete}
/>
```

---

## Responsive Breakpoints

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktops |

### Mobile-First Approach

All components designed for mobile (< 640px) first, then enhanced for larger screens.

---

## Accessibility

- Minimum contrast ratio: 4.5:1
- Focus indicators: Mint ring
- Touch targets: 44x44px minimum
- Reduced motion: Respects `prefers-reduced-motion`

---

## Dark Mode

WellWell is dark-mode by default. The design system uses semantic tokens that could support light mode in the future by redefining CSS variables.

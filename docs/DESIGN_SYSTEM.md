# WellWell Design System

## Color Palette

### Primary Colors (HSL)

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--mint` | 166 100% 50% | Primary accent, success states |
| `--aqua` | 180 100% 50% | Secondary accent, gradients |
| `--background` | 220 25% 6% | App background |
| `--foreground` | 210 40% 98% | Primary text |

### Semantic Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--primary` | mint | mint | CTAs, links |
| `--secondary` | 220 20% 12% | 220 20% 12% | Cards, inputs |
| `--muted` | 220 20% 16% | 220 20% 16% | Subtle backgrounds |
| `--muted-foreground` | 215 20% 65% | 215 20% 65% | Secondary text |
| `--accent` | 166 100% 15% | 166 100% 15% | Highlights |

### Gradients

```css
--brand-gradient: linear-gradient(135deg, var(--mint), var(--aqua));
--card-gradient: linear-gradient(180deg, rgba(26, 30, 38, 0.8), rgba(26, 30, 38, 0.4));
--glow-gradient: radial-gradient(circle at 50% 0%, rgba(0, 255, 209, 0.15), transparent 50%);
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

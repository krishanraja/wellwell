# Layout Scroll Pattern Audit Checklist

This document provides a systematic checklist for auditing all pages to ensure they follow the correct scroll pattern.

## Scroll Pattern Guidelines

### Pattern 1: Scrollable Pages
**Use when**: Page content may exceed viewport height and needs to scroll.

**Implementation**:
```tsx
<Layout scrollable>
  <div className="space-y-6 pb-4">
    {/* Page content */}
  </div>
</Layout>
```

**Characteristics**:
- Uses `<Layout scrollable>` prop
- Content is wrapped in a simple container (usually `div` with spacing)
- Layout component handles overflow with `overflow-y-auto`
- No manual `overflow-y-auto` or `min-h-0` needed on inner containers

**Examples**: EditProfile, More, Blog

---

### Pattern 2: Fixed-Height Pages with Manual Scrolling
**Use when**: Page has a complex layout with fixed headers/footers and a scrollable content area.

**Implementation**:
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

**Characteristics**:
- Uses `<Layout>` (no scrollable prop)
- Manual flex layout with `h-full overflow-hidden` on root container
- Scrollable area uses `flex-1 min-h-0 overflow-y-auto`
- Fixed sections use `shrink-0`

**Examples**: History, Intervene (when showing results)

---

## Audit Checklist

For each page, check the following:

### 1. Does the page need to scroll?
- [ ] **Yes** - Content can exceed viewport → Use Pattern 1 (scrollable)
- [ ] **No** - Fixed layout with internal scroll areas → Use Pattern 2 (manual)
- [ ] **No** - Content always fits viewport → Use Pattern 1 (scrollable) for safety

### 2. Current Implementation Check
- [ ] Page uses `<Layout scrollable>` correctly (if Pattern 1)
- [ ] Page uses `<Layout>` without scrollable (if Pattern 2)
- [ ] No conflicting overflow styles
- [ ] Content structure matches chosen pattern

### 3. Common Issues to Look For
- [ ] ❌ Using `scrollable` prop but Layout doesn't support it (old code)
- [ ] ❌ Using `overflow-hidden` on scrollable containers
- [ ] ❌ Missing `min-h-0` on flex children that need to scroll
- [ ] ❌ Using both `scrollable` prop AND manual `overflow-y-auto`
- [ ] ❌ Content cut off at bottom (missing padding-bottom)

---

## Pages to Audit

### ✅ Already Verified
- [x] **EditProfile** - Uses Pattern 1 correctly with `<Layout scrollable={true}>`
- [x] **More** - Uses Pattern 1 correctly with `<Layout scrollable>`
- [x] **Blog** - Uses Pattern 1 correctly with `<Layout scrollable>`
- [x] **History** - Uses Pattern 2 correctly with manual flex layout
- [x] **Intervene** - Uses Pattern 2 correctly with manual flex layout

### 🔍 Needs Review
Review these pages and update if needed:

- [ ] **Index** (`src/pages/Index.tsx`)
- [ ] **Pulse** (`src/pages/Pulse.tsx`)
- [ ] **Debrief** (`src/pages/Debrief.tsx`)
- [ ] **Profile** (`src/pages/Profile.tsx`)
- [ ] **Trends** (`src/pages/Trends.tsx`)
- [ ] **Decision** (`src/pages/Decision.tsx`)
- [ ] **Conflict** (`src/pages/Conflict.tsx`)
- [ ] **WeeklyReset** (`src/pages/WeeklyReset.tsx`)
- [ ] **MonthlyNarrative** (`src/pages/MonthlyNarrative.tsx`)
- [ ] **Settings** (`src/pages/Settings.tsx`)
- [ ] **Pricing** (`src/pages/Pricing.tsx`)
- [ ] **About** (`src/pages/About.tsx`)
- [ ] **Library** (`src/pages/Library.tsx`)
- [ ] **DailyStancesLibrary** (`src/pages/DailyStancesLibrary.tsx`)
- [ ] **MeditationsLibrary** (`src/pages/MeditationsLibrary.tsx`)
- [ ] **WisdomLibrary** (`src/pages/WisdomLibrary.tsx`)
- [ ] **Onboarding** (`src/pages/Onboarding.tsx`)
- [ ] **Landing** (`src/pages/Landing.tsx`)
- [ ] **Auth** (`src/pages/Auth.tsx`)
- [ ] **FAQ** (`src/pages/FAQ.tsx`)
- [ ] **BlogArticle** (`src/pages/BlogArticle.tsx`)
- [ ] **NotFound** (`src/pages/NotFound.tsx`)

---

## Quick Fix Guide

### If page should scroll but doesn't:
1. Add `scrollable` prop: `<Layout scrollable>`
2. Ensure content is in a simple container (not complex flex layout)
3. Add bottom padding if content gets cut off: `pb-4` or `pb-8`

### If page has complex layout:
1. Remove `scrollable` prop if present
2. Use Pattern 2 with manual flex layout
3. Ensure scrollable area has `flex-1 min-h-0 overflow-y-auto`

### If page uses old `scrollable` prop incorrectly:
1. Determine if it should be Pattern 1 or Pattern 2
2. Update accordingly
3. Remove any conflicting overflow styles

---

## Testing Checklist

After making changes to any page:

- [ ] Page loads without errors
- [ ] Content is visible and not cut off
- [ ] Scrolling works smoothly (if scrollable)
- [ ] No horizontal scroll appears
- [ ] Bottom navigation doesn't overlap content
- [ ] Works on mobile viewport sizes
- [ ] Works on desktop viewport sizes
- [ ] Refresh on the route works (no 404)

---

## Notes

- The `scrollable` prop was added in this implementation, so older pages may not use it yet
- Pattern 1 (scrollable prop) is simpler and preferred for most pages
- Pattern 2 (manual) is only needed for complex layouts with fixed headers/footers
- When in doubt, use Pattern 1 - it's easier to maintain




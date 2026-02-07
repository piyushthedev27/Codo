# Codo Dashboard Design System

## Overview

This document describes the comprehensive design system for the Codo AI-powered learning platform dashboard. The design system ensures consistency, accessibility, and maintainability across all dashboard components.

## Table of Contents

1. [Color System](#color-system)
2. [Dark Mode Support](#dark-mode-support)
3. [Typography](#typography)
4. [Spacing and Layout](#spacing-and-layout)
5. [Component Patterns](#component-patterns)
6. [Accessibility](#accessibility)
7. [Usage Guidelines](#usage-guidelines)

## Color System

### Peer Personality Colors

Each AI peer has a distinct color palette that reflects their personality:

#### Sarah (Curious)
- **Primary**: `hsl(236 72% 79%)` - Pink 400
- **Usage**: Avatar rings, chat buttons, hover effects
- **CSS Variable**: `--peer-sarah-primary`
- **Utility Class**: `.peer-sarah-text`, `.peer-sarah-bg`, `.peer-sarah-glow`

#### Alex (Analytical)
- **Primary**: `hsl(217 91% 60%)` - Blue 500
- **Usage**: Avatar rings, chat buttons, hover effects
- **CSS Variable**: `--peer-alex-primary`
- **Utility Class**: `.peer-alex-text`, `.peer-alex-bg`, `.peer-alex-glow`

#### Jordan (Supportive)
- **Primary**: `hsl(142 71% 45%)` - Green 500
- **Usage**: Avatar rings, chat buttons, hover effects
- **CSS Variable**: `--peer-jordan-primary`
- **Utility Class**: `.peer-jordan-text`, `.peer-jordan-bg`, `.peer-jordan-glow`

### Status Indicator Colors

Status indicators use semantic colors for immediate recognition:

| Status | Color | HSL | Usage |
|--------|-------|-----|-------|
| Online | Green | `hsl(142 71% 55%)` | Active peer status |
| Coding | Blue | `hsl(217 91% 70%)` | Peer is coding |
| Away | Orange | `hsl(38 92% 60%)` | Peer is away |
| Studying | Purple | `hsl(271 81% 66%)` | Peer is studying |
| Offline | Gray | `hsl(215 16% 57%)` | Peer is offline |

**CSS Variables**: `--status-online`, `--status-coding`, `--status-away`, `--status-studying`, `--status-offline`

### Trend Indicator Colors

Trend indicators show progress direction:

| Trend | Color | HSL | Icon |
|-------|-------|-----|------|
| Up | Green | `hsl(142 71% 55%)` | ↑ TrendingUp |
| Down | Red | `hsl(0 84% 70%)` | ↓ TrendingDown |
| Stable | Gray | `hsl(215 16% 57%)` | — Minus |

**CSS Variables**: `--trend-up`, `--trend-down`, `--trend-stable`

### Activity Type Colors

Different activity types have distinct color coding:

| Activity | Color | HSL | Border |
|----------|-------|-----|--------|
| Lesson | Blue | `hsl(217 91% 70%)` | Left border |
| Achievement | Gold | `hsl(45 93% 57%)` | Left border |
| Collaboration | Green | `hsl(142 71% 55%)` | Left border |
| Challenge | Purple | `hsl(271 81% 66%)` | Left border |
| Mistake | Red | `hsl(0 84% 70%)` | Left border |

**Utility Classes**: `.activity-lesson-bg`, `.activity-achievement-bg`, `.activity-collaboration-bg`, `.activity-challenge-bg`, `.activity-mistake-bg`

### Difficulty Level Colors

Difficulty badges use intuitive color coding:

| Difficulty | Color | HSL | Background |
|------------|-------|-----|------------|
| Beginner | Green | `hsl(142 71% 55%)` | `hsl(142 71% 55% / 0.15)` |
| Intermediate | Yellow | `hsl(45 93% 57%)` | `hsl(45 93% 57% / 0.15)` |
| Advanced | Red | `hsl(0 84% 70%)` | `hsl(0 84% 70% / 0.15)` |

**Utility Classes**: `.difficulty-beginner`, `.difficulty-intermediate`, `.difficulty-advanced`

### Stat Card Gradients

Each stat card has a unique gradient:

| Card | From | To | Class |
|------|------|-----|-------|
| Learning Progress | Blue 500 | Blue 600 | `.stat-gradient-progress` |
| Current Streak | Orange 500 | Red 500 | `.stat-gradient-streak` |
| Skills Mastered | Green 500 | Green 600 | `.stat-gradient-skills` |
| Coding Time | Purple 500 | Purple 600 | `.stat-gradient-time` |

## Dark Mode Support

### Contrast Ratios

All text colors meet **WCAG AA standards** (minimum 4.5:1 contrast ratio):

| Element | Foreground | Background | Ratio | Standard |
|---------|------------|------------|-------|----------|
| Primary Text | `hsl(210 40% 98%)` | `hsl(222 84% 5%)` | 18.5:1 | AAA |
| Secondary Text | `hsl(215 20% 65%)` | `hsl(222 84% 5%)` | 5.8:1 | AA |
| Muted Text | `hsl(215 16% 57%)` | `hsl(222 84% 5%)` | 4.6:1 | AA |
| Card Text | `hsl(210 40% 98%)` | `hsl(217 33% 18%)` | 14.2:1 | AAA |

### Theme Transitions

All color transitions use smooth animations:

```css
* {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Reduced Motion**: Transitions are disabled for users with `prefers-reduced-motion: reduce`.

### Dark Mode Color Adjustments

Colors are automatically adjusted in dark mode for better visibility:

- **Status indicators**: +10% lightness
- **Activity colors**: +10% lightness, +5% opacity
- **Difficulty badges**: +10% lightness
- **Interactive elements**: +10% lightness

### High Contrast Mode

For users with `prefers-contrast: high`:

- Foreground: Pure white (`hsl(0 0% 100%)`)
- Background: Pure black (`hsl(0 0% 0%)`)
- Borders: 50% gray (`hsl(0 0% 50%)`)

## Typography

### Font Family

```css
font-family: 'Inter', system-ui, sans-serif;
```

### Text Hierarchy

| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| H1 | 2.25rem (36px) | 700 | 1.2 | Page titles |
| H2 | 1.875rem (30px) | 700 | 1.3 | Section titles |
| H3 | 1.5rem (24px) | 600 | 1.4 | Card titles |
| H4 | 1.25rem (20px) | 600 | 1.5 | Subsection titles |
| Body | 1rem (16px) | 400 | 1.5 | Body text |
| Small | 0.875rem (14px) | 400 | 1.5 | Secondary text |
| XSmall | 0.75rem (12px) | 400 | 1.5 | Captions |

### Text Colors

| Purpose | Light Mode | Dark Mode | Variable |
|---------|------------|-----------|----------|
| Primary | `hsl(222 84% 5%)` | `hsl(210 40% 98%)` | `--foreground` |
| Secondary | `hsl(215 16% 47%)` | `hsl(215 20% 65%)` | `--muted-foreground` |
| Muted | `hsl(215 16% 57%)` | `hsl(215 16% 57%)` | `--muted-foreground` |

## Spacing and Layout

### Spacing Scale

Based on Tailwind's spacing scale (4px base unit):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 0.25rem (4px) | Tight spacing |
| sm | 0.5rem (8px) | Small gaps |
| md | 1rem (16px) | Default spacing |
| lg | 1.5rem (24px) | Section spacing |
| xl | 2rem (32px) | Large spacing |
| 2xl | 3rem (48px) | Extra large spacing |

### Grid System

Dashboard uses responsive grid layouts:

```css
/* Stats Grid */
grid-cols-1 sm:grid-cols-2 lg:grid-cols-4

/* Content Grid */
grid-cols-1 lg:grid-cols-3

/* Two-column layout */
grid-cols-1 lg:grid-cols-[2fr_1fr]
```

### Breakpoints

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| xs | 475px | Extra small devices |
| sm | 640px | Small devices |
| md | 768px | Tablets |
| lg | 1024px | Desktops |
| xl | 1280px | Large desktops |
| 2xl | 1536px | Extra large screens |

## Component Patterns

### Card Component

Standard card structure:

```tsx
<Card className="fade-in-delay-1">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

**Styling**:
- Background: `hsl(var(--card))`
- Border: `1px solid hsl(var(--border))`
- Border radius: `var(--radius)` (0.75rem)
- Padding: `1.5rem` (24px)

### Button Variants

| Variant | Background | Text | Border | Usage |
|---------|------------|------|--------|-------|
| Primary | Blue gradient | White | None | Primary actions |
| Secondary | Transparent | Foreground | Border | Secondary actions |
| Outline | Transparent | Foreground | Border | Tertiary actions |
| Ghost | Transparent | Foreground | None | Subtle actions |

### Badge Variants

| Variant | Background | Text | Usage |
|---------|------------|------|-------|
| Default | Muted | Foreground | General badges |
| Secondary | Secondary | Secondary foreground | Less prominent |
| Outline | Transparent | Foreground | Outlined badges |
| Destructive | Destructive | Destructive foreground | Error states |

### Progress Bars

```tsx
<Progress value={percentage} className="h-2" />
```

**Styling**:
- Track: `hsl(var(--muted))`
- Fill: Gradient from blue to purple
- Height: 0.5rem (8px) default
- Border radius: Full (9999px)

## Accessibility

### WCAG Compliance

All components meet **WCAG 2.1 AA standards**:

- ✅ Minimum contrast ratio: 4.5:1 for normal text
- ✅ Minimum contrast ratio: 3:1 for large text (18pt+)
- ✅ Minimum contrast ratio: 3:1 for UI components
- ✅ Focus indicators: 2px solid outline with 2px offset
- ✅ Keyboard navigation: Full support
- ✅ Screen reader support: Proper ARIA labels

### Focus Indicators

All interactive elements have visible focus indicators:

```css
*:focus-visible {
  outline: 2px solid hsl(217.2 91.2% 59.8%);
  outline-offset: 2px;
}
```

### Reduced Motion

Animations are disabled for users with motion sensitivity:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Screen Reader Support

- Semantic HTML elements
- Proper heading hierarchy
- ARIA labels for icons
- ARIA live regions for dynamic content
- Alt text for images

## Usage Guidelines

### Using Peer Colors

```tsx
// Avatar with peer color ring
<Avatar peerId="sarah" size="md" />

// Button with peer color
<Button className="peer-sarah-bg hover:peer-sarah-glow">
  Chat with Sarah
</Button>

// Text with peer color
<span className="peer-alex-text">Alex recommends this</span>
```

### Using Status Indicators

```tsx
// Status dot
<div className="w-3 h-3 rounded-full status-online" />

// Status badge
<Badge className="status-coding">Coding</Badge>
```

### Using Activity Colors

```tsx
// Activity card
<div className="activity-lesson-bg p-4 rounded-lg">
  <p>Completed React Hooks lesson</p>
</div>
```

### Using Difficulty Badges

```tsx
// Difficulty badge
<Badge className="difficulty-beginner">Beginner</Badge>
<Badge className="difficulty-intermediate">Intermediate</Badge>
<Badge className="difficulty-advanced">Advanced</Badge>
```

### Using Stat Card Gradients

```tsx
// Stat card with gradient
<Card className="stat-gradient-progress text-white">
  <CardContent>
    <div className="text-3xl font-bold">75%</div>
    <p>Learning Progress</p>
  </CardContent>
</Card>
```

### Using Trend Indicators

```tsx
// Trend indicator
<div className="flex items-center gap-1">
  <TrendingUp className="w-4 h-4 trend-up" />
  <span className="trend-up">+12%</span>
</div>
```

## Testing Contrast Ratios

Use the contrast checker utility to verify color combinations:

```typescript
import { testColorCombination, formatContrastRatio } from '@/lib/utils/contrast-checker'

// Test a color combination
const result = testColorCombination(
  [210, 40, 98], // Foreground HSL
  [222, 84, 5]   // Background HSL
)

console.log(`Contrast ratio: ${formatContrastRatio(result.ratio)}`)
console.log(`WCAG level: ${result.level}`)
console.log(`Passes: ${result.passes}`)
console.log(`Recommendation: ${result.recommendation}`)
```

## File Structure

```
src/styles/
├── dashboard-colors.css          # Color system definitions
├── dark-mode-enhancements.css    # Dark mode specific styles
├── dashboard-animations.css      # Animation utilities
├── avatar-animations.css         # Avatar-specific animations
├── knowledge-graph-animations.css # Graph animations
├── optimized-animations.css      # Performance-optimized animations
├── mobile-optimizations.css      # Mobile-specific styles
└── DESIGN_SYSTEM.md             # This file

src/lib/utils/
├── contrast-checker.ts           # Contrast ratio utilities
└── __tests__/
    └── contrast-checker.test.ts  # Contrast tests
```

## Best Practices

### Do's ✅

- Use CSS custom properties for colors
- Use utility classes for common patterns
- Test color combinations with contrast checker
- Provide focus indicators for all interactive elements
- Use semantic HTML elements
- Add ARIA labels for icons and dynamic content
- Test with screen readers
- Support keyboard navigation
- Respect user preferences (reduced motion, high contrast)

### Don'ts ❌

- Don't use hardcoded color values
- Don't rely solely on color to convey information
- Don't use animations without reduced motion support
- Don't create custom focus indicators without testing
- Don't skip ARIA labels for decorative elements
- Don't use low contrast color combinations
- Don't forget to test in dark mode
- Don't ignore accessibility warnings

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [ShadCN/UI Components](https://ui.shadcn.com/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## Changelog

### Version 1.0.0 (Current)

- Initial design system implementation
- Comprehensive color system with peer personalities
- Dark mode support with WCAG AA compliance
- Status, trend, and activity color coding
- Difficulty level badges
- Stat card gradients
- Contrast ratio verification utilities
- Accessibility enhancements
- Documentation and usage guidelines

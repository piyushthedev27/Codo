# Design System Quick Reference

## Color Utility Classes

### Peer Personality Colors

```css
/* Sarah (Pink) */
.peer-sarah-text      /* Text color */
.peer-sarah-bg        /* Background color */
.peer-sarah-border    /* Border color */
.peer-sarah-glow      /* Glow effect */

/* Alex (Blue) */
.peer-alex-text
.peer-alex-bg
.peer-alex-border
.peer-alex-glow

/* Jordan (Green) */
.peer-jordan-text
.peer-jordan-bg
.peer-jordan-border
.peer-jordan-glow
```

### Status Indicators

```css
.status-online    /* Green */
.status-coding    /* Blue */
.status-away      /* Orange */
.status-studying  /* Purple */
.status-offline   /* Gray */
```

### Trend Indicators

```css
.trend-up         /* Green text */
.trend-up-bg      /* Green background */
.trend-down       /* Red text */
.trend-down-bg    /* Red background */
.trend-stable     /* Gray text */
.trend-stable-bg  /* Gray background */
```

### Activity Types

```css
.activity-lesson-bg         /* Blue background with left border */
.activity-achievement-bg    /* Gold background with left border */
.activity-collaboration-bg  /* Green background with left border */
.activity-challenge-bg      /* Purple background with left border */
.activity-mistake-bg        /* Red background with left border */
```

### Difficulty Badges

```css
.difficulty-beginner      /* Green badge */
.difficulty-intermediate  /* Yellow badge */
.difficulty-advanced      /* Red badge */
```

### Stat Card Gradients

```css
.stat-gradient-progress  /* Blue gradient */
.stat-gradient-streak    /* Orange to red gradient */
.stat-gradient-skills    /* Green gradient */
.stat-gradient-time      /* Purple gradient */
```

### Special Effects

```css
.progress-gradient  /* Blue to purple gradient for progress bars */
.xp-glow           /* Gold glow effect for XP */
.milestone-card    /* Milestone card styling */
.milestone-text    /* Milestone text color */
```

### Achievement Tiers

```css
.achievement-bronze    /* Bronze color */
.achievement-silver    /* Silver color */
.achievement-gold      /* Gold color */
.achievement-platinum  /* Platinum color */
```

## CSS Custom Properties

### Peer Colors

```css
--peer-sarah-primary
--peer-sarah-secondary
--peer-sarah-accent
--peer-sarah-glow

--peer-alex-primary
--peer-alex-secondary
--peer-alex-accent
--peer-alex-glow

--peer-jordan-primary
--peer-jordan-secondary
--peer-jordan-accent
--peer-jordan-glow
```

### Status Colors

```css
--status-online
--status-coding
--status-away
--status-studying
--status-offline

--lesson-completed
--lesson-in-progress
--lesson-locked
```

### Trend Colors

```css
--trend-up
--trend-up-bg
--trend-down
--trend-down-bg
--trend-stable
--trend-stable-bg
```

### Activity Colors

```css
--activity-lesson
--activity-lesson-bg
--activity-lesson-border

--activity-achievement
--activity-achievement-bg
--activity-achievement-border

--activity-collaboration
--activity-collaboration-bg
--activity-collaboration-border

--activity-challenge
--activity-challenge-bg
--activity-challenge-border

--activity-mistake
--activity-mistake-bg
--activity-mistake-border
```

### Hierarchy Colors

```css
--hierarchy-primary
--hierarchy-primary-hover
--hierarchy-primary-active

--hierarchy-secondary
--hierarchy-secondary-hover
--hierarchy-secondary-active

--hierarchy-success
--hierarchy-success-hover
--hierarchy-success-active

--hierarchy-warning
--hierarchy-warning-hover
--hierarchy-warning-active

--hierarchy-danger
--hierarchy-danger-hover
--hierarchy-danger-active

--hierarchy-info
--hierarchy-info-hover
--hierarchy-info-active
```

### Stat Card Colors

```css
--stat-progress-from
--stat-progress-to

--stat-streak-from
--stat-streak-to

--stat-skills-from
--stat-skills-to

--stat-time-from
--stat-time-to
```

### Difficulty Colors

```css
--difficulty-beginner
--difficulty-beginner-bg
--difficulty-beginner-text

--difficulty-intermediate
--difficulty-intermediate-bg
--difficulty-intermediate-text

--difficulty-advanced
--difficulty-advanced-bg
--difficulty-advanced-text
```

### XP and Progress

```css
--xp-primary
--xp-secondary
--xp-glow

--progress-primary
--progress-secondary
--progress-glow
```

### Milestones

```css
--milestone-primary
--milestone-secondary
--milestone-bg
--milestone-border
```

### Achievements

```css
--achievement-bronze
--achievement-silver
--achievement-gold
--achievement-platinum
```

## Common Patterns

### Peer Avatar with Color Ring

```tsx
<Avatar peerId="sarah" size="md" showRing={true} />
```

### Status Indicator Dot

```tsx
<div className="flex items-center gap-2">
  <div className="w-3 h-3 rounded-full status-online" />
  <span>Online</span>
</div>
```

### Trend Indicator

```tsx
<div className="flex items-center gap-1 trend-up-bg px-2 py-1 rounded-full">
  <TrendingUp className="w-4 h-4 trend-up" />
  <span className="trend-up">+12%</span>
</div>
```

### Activity Card

```tsx
<div className="activity-lesson-bg p-4 rounded-lg">
  <div className="flex items-center gap-3">
    <BookOpen className="w-5 h-5 text-blue-500" />
    <div>
      <h4 className="font-medium">Completed React Hooks</h4>
      <p className="text-sm text-gray-600">+50 XP</p>
    </div>
  </div>
</div>
```

### Difficulty Badge

```tsx
<Badge className="difficulty-beginner">
  Beginner
</Badge>
```

### Stat Card with Gradient

```tsx
<Card className="stat-gradient-progress text-white border-0">
  <CardContent className="p-6">
    <div className="flex items-center gap-2 mb-2">
      <Target className="w-5 h-5" />
      <span className="text-sm font-medium">Learning Progress</span>
    </div>
    <div className="text-3xl font-bold mb-2">75%</div>
    <div className="text-sm opacity-90">
      15 of 20 lessons completed
    </div>
  </CardContent>
</Card>
```

### Progress Bar with Gradient

```tsx
<div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
  <div 
    className="absolute top-0 left-0 h-3 progress-gradient rounded-full"
    style={{ width: '75%' }}
  />
</div>
```

### Peer Chat Button

```tsx
<Button className="peer-sarah-bg hover:peer-sarah-glow text-white">
  <MessageCircle className="w-4 h-4 mr-2" />
  Chat with Sarah
</Button>
```

### Milestone Card

```tsx
<div className="milestone-card p-4 rounded-lg">
  <div className="flex items-center gap-3">
    <Trophy className="w-5 h-5 milestone-text" />
    <div>
      <h4 className="font-medium milestone-text">Next Milestone</h4>
      <p className="text-sm text-gray-600">Complete 5 more lessons</p>
    </div>
  </div>
</div>
```

### XP Display with Glow

```tsx
<div className="flex items-center gap-2">
  <Star className="w-5 h-5 text-yellow-500" />
  <span className="text-2xl font-bold xp-glow">350 XP</span>
</div>
```

## Dark Mode Classes

All utility classes automatically adjust for dark mode. No additional classes needed!

```tsx
{/* Automatically adjusts for dark mode */}
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content
</div>
```

## Contrast Verification

```typescript
import { testColorCombination } from '@/lib/utils/contrast-checker'

// Test a color combination
const result = testColorCombination(
  [210, 40, 98], // Foreground HSL
  [222, 84, 5]   // Background HSL
)

console.log(`Passes WCAG AA: ${result.passes}`)
console.log(`Level: ${result.level}`)
```

## Responsive Utilities

```tsx
{/* Stats grid - responsive */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Stat cards */}
</div>

{/* Two-column layout - responsive */}
<div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
  {/* Main content */}
  {/* Sidebar */}
</div>
```

## Animation Classes

```css
.fade-in              /* Fade in animation */
.fade-in-delay-1      /* Fade in with 100ms delay */
.fade-in-delay-2      /* Fade in with 200ms delay */
.fade-in-delay-3      /* Fade in with 300ms delay */
.fade-in-delay-4      /* Fade in with 400ms delay */

.smooth-transition    /* Smooth 200ms transition */
.card-hover-effect    /* Card hover effect */
.button-glow          /* Button glow on hover */
.icon-bounce          /* Icon bounce animation */
.hover-lift           /* Lift effect on hover */
.hover-scale          /* Scale effect on hover */

.gpu-accelerated      /* GPU-accelerated transform */
.transition-fast      /* Fast transition (150ms) */
.transition-optimized /* Optimized transition */
```

## Accessibility

### Focus Indicators

All interactive elements automatically get focus indicators:

```tsx
<button className="...">
  {/* Automatically gets 2px blue outline on focus */}
</button>
```

### Reduced Motion

Animations automatically respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  /* All animations disabled */
}
```

### Screen Reader Support

```tsx
<div role="status" aria-live="polite">
  {/* Dynamic content */}
</div>

<button aria-label="Close dialog">
  <X className="w-4 h-4" />
</button>
```

## Common Mistakes to Avoid

❌ **Don't** use hardcoded colors:
```tsx
<div className="bg-[#3b82f6]">  {/* Bad */}
```

✅ **Do** use utility classes or CSS variables:
```tsx
<div className="bg-blue-500">  {/* Good */}
<div style={{ backgroundColor: 'hsl(var(--peer-alex-primary))' }}>  {/* Good */}
```

❌ **Don't** forget dark mode:
```tsx
<div className="bg-white text-black">  {/* Bad - no dark mode */}
```

✅ **Do** include dark mode variants:
```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">  {/* Good */}
```

❌ **Don't** use low contrast colors:
```tsx
<div className="bg-gray-200 text-gray-400">  {/* Bad - low contrast */}
```

✅ **Do** verify contrast ratios:
```tsx
<div className="bg-gray-900 text-white">  {/* Good - high contrast */}
```

## Need Help?

- 📖 Full documentation: `src/styles/DESIGN_SYSTEM.md`
- 🧪 Test utilities: `src/lib/utils/contrast-checker.ts`
- 📝 Implementation details: `src/styles/IMPLEMENTATION_SUMMARY.md`
- 🎨 Color definitions: `src/styles/dashboard-colors.css`
- 🌙 Dark mode styles: `src/styles/dark-mode-enhancements.css`

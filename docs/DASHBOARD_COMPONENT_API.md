# Dashboard Component API Reference

## Quick Reference

| Component | Purpose | Key Props | Status |
|-----------|---------|-----------|--------|
| ResponsiveDashboard | Main layout wrapper | initialData | ✅ Implemented |
| HeroWelcomeSection | Personalized greeting | userName, progress, streak | ✅ Implemented |
| EnhancedStatsGrid | Learning metrics | learningProgress, streak, skills | ✅ Implemented |
| AIPeerCards | AI companions | peers, onChatClick | ✅ Implemented |
| LearningPath | Progress visualization | currentTrack, lessons, milestone | ✅ Implemented |
| RecommendedLessons | AI-curated content | recommendations, onStartLesson | ✅ Implemented |
| EnhancedActivityFeed | Recent activities | activities, onViewAll | ✅ Implemented |

## Detailed API Documentation

### ResponsiveDashboard

**File**: `src/app/(auth)/dashboard/components/ResponsiveDashboard.tsx`

**Description**: Main dashboard layout component that orchestrates all dashboard sections with responsive design.

**Props**:
```typescript
interface ResponsiveDashboardProps {
  initialData: {
    hero: HeroData
    stats: StatsData
    peers: PeerData[]
    learningPath: LearningPathData
    recommendations: RecommendationData[]
    activities: ActivityData[]
  }
}
```

**Type Definitions**:
```typescript
interface HeroData {
  userName: string
  currentProgress: number
  streak: number
  xp: number
  achievements: number
  aiPeerMessage?: {
    peer: AIPeerProfile
    message: string
  }
}

interface StatsData {
  learningProgress: {
    percentage: number
    lessonsCompleted: number
    trend: 'up' | 'down' | 'stable'
    trendValue: number
  }
  streak: {
    current: number
    best: number
    trend: 'up' | 'down' | 'stable'
  }
  skillsMastered: {
    count: number
    recentSkills: string[]
    monthlyProgress: number
  }
  codingTime: {
    hoursThisWeek: number
    dailyAverage: number
    weeklyComparison: number
  }
}
```

**Usage**:
```tsx
<ResponsiveDashboard initialData={dashboardData} />
```

**Features**:
- Responsive grid layout
- Real-time data synchronization
- Optimistic UI updates
- Error boundary protection
- Loading states

**Responsive Breakpoints**:
- Mobile: < 768px (single column)
- Tablet: 768px - 1024px (two columns)
- Desktop: > 1024px (multi-column grid)

---

### HeroWelcomeSection

**File**: `src/app/(auth)/dashboard/components/HeroWelcomeSection.tsx`

**Description**: Displays personalized welcome message with AI peer motivational content and quick stats.

**Props**:
```typescript
interface HeroWelcomeSectionProps {
  userName: string
  currentProgress: number
  streak: number
  xp: number
  achievements: number
  aiPeerMessage?: {
    peer: AIPeerProfile
    message: string
  }
}
```

**Default Values**:
```typescript
{
  aiPeerMessage: {
    peer: AI_PEERS.sarah,
    message: "Keep up the great work! You're making excellent progress."
  }
}
```

**Usage**:
```tsx
<HeroWelcomeSection
  userName="Alex"
  currentProgress={65}
  streak={7}
  xp={2450}
  achievements={12}
/>
```

**Styling Classes**:
- Background: `bg-gradient-to-r from-blue-500 to-purple-600`
- Text: `text-white`
- Animation: `animate-gradient`

**Accessibility**:
- ARIA label: "Welcome section"
- Role: "region"
- Keyboard navigable CTAs

---

### EnhancedStatsGrid

**File**: `src/app/(auth)/dashboard/components/EnhancedStatsGrid.tsx`

**Description**: Displays four key learning metrics with trend indicators.

**Props**:
```typescript
interface EnhancedStatsGridProps {
  learningProgress: {
    percentage: number
    lessonsCompleted: number
    trend: 'up' | 'down' | 'stable'
    trendValue: number
  }
  streak: {
    current: number
    best: number
    trend: 'up' | 'down' | 'stable'
  }
  skillsMastered: {
    count: number
    recentSkills: string[]
    monthlyProgress: number
  }
  codingTime: {
    hoursThisWeek: number
    dailyAverage: number
    weeklyComparison: number
  }
}
```

**Card Structure**:
Each stat card contains:
- Icon (colorful, size: 40px)
- Large focal number (text-4xl)
- Supporting text (text-sm)
- Trend indicator (arrow + percentage)

**Icons Used**:
- Learning Progress: `BookOpen` (blue)
- Streak: `Flame` (orange)
- Skills Mastered: `Target` (green)
- Coding Time: `Clock` (purple)

**Usage**:
```tsx
<EnhancedStatsGrid
  learningProgress={{
    percentage: 65,
    lessonsCompleted: 23,
    trend: 'up',
    trendValue: 12
  }}
  streak={{
    current: 7,
    best: 14,
    trend: 'up'
  }}
  skillsMastered={{
    count: 15,
    recentSkills: ['React Hooks', 'TypeScript'],
    monthlyProgress: 3
  }}
  codingTime={{
    hoursThisWeek: 12.5,
    dailyAverage: 1.8,
    weeklyComparison: 15
  }}
/>
```

**Responsive Grid**:
- Desktop: `grid-cols-4`
- Tablet: `grid-cols-2`
- Mobile: `grid-cols-1`

---

### AIPeerCards

**File**: `src/app/(auth)/dashboard/components/AIPeerCards.tsx`

**Description**: Displays AI study companions with status indicators and interaction options.

**Props**:
```typescript
interface AIPeerCardsProps {
  peers: Array<{
    profile: AIPeerProfile
    status: 'online' | 'coding' | 'away' | 'studying'
    specialty: string
    level: number // 1-5
    recentMessage?: {
      content: string
      timestamp: Date
    }
  }>
  onChatClick: (peerId: string) => void
}
```

**AIPeerProfile Type**:
```typescript
interface AIPeerProfile {
  id: string
  name: string
  personality: 'curious' | 'analytical' | 'supportive'
  avatar_url: string
  skill_level: string
  interaction_style: string
}
```

**Status Colors**:
- online: `bg-green-500`
- coding: `bg-blue-500`
- away: `bg-gray-400`
- studying: `bg-orange-500`

**Personality Colors** (for buttons and glow):
- curious (Sarah): `pink-400`
- analytical (Alex): `blue-400`
- supportive (Jordan): `green-400`

**Usage**:
```tsx
<AIPeerCards
  peers={[
    {
      profile: AI_PEERS.sarah,
      status: 'online',
      specialty: 'React Hooks Expert',
      level: 4,
      recentMessage: {
        content: 'Great job!',
        timestamp: new Date()
      }
    }
  ]}
  onChatClick={(id) => router.push(`/chat/${id}`)}
/>
```

**Hover Effects**:
- Scale: `hover:scale-105`
- Glow: `hover:shadow-[0_0_20px_rgba(personality-color,0.5)]`
- Transition: `transition-all duration-300`

---

### LearningPath

**File**: `src/app/(auth)/dashboard/components/LearningPath.tsx`

**Description**: Visualizes current learning track with lesson status and milestone progress.

**Props**:
```typescript
interface LearningPathProps {
  currentTrack: {
    name: string
    progress: number
    estimatedCompletion: string
  }
  lessons: Array<{
    id: string
    title: string
    status: 'completed' | 'in_progress' | 'locked'
    duration: number
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
    xpReward: number
  }>
  nextMilestone: {
    title: string
    description: string
    reward: string
    progress: number
  }
  onContinueLesson: () => void
  onViewFullPath: () => void
}
```

**Status Icons**:
- completed: ✅ (green checkmark)
- in_progress: 🔵 (blue circle)
- locked: ⚪ (gray circle)

**Progress Bar**:
- Gradient: `bg-gradient-to-r from-blue-500 to-purple-600`
- Height: `h-2`
- Rounded: `rounded-full`
- Animated: `transition-all duration-500`

**Usage**:
```tsx
<LearningPath
  currentTrack={{
    name: 'React Fundamentals',
    progress: 65,
    estimatedCompletion: '2 weeks'
  }}
  lessons={lessonsData}
  nextMilestone={milestoneData}
  onContinueLesson={() => router.push('/lessons/current')}
  onViewFullPath={() => router.push('/learning-path')}
/>
```

---

### RecommendedLessons

**File**: `src/app/(auth)/dashboard/components/RecommendedLessons.tsx`

**Description**: Displays AI-curated lesson recommendations with peer endorsements.

**Props**:
```typescript
interface RecommendedLessonsProps {
  recommendations: Array<{
    id: string
    title: string
    description: string
    thumbnail: string
    duration: number
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
    tags: string[]
    recommendedBy: {
      peer: AIPeerProfile
      reason: string
    }
  }>
  onStartLesson: (lessonId: string) => void
  onExploreMore: () => void
}
```

**Difficulty Badges**:
- Beginner: `bg-green-100 text-green-800`
- Intermediate: `bg-yellow-100 text-yellow-800`
- Advanced: `bg-red-100 text-red-800`

**Card Layout**:
- Thumbnail: 16:9 aspect ratio
- Title: `text-lg font-semibold`
- Description: `text-sm text-gray-600`
- Duration: `text-xs text-gray-500`

**Usage**:
```tsx
<RecommendedLessons
  recommendations={recommendationsData}
  onStartLesson={(id) => router.push(`/lessons/${id}`)}
  onExploreMore={() => router.push('/lessons')}
/>
```

---

### EnhancedActivityFeed

**File**: `src/app/(auth)/dashboard/components/EnhancedActivityFeed.tsx`

**Description**: Shows recent learning activities with categorization and XP tracking.

**Props**:
```typescript
interface EnhancedActivityFeedProps {
  activities: Array<{
    id: string
    type: 'lesson' | 'achievement' | 'collaboration' | 'challenge'
    title: string
    description: string
    xpEarned: number
    timestamp: Date
    peerInvolvement?: AIPeerProfile[]
    metadata?: {
      duration?: number
      difficulty?: string
      completionRate?: number
    }
  }>
  maxDisplay?: number
  onViewAll: () => void
}
```

**Activity Type Colors**:
- lesson: `bg-blue-50 border-blue-200`
- achievement: `bg-yellow-50 border-yellow-200`
- collaboration: `bg-green-50 border-green-200`
- challenge: `bg-purple-50 border-purple-200`

**Activity Type Icons**:
- lesson: `BookOpen`
- achievement: `Trophy`
- collaboration: `Users`
- challenge: `Code`

**Usage**:
```tsx
<EnhancedActivityFeed
  activities={activitiesData}
  maxDisplay={7}
  onViewAll={() => router.push('/activity')}
/>
```

**Time Formatting**:
- < 1 hour: "X minutes ago"
- < 24 hours: "X hours ago"
- < 7 days: "X days ago"
- >= 7 days: "MMM DD, YYYY"

---

## Common Patterns

### Error Handling

All components implement error boundaries:

```typescript
<ErrorBoundary fallback={<ComponentError />}>
  <YourComponent {...props} />
</ErrorBoundary>
```

### Loading States

All components support loading states:

```typescript
{isLoading ? (
  <ComponentSkeleton />
) : (
  <YourComponent {...props} />
)}
```

### Empty States

All components handle empty data:

```typescript
{data.length === 0 ? (
  <EmptyState message="No data available" />
) : (
  <YourComponent data={data} />
)}
```

## Type Exports

All types are exported from component files:

```typescript
export type { HeroWelcomeSectionProps }
export type { EnhancedStatsGridProps }
export type { AIPeerCardsProps }
// ... etc
```

Import types:

```typescript
import type { HeroWelcomeSectionProps } from '@/app/(auth)/dashboard/components/HeroWelcomeSection'
```

---

**Last Updated**: February 2026
**Version**: 1.0.0

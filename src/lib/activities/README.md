# Enhanced Activity Tracking System

## Overview

The Enhanced Activity Tracking System provides comprehensive activity categorization, XP calculation, and achievement management for the Codo learning platform. This system tracks user learning activities, calculates rewards with bonuses, and manages achievement unlocks.

## Features

### 1. Activity Categorization (`activity-types.ts`)

- **8 Activity Categories**: lesson_completed, achievement, collaboration, practice, voice_coaching, peer_interaction, milestone, challenge_completed
- **Visual Styling**: Each category has unique colors, icons, and styling
- **Priority System**: Activities are prioritized for sorting and display

### 2. Activity Tracking (`activity-tracker.ts`)

- **XP Calculation**: Dynamic XP calculation with multiple bonus multipliers
  - Streak bonuses (10% per day, capped at 100%)
  - Quality bonuses (up to 50% for high-quality work)
  - Collaboration bonuses (flat 50 XP bonus)
  - Difficulty multipliers (1x beginner, 1.5x intermediate, 2x advanced)

- **Activity Enhancement**: Converts database activities to enhanced display format
- **Sorting & Grouping**: Sort by timestamp and group by date
- **Timestamp Formatting**: Relative time display (e.g., "2 hours ago")

### 3. Achievement System (`achievement-system.ts`)

- **15 Predefined Achievements**: Across 5 categories
  - Streak achievements (3, 7, 30 days)
  - Lesson achievements (5, 25, 100 lessons)
  - Challenge achievements (10, 50 challenges)
  - Collaboration achievements (5, 25 sessions)
  - Mastery achievements (5, 20 concepts)
  - Special achievements (first lesson, voice coaching, peer interaction)

- **Rarity System**: Common, Rare, Epic, Legendary
- **Progress Tracking**: Real-time progress calculation
- **Unlock Detection**: Automatic achievement unlock checking

## Components

### EnhancedActivityFeed Component

Located at: `src/app/(auth)/dashboard/components/EnhancedActivityFeed.tsx`

**Features**:
- Animated activity cards with Framer Motion
- Category-based styling and icons
- AI peer avatar display
- XP badges with visual emphasis
- Achievement celebration animations
- Responsive design for mobile and desktop

**Props**:
```typescript
interface EnhancedActivityFeedProps {
  activities: EnhancedActivity[]
  maxDisplay?: number          // Default: 5
  showCelebrations?: boolean   // Default: true
}
```

## API Endpoints

### Activities API (`/api/activities`)

**GET** - Fetch user activities
- Query params: `limit` (default: 10), `offset` (default: 0)
- Returns: Enhanced activities with sorting

**POST** - Create new activity
- Body: activity_type, title, description, xp_earned, duration_minutes, etc.
- Automatically updates user XP

### Achievements API (`/api/achievements`)

**GET** - Fetch user achievements
- Returns: All achievements with progress, recently unlocked

**POST** - Unlock achievement
- Body: achievementId
- Updates user profile with unlocked achievement

## Usage Examples

### Creating an Activity

```typescript
import { calculateActivityXP } from '@/lib/activities'

const xp = calculateActivityXP('lesson_completed', {
  streakDays: 5,
  qualityScore: 0.9,
  hasCollaboration: true,
  difficulty: 'intermediate'
})
// Returns: 100 * 1.5 (difficulty) + 50 (streak) + 10 (quality) + 50 (collab) = 260 XP
```

### Displaying Activities

```typescript
import { EnhancedActivityFeed } from '@/app/(auth)/dashboard/components/EnhancedActivityFeed'

<EnhancedActivityFeed 
  activities={activities}
  maxDisplay={5}
  showCelebrations={true}
/>
```

### Checking Achievements

```typescript
import { getUserAchievements, checkAchievementUnlock } from '@/lib/activities'

const achievements = getUserAchievements(profile, activities, unlockedIds)
const shouldUnlock = checkAchievementUnlock(achievement, profile, activities)
```

## Activity Types

| Type | Icon | Color | Description |
|------|------|-------|-------------|
| lesson_completed | BookOpen | Blue | Completed learning lesson |
| achievement | Trophy | Yellow | Earned achievement badge |
| collaboration | Users | Purple | Collaborative coding session |
| practice | Code | Green | Practice coding challenge |
| voice_coaching | Zap | Orange | Voice coaching session |
| peer_interaction | MessageCircle | Pink | AI peer interaction |
| milestone | Target | Indigo | Reached milestone |
| challenge_completed | Award | Emerald | Completed coding challenge |

## XP Calculation Formula

```
Base XP = ACTIVITY_BASE_VALUE * DIFFICULTY_MULTIPLIER

Streak Bonus = Base XP * (streak_days * 0.1) [capped at 100%]
Quality Bonus = Base XP * ((quality_score - 0.7) * 0.5) [if quality > 0.7]
Collaboration Bonus = 50 XP [flat bonus]

Total XP = Base XP + Streak Bonus + Quality Bonus + Collaboration Bonus
```

## Achievement Rarity Colors

- **Common**: Gray - Basic achievements for getting started
- **Rare**: Blue - Requires consistent effort
- **Epic**: Purple - Significant accomplishment
- **Legendary**: Yellow - Exceptional achievement

## Database Schema

### learning_activities table
```sql
- id: UUID
- user_id: UUID (FK to user_profiles)
- activity_type: TEXT
- title: TEXT
- description: TEXT
- xp_earned: INTEGER
- duration_minutes: INTEGER
- peer_interactions_count: INTEGER
- voice_coaching_used: BOOLEAN
- mistakes_made: INTEGER
- completion_percentage: INTEGER
- metadata: JSONB
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### user_profiles.metadata
```json
{
  "unlocked_achievements": ["achievement-id-1", "achievement-id-2"]
}
```

## Integration with Dashboard

The enhanced activity feed is integrated into the dashboard at:
`src/app/(auth)/dashboard/page.tsx`

It replaces the previous basic activity list with:
- Category-based styling
- AI peer involvement indicators
- XP tracking with visual emphasis
- Achievement celebrations
- Responsive animations

## Future Enhancements

- [ ] Activity filtering by category
- [ ] Activity search functionality
- [ ] Export activity history
- [ ] Custom achievement creation
- [ ] Activity analytics dashboard
- [ ] Social sharing of achievements
- [ ] Activity streaks visualization
- [ ] Peer comparison features

## Testing

Run tests with:
```bash
npm test src/lib/activities
```

## Requirements Satisfied

- ✅ Requirement 21.14: Enhanced activity feed with AI peer involvement
- ✅ Requirement 21.15: Activity categorization with different colors
- ✅ Requirement 23.5: Comprehensive activity tracking and achievement system

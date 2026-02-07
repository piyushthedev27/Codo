# Lesson Recommendation System

## Overview

The Lesson Recommendation System provides AI-powered, personalized lesson recommendations based on user behavior, learning patterns, and AI peer personalities. It implements multiple recommendation strategies including content-based filtering, collaborative filtering, and hybrid approaches.

## Architecture

### Core Components

1. **lesson-recommender.ts** - Core recommendation logic
   - Relevance score calculation
   - Prerequisite checking
   - Peer recommendation assignment
   - Basic recommendation generation

2. **recommendation-engine.ts** - Advanced recommendation engine
   - User behavior analysis
   - Collaborative filtering
   - Content-based filtering
   - Hybrid recommendation generation

3. **API Route** (`/api/recommendations`)
   - RESTful endpoint for fetching recommendations
   - Integrates with Supabase for user data
   - Provides demo fallback for reliability

## Features

### Relevance Scoring

The system calculates relevance scores (0-100) based on multiple factors:

- **Skill Level Match (30%)**: How well the lesson difficulty matches user's skill level
- **Topic Alignment (25%)**: Alignment with user's primary domain and interests
- **Learning Goal Alignment (20%)**: Match with user's stated learning goals
- **Activity Patterns (15%)**: Based on recent learning activities
- **Mistake Relevance (10%)**: Addresses user's common mistakes

### User Behavior Analysis

Analyzes user activity to build a behavioral profile:

- Preferred topics and frequency
- Average session duration
- Preferred difficulty level
- Learning velocity (lessons per week)
- Engagement score
- Peak learning times
- Completion rate
- Mistake patterns

### AI Peer Integration

Each recommendation is assigned to an AI peer based on:

- Lesson difficulty matching peer skill level
- Peer personality alignment with lesson type
- Believable peer endorsements with personalized reasons

**Peer Personalities:**
- **Sarah (Curious)**: Beginner-friendly, asks questions
- **Alex (Analytical)**: Intermediate, detail-oriented
- **Jordan (Supportive)**: Advanced, mentorship-focused

### Prerequisite Checking

Ensures recommended lessons match user's current knowledge:

- Checks completed concepts in knowledge graph
- Filters out lessons with unmet prerequisites
- Supports fuzzy matching for prerequisite names

### Collaborative Filtering

Finds similar users and recommends popular lessons:

- Calculates user similarity using Jaccard similarity
- Identifies popular lessons among similar users
- Boosts recommendations based on peer success

### Content-Based Filtering

Analyzes lesson features for similarity:

- Topic vectorization
- Difficulty scoring
- Duration matching
- Tag overlap analysis

## Usage

### Basic Recommendation Generation

```typescript
import { generateRecommendations } from '@/lib/recommendations/lesson-recommender'

const recommendations = generateRecommendations(
  availableLessons,
  {
    userProfile,
    knowledgeGraph,
    recentActivities,
    aiPeers,
    mistakePatterns
  },
  3 // number of recommendations
)
```

### Hybrid Recommendations

```typescript
import { generateHybridRecommendations } from '@/lib/recommendations/recommendation-engine'

const recommendations = generateHybridRecommendations(
  availableLessons,
  context,
  collaborativeData, // optional
  3
)
```

### API Integration

```typescript
// Fetch recommendations from API
const response = await fetch('/api/recommendations')
const { recommendations, demo } = await response.json()
```

### Component Integration

```tsx
import { RecommendedLessons } from '@/app/(auth)/dashboard/components/RecommendedLessons'

<RecommendedLessons 
  lessons={staticLessons}  // optional: provide static lessons
  enableAPI={true}          // optional: fetch from API
/>
```

## Data Models

### LessonMetadata

```typescript
interface LessonMetadata {
  id: string
  title: string
  description: string
  topic: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  durationMinutes: number
  prerequisites: string[]
  learningObjectives: string[]
  tags: string[]
  category: string
  xpReward: number
  thumbnail?: string
}
```

### RecommendedLesson

```typescript
interface RecommendedLesson extends LessonMetadata {
  recommendedBy: string // AI peer ID
  recommendationReason: string
  relevanceScore: number
  difficultyMatch: number
  prerequisitesMet: boolean
}
```

### RecommendationContext

```typescript
interface RecommendationContext {
  userProfile: UserProfile
  knowledgeGraph: KnowledgeGraphNode[]
  recentActivities: LearningActivity[]
  aiPeers: AIPeerProfile[]
  mistakePatterns?: Array<{ error_type: string; frequency: number }>
}
```

## Algorithm Details

### Relevance Score Calculation

```
relevanceScore = 
  (skillLevelMatch * 0.30) +
  (topicAlignment * 0.25) +
  (goalAlignment * 0.20) +
  (activityAlignment * 0.15) +
  (mistakeRelevance * 0.10)
```

### Skill Level Matching

- Perfect match (same level): 1.0
- One level difference: 0.7
- Two levels difference: 0.3

### Topic Alignment

- Direct match: 1.0
- Related topics: 0.7
- Unrelated: 0.3

### User Similarity (Collaborative Filtering)

Uses Jaccard similarity:
```
similarity = |intersection| / |union|
```

Where sets contain content IDs from user activities.

## Performance Considerations

- **Caching**: API responses are cached for improved performance
- **Lazy Loading**: Component supports lazy loading of recommendations
- **Fallback**: Demo data ensures reliability during API failures
- **Efficient Queries**: Database queries are optimized with proper indexing

## Testing

Run tests with:
```bash
npm test src/lib/recommendations/__tests__/lesson-recommender.test.ts
```

Test coverage includes:
- Relevance score calculation
- Prerequisite checking
- Peer assignment
- Recommendation generation
- Sorting and filtering

## Future Enhancements

1. **Machine Learning Integration**
   - Use embeddings for better topic matching
   - Train models on user behavior patterns
   - Implement deep learning for personalization

2. **Advanced Collaborative Filtering**
   - Matrix factorization
   - Neural collaborative filtering
   - Session-based recommendations

3. **Real-time Updates**
   - WebSocket integration for live recommendations
   - Instant refresh on activity completion
   - Dynamic re-ranking based on user interactions

4. **A/B Testing**
   - Test different recommendation strategies
   - Measure engagement and completion rates
   - Optimize algorithm weights

5. **Explainability**
   - Detailed reasoning for recommendations
   - User feedback integration
   - Transparency in scoring

## Requirements Satisfied

- ✅ **Requirement 21.16**: Recommended content section with "Explore More" link
- ✅ **Requirement 21.17**: 3 AI-recommended lessons with metadata and peer recommendations
- ✅ **Requirement 21.18**: "Start Lesson" buttons with hover effects
- ✅ **Requirement 23.4**: AI-powered recommendation engine with behavior analysis, collaborative filtering, content-based filtering, and peer assignment

## API Endpoints

### GET /api/recommendations

Fetches personalized lesson recommendations.

**Response:**
```json
{
  "recommendations": [
    {
      "id": "lesson-1",
      "title": "Advanced React Hooks",
      "description": "Master hooks...",
      "difficulty": "intermediate",
      "duration": "2.5 hours",
      "recommendedBy": "alex",
      "recommendationReason": "Alex recommends this for deep understanding...",
      "relevanceScore": 87,
      "prerequisitesMet": true
    }
  ],
  "demo": false
}
```

### POST /api/recommendations

Refreshes recommendations after new activity.

**Request:**
```json
{
  "activityId": "activity-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Recommendations will be refreshed"
}
```

## License

Part of the Codo AI-Powered Learning Platform.

# Dashboard Analytics System

## Overview

The Dashboard Analytics System provides comprehensive tracking of user interactions, engagement metrics, performance monitoring, and error tracking for the Codo dashboard.

## Features

- **Event Tracking**: Track user clicks, hovers, views, and interactions
- **Engagement Metrics**: Monitor time spent, components viewed, and feature usage
- **Performance Monitoring**: Measure load times, render times, and API response times
- **Error Tracking**: Capture and log errors with context for debugging
- **Admin Dashboard**: View analytics and monitoring data in real-time

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Dashboard Components                      │
│  - Use analytics hooks to track events                       │
│  - Automatic performance monitoring                          │
│  - Error boundary integration                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Analytics Client Library                        │
│  - DashboardAnalytics: Event tracking                        │
│  - PerformanceMonitor: Performance metrics                   │
│  - ErrorTracker: Error logging                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Routes                                 │
│  - /api/analytics/track: Store events                        │
│  - /api/analytics/session: Store session metrics            │
│  - /api/analytics/performance: Store performance data       │
│  - /api/analytics/errors: Store errors                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Supabase Database                           │
│  - dashboard_analytics_events                                │
│  - dashboard_analytics_sessions                              │
│  - dashboard_performance_metrics                             │
│  - dashboard_errors                                          │
└─────────────────────────────────────────────────────────────┘
```

## Usage

### Initialize Analytics

```typescript
import { initializeAnalytics } from '@/lib/analytics/dashboard-analytics'

// Initialize analytics for a user
const analytics = initializeAnalytics(userId)
```

### Track Events in Components

```typescript
import { useDashboardAnalytics } from '@/lib/analytics/use-dashboard-analytics'

export function MyComponent() {
  const { trackInteraction, trackComponentView } = useDashboardAnalytics(userId)
  
  useEffect(() => {
    trackComponentView('MyComponent')
  }, [])
  
  const handleClick = () => {
    trackInteraction('MyComponent', 'button_clicked', {
      buttonName: 'Submit'
    })
  }
  
  return <button onClick={handleClick}>Submit</button>
}
```

### Automatic Component Tracking

```typescript
import { useComponentTracking } from '@/lib/analytics/use-dashboard-analytics'

export function MyComponent() {
  // Automatically tracks when component is viewed
  useComponentTracking('MyComponent', {
    variant: 'default',
    userId: user.id
  })
  
  return <div>Component content</div>
}
```

### Performance Monitoring

```typescript
import { usePerformanceTracking } from '@/lib/analytics/use-dashboard-analytics'

export function MyComponent() {
  const { measureApiCall } = usePerformanceTracking('MyComponent')
  
  const fetchData = async () => {
    // Automatically measures API call performance
    const data = await measureApiCall(() => 
      fetch('/api/data').then(r => r.json())
    )
    return data
  }
  
  return <div>Component content</div>
}
```

### Error Tracking

```typescript
import { useErrorTracking } from '@/lib/analytics/use-dashboard-analytics'

export function MyComponent() {
  const { trackError } = useErrorTracking('MyComponent')
  
  const handleAction = async () => {
    try {
      await riskyOperation()
    } catch (error) {
      trackError(error as Error, {
        action: 'riskyOperation',
        userId: user.id
      })
    }
  }
  
  return <button onClick={handleAction}>Do Something</button>
}
```

### Time Tracking

```typescript
import { useTimeTracking } from '@/lib/analytics/use-dashboard-analytics'

export function MyComponent() {
  // Automatically tracks time spent on component
  useTimeTracking('MyComponent')
  
  return <div>Component content</div>
}
```

## API Routes

### POST /api/analytics/track

Track a dashboard event.

**Request Body**:
```json
{
  "sessionId": "session_123",
  "eventType": "click",
  "component": "HeroWelcomeSection",
  "action": "cta_clicked",
  "metadata": {
    "buttonText": "Continue Learning"
  },
  "timestamp": "2026-02-07T10:30:00Z"
}
```

### POST /api/analytics/session

Store session engagement metrics.

**Request Body**:
```json
{
  "sessionId": "session_123",
  "timeSpent": 120000,
  "componentsViewed": ["HeroWelcomeSection", "EnhancedStatsGrid"],
  "interactionsCount": 15,
  "navigationPath": ["/dashboard", "/lessons"],
  "featureUsage": {
    "HeroWelcomeSection:cta_clicked": 2,
    "EnhancedStatsGrid:card_clicked": 3
  },
  "timestamp": "2026-02-07T10:32:00Z"
}
```

### POST /api/analytics/performance

Store performance metrics.

**Request Body**:
```json
{
  "component": "EnhancedStatsGrid",
  "loadTime": 45.2,
  "renderTime": 12.8,
  "apiResponseTime": 150.5,
  "errorCount": 0,
  "timestamp": "2026-02-07T10:30:00Z"
}
```

### POST /api/analytics/errors

Track an error.

**Request Body**:
```json
{
  "component": "LearningPath",
  "message": "Failed to fetch lessons",
  "stack": "Error: Failed to fetch...",
  "context": {
    "userId": "user_123",
    "action": "fetchLessons"
  },
  "timestamp": "2026-02-07T10:30:00Z"
}
```

## Database Schema

### dashboard_analytics_events

Stores individual user interaction events.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | TEXT | User identifier |
| session_id | TEXT | Session identifier |
| event_type | TEXT | Type of event (click, hover, view, etc.) |
| component | TEXT | Component name |
| action | TEXT | Action performed |
| metadata | JSONB | Additional event data |
| timestamp | TIMESTAMP | Event timestamp |

### dashboard_analytics_sessions

Stores aggregated session-level metrics.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | TEXT | User identifier |
| session_id | TEXT | Session identifier |
| time_spent | INTEGER | Time spent in milliseconds |
| components_viewed | TEXT[] | List of viewed components |
| interactions_count | INTEGER | Number of interactions |
| navigation_path | TEXT[] | Navigation history |
| feature_usage | JSONB | Feature usage counts |
| timestamp | TIMESTAMP | Session end timestamp |

### dashboard_performance_metrics

Stores component performance measurements.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | TEXT | User identifier |
| component | TEXT | Component name |
| load_time | NUMERIC | Load time in milliseconds |
| render_time | NUMERIC | Render time in milliseconds |
| api_response_time | NUMERIC | API response time in milliseconds |
| error_count | INTEGER | Number of errors |
| timestamp | TIMESTAMP | Measurement timestamp |

### dashboard_errors

Stores error occurrences.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | TEXT | User identifier |
| component | TEXT | Component name |
| error_message | TEXT | Error message |
| error_stack | TEXT | Error stack trace |
| context | JSONB | Additional context |
| timestamp | TIMESTAMP | Error timestamp |
| resolved | BOOLEAN | Whether error is resolved |

## Admin Dashboard

Access the admin dashboard at `/admin/dashboard-analytics` to view:

- Total sessions and engagement metrics
- Average time spent and interactions
- Performance metrics (load time, render time, API time)
- Error tracking and rates
- Most viewed components
- Most used features
- Recent errors with details

## Best Practices

1. **Privacy**: Analytics respects user privacy and doesn't track sensitive data
2. **Performance**: Analytics runs asynchronously and doesn't block UI
3. **Error Handling**: Analytics failures don't affect user experience
4. **Data Retention**: Consider implementing data retention policies
5. **Sampling**: For high-traffic applications, consider sampling events

## Configuration

### Environment Variables

No additional environment variables required. Uses existing Supabase and Clerk configuration.

### Opt-out

Users can opt out of analytics tracking by:
1. Disabling analytics in user preferences
2. Using browser Do Not Track settings

## Troubleshooting

### Events Not Being Tracked

1. Check browser console for errors
2. Verify API routes are accessible
3. Check Supabase connection
4. Verify user authentication

### Performance Impact

Analytics is designed to have minimal performance impact:
- Events are sent asynchronously
- Failed requests don't retry excessively
- Data is batched when possible

### Database Issues

If analytics tables don't exist:
1. Run the migration: `src/lib/database/migrations/dashboard-analytics.sql`
2. Verify Row Level Security policies
3. Check user permissions

## Future Enhancements

- [ ] Real-time analytics dashboard
- [ ] Custom event types
- [ ] A/B testing integration
- [ ] Funnel analysis
- [ ] Cohort analysis
- [ ] Export analytics data
- [ ] Automated alerts for anomalies
- [ ] Integration with external analytics services

---

**Last Updated**: February 2026
**Version**: 1.0.0

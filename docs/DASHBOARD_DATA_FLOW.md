# Dashboard Data Flow and State Management

## Overview

This document describes the data flow architecture, state management patterns, and API integration for the Codo dashboard.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Dashboard Page (Server Component)              │ │
│  │  - Initial data fetch from Supabase                         │ │
│  │  - Server-side rendering for performance                    │ │
│  │  - Authentication check via Clerk                           │ │
│  └────────────────────┬───────────────────────────────────────┘ │
│                       │                                           │
│                       ▼                                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         ResponsiveDashboard (Client Component)              │ │
│  │  - Receives initialData from server                         │ │
│  │  - Manages client-side state                                │ │
│  │  - Handles real-time updates                                │ │
│  │  - Coordinates child components                             │ │
│  └────────────────────┬───────────────────────────────────────┘ │
│                       │                                           │
│                       ▼                                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Child Components (Presentational)              │ │
│  │  - HeroWelcomeSection                                       │ │
│  │  - EnhancedStatsGrid                                        │ │
│  │  - AIPeerCards                                              │ │
│  │  - LearningPath                                             │ │
│  │  - RecommendedLessons                                       │ │
│  │  - EnhancedActivityFeed                                     │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                       │                    ▲
                       │ API Requests       │ Real-time Updates
                       ▼                    │
┌─────────────────────────────────────────────────────────────────┐
│                      Backend Services                            │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐│
│  │  API Routes      │  │  Database Ops    │  │  Real-time     ││
│  │  /api/dashboard  │  │  dashboard-ops   │  │  dashboard-sync││
│  │  /api/activities │  │  Supabase        │  │  WebSocket     ││
│  │  /api/insights   │  │  PostgreSQL      │  │  Polling       ││
│  └──────────────────┘  └──────────────────┘  └────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Patterns

### 1. Initial Page Load (Server-Side)

```typescript
// src/app/(auth)/dashboard/page.tsx
export default async function DashboardPage() {
  // 1. Authenticate user
  const { userId } = auth()
  
  if (!userId) {
    redirect('/sign-in')
  }
  
  // 2. Fetch initial data server-side
  const dashboardData = await getDashboardData(userId)
  
  // 3. Pass data to client component
  return <ResponsiveDashboard initialData={dashboardData} />
}
```

**Benefits**:
- Fast initial render (server-side)
- SEO-friendly
- No loading spinner on first load
- Reduced client-side JavaScript

### 2. Client-Side State Management

```typescript
// src/app/(auth)/dashboard/components/ResponsiveDashboard.tsx
'use client'

export function ResponsiveDashboard({ initialData }) {
  // Local state for dashboard data
  const [data, setData] = useState(initialData)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  // Real-time updates via polling
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const updates = await fetchDashboardUpdates()
        setData(prev => mergeUpdates(prev, updates))
      } catch (err) {
        setError(err)
      }
    }, 30000) // Poll every 30 seconds
    
    return () => clearInterval(interval)
  }, [])
  
  // Real-time updates via WebSocket
  useDashboardSync(userId, (update) => {
    setData(prev => applyUpdate(prev, update))
  })
  
  return (
    <div className="dashboard-container">
      {error && <ErrorBanner error={error} />}
      <HeroWelcomeSection {...data.hero} />
      <EnhancedStatsGrid {...data.stats} />
      {/* ... other components */}
    </div>
  )
}
```

### 3. Optimistic Updates

```typescript
// Example: Dismissing an insight
const handleDismissInsight = async (insightId: string) => {
  // 1. Optimistically update UI
  const previousInsights = insights
  setInsights(prev => prev.filter(i => i.id !== insightId))
  
  try {
    // 2. Send request to server
    await fetch(`/api/insights/dismiss`, {
      method: 'POST',
      body: JSON.stringify({ insightId })
    })
  } catch (error) {
    // 3. Rollback on error
    setInsights(previousInsights)
    showErrorToast('Failed to dismiss insight')
  }
}
```

### 4. Real-time Synchronization

```typescript
// src/lib/realtime/dashboard-sync.ts
import { createClient } from '@/lib/supabase/client'

export function useDashboardSync(
  userId: string,
  onUpdate: (update: DashboardUpdate) => void
) {
  const supabase = createClient()
  
  useEffect(() => {
    // Subscribe to database changes
    const channel = supabase
      .channel(`dashboard:${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'learning_activities',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        onUpdate({
          type: 'activity',
          data: payload.new
        })
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_learning_stats',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        onUpdate({
          type: 'stats',
          data: payload.new
        })
      })
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, onUpdate])
}
```

## API Integration

### Dashboard Data Endpoint

**Endpoint**: `GET /api/dashboard`

**Response Structure**:
```typescript
{
  hero: {
    userName: string
    currentProgress: number
    streak: number
    xp: number
    achievements: number
    aiPeerMessage: {
      peer: AIPeerProfile
      message: string
    }
  },
  stats: {
    learningProgress: {
      percentage: number
      lessonsCompleted: number
      trend: 'up' | 'down' | 'stable'
      trendValue: number
    },
    streak: {
      current: number
      best: number
      trend: 'up' | 'down' | 'stable'
    },
    skillsMastered: {
      count: number
      recentSkills: string[]
      monthlyProgress: number
    },
    codingTime: {
      hoursThisWeek: number
      dailyAverage: number
      weeklyComparison: number
    }
  },
  peers: Array<{
    profile: AIPeerProfile
    status: 'online' | 'coding' | 'away' | 'studying'
    specialty: string
    level: number
    recentMessage?: {
      content: string
      timestamp: Date
    }
  }>,
  learningPath: {
    currentTrack: {
      name: string
      progress: number
      estimatedCompletion: string
    },
    lessons: Array<LessonData>,
    nextMilestone: MilestoneData
  },
  recommendations: Array<RecommendationData>,
  activities: Array<ActivityData>
}
```

**Implementation**:
```typescript
// src/app/api/dashboard/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { getDashboardData } from '@/lib/database/dashboard-operations'

export async function GET(request: Request) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const data = await getDashboardData(userId)
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'private, max-age=60'
      }
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Database Operations

```typescript
// src/lib/database/dashboard-operations.ts
import { createClient } from '@/lib/supabase/server'

export async function getDashboardData(userId: string) {
  const supabase = createClient()
  
  // Parallel data fetching for performance
  const [
    profile,
    stats,
    peers,
    learningPath,
    recommendations,
    activities
  ] = await Promise.all([
    getUserProfile(supabase, userId),
    getLearningStats(supabase, userId),
    getAIPeerStatus(supabase, userId),
    getLearningPath(supabase, userId),
    getRecommendations(supabase, userId),
    getRecentActivities(supabase, userId)
  ])
  
  return {
    hero: {
      userName: profile.name,
      currentProgress: stats.progress,
      streak: stats.streak,
      xp: stats.xp,
      achievements: stats.achievements,
      aiPeerMessage: await getAIPeerMessage(userId)
    },
    stats: {
      learningProgress: stats.learningProgress,
      streak: stats.streakData,
      skillsMastered: stats.skills,
      codingTime: stats.codingTime
    },
    peers,
    learningPath,
    recommendations,
    activities
  }
}
```

## State Management Patterns

### 1. Server State (React Query Pattern)

For data that comes from the server:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000 // Refetch every minute
  })
}

export function useDismissInsight() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: dismissInsight,
    onMutate: async (insightId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['dashboard'] })
      const previous = queryClient.getQueryData(['dashboard'])
      
      queryClient.setQueryData(['dashboard'], (old) => ({
        ...old,
        insights: old.insights.filter(i => i.id !== insightId)
      }))
      
      return { previous }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['dashboard'], context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}
```

### 2. UI State (Local State)

For UI-only state (modals, dropdowns, etc.):

```typescript
export function DashboardComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPeer, setSelectedPeer] = useState<string | null>(null)
  
  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>
        Open Modal
      </button>
      
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          {/* Modal content */}
        </Modal>
      )}
    </div>
  )
}
```

### 3. Global State (Context)

For state shared across multiple components:

```typescript
// src/contexts/DashboardContext.tsx
const DashboardContext = createContext<DashboardContextType | null>(null)

export function DashboardProvider({ children, initialData }) {
  const [data, setData] = useState(initialData)
  const [filters, setFilters] = useState({})
  
  const value = {
    data,
    setData,
    filters,
    setFilters,
    refreshData: async () => {
      const updated = await fetchDashboardData()
      setData(updated)
    }
  }
  
  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider')
  }
  return context
}
```

## Caching Strategy

### 1. Server-Side Caching

```typescript
// Cache dashboard data for 60 seconds
export const revalidate = 60

export default async function DashboardPage() {
  const data = await getDashboardData(userId)
  return <ResponsiveDashboard initialData={data} />
}
```

### 2. Client-Side Caching

```typescript
// src/lib/cache/dashboard-cache.ts
const cache = new Map<string, { data: any; timestamp: number }>()

export function getCachedData(key: string, maxAge: number = 60000) {
  const cached = cache.get(key)
  
  if (!cached) return null
  
  const age = Date.now() - cached.timestamp
  if (age > maxAge) {
    cache.delete(key)
    return null
  }
  
  return cached.data
}

export function setCachedData(key: string, data: any) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  })
}
```

### 3. API Response Caching

```typescript
// src/app/api/dashboard/route.ts
export async function GET(request: Request) {
  const data = await getDashboardData(userId)
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'private, max-age=60, stale-while-revalidate=120'
    }
  })
}
```

## Error Handling

### 1. API Error Handling

```typescript
async function fetchDashboardData() {
  try {
    const response = await fetch('/api/dashboard')
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
    throw error
  }
}
```

### 2. Component Error Boundaries

```typescript
// src/components/ErrorBoundary.tsx
export class DashboardErrorBoundary extends React.Component {
  state = { hasError: false, error: null }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Dashboard error:', error, errorInfo)
    // Log to error tracking service
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <button onClick={() => window.location.reload()}>
            Reload Dashboard
          </button>
        </div>
      )
    }
    
    return this.props.children
  }
}
```

### 3. Graceful Degradation

```typescript
export function ResponsiveDashboard({ initialData }) {
  const [data, setData] = useState(initialData)
  const [error, setError] = useState(null)
  
  if (error) {
    return (
      <div className="dashboard-error">
        <p>Unable to load dashboard. Using cached data.</p>
        <DashboardContent data={data} isStale={true} />
      </div>
    )
  }
  
  return <DashboardContent data={data} />
}
```

## Performance Optimization

### 1. Data Fetching Optimization

```typescript
// Parallel fetching
const [stats, activities] = await Promise.all([
  getStats(userId),
  getActivities(userId)
])

// Sequential fetching (when dependent)
const profile = await getProfile(userId)
const preferences = await getPreferences(profile.id)
```

### 2. Component Memoization

```typescript
import { memo } from 'react'

export const EnhancedStatsGrid = memo(function EnhancedStatsGrid(props) {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.stats === nextProps.stats
})
```

### 3. Lazy Loading

```typescript
import dynamic from 'next/dynamic'

const EnhancedActivityFeed = dynamic(
  () => import('./EnhancedActivityFeed'),
  {
    loading: () => <ActivityFeedSkeleton />,
    ssr: false
  }
)
```

## Testing Data Flow

### 1. Mock API Responses

```typescript
// src/__mocks__/dashboard-api.ts
export const mockDashboardData = {
  hero: {
    userName: 'Test User',
    currentProgress: 65,
    streak: 7,
    xp: 2450,
    achievements: 12
  },
  // ... rest of mock data
}

export async function fetchDashboardData() {
  return Promise.resolve(mockDashboardData)
}
```

### 2. Test Real-time Updates

```typescript
describe('Dashboard Real-time Updates', () => {
  it('updates stats when activity is completed', async () => {
    const { rerender } = render(<ResponsiveDashboard initialData={mockData} />)
    
    // Simulate activity completion
    act(() => {
      mockWebSocket.emit('activity_completed', {
        xp: 100,
        activity: 'lesson'
      })
    })
    
    await waitFor(() => {
      expect(screen.getByText('2550 XP')).toBeInTheDocument()
    })
  })
})
```

---

**Last Updated**: February 2026
**Version**: 1.0.0

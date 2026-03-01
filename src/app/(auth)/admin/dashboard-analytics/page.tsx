/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Admin Dashboard Analytics Page
 * 
 * Displays analytics and monitoring data for the dashboard
 */

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'

async function getDashboardAnalytics() {
  const supabase = await createServerClient()
  
  // Get analytics summary
  const [eventsResult, sessionsResult, performanceResult, errorsResult] = await Promise.all([
    supabase
      .from('dashboard_analytics_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100),
    supabase
      .from('dashboard_analytics_sessions')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50),
    supabase
      .from('dashboard_performance_metrics')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100),
    supabase
      .from('dashboard_errors')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50)
  ])
  
  return {
    events: eventsResult.data || [],
    sessions: sessionsResult.data || [],
    performance: performanceResult.data || [],
    errors: errorsResult.data || []
  }
}

function calculateMetrics(data: any) {
  const { events, sessions, performance, errors } = data
  
  // Calculate engagement metrics
  const totalSessions = sessions.length
  const avgTimeSpent = sessions.reduce((sum: number, s: any) => sum + (s.time_spent || 0), 0) / totalSessions || 0
  const avgInteractions = sessions.reduce((sum: number, s: any) => sum + (s.interactions_count || 0), 0) / totalSessions || 0
  
  // Calculate performance metrics
  const avgLoadTime = performance.reduce((sum: number, p: any) => sum + (p.load_time || 0), 0) / performance.length || 0
  const avgRenderTime = performance.reduce((sum: number, p: any) => sum + (p.render_time || 0), 0) / performance.length || 0
  const avgApiTime = performance.reduce((sum: number, p: any) => sum + (p.api_response_time || 0), 0) / performance.length || 0
  
  // Calculate error rate
  const totalErrors = errors.length
  const errorRate = (totalErrors / totalSessions) * 100 || 0
  
  // Most viewed components
  const componentViews = events
    .filter((e: any) => e.event_type === 'view')
    .reduce((acc: any, e: any) => {
      acc[e.component] = (acc[e.component] || 0) + 1
      return acc
    }, {})
  
  const topComponents = Object.entries(componentViews)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 5)
  
  // Most used features
  const featureUsage = sessions.reduce((acc: any, s: any) => {
    const usage = s.feature_usage || {}
    Object.entries(usage).forEach(([feature, count]) => {
      acc[feature] = (acc[feature] || 0) + (count as number)
    })
    return acc
  }, {})
  
  const topFeatures = Object.entries(featureUsage)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 5)
  
  return {
    engagement: {
      totalSessions,
      avgTimeSpent: Math.round(avgTimeSpent / 1000), // Convert to seconds
      avgInteractions: Math.round(avgInteractions)
    },
    performance: {
      avgLoadTime: avgLoadTime.toFixed(2),
      avgRenderTime: avgRenderTime.toFixed(2),
      avgApiTime: avgApiTime.toFixed(2)
    },
    errors: {
      totalErrors,
      errorRate: errorRate.toFixed(2)
    },
    topComponents,
    topFeatures
  }
}

export default async function DashboardAnalyticsPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }
  
  // TODO: Add admin role check
  // For now, any authenticated user can access
  
  const data = await getDashboardAnalytics()
  const metrics = calculateMetrics(data)
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Monitor dashboard usage, performance, and system health
        </p>
      </div>
      
      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Sessions
          </h3>
          <p className="text-3xl font-bold mt-2">{metrics.engagement.totalSessions}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Avg Time Spent
          </h3>
          <p className="text-3xl font-bold mt-2">{metrics.engagement.avgTimeSpent}s</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Avg Interactions
          </h3>
          <p className="text-3xl font-bold mt-2">{metrics.engagement.avgInteractions}</p>
        </Card>
      </div>
      
      {/* Performance Metrics */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Load Time</p>
            <p className="text-2xl font-bold">{metrics.performance.avgLoadTime}ms</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Render Time</p>
            <p className="text-2xl font-bold">{metrics.performance.avgRenderTime}ms</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg API Time</p>
            <p className="text-2xl font-bold">{metrics.performance.avgApiTime}ms</p>
          </div>
        </div>
      </Card>
      
      {/* Error Metrics */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Error Tracking</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Errors</p>
            <p className="text-2xl font-bold text-red-600">{metrics.errors.totalErrors}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Error Rate</p>
            <p className="text-2xl font-bold text-red-600">{metrics.errors.errorRate}%</p>
          </div>
        </div>
      </Card>
      
      {/* Top Components */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Most Viewed Components</h2>
        <div className="space-y-2">
          {metrics.topComponents.map(([component, views]: any) => (
            <div key={component} className="flex justify-between items-center">
              <span className="font-medium">{component}</span>
              <span className="text-gray-600 dark:text-gray-400">{views} views</span>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Top Features */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Most Used Features</h2>
        <div className="space-y-2">
          {metrics.topFeatures.map(([feature, usage]: any) => (
            <div key={feature} className="flex justify-between items-center">
              <span className="font-medium">{feature}</span>
              <span className="text-gray-600 dark:text-gray-400">{usage} uses</span>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Recent Errors */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Errors</h2>
        <div className="space-y-4">
          {data.errors.slice(0, 10).map((error: any) => (
            <div key={error.id} className="border-l-4 border-red-500 pl-4">
              <p className="font-medium">{error.component}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{error.error_message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(error.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

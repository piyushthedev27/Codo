/**
 * React hooks for dashboard analytics
 */

'use client'

import { useEffect, useRef, useCallback } from 'react'
import {
  initializeAnalytics,
  getAnalytics,
  getPerformanceMonitor,
  getErrorTracker,
  type DashboardEvent
} from './dashboard-analytics'

/**
 * Hook to initialize and use dashboard analytics
 */
export function useDashboardAnalytics(userId: string) {
  const analyticsRef = useRef(initializeAnalytics(userId))
  
  useEffect(() => {
    const analytics = analyticsRef.current
    
    // Flush analytics on unmount or page unload
    const handleUnload = () => {
      analytics.flush()
    }
    
    window.addEventListener('beforeunload', handleUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleUnload)
      analytics.flush()
    }
  }, [])
  
  const trackEvent = useCallback((
    eventType: DashboardEvent['eventType'],
    component: string,
    action: string,
    metadata?: Record<string, any>
  ) => {
    analyticsRef.current.trackEvent(eventType, component, action, metadata)
  }, [])
  
  const trackComponentView = useCallback((component: string, metadata?: Record<string, any>) => {
    analyticsRef.current.trackComponentView(component, metadata)
  }, [])
  
  const trackInteraction = useCallback((component: string, action: string, metadata?: Record<string, any>) => {
    analyticsRef.current.trackInteraction(component, action, metadata)
  }, [])
  
  const trackNavigation = useCallback((from: string, to: string) => {
    analyticsRef.current.trackNavigation(from, to)
  }, [])
  
  return {
    trackEvent,
    trackComponentView,
    trackInteraction,
    trackNavigation,
    getMetrics: () => analyticsRef.current.getEngagementMetrics()
  }
}

/**
 * Hook to track component view automatically
 */
export function useComponentTracking(componentName: string, metadata?: Record<string, any>) {
  useEffect(() => {
    const analytics = getAnalytics()
    if (analytics) {
      analytics.trackComponentView(componentName, metadata)
    }
  }, [componentName, metadata])
}

/**
 * Hook to measure component performance
 */
export function usePerformanceTracking(componentName: string) {
  const performanceMonitor = getPerformanceMonitor()
  
  useEffect(() => {
    const measureRender = performanceMonitor.measureRenderTime(componentName)
    return measureRender
  }, [componentName, performanceMonitor])
  
  const measureApiCall = useCallback(
    async <T,>(apiCall: () => Promise<T>): Promise<T> => {
      return performanceMonitor.measureApiCall(componentName, apiCall)
    },
    [componentName, performanceMonitor]
  )
  
  return { measureApiCall }
}

/**
 * Hook to track errors in components
 */
export function useErrorTracking(componentName: string) {
  const errorTracker = getErrorTracker()
  
  const trackError = useCallback((error: Error, context?: Record<string, any>) => {
    errorTracker.trackError(componentName, error, context)
  }, [componentName, errorTracker])
  
  return { trackError }
}

/**
 * Hook to track user interactions with automatic event handling
 */
export function useInteractionTracking(componentName: string) {
  const analytics = getAnalytics()
  
  const trackClick = useCallback((action: string, metadata?: Record<string, any>) => {
    if (analytics) {
      analytics.trackEvent('click', componentName, action, metadata)
    }
  }, [componentName, analytics])
  
  const trackHover = useCallback((action: string, metadata?: Record<string, any>) => {
    if (analytics) {
      analytics.trackEvent('hover', componentName, action, metadata)
    }
  }, [componentName, analytics])
  
  return { trackClick, trackHover }
}

/**
 * Hook to track time spent on a component
 */
export function useTimeTracking(componentName: string) {
  const startTimeRef = useRef<number>(Date.now())
  const analytics = getAnalytics()
  
  useEffect(() => {
    startTimeRef.current = Date.now()
    
    return () => {
      const timeSpent = Date.now() - startTimeRef.current
      if (analytics) {
        analytics.trackEvent('view', componentName, 'time_spent', {
          duration: timeSpent,
          durationSeconds: Math.round(timeSpent / 1000)
        })
      }
    }
  }, [componentName, analytics])
}

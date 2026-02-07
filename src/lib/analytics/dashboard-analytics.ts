/**
 * Dashboard Analytics System
 * 
 * Tracks user interactions, engagement metrics, and performance data
 * for the modernized dashboard.
 */

export interface DashboardEvent {
  eventType: 'click' | 'hover' | 'view' | 'interaction' | 'navigation'
  component: string
  action: string
  metadata?: Record<string, any>
  timestamp: Date
  userId: string
  sessionId: string
}

export interface EngagementMetrics {
  userId: string
  sessionId: string
  timeSpent: number // milliseconds
  componentsViewed: string[]
  interactionsCount: number
  navigationPath: string[]
  featureUsage: Record<string, number>
  timestamp: Date
}

export interface PerformanceMetrics {
  component: string
  loadTime: number
  renderTime: number
  apiResponseTime?: number
  errorCount: number
  timestamp: Date
}

/**
 * Analytics tracker class for dashboard events
 */
export class DashboardAnalytics {
  private events: DashboardEvent[] = []
  private sessionId: string
  private userId: string
  private sessionStart: number
  private componentsViewed: Set<string> = new Set()
  private navigationPath: string[] = []
  private featureUsage: Map<string, number> = new Map()
  
  constructor(userId: string) {
    this.userId = userId
    this.sessionId = this.generateSessionId()
    this.sessionStart = Date.now()
    
    // Initialize session tracking
    this.initializeTracking()
  }
  
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  private initializeTracking() {
    // Track page visibility
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.trackEvent('view', 'dashboard', 'page_hidden')
        } else {
          this.trackEvent('view', 'dashboard', 'page_visible')
        }
      })
    }
  }
  
  /**
   * Track a dashboard event
   */
  trackEvent(
    eventType: DashboardEvent['eventType'],
    component: string,
    action: string,
    metadata?: Record<string, any>
  ) {
    const event: DashboardEvent = {
      eventType,
      component,
      action,
      metadata,
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.sessionId
    }
    
    this.events.push(event)
    
    // Update tracking metrics
    this.componentsViewed.add(component)
    
    if (eventType === 'navigation') {
      this.navigationPath.push(action)
    }
    
    // Update feature usage
    const featureKey = `${component}:${action}`
    this.featureUsage.set(featureKey, (this.featureUsage.get(featureKey) || 0) + 1)
    
    // Send to analytics service (async, non-blocking)
    this.sendToAnalytics(event).catch(console.error)
  }
  
  /**
   * Track component view
   */
  trackComponentView(component: string, metadata?: Record<string, any>) {
    this.trackEvent('view', component, 'viewed', metadata)
  }
  
  /**
   * Track user interaction
   */
  trackInteraction(component: string, action: string, metadata?: Record<string, any>) {
    this.trackEvent('interaction', component, action, metadata)
  }
  
  /**
   * Track navigation
   */
  trackNavigation(from: string, to: string) {
    this.trackEvent('navigation', 'dashboard', 'navigate', { from, to })
  }
  
  /**
   * Get engagement metrics for current session
   */
  getEngagementMetrics(): EngagementMetrics {
    return {
      userId: this.userId,
      sessionId: this.sessionId,
      timeSpent: Date.now() - this.sessionStart,
      componentsViewed: Array.from(this.componentsViewed),
      interactionsCount: this.events.filter(e => e.eventType === 'interaction').length,
      navigationPath: this.navigationPath,
      featureUsage: Object.fromEntries(this.featureUsage),
      timestamp: new Date()
    }
  }
  
  /**
   * Send event to analytics service
   */
  private async sendToAnalytics(event: DashboardEvent) {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      })
    } catch (error) {
      // Fail silently - analytics should not break user experience
      console.error('Analytics tracking error:', error)
    }
  }
  
  /**
   * Flush all pending events
   */
  async flush() {
    const metrics = this.getEngagementMetrics()
    
    try {
      await fetch('/api/analytics/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics)
      })
    } catch (error) {
      console.error('Failed to flush analytics:', error)
    }
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  
  /**
   * Measure component load time
   */
  measureLoadTime(component: string): () => void {
    const start = performance.now()
    
    return () => {
      const loadTime = performance.now() - start
      this.recordMetric({
        component,
        loadTime,
        renderTime: 0,
        errorCount: 0,
        timestamp: new Date()
      })
    }
  }
  
  /**
   * Measure component render time
   */
  measureRenderTime(component: string): () => void {
    const start = performance.now()
    
    return () => {
      const renderTime = performance.now() - start
      
      if (renderTime > 16) { // Slower than 60fps
        console.warn(`${component} render took ${renderTime.toFixed(2)}ms (>16ms)`)
      }
      
      this.recordMetric({
        component,
        loadTime: 0,
        renderTime,
        errorCount: 0,
        timestamp: new Date()
      })
    }
  }
  
  /**
   * Measure API response time
   */
  async measureApiCall<T>(
    component: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    const start = performance.now()
    
    try {
      const result = await apiCall()
      const apiResponseTime = performance.now() - start
      
      this.recordMetric({
        component,
        loadTime: 0,
        renderTime: 0,
        apiResponseTime,
        errorCount: 0,
        timestamp: new Date()
      })
      
      return result
    } catch (error) {
      const apiResponseTime = performance.now() - start
      
      this.recordMetric({
        component,
        loadTime: 0,
        renderTime: 0,
        apiResponseTime,
        errorCount: 1,
        timestamp: new Date()
      })
      
      throw error
    }
  }
  
  /**
   * Record a performance metric
   */
  private recordMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric)
    
    // Send to monitoring service
    this.sendToMonitoring(metric).catch(console.error)
  }
  
  /**
   * Send metric to monitoring service
   */
  private async sendToMonitoring(metric: PerformanceMetrics) {
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric)
      })
    } catch (error) {
      console.error('Performance monitoring error:', error)
    }
  }
  
  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return this.metrics
  }
  
  /**
   * Get average metrics by component
   */
  getAverageMetrics(component: string) {
    const componentMetrics = this.metrics.filter(m => m.component === component)
    
    if (componentMetrics.length === 0) {
      return null
    }
    
    const sum = componentMetrics.reduce((acc, m) => ({
      loadTime: acc.loadTime + m.loadTime,
      renderTime: acc.renderTime + m.renderTime,
      apiResponseTime: acc.apiResponseTime + (m.apiResponseTime || 0),
      errorCount: acc.errorCount + m.errorCount
    }), { loadTime: 0, renderTime: 0, apiResponseTime: 0, errorCount: 0 })
    
    return {
      component,
      avgLoadTime: sum.loadTime / componentMetrics.length,
      avgRenderTime: sum.renderTime / componentMetrics.length,
      avgApiResponseTime: sum.apiResponseTime / componentMetrics.length,
      totalErrors: sum.errorCount,
      sampleSize: componentMetrics.length
    }
  }
}

/**
 * Error tracking utilities
 */
export class ErrorTracker {
  private errors: Array<{
    component: string
    error: Error
    context?: Record<string, any>
    timestamp: Date
  }> = []
  
  /**
   * Track an error
   */
  trackError(component: string, error: Error, context?: Record<string, any>) {
    const errorRecord = {
      component,
      error,
      context,
      timestamp: new Date()
    }
    
    this.errors.push(errorRecord)
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${component}]`, error, context)
    }
    
    // Send to error tracking service
    this.sendToErrorTracking(errorRecord).catch(console.error)
  }
  
  /**
   * Send error to tracking service
   */
  private async sendToErrorTracking(errorRecord: any) {
    try {
      await fetch('/api/analytics/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          component: errorRecord.component,
          message: errorRecord.error.message,
          stack: errorRecord.error.stack,
          context: errorRecord.context,
          timestamp: errorRecord.timestamp
        })
      })
    } catch (error) {
      console.error('Error tracking failed:', error)
    }
  }
  
  /**
   * Get all tracked errors
   */
  getErrors() {
    return this.errors
  }
  
  /**
   * Get errors by component
   */
  getErrorsByComponent(component: string) {
    return this.errors.filter(e => e.component === component)
  }
}

// Singleton instances
let analyticsInstance: DashboardAnalytics | null = null
let performanceInstance: PerformanceMonitor | null = null
let errorTrackerInstance: ErrorTracker | null = null

/**
 * Initialize analytics for a user
 */
export function initializeAnalytics(userId: string): DashboardAnalytics {
  if (!analyticsInstance || analyticsInstance['userId'] !== userId) {
    analyticsInstance = new DashboardAnalytics(userId)
  }
  return analyticsInstance
}

/**
 * Get analytics instance
 */
export function getAnalytics(): DashboardAnalytics | null {
  return analyticsInstance
}

/**
 * Get performance monitor instance
 */
export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceInstance) {
    performanceInstance = new PerformanceMonitor()
  }
  return performanceInstance
}

/**
 * Get error tracker instance
 */
export function getErrorTracker(): ErrorTracker {
  if (!errorTrackerInstance) {
    errorTrackerInstance = new ErrorTracker()
  }
  return errorTrackerInstance
}

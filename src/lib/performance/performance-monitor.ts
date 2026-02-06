/**
 * Performance Monitoring System
 * Tracks page load times, component render times, and user interactions
 */

// Performance metrics interface
export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  
  // Navigation timing
  domContentLoaded?: number
  loadComplete?: number
  firstPaint?: number
  firstContentfulPaint?: number
  
  // Custom metrics
  timeToInteractive?: number
  componentRenderTime?: number
  apiResponseTime?: number
  
  // Page specific
  pageName: string
  timestamp: number
  userAgent: string
  connectionType?: string
}

// Performance thresholds (in milliseconds)
export const PERFORMANCE_THRESHOLDS = {
  LCP: 2500,        // Good: < 2.5s
  FID: 100,         // Good: < 100ms
  CLS: 0.1,         // Good: < 0.1
  PAGE_LOAD: 2000,  // Target: < 2s
  API_RESPONSE: 1000, // Target: < 1s
  COMPONENT_RENDER: 16, // Target: < 16ms (60fps)
} as const

// Performance monitor class
class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private observers: Map<string, PerformanceObserver> = new Map()
  private startTimes: Map<string, number> = new Map()

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers()
      this.setupNavigationTiming()
    }
  }

  // Initialize performance observers
  private initializeObservers() {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          this.recordMetric('lcp', lastEntry.startTime)
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.set('lcp', lcpObserver)
      } catch (error) {
        console.warn('LCP observer not supported:', error)
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            this.recordMetric('fid', entry.processingStart - entry.startTime)
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
        this.observers.set('fid', fidObserver)
      } catch (error) {
        console.warn('FID observer not supported:', error)
      }

      // Cumulative Layout Shift
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          this.recordMetric('cls', clsValue)
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.set('cls', clsObserver)
      } catch (error) {
        console.warn('CLS observer not supported:', error)
      }

      // Paint timing
      try {
        const paintObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            if (entry.name === 'first-paint') {
              this.recordMetric('firstPaint', entry.startTime)
            } else if (entry.name === 'first-contentful-paint') {
              this.recordMetric('firstContentfulPaint', entry.startTime)
            }
          })
        })
        paintObserver.observe({ entryTypes: ['paint'] })
        this.observers.set('paint', paintObserver)
      } catch (error) {
        console.warn('Paint observer not supported:', error)
      }
    }
  }

  // Setup navigation timing
  private setupNavigationTiming() {
    if ('performance' in window && 'timing' in window.performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const timing = window.performance.timing
          const navigation = window.performance.navigation

          const metrics = {
            domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
            loadComplete: timing.loadEventEnd - timing.navigationStart,
            timeToInteractive: this.calculateTimeToInteractive(),
          }

          Object.entries(metrics).forEach(([key, value]) => {
            if (value > 0) {
              this.recordMetric(key as keyof PerformanceMetrics, value)
            }
          })
        }, 0)
      })
    }
  }

  // Calculate Time to Interactive (TTI)
  private calculateTimeToInteractive(): number {
    if (!('performance' in window)) return 0

    const timing = window.performance.timing
    const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart
    
    // Simple TTI approximation - when DOM is ready and no long tasks
    return domContentLoaded
  }

  // Record a performance metric
  private recordMetric(key: keyof PerformanceMetrics, value: number) {
    const currentMetric = this.getCurrentMetric()
    if (currentMetric) {
      (currentMetric as any)[key] = value
    }
  }

  // Get or create current metric entry
  private getCurrentMetric(): PerformanceMetrics | null {
    const pageName = this.getCurrentPageName()
    let metric = this.metrics.find(m => m.pageName === pageName && !m.loadComplete)
    
    if (!metric) {
      metric = {
        pageName,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        connectionType: this.getConnectionType(),
      }
      this.metrics.push(metric)
    }
    
    return metric
  }

  // Get current page name
  private getCurrentPageName(): string {
    if (typeof window === 'undefined') return 'unknown'
    
    const path = window.location.pathname
    if (path === '/') return 'home'
    if (path.startsWith('/dashboard')) return 'dashboard'
    if (path.startsWith('/lessons/')) return 'lesson'
    if (path.startsWith('/coding/')) return 'coding'
    return path.replace(/^\//, '').replace(/\//g, '-') || 'unknown'
  }

  // Get connection type
  private getConnectionType(): string {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      return connection?.effectiveType || 'unknown'
    }
    return 'unknown'
  }

  // Start timing a custom operation
  startTiming(label: string) {
    this.startTimes.set(label, performance.now())
  }

  // End timing a custom operation
  endTiming(label: string): number {
    const startTime = this.startTimes.get(label)
    if (!startTime) return 0
    
    const duration = performance.now() - startTime
    this.startTimes.delete(label)
    
    // Record component render time
    if (label.includes('render')) {
      this.recordMetric('componentRenderTime', duration)
    }
    
    return duration
  }

  // Measure API response time
  async measureAPICall<T>(
    label: string,
    apiCall: () => Promise<T>
  ): Promise<{ data: T; duration: number }> {
    const startTime = performance.now()
    
    try {
      const data = await apiCall()
      const duration = performance.now() - startTime
      
      this.recordMetric('apiResponseTime', duration)
      
      return { data, duration }
    } catch (error) {
      const duration = performance.now() - startTime
      console.warn(`API call ${label} failed after ${duration}ms:`, error)
      throw error
    }
  }

  // Get performance summary
  getPerformanceSummary(pageName?: string): PerformanceMetrics[] {
    if (pageName) {
      return this.metrics.filter(m => m.pageName === pageName)
    }
    return [...this.metrics]
  }

  // Check if performance meets thresholds
  checkPerformanceThresholds(metric: PerformanceMetrics): {
    passed: boolean
    issues: string[]
  } {
    const issues: string[] = []

    if (metric.lcp && metric.lcp > PERFORMANCE_THRESHOLDS.LCP) {
      issues.push(`LCP too slow: ${metric.lcp}ms (target: <${PERFORMANCE_THRESHOLDS.LCP}ms)`)
    }

    if (metric.fid && metric.fid > PERFORMANCE_THRESHOLDS.FID) {
      issues.push(`FID too slow: ${metric.fid}ms (target: <${PERFORMANCE_THRESHOLDS.FID}ms)`)
    }

    if (metric.cls && metric.cls > PERFORMANCE_THRESHOLDS.CLS) {
      issues.push(`CLS too high: ${metric.cls} (target: <${PERFORMANCE_THRESHOLDS.CLS})`)
    }

    if (metric.loadComplete && metric.loadComplete > PERFORMANCE_THRESHOLDS.PAGE_LOAD) {
      issues.push(`Page load too slow: ${metric.loadComplete}ms (target: <${PERFORMANCE_THRESHOLDS.PAGE_LOAD}ms)`)
    }

    if (metric.apiResponseTime && metric.apiResponseTime > PERFORMANCE_THRESHOLDS.API_RESPONSE) {
      issues.push(`API response too slow: ${metric.apiResponseTime}ms (target: <${PERFORMANCE_THRESHOLDS.API_RESPONSE}ms)`)
    }

    return {
      passed: issues.length === 0,
      issues
    }
  }

  // Generate performance report
  generateReport(): {
    summary: {
      totalPages: number
      averageLoadTime: number
      passedThresholds: number
      failedThresholds: number
    }
    details: Array<{
      page: string
      metrics: PerformanceMetrics
      status: 'passed' | 'failed'
      issues: string[]
    }>
  } {
    const details = this.metrics.map(metric => {
      const check = this.checkPerformanceThresholds(metric)
      return {
        page: metric.pageName,
        metrics: metric,
        status: check.passed ? 'passed' as const : 'failed' as const,
        issues: check.issues
      }
    })

    const totalPages = details.length
    const averageLoadTime = details.reduce((sum, d) => sum + (d.metrics.loadComplete || 0), 0) / totalPages
    const passedThresholds = details.filter(d => d.status === 'passed').length
    const failedThresholds = totalPages - passedThresholds

    return {
      summary: {
        totalPages,
        averageLoadTime,
        passedThresholds,
        failedThresholds
      },
      details
    }
  }

  // Clear metrics
  clearMetrics() {
    this.metrics = []
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  React.useEffect(() => {
    const label = `${componentName}-render`
    performanceMonitor.startTiming(label)
    
    return () => {
      performanceMonitor.endTiming(label)
    }
  }, [componentName])

  const measureRender = React.useCallback((callback: () => void) => {
    const label = `${componentName}-update`
    performanceMonitor.startTiming(label)
    callback()
    performanceMonitor.endTiming(label)
  }, [componentName])

  return { measureRender }
}

// Performance testing utilities
export const performanceTest = {
  // Test page load time
  async testPageLoad(url: string): Promise<{
    loadTime: number
    passed: boolean
    metrics: PerformanceMetrics
  }> {
    return new Promise((resolve) => {
      const startTime = performance.now()
      
      // Navigate to page (in testing environment)
      window.location.href = url
      
      window.addEventListener('load', () => {
        setTimeout(() => {
          const loadTime = performance.now() - startTime
          const metrics = performanceMonitor.getCurrentMetric()!
          const check = performanceMonitor.checkPerformanceThresholds(metrics)
          
          resolve({
            loadTime,
            passed: loadTime < PERFORMANCE_THRESHOLDS.PAGE_LOAD,
            metrics
          })
        }, 100)
      }, { once: true })
    })
  },

  // Test component render time
  testComponentRender(component: React.ComponentType, props: any = {}): Promise<{
    renderTime: number
    passed: boolean
  }> {
    return new Promise((resolve) => {
      const startTime = performance.now()
      
      // This would need to be implemented with a testing framework
      // For now, just return a mock result
      const renderTime = Math.random() * 20 // Simulate 0-20ms render time
      
      resolve({
        renderTime,
        passed: renderTime < PERFORMANCE_THRESHOLDS.COMPONENT_RENDER
      })
    })
  },

  // Test API response time
  async testAPIResponse(url: string): Promise<{
    responseTime: number
    passed: boolean
  }> {
    const { duration } = await performanceMonitor.measureAPICall(
      `test-${url}`,
      () => fetch(url).then(r => r.json())
    )

    return {
      responseTime: duration,
      passed: duration < PERFORMANCE_THRESHOLDS.API_RESPONSE
    }
  }
}

import React from 'react'

export default performanceMonitor
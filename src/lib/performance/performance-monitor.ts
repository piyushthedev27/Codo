/**
 * Performance Monitoring Utilities
 * Track and optimize application performance
 */

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  type: 'navigation' | 'resource' | 'measure' | 'paint' | 'custom'
}

interface PerformanceThresholds {
  fcp: number // First Contentful Paint
  lcp: number // Largest Contentful Paint
  fid: number // First Input Delay
  cls: number // Cumulative Layout Shift
  ttfb: number // Time to First Byte
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  fcp: 1800, // 1.8s
  lcp: 2500, // 2.5s
  fid: 100, // 100ms
  cls: 0.1, // 0.1
  ttfb: 600 // 600ms
}

/**
 * Performance Monitor Class
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private thresholds: PerformanceThresholds
  private observers: Map<string, PerformanceObserver> = new Map()

  constructor(thresholds: Partial<PerformanceThresholds> = {}) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds }
    
    if (typeof window !== 'undefined') {
      this.initializeObservers()
    }
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers() {
    // Observe paint timing
    if ('PerformanceObserver' in window) {
      try {
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: entry.name,
              value: entry.startTime,
              timestamp: Date.now(),
              type: 'paint'
            })
          }
        })
        paintObserver.observe({ entryTypes: ['paint'] })
        this.observers.set('paint', paintObserver)
      } catch (e) {
        console.warn('Paint observer not supported')
      }

      // Observe Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          this.recordMetric({
            name: 'largest-contentful-paint',
            value: lastEntry.startTime,
            timestamp: Date.now(),
            type: 'paint'
          })
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.set('lcp', lcpObserver)
      } catch (e) {
        console.warn('LCP observer not supported')
      }

      // Observe First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const fid = (entry as any).processingStart - entry.startTime
            this.recordMetric({
              name: 'first-input-delay',
              value: fid,
              timestamp: Date.now(),
              type: 'custom'
            })
          }
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
        this.observers.set('fid', fidObserver)
      } catch (e) {
        console.warn('FID observer not supported')
      }

      // Observe Layout Shifts
      try {
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
              this.recordMetric({
                name: 'cumulative-layout-shift',
                value: clsValue,
                timestamp: Date.now(),
                type: 'custom'
              })
            }
          }
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.set('cls', clsObserver)
      } catch (e) {
        console.warn('CLS observer not supported')
      }
    }
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric)
    
    // Check against thresholds
    this.checkThreshold(metric)
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${metric.name}: ${metric.value.toFixed(2)}ms`)
    }
  }

  /**
   * Check if metric exceeds threshold
   */
  private checkThreshold(metric: PerformanceMetric) {
    let threshold: number | undefined
    let metricName: string = metric.name

    if (metric.name === 'first-contentful-paint') {
      threshold = this.thresholds.fcp
      metricName = 'FCP'
    } else if (metric.name === 'largest-contentful-paint') {
      threshold = this.thresholds.lcp
      metricName = 'LCP'
    } else if (metric.name === 'first-input-delay') {
      threshold = this.thresholds.fid
      metricName = 'FID'
    } else if (metric.name === 'cumulative-layout-shift') {
      threshold = this.thresholds.cls
      metricName = 'CLS'
    }

    if (threshold && metric.value > threshold) {
      console.warn(
        `[Performance Warning] ${metricName} (${metric.value.toFixed(2)}) exceeds threshold (${threshold})`
      )
    }
  }

  /**
   * Measure component render time
   */
  measureComponent(componentName: string, callback: () => void) {
    const startMark = `${componentName}-start`
    const endMark = `${componentName}-end`
    const measureName = `${componentName}-render`

    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(startMark)
      callback()
      performance.mark(endMark)

      try {
        performance.measure(measureName, startMark, endMark)
        const measure = performance.getEntriesByName(measureName)[0]
        
        this.recordMetric({
          name: measureName,
          value: measure.duration,
          timestamp: Date.now(),
          type: 'measure'
        })

        // Clean up
        performance.clearMarks(startMark)
        performance.clearMarks(endMark)
        performance.clearMeasures(measureName)
      } catch (e) {
        console.warn('Performance measurement failed:', e)
      }
    } else {
      callback()
    }
  }

  /**
   * Measure async operation
   */
  async measureAsync<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now()
    
    try {
      const result = await operation()
      const duration = Date.now() - startTime
      
      this.recordMetric({
        name: operationName,
        value: duration,
        timestamp: Date.now(),
        type: 'custom'
      })
      
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      
      this.recordMetric({
        name: `${operationName}-error`,
        value: duration,
        timestamp: Date.now(),
        type: 'custom'
      })
      
      throw error
    }
  }

  /**
   * Get Core Web Vitals
   */
  getCoreWebVitals(): {
    fcp?: number
    lcp?: number
    fid?: number
    cls?: number
    ttfb?: number
  } {
    const vitals: any = {}

    // FCP
    const fcpMetric = this.metrics.find(m => m.name === 'first-contentful-paint')
    if (fcpMetric) vitals.fcp = fcpMetric.value

    // LCP
    const lcpMetric = this.metrics.find(m => m.name === 'largest-contentful-paint')
    if (lcpMetric) vitals.lcp = lcpMetric.value

    // FID
    const fidMetric = this.metrics.find(m => m.name === 'first-input-delay')
    if (fidMetric) vitals.fid = fidMetric.value

    // CLS
    const clsMetric = this.metrics.find(m => m.name === 'cumulative-layout-shift')
    if (clsMetric) vitals.cls = clsMetric.value

    // TTFB
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navTiming = performance.getEntriesByType('navigation')[0] as any
      if (navTiming) {
        vitals.ttfb = navTiming.responseStart - navTiming.requestStart
      }
    }

    return vitals
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  /**
   * Get metrics by type
   */
  getMetricsByType(type: PerformanceMetric['type']): PerformanceMetric[] {
    return this.metrics.filter(m => m.type === type)
  }

  /**
   * Get performance summary
   */
  getSummary(): {
    totalMetrics: number
    coreWebVitals: {
      fcp?: number
      lcp?: number
      fid?: number
      cls?: number
      ttfb?: number
    }
    slowestOperations: PerformanceMetric[]
    averageRenderTime: number
  } {
    const coreWebVitals = this.getCoreWebVitals()
    const renderMetrics = this.metrics.filter(m => m.name.includes('render'))
    const averageRenderTime = renderMetrics.length > 0
      ? renderMetrics.reduce((sum, m) => sum + m.value, 0) / renderMetrics.length
      : 0

    const slowestOperations = [...this.metrics]
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    return {
      totalMetrics: this.metrics.length,
      coreWebVitals,
      slowestOperations,
      averageRenderTime
    }
  }

  /**
   * Export metrics for analytics
   */
  exportMetrics(): string {
    return JSON.stringify({
      timestamp: Date.now(),
      metrics: this.metrics,
      summary: this.getSummary()
    }, null, 2)
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = []
  }

  /**
   * Disconnect all observers
   */
  disconnect() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor(componentName: string) {
  React.useEffect(() => {
    const startTime = Date.now()

    return () => {
      const duration = Date.now() - startTime
      performanceMonitor.measureComponent(componentName, () => {})
    }
  }, [componentName])
}

/**
 * HOC for performance monitoring
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  return function PerformanceMonitoredComponent(props: P) {
    const name = componentName || Component.displayName || Component.name || 'Component'
    usePerformanceMonitor(name)
    return React.createElement(Component, props)
  }
}

/**
 * Report Web Vitals to analytics
 */
export function reportWebVitals(onPerfEntry?: (metric: any) => void) {
  if (onPerfEntry && typeof window !== 'undefined') {
    // Use our own monitoring implementation
    const vitals = performanceMonitor.getCoreWebVitals()
    Object.entries(vitals).forEach(([name, value]) => {
      if (value !== undefined) {
        onPerfEntry({ name, value })
      }
    })
  }
}

// Import React for hooks
import React from 'react'

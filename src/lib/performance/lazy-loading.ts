/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Lazy Loading and Performance Optimization Utilities
 * Provides efficient component loading and image optimization
 */

import { ComponentType, lazy, LazyExoticComponent } from 'react'

/**
 * Lazy load a component with retry logic
 * Handles network failures gracefully
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  retries = 3,
  interval = 1000
): LazyExoticComponent<T> {
  return lazy(async () => {
    for (let i = 0; i < retries; i++) {
      try {
        return await componentImport()
      } catch (_error) {
        if (i === retries - 1) {
          throw _error
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, interval * (i + 1)))
      }
    }
    throw new Error('Failed to load component after retries')
  })
}

/**
 * Preload a component for faster subsequent loads
 */
export function preloadComponent(componentImport: () => Promise<any>) {
  const promise = componentImport()
  return () => promise
}

/**
 * Image loading optimization
 */
export interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  quality?: number
  sizes?: string
}

/**
 * Generate responsive image sizes string
 */
export function generateImageSizes(breakpoints: { [key: string]: string }): string {
  return Object.entries(breakpoints)
    .map(([breakpoint, size]) => `(max-width: ${breakpoint}) ${size}`)
    .join(', ')
}

/**
 * Common responsive image sizes
 */
export const RESPONSIVE_IMAGE_SIZES = {
  avatar: generateImageSizes({
    '640px': '40px',
    '768px': '48px',
    '1024px': '56px',
    '1280px': '64px'
  }),
  card: generateImageSizes({
    '640px': '100vw',
    '768px': '50vw',
    '1024px': '33vw',
    '1280px': '25vw'
  }),
  hero: generateImageSizes({
    '640px': '100vw',
    '768px': '100vw',
    '1024px': '80vw',
    '1280px': '60vw'
  })
}

/**
 * Intersection Observer for lazy loading
 */
export class LazyLoadObserver {
  private observer: IntersectionObserver | null = null
  private callbacks: Map<Element, () => void> = new Map()

  constructor(options?: IntersectionObserverInit) {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const callback = this.callbacks.get(entry.target)
            if (callback) {
              callback()
              this.unobserve(entry.target)
            }
          }
        })
      }, {
        rootMargin: '50px',
        threshold: 0.01,
        ...options
      })
    }
  }

  observe(element: Element, callback: () => void) {
    if (this.observer) {
      this.callbacks.set(element, callback)
      this.observer.observe(element)
    } else {
      // Fallback: execute immediately if IntersectionObserver not supported
      callback()
    }
  }

  unobserve(element: Element) {
    if (this.observer) {
      this.observer.unobserve(element)
      this.callbacks.delete(element)
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect()
      this.callbacks.clear()
    }
  }
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Request Idle Callback wrapper with fallback
 */
export function requestIdleCallback(callback: () => void, options?: { timeout?: number }) {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options)
  } else {
    // Fallback to setTimeout
    return setTimeout(callback, 1) as any
  }
}

/**
 * Cancel Idle Callback wrapper with fallback
 */
export function cancelIdleCallback(id: number) {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(id)
  } else {
    clearTimeout(id)
  }
}

/**
 * Measure component render performance
 */
export function measurePerformance(componentName: string, callback: () => void) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const startMark = `${componentName}-start`
    const endMark = `${componentName}-end`
    const measureName = `${componentName}-render`

    performance.mark(startMark)
    callback()
    performance.mark(endMark)
    
    try {
      performance.measure(measureName, startMark, endMark)
      const measure = performance.getEntriesByName(measureName)[0]
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render time: ${measure.duration.toFixed(2)}ms`)
      }
      
      // Clean up marks and measures
      performance.clearMarks(startMark)
      performance.clearMarks(endMark)
      performance.clearMeasures(measureName)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      // Ignore errors in performance measurement
    }
  } else {
    callback()
  }
}

/**
 * Prefetch resources for better performance
 */
export function prefetchResource(url: string, type: 'script' | 'style' | 'image' | 'fetch' = 'fetch') {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.as = type
  link.href = url
  document.head.appendChild(link)
}

/**
 * Preconnect to external domains
 */
export function preconnect(url: string) {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preconnect'
  link.href = url
  document.head.appendChild(link)
}

/**
 * Check if device is low-end based on hardware concurrency
 */
export function isLowEndDevice(): boolean {
  if (typeof window === 'undefined') return false
  
  const cores = navigator.hardwareConcurrency || 4
  const memory = (navigator as any).deviceMemory || 4
  
  return cores <= 2 || memory <= 2
}

/**
 * Get optimal animation settings based on device capabilities
 */
export function getOptimalAnimationSettings() {
  const isLowEnd = isLowEndDevice()
  const prefersReducedMotion = typeof window !== 'undefined' 
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return {
    enableAnimations: !prefersReducedMotion && !isLowEnd,
    animationDuration: isLowEnd ? 150 : 300,
    enableParallax: !isLowEnd,
    enableBlur: !isLowEnd,
    maxParticles: isLowEnd ? 10 : 50
  }
}

/**
 * Adaptive loading based on network conditions
 */
export function getNetworkQuality(): 'slow' | 'medium' | 'fast' {
  if (typeof window === 'undefined') return 'medium'

  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
  
  if (!connection) return 'medium'

  const effectiveType = connection.effectiveType
  
  if (effectiveType === 'slow-2g' || effectiveType === '2g') {
    return 'slow'
  } else if (effectiveType === '3g') {
    return 'medium'
  } else {
    return 'fast'
  }
}

/**
 * Load images based on network quality
 */
export function getOptimalImageQuality(): number {
  const networkQuality = getNetworkQuality()
  
  switch (networkQuality) {
    case 'slow':
      return 50
    case 'medium':
      return 75
    case 'fast':
      return 90
    default:
      return 75
  }
}

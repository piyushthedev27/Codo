/**
 * Animation Optimization Utilities
 * Ensures smooth 60fps animations with GPU acceleration
 */

import { getOptimalAnimationSettings, isLowEndDevice } from '../performance/lazy-loading'

/**
 * GPU-accelerated CSS classes
 * Uses transform and opacity for better performance
 */
export const animationClasses = {
  // Fade animations
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  fadeInUp: 'animate-fade-in-up',
  fadeInDown: 'animate-fade-in-down',
  
  // Scale animations
  scaleIn: 'animate-scale-in',
  scaleOut: 'animate-scale-out',
  
  // Slide animations
  slideInLeft: 'animate-slide-in-left',
  slideInRight: 'animate-slide-in-right',
  slideInUp: 'animate-slide-in-up',
  slideInDown: 'animate-slide-in-down',
  
  // Bounce animations
  bounce: 'animate-bounce-subtle',
  
  // Pulse animations
  pulse: 'animate-pulse-subtle',
  
  // Shimmer loading
  shimmer: 'animate-shimmer'
}

/**
 * Framer Motion variants optimized for performance
 */
export const motionVariants = {
  // Container animations
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  },
  
  // Item animations
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    }
  },
  
  // Fade animations
  fade: {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
    exit: { opacity: 0 }
  },
  
  // Scale animations
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    show: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20
      }
    },
    exit: { opacity: 0, scale: 0.8 }
  },
  
  // Slide animations
  slideUp: {
    hidden: { opacity: 0, y: 50 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: { opacity: 0, y: 50 }
  },
  
  slideDown: {
    hidden: { opacity: 0, y: -50 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: { opacity: 0, y: -50 }
  },
  
  slideLeft: {
    hidden: { opacity: 0, x: 50 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: { opacity: 0, x: 50 }
  },
  
  slideRight: {
    hidden: { opacity: 0, x: -50 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: { opacity: 0, x: -50 }
  }
}

/**
 * Optimized transition settings
 */
export const transitions = {
  // Fast transitions for immediate feedback
  fast: {
    type: 'tween',
    duration: 0.15,
    ease: 'easeOut'
  },
  
  // Standard transitions
  standard: {
    type: 'tween',
    duration: 0.3,
    ease: 'easeInOut'
  },
  
  // Smooth spring transitions
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30
  },
  
  // Bouncy spring
  springBouncy: {
    type: 'spring',
    stiffness: 400,
    damping: 20
  },
  
  // Slow spring for dramatic effect
  springSlow: {
    type: 'spring',
    stiffness: 200,
    damping: 25
  }
}

/**
 * Get optimized animation config based on device capabilities
 */
export function getOptimizedAnimationConfig() {
  const settings = getOptimalAnimationSettings()
  
  if (!settings.enableAnimations) {
    return {
      initial: false,
      animate: false,
      exit: false,
      transition: { duration: 0 }
    }
  }
  
  return {
    initial: 'hidden',
    animate: 'show',
    exit: 'exit',
    transition: {
      duration: settings.animationDuration / 1000
    }
  }
}

/**
 * Stagger animation helper
 */
export function getStaggerConfig(itemCount: number, baseDelay = 0.05) {
  const isLowEnd = isLowEndDevice()
  const delay = isLowEnd ? baseDelay * 2 : baseDelay
  
  return {
    staggerChildren: delay,
    delayChildren: delay,
    when: 'beforeChildren' as const
  }
}

/**
 * Scroll-triggered animation observer
 */
export class ScrollAnimationObserver {
  private observer: IntersectionObserver | null = null
  private callbacks: Map<Element, (isVisible: boolean) => void> = new Map()

  constructor(options?: IntersectionObserverInit) {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const callback = this.callbacks.get(entry.target)
          if (callback) {
            callback(entry.isIntersecting)
          }
        })
      }, {
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1,
        ...options
      })
    }
  }

  observe(element: Element, callback: (isVisible: boolean) => void) {
    if (this.observer) {
      this.callbacks.set(element, callback)
      this.observer.observe(element)
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
 * Request Animation Frame helper for smooth animations
 */
export class AnimationFrameScheduler {
  private rafId: number | null = null
  private callbacks: Set<() => void> = new Set()

  schedule(callback: () => void) {
    this.callbacks.add(callback)
    
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => this.execute())
    }
  }

  private execute() {
    this.callbacks.forEach(callback => callback())
    this.callbacks.clear()
    this.rafId = null
  }

  cancel() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.callbacks.clear()
  }
}

/**
 * CSS custom properties for dynamic animations
 */
export function setAnimationProperty(element: HTMLElement, property: string, value: string | number) {
  element.style.setProperty(`--${property}`, String(value))
}

/**
 * Batch DOM reads and writes for better performance
 */
export class DOMBatcher {
  private readQueue: Array<() => void> = []
  private writeQueue: Array<() => void> = []
  private scheduled = false

  read(callback: () => void) {
    this.readQueue.push(callback)
    this.schedule()
  }

  write(callback: () => void) {
    this.writeQueue.push(callback)
    this.schedule()
  }

  private schedule() {
    if (!this.scheduled) {
      this.scheduled = true
      requestAnimationFrame(() => this.flush())
    }
  }

  private flush() {
    // Execute all reads first
    this.readQueue.forEach(callback => callback())
    this.readQueue = []
    
    // Then execute all writes
    this.writeQueue.forEach(callback => callback())
    this.writeQueue = []
    
    this.scheduled = false
  }
}

/**
 * Prefers reduced motion check
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get safe animation duration based on user preferences
 */
export function getSafeAnimationDuration(duration: number): number {
  return prefersReducedMotion() ? 0 : duration
}

/**
 * Create optimized keyframe animation
 */
export function createKeyframeAnimation(
  element: HTMLElement,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions
): Animation | null {
  if (typeof window === 'undefined' || !element.animate) return null
  
  const settings = getOptimalAnimationSettings()
  
  if (!settings.enableAnimations) {
    // Apply final state immediately
    const finalKeyframe = keyframes[keyframes.length - 1]
    Object.assign(element.style, finalKeyframe)
    return null
  }
  
  return element.animate(keyframes, {
    ...options,
    duration: getSafeAnimationDuration(options.duration as number || 300)
  })
}

/**
 * Optimized CSS classes for common patterns
 */
export const optimizedClasses = {
  // GPU acceleration
  gpuAccelerated: 'transform-gpu will-change-transform',
  
  // Smooth transitions
  transitionFast: 'transition-fast',
  transitionStandard: 'transition-standard',
  transitionSlow: 'transition-slow',
  transitionOptimized: 'transition-optimized',
  
  // Hover effects
  hoverScale: 'hover-scale',
  hoverLift: 'hover-lift',
  hoverGlow: 'hover-glow',
  
  // Loading states
  skeleton: 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded',
  shimmer: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700'
}

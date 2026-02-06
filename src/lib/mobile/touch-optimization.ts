/**
 * Mobile Touch Optimization Utilities
 * Provides enhanced touch interactions for mobile devices
 */

export interface TouchOptimizationConfig {
  tapDelay?: number
  doubleTapDelay?: number
  longPressDelay?: number
  swipeThreshold?: number
  preventZoom?: boolean
  enhancedTouchTargets?: boolean
}

export interface TouchGesture {
  type: 'tap' | 'double-tap' | 'long-press' | 'swipe' | 'pinch'
  startX: number
  startY: number
  endX?: number
  endY?: number
  duration: number
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: number
}

export class TouchOptimizer {
  private config: Required<TouchOptimizationConfig>
  private touchStartTime: number = 0
  private touchStartX: number = 0
  private touchStartY: number = 0
  private lastTapTime: number = 0
  private tapCount: number = 0
  private longPressTimer: NodeJS.Timeout | null = null
  private isLongPress: boolean = false

  constructor(config: TouchOptimizationConfig = {}) {
    this.config = {
      tapDelay: 300,
      doubleTapDelay: 300,
      longPressDelay: 500,
      swipeThreshold: 50,
      preventZoom: true,
      enhancedTouchTargets: true,
      ...config
    }
  }

  /**
   * Optimize touch events for an element
   */
  public optimizeElement(
    element: HTMLElement,
    callbacks: {
      onTap?: (gesture: TouchGesture) => void
      onDoubleTap?: (gesture: TouchGesture) => void
      onLongPress?: (gesture: TouchGesture) => void
      onSwipe?: (gesture: TouchGesture) => void
    }
  ): () => void {
    // Enhance touch targets
    if (this.config.enhancedTouchTargets) {
      this.enhanceTouchTargets(element)
    }

    // Prevent zoom on double tap if configured
    if (this.config.preventZoom) {
      element.style.touchAction = 'manipulation'
    }

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      this.touchStartTime = Date.now()
      this.touchStartX = touch.clientX
      this.touchStartY = touch.clientY
      this.isLongPress = false

      // Start long press timer
      this.longPressTimer = setTimeout(() => {
        this.isLongPress = true
        callbacks.onLongPress?.({
          type: 'long-press',
          startX: this.touchStartX,
          startY: this.touchStartY,
          duration: Date.now() - this.touchStartTime
        })
      }, this.config.longPressDelay)

      // Add visual feedback
      this.addTouchFeedback(element, touch.clientX, touch.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      const deltaX = Math.abs(touch.clientX - this.touchStartX)
      const deltaY = Math.abs(touch.clientY - this.touchStartY)

      // Cancel long press if moved too much
      if (deltaX > 10 || deltaY > 10) {
        if (this.longPressTimer) {
          clearTimeout(this.longPressTimer)
          this.longPressTimer = null
        }
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const endTime = Date.now()
      const duration = endTime - this.touchStartTime
      const touch = e.changedTouches[0]
      const endX = touch.clientX
      const endY = touch.clientY

      // Clear long press timer
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer)
        this.longPressTimer = null
      }

      // Skip if it was a long press
      if (this.isLongPress) {
        return
      }

      const deltaX = endX - this.touchStartX
      const deltaY = endY - this.touchStartY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      // Detect swipe
      if (distance > this.config.swipeThreshold) {
        const direction = this.getSwipeDirection(deltaX, deltaY)
        callbacks.onSwipe?.({
          type: 'swipe',
          startX: this.touchStartX,
          startY: this.touchStartY,
          endX,
          endY,
          duration,
          direction,
          distance
        })
        return
      }

      // Detect tap or double tap
      if (duration < this.config.tapDelay) {
        const timeSinceLastTap = endTime - this.lastTapTime
        
        if (timeSinceLastTap < this.config.doubleTapDelay && this.tapCount === 1) {
          // Double tap
          this.tapCount = 0
          callbacks.onDoubleTap?.({
            type: 'double-tap',
            startX: this.touchStartX,
            startY: this.touchStartY,
            endX,
            endY,
            duration
          })
        } else {
          // Single tap (with delay to check for double tap)
          this.tapCount = 1
          this.lastTapTime = endTime
          
          setTimeout(() => {
            if (this.tapCount === 1) {
              callbacks.onTap?.({
                type: 'tap',
                startX: this.touchStartX,
                startY: this.touchStartY,
                endX,
                endY,
                duration
              })
            }
            this.tapCount = 0
          }, this.config.doubleTapDelay)
        }
      }

      // Remove visual feedback
      this.removeTouchFeedback(element)
    }

    const handleTouchCancel = () => {
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer)
        this.longPressTimer = null
      }
      this.removeTouchFeedback(element)
    }

    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })
    element.addEventListener('touchcancel', handleTouchCancel, { passive: false })

    // Return cleanup function
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchcancel', handleTouchCancel)
    }
  }

  /**
   * Enhance touch targets for better accessibility
   */
  private enhanceTouchTargets(element: HTMLElement): void {
    const computedStyle = window.getComputedStyle(element)
    const minTouchTarget = 44 // iOS HIG minimum

    // Get current dimensions
    const rect = element.getBoundingClientRect()
    
    // Add padding if touch target is too small
    if (rect.width < minTouchTarget || rect.height < minTouchTarget) {
      const paddingX = Math.max(0, (minTouchTarget - rect.width) / 2)
      const paddingY = Math.max(0, (minTouchTarget - rect.height) / 2)
      
      element.style.padding = `${paddingY}px ${paddingX}px`
      element.style.minWidth = `${minTouchTarget}px`
      element.style.minHeight = `${minTouchTarget}px`
    }

    // Ensure proper cursor for touch devices
    element.style.cursor = 'pointer'
    
    // Add touch-friendly styling
    element.style.userSelect = 'none'
    ;(element.style as any).webkitUserSelect = 'none'
    ;(element.style as any).webkitTouchCallout = 'none'
  }

  /**
   * Add visual feedback for touch
   */
  private addTouchFeedback(element: HTMLElement, x: number, y: number): void {
    element.style.transform = 'scale(0.95)'
    element.style.transition = 'transform 0.1s ease-out'
    
    // Add ripple effect
    const ripple = document.createElement('div')
    const rect = element.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    
    ripple.style.position = 'absolute'
    ripple.style.borderRadius = '50%'
    ripple.style.background = 'rgba(255, 255, 255, 0.3)'
    ripple.style.transform = 'scale(0)'
    ripple.style.animation = 'ripple 0.6s linear'
    ripple.style.left = `${x - rect.left - size / 2}px`
    ripple.style.top = `${y - rect.top - size / 2}px`
    ripple.style.width = `${size}px`
    ripple.style.height = `${size}px`
    ripple.style.pointerEvents = 'none'
    ripple.style.zIndex = '1000'
    
    element.style.position = 'relative'
    element.style.overflow = 'hidden'
    element.appendChild(ripple)
    
    // Remove ripple after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple)
      }
    }, 600)
  }

  /**
   * Remove visual feedback
   */
  private removeTouchFeedback(element: HTMLElement): void {
    element.style.transform = 'scale(1)'
  }

  /**
   * Determine swipe direction
   */
  private getSwipeDirection(deltaX: number, deltaY: number): 'up' | 'down' | 'left' | 'right' {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left'
    } else {
      return deltaY > 0 ? 'down' : 'up'
    }
  }
}

/**
 * React hook for touch optimization
 */
export function useTouchOptimization(
  config?: TouchOptimizationConfig
) {
  const optimizer = new TouchOptimizer(config)

  const optimizeRef = (callbacks: {
    onTap?: (gesture: TouchGesture) => void
    onDoubleTap?: (gesture: TouchGesture) => void
    onLongPress?: (gesture: TouchGesture) => void
    onSwipe?: (gesture: TouchGesture) => void
  }) => {
    return (element: HTMLElement | null) => {
      if (element) {
        return optimizer.optimizeElement(element, callbacks)
      }
    }
  }

  return { optimizeRef }
}

/**
 * CSS for ripple animation
 */
export const TOUCH_OPTIMIZATION_CSS = `
@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

.touch-optimized {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  touch-action: manipulation;
}

.touch-target-enhanced {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Enhanced button styles for mobile */
.mobile-button {
  padding: 12px 24px;
  font-size: 16px;
  line-height: 1.5;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.mobile-button:active {
  transform: scale(0.95);
  background-color: rgba(0, 0, 0, 0.1);
}

/* Enhanced card interactions */
.mobile-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.mobile-card:active {
  transform: translateY(1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Swipe indicators */
.swipe-indicator {
  position: relative;
  overflow: hidden;
}

.swipe-indicator::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid currentColor;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  opacity: 0.5;
}
`

/**
 * Utility to detect mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768
}

/**
 * Utility to detect touch support
 */
export function hasTouchSupport(): boolean {
  if (typeof window === 'undefined') return false
  
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * Prevent zoom on double tap for specific elements
 */
export function preventZoom(element: HTMLElement): void {
  element.style.touchAction = 'manipulation'
  element.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault()
    }
  }, { passive: false })
}

/**
 * Add haptic feedback (if supported)
 */
export function addHapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light'): void {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30]
    }
    navigator.vibrate(patterns[type])
  }
}
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

/**
 * Touch-Optimized Card Component
 * Provides swipe gestures and touch-friendly interactions for mobile
 */

import { useRef, useState } from 'react'
import { motion, PanInfo, useAnimation } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TouchOptimizedCardProps {
  children: React.ReactNode
  className?: string
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onTap?: () => void
  swipeThreshold?: number
  enableSwipe?: boolean
}

export function TouchOptimizedCard({
  children,
  className,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  swipeThreshold = 100,
  enableSwipe = true
}: TouchOptimizedCardProps) {
  const controls = useAnimation()
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false)
    
    const swipeDistance = Math.abs(info.offset.x)
    const swipeVelocity = Math.abs(info.velocity.x)
    
    // Determine if swipe threshold was met
    if (swipeDistance > swipeThreshold || swipeVelocity > 500) {
      if (info.offset.x > 0 && onSwipeRight) {
        onSwipeRight()
      } else if (info.offset.x < 0 && onSwipeLeft) {
        onSwipeLeft()
      }
    }
    
    // Animate back to original position
    controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } })
  }

  const handleTap = () => {
    if (!isDragging && onTap) {
      onTap()
    }
  }

  return (
    <motion.div
      drag={enableSwipe ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTap={handleTap}
      animate={controls}
      whileTap={{ scale: onTap ? 0.98 : 1 }}
      className={cn(
        'touch-manipulation cursor-pointer',
        // Ensure proper touch targets
        'min-h-[44px]',
        className
      )}
      style={{ touchAction: enableSwipe ? 'pan-y' : 'auto' }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Swipeable Stats Card for mobile
 * Allows users to swipe through stats on mobile devices
 */
interface SwipeableStatsCardProps {
  stats: Array<{
    title: string
    value: string | number
    subtitle: string
    icon: React.ReactNode
    gradient: string
  }>
  currentIndex: number
  onIndexChange: (index: number) => void
}

export function SwipeableStatsCard({ stats, currentIndex, onIndexChange }: SwipeableStatsCardProps) {
  const handleSwipeLeft = () => {
    if (currentIndex < stats.length - 1) {
      onIndexChange(currentIndex + 1)
    }
  }

  const handleSwipeRight = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1)
    }
  }

  const currentStat = stats[currentIndex]

  return (
    <div className="relative">
      <TouchOptimizedCard
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        className={cn(
          'rounded-xl p-6 text-white shadow-lg',
          currentStat.gradient
        )}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-lg">
            {currentStat.icon}
          </div>
          <h3 className="text-lg font-semibold">{currentStat.title}</h3>
        </div>
        
        <div className="text-3xl font-bold mb-2">{currentStat.value}</div>
        <p className="text-sm text-white/90">{currentStat.subtitle}</p>
      </TouchOptimizedCard>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {stats.map((_, index) => (
          <button
            key={index}
            onClick={() => onIndexChange(index)}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-200 touch-manipulation',
              index === currentIndex
                ? 'bg-blue-600 w-6'
                : 'bg-gray-300 dark:bg-gray-600'
            )}
            aria-label={`Go to stat ${index + 1}`}
          />
        ))}
      </div>

      {/* Swipe Hint (show on first render) */}
      {currentIndex === 0 && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute top-1/2 right-4 -translate-y-1/2 text-white/60 text-sm pointer-events-none"
        >
          ← Swipe →
        </motion.div>
      )}
    </div>
  )
}

/**
 * Touch-Friendly Button with haptic feedback simulation
 */
interface TouchButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
}

export function TouchButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className,
  disabled = false
}: TouchButtonProps) {
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg active:shadow-md',
    secondary: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
  }

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm min-h-[40px]',
    md: 'px-6 py-3 text-base min-h-[48px]',
    lg: 'px-8 py-4 text-lg min-h-[56px]'
  }

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-lg font-medium transition-all duration-200 touch-manipulation',
        'active:translate-y-0.5',
        variantStyles[variant],
        sizeStyles[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </motion.button>
  )
}

/**
 * Pull-to-Refresh Component
 */
interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  threshold?: number
}

export function PullToRefresh({ onRefresh, children, threshold = 80 }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isRefreshing) return
    
    const currentY = e.touches[0].clientY
    const distance = currentY - startY.current
    
    // Only allow pull down when at top of page
    if (window.scrollY === 0 && distance > 0) {
      setPullDistance(Math.min(distance, threshold * 1.5))
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      await onRefresh()
      setIsRefreshing(false)
    }
    setPullDistance(0)
  }

  const progress = Math.min((pullDistance / threshold) * 100, 100)

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull Indicator */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: pullDistance > 0 ? pullDistance : 0 }}
        className="flex items-center justify-center overflow-hidden"
      >
        <div className="flex flex-col items-center gap-2 py-2">
          <motion.div
            animate={{ rotate: isRefreshing ? 360 : progress * 3.6 }}
            transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
            className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isRefreshing ? 'Refreshing...' : pullDistance >= threshold ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      </motion.div>

      {children}
    </div>
  )
}

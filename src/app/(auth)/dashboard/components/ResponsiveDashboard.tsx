'use client'

/**
 * Responsive Dashboard Wrapper
 * Adapts dashboard layout and components based on screen size
 * Provides mobile-optimized views with swipeable stats
 */

import { useState, useEffect } from 'react'
import { SwipeableStatsCard } from '@/components/mobile/TouchOptimizedCard'
import { EnhancedStatsGrid, CompactStatsGrid } from './EnhancedStatsGrid'
import type { EnhancedStats } from '@/lib/utils/stats-calculations'
import { Target, Zap, Star, Clock } from 'lucide-react'
import { formatDuration } from '@/lib/utils/stats-calculations'

interface ResponsiveDashboardProps {
  stats: EnhancedStats
  children?: React.ReactNode
}

export function ResponsiveStatsDisplay({ stats }: { stats: EnhancedStats }) {
  const [isMobile, setIsMobile] = useState(false)
  const [currentStatIndex, setCurrentStatIndex] = useState(0)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Prepare stats for swipeable cards
  const swipeableStats = [
    {
      title: 'Learning Progress',
      value: `${stats.learningProgress.percentage}%`,
      subtitle: `${stats.learningProgress.lessonsCompleted} of ${stats.learningProgress.totalLessons} lessons completed`,
      icon: <Target className="w-6 h-6" />,
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      title: 'Current Streak',
      value: `${stats.currentStreak.days} Days`,
      subtitle: stats.currentStreak.message,
      icon: <Zap className="w-6 h-6" />,
      gradient: 'bg-gradient-to-br from-orange-500 to-red-500'
    },
    {
      title: 'Skills Mastered',
      value: `${stats.skillsMastered.count} Skills`,
      subtitle: stats.skillsMastered.recentSkills.length > 0 
        ? stats.skillsMastered.recentSkills.join(', ')
        : 'Keep learning to unlock skills!',
      icon: <Star className="w-6 h-6" />,
      gradient: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    {
      title: 'Time This Week',
      value: formatDuration(stats.codingTime.weeklyHours),
      subtitle: `Daily avg: ${formatDuration(stats.codingTime.dailyAverage)}`,
      icon: <Clock className="w-6 h-6" />,
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600'
    }
  ]

  // Mobile: Show swipeable single card
  if (isMobile) {
    return (
      <div className="mb-6">
        <SwipeableStatsCard
          stats={swipeableStats}
          currentIndex={currentStatIndex}
          onIndexChange={setCurrentStatIndex}
        />
      </div>
    )
  }

  // Tablet: Show compact 2x2 grid
  if (window.innerWidth < 1024) {
    return (
      <div className="mb-6 sm:mb-8">
        <CompactStatsGrid stats={stats} />
      </div>
    )
  }

  // Desktop: Show full grid
  return (
    <div className="mb-6 sm:mb-8">
      <EnhancedStatsGrid stats={stats} />
    </div>
  )
}

/**
 * Responsive container with proper spacing
 */
export function ResponsiveContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 mobile-safe-area">
      {children}
    </div>
  )
}

/**
 * Responsive grid that stacks properly on mobile
 */
interface ResponsiveGridProps {
  children: React.ReactNode
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  className?: string
}

export function ResponsiveGrid({ 
  children, 
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = { mobile: 4, tablet: 6, desktop: 8 },
  className = ''
}: ResponsiveGridProps) {
  const gridClasses = `
    grid
    grid-cols-${columns.mobile}
    sm:grid-cols-${columns.tablet}
    lg:grid-cols-${columns.desktop}
    gap-${gap.mobile}
    sm:gap-${gap.tablet}
    lg:gap-${gap.desktop}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  return (
    <div className={gridClasses}>
      {children}
    </div>
  )
}

/**
 * Responsive section with proper spacing and mobile optimization
 */
interface ResponsiveSectionProps {
  children: React.ReactNode
  className?: string
  mobileOptimized?: boolean
}

export function ResponsiveSection({ 
  children, 
  className = '',
  mobileOptimized = true 
}: ResponsiveSectionProps) {
  return (
    <section 
      className={`
        ${mobileOptimized ? 'mobile-stack' : ''}
        ${className}
      `}
    >
      {children}
    </section>
  )
}

/**
 * Responsive card that adapts padding and sizing
 */
export function ResponsiveCard({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`
      bg-white dark:bg-gray-800 
      rounded-lg sm:rounded-xl 
      p-4 sm:p-6 
      border border-gray-200 dark:border-gray-700
      shadow-sm hover:shadow-md
      transition-shadow duration-200
      ${className}
    `}>
      {children}
    </div>
  )
}

/**
 * Responsive text that scales with viewport
 */
export function ResponsiveHeading({ 
  level = 1, 
  children, 
  className = '' 
}: { 
  level?: 1 | 2 | 3 | 4
  children: React.ReactNode
  className?: string 
}) {
  const sizeClasses = {
    1: 'text-2xl sm:text-3xl md:text-4xl',
    2: 'text-xl sm:text-2xl md:text-3xl',
    3: 'text-lg sm:text-xl md:text-2xl',
    4: 'text-base sm:text-lg md:text-xl'
  }

  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4'

  return (
    <Tag className={`font-bold ${sizeClasses[level]} ${className}`}>
      {children}
    </Tag>
  )
}

/**
 * Responsive button with proper touch targets
 */
export function ResponsiveButton({ 
  children, 
  onClick, 
  variant = 'primary',
  className = '' 
}: { 
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
}) {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
  }

  return (
    <button
      onClick={onClick}
      className={`
        ${variantClasses[variant]}
        px-4 sm:px-6 
        py-2 sm:py-3 
        rounded-lg 
        font-medium 
        text-sm sm:text-base
        min-h-[44px]
        touch-manipulation
        transition-all duration-200
        active:scale-98
        ${className}
      `}
    >
      {children}
    </button>
  )
}

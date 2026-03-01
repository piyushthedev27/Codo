/**
 * Mobile Responsive Wrapper Component
 * Provides consistent mobile optimizations across components
 */

'use client'

import { useEffect, useState, ReactNode } from 'react'
import { isMobileDevice } from '@/lib/mobile/touch-optimization'
import { useLayoutOptimization } from '@/lib/mobile/layout-optimization'

interface MobileResponsiveWrapperProps {
  children: ReactNode
  className?: string
  enableTouchOptimization?: boolean
  enableLayoutOptimization?: boolean
  mobileClassName?: string
  desktopClassName?: string
}

export function MobileResponsiveWrapper({
  children,
  className = '',
  enableTouchOptimization = true,
  enableLayoutOptimization = true,
  mobileClassName = '',
  desktopClassName = ''
}: MobileResponsiveWrapperProps) {
  const [isMobile, setIsMobile] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { viewport } = useLayoutOptimization()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileDevice())
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const wrapperClasses = [
    className,
    isMobile ? mobileClassName : desktopClassName,
    enableTouchOptimization && isMobile ? 'touch-optimized' : '',
    enableLayoutOptimization && isMobile ? 'mobile-optimized' : '',
    isMobile ? 'mobile-safe-area' : ''
  ].filter(Boolean).join(' ')

  return (
    <div className={wrapperClasses} data-mobile={isMobile}>
      {children}
    </div>
  )
}

/**
 * Mobile-specific layout components
 */

interface MobileStackProps {
  children: ReactNode
  className?: string
  spacing?: 'sm' | 'md' | 'lg'
}

export function MobileStack({
  children,
  className = '',
  spacing = 'md'
}: MobileStackProps) {
  const spacingClasses = {
    sm: 'space-y-2 sm:space-y-3',
    md: 'space-y-4 sm:space-y-6',
    lg: 'space-y-6 sm:space-y-8'
  }

  return (
    <div className={`${spacingClasses[spacing]} ${className}`}>
      {children}
    </div>
  )
}

interface MobileGridProps {
  children: ReactNode
  className?: string
  cols?: {
    mobile: number
    tablet: number
    desktop: number
  }
  gap?: 'sm' | 'md' | 'lg'
}

export function MobileGrid({
  children,
  className = '',
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md'
}: MobileGridProps) {
  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8'
  }

  const gridClasses = `grid grid-cols-${cols.mobile} md:grid-cols-${cols.tablet} lg:grid-cols-${cols.desktop} ${gapClasses[gap]} ${className}`

  return (
    <div className={gridClasses}>
      {children}
    </div>
  )
}

interface MobileCardProps {
  children: ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  interactive?: boolean
}

export function MobileCard({
  children,
  className = '',
  padding = 'md',
  interactive = false
}: MobileCardProps) {
  const paddingClasses = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  }

  const cardClasses = [
    'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
    paddingClasses[padding],
    interactive ? 'mobile-card cursor-pointer' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={cardClasses}>
      {children}
    </div>
  )
}

interface MobileButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  fullWidth?: boolean
}

export function MobileButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  fullWidth = false
}: MobileButtonProps) {
  const baseClasses = 'mobile-button touch-target-enhanced font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2'

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-sm',
    outline: 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
  }

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]'
  }

  const buttonClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  )
}

interface MobileInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number'
  className?: string
  disabled?: boolean
  error?: string
}

export function MobileInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
  disabled = false,
  error
}: MobileInputProps) {
  const inputClasses = [
    'mobile-input',
    error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className="w-full">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClasses}
        disabled={disabled}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  )
}

/**
 * Mobile-specific layout hooks
 */

export function useMobileLayout() {
  const [isMobile, setIsMobile] = useState(false)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    const checkLayout = () => {
      setIsMobile(isMobileDevice())
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait')
    }

    checkLayout()
    window.addEventListener('resize', checkLayout)
    window.addEventListener('orientationchange', checkLayout)

    return () => {
      window.removeEventListener('resize', checkLayout)
      window.removeEventListener('orientationchange', checkLayout)
    }
  }, [])

  return {
    isMobile,
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape'
  }
}

/**
 * Mobile-specific utility functions
 */

export function getMobileBreakpoint(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'

  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}
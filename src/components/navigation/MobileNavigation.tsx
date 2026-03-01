/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

/**
 * Mobile Navigation Component
 * Optimized hamburger menu with touch-friendly interactions
 * Features: swipe gestures, touch targets, smooth animations
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { _useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence, PanInfo, useAnimation } from 'framer-motion'
import { X, Brain, Home, Network, BookOpen, Code, Users, BarChart, Settings, Trophy, Target, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import { navigationConfig, type NavigationIconName } from './navigation-config'
import { NavigationItem } from './types'
import { useUser } from '@clerk/nextjs'

// Icon mapping for client-side rendering
const ICON_MAP = {
  Home,
  Network,
  BookOpen,
  Code,
  Users,
  BarChart,
  Settings,
  Trophy,
  Target,
  Lightbulb
} as const

function getIconComponent(iconName: NavigationIconName) {
  return ICON_MAP[iconName]
}

interface MobileNavigationProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  const pathname = usePathname()
  const { user } = useUser()
  const controls = useAnimation()
  const constraintsRef = useRef(null)

  const isActive = (item: NavigationItem) => {
    if (item.href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(item.href)
  }

  // Handle swipe to close gesture
  const handleDragEnd = (event: any, info: PanInfo) => {
    const shouldClose = info.velocity.x < -500 || info.offset.x < -100

    if (shouldClose) {
      onClose()
    } else {
      controls.start({ x: 0 })
    }
  }

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Add touch-action to prevent pull-to-refresh on mobile
      document.body.style.touchAction = 'none'
    } else {
      document.body.style.overflow = 'unset'
      document.body.style.touchAction = 'auto'
    }

    return () => {
      document.body.style.overflow = 'unset'
      document.body.style.touchAction = 'auto'
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with tap to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            style={{ touchAction: 'none' }}
          />

          {/* Mobile Menu Panel with swipe gesture */}
          <motion.div
            ref={constraintsRef}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
              mass: 0.8
            }}
            drag="x"
            dragConstraints={{ left: -300, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="fixed left-0 top-0 h-full w-[280px] max-w-[85vw] bg-white dark:bg-gray-900 z-50 shadow-2xl overflow-hidden"
            style={{ touchAction: 'pan-y' }}
          >
            {/* Swipe Indicator */}
            <div className="absolute top-1/2 -translate-y-1/2 right-2 w-1 h-12 bg-gray-300 dark:bg-gray-700 rounded-full opacity-50" />

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <Link href="/dashboard" onClick={onClose}>
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2"
                >
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Codo
                  </span>
                </motion.div>
              </Link>

              {/* Close Button - Large touch target */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-3 -mr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-manipulation"
                aria-label="Close menu"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </motion.button>
            </div>

            {/* Navigation Items - Scrollable */}
            <nav className="flex-1 overflow-y-auto py-4 px-2 overscroll-contain">
              {navigationConfig.sections.map((section, sectionIndex) => (
                <div key={section.id} className={cn(sectionIndex > 0 && 'mt-6')}>
                  {section.title && (
                    <div className="px-4 mb-2">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {section.title}
                      </span>
                    </div>
                  )}

                  {section.items.map((item) => {
                    const active = isActive(item)
                    const Icon = getIconComponent(item.iconName)

                    return (
                      <Link key={item.id} href={item.href} onClick={onClose}>
                        <motion.div
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            'relative flex items-center gap-3 px-4 py-4 mb-1 rounded-lg',
                            'transition-all duration-200 cursor-pointer',
                            // Larger touch targets for mobile
                            'min-h-[56px] touch-manipulation',
                            active
                              ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400'
                              : 'text-gray-700 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-800'
                          )}
                        >
                          {/* Active Indicator */}
                          {active && (
                            <motion.div
                              layoutId="mobileActiveIndicator"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-blue-600 to-purple-600 rounded-r-full"
                              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                          )}

                          {/* Icon */}
                          <div className="flex-shrink-0">
                            <Icon className={cn(
                              'w-6 h-6 transition-colors',
                              active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                            )} />
                          </div>

                          {/* Label */}
                          <span className={cn(
                            'text-base font-medium flex-1',
                            active ? 'text-blue-600 dark:text-blue-400' : ''
                          )}>
                            {item.label}
                          </span>

                          {/* Badge */}
                          {item.badge && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex-shrink-0"
                            >
                              <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-bold text-white bg-red-500 rounded-full">
                                {item.badge}
                              </span>
                            </motion.div>
                          )}
                        </motion.div>
                      </Link>
                    )
                  })}
                </div>
              ))}
            </nav>

            {/* User Profile Section - Fixed at bottom */}
            {user && (
              <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {user.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.imageUrl}
                        alt={user.firstName || 'User'}
                        className="w-12 h-12 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                        {user.firstName?.[0] || 'U'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.firstName || 'User'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      Level 1 Learner
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

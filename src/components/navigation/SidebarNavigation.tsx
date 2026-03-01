'use client'

/**
 * Sidebar Navigation Component
 * Vertical navigation bar with icon-based menu
 * Features: active state highlighting, hover effects, collapsible for mobile
 */

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Brain, Home, Network, BookOpen, Code, Users, BarChart, Settings, Trophy, Target, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import { navigationConfig, type NavigationIconName } from './navigation-config'
import { NavigationItem } from './types'
import { useUser } from '@clerk/nextjs'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Avatar as _Avatar } from '@/components/shared/Avatar'

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

interface SidebarNavigationProps {
  className?: string
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export function SidebarNavigation({
  className,
  collapsed: controlledCollapsed,
  onCollapsedChange
}: SidebarNavigationProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const pathname = usePathname()
  const { user } = useUser()

  // Use controlled state if provided, otherwise use internal state
  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed
  const setCollapsed = onCollapsedChange || setInternalCollapsed

  const isActive = (item: NavigationItem) => {
    if (item.href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(item.href)
  }

  return (
    <motion.aside
      initial={false}
      animate={{
        width: collapsed ? '80px' : '240px'
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800',
        'flex flex-col z-40',
        'transition-all duration-300',
        className
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <Link href="/dashboard">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex-shrink-0">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap overflow-hidden"
                >
                  Codo
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </Link>

        {/* Collapse Toggle - Desktop Only */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}
        </motion.button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navigationConfig.sections.map((section, sectionIndex) => (
          <div key={section.id} className={cn(sectionIndex > 0 && 'mt-6')}>
            {section.title && !collapsed && (
              <div className="px-3 mb-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {section.title}
                </span>
              </div>
            )}

            {section.items.map((item) => {
              const active = isActive(item)
              const Icon = getIconComponent(item.iconName)

              return (
                <Link key={item.id} href={item.href}>
                  <motion.div
                    whileHover={{ x: collapsed ? 0 : 4 }}
                    className={cn(
                      'relative flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg',
                      'transition-all duration-200 cursor-pointer group',
                      active
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    {/* Active Indicator */}
                    {active && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-r-full"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}

                    {/* Icon */}
                    <div className={cn('flex-shrink-0', collapsed ? 'mx-auto' : '')}>
                      <Icon className={cn(
                        'w-5 h-5 transition-colors',
                        active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100'
                      )} />
                    </div>

                    {/* Label */}
                    <AnimatePresence mode="wait">
                      {!collapsed && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex-1 overflow-hidden"
                        >
                          <span className={cn(
                            'text-sm font-medium whitespace-nowrap',
                            active ? 'text-blue-600 dark:text-blue-400' : ''
                          )}>
                            {item.label}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Badge */}
                    {item.badge && !collapsed && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex-shrink-0"
                      >
                        <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
                          {item.badge}
                        </span>
                      </motion.div>
                    )}

                    {/* Tooltip for collapsed state */}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                        {item.label}
                        {item.badge && (
                          <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User Profile Section */}
      {user && (
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <div className={cn(
            'flex items-center gap-3',
            collapsed && 'justify-center'
          )}>
            <div className="flex-shrink-0">
              {user.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.imageUrl}
                  alt={user.firstName || 'User'}
                  className="w-10 h-10 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {user.firstName?.[0] || 'U'}
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 overflow-hidden"
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.firstName || 'User'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    Level {(user.publicMetadata?.current_level as number) || 1} Learner
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.aside>
  )
}

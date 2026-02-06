'use client'

/**
 * Top Navigation Bar Component
 * Horizontal navigation with branding, notifications, search, and user profile
 * Features: notification center, quick actions, theme toggle, responsive design
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Search,
  Sparkles,
  MessageSquare,
  Menu,
  X,
  Trophy,
  BookOpen,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/button'
import { useUser, UserButton } from '@clerk/nextjs'
import { Avatar } from '@/components/shared/Avatar'
import Link from 'next/link'

interface Notification {
  id: string
  type: 'message' | 'achievement' | 'lesson' | 'system'
  title: string
  description: string
  timestamp: string
  read: boolean
  icon?: React.ReactNode
  href?: string
}

interface TopNavigationBarProps {
  className?: string
  onMenuClick?: () => void
  showMenuButton?: boolean
}

export function TopNavigationBar({
  className,
  onMenuClick,
  showMenuButton = true
}: TopNavigationBarProps) {
  const { user } = useUser()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const notificationRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // Mock notifications - in production, fetch from API
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'message',
      title: 'New message from Sarah',
      description: 'Great job on completing the React lesson!',
      timestamp: '5 min ago',
      read: false,
      icon: <MessageSquare className="w-4 h-4" />,
      href: '/dashboard#ai-peers'
    },
    {
      id: '2',
      type: 'achievement',
      title: 'Achievement Unlocked!',
      description: 'You earned the "10 Day Streak" badge',
      timestamp: '1 hour ago',
      read: false,
      icon: <Trophy className="w-4 h-4" />,
      href: '/dashboard#achievements'
    },
    {
      id: '3',
      type: 'lesson',
      title: 'Lesson Completed',
      description: 'React Hooks Deep Dive - 150 XP earned',
      timestamp: '2 hours ago',
      read: true,
      icon: <BookOpen className="w-4 h-4" />,
      href: '/lessons'
    }
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-4 h-4 text-blue-600" />
      case 'achievement':
        return <Trophy className="w-4 h-4 text-yellow-600" />
      case 'lesson':
        return <BookOpen className="w-4 h-4 text-green-600" />
      case 'system':
        return <AlertCircle className="w-4 h-4 text-gray-600" />
      default:
        return <Bell className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md',
        'border-b border-gray-200 dark:border-gray-800',
        'transition-all duration-200',
        className
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left Section - Menu Button (Mobile) */}
        <div className="flex items-center gap-4">
          {showMenuButton && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </motion.button>
          )}

          {/* Search Button */}
          <div className="relative" ref={searchRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSearch(!showSearch)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Search className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-400">
                Search...
              </span>
              <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded">
                ⌘K
              </kbd>
            </motion.button>

            {/* Search Dropdown */}
            <AnimatePresence>
              {showSearch && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="p-3">
                    <input
                      type="text"
                      placeholder="Search lessons, concepts, peers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                      Quick Links
                    </div>
                    <Link href="/lessons">
                      <div className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer text-sm">
                        Browse All Lessons
                      </div>
                    </Link>
                    <Link href="/knowledge-graph-demo">
                      <div className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer text-sm">
                        View Knowledge Graph
                      </div>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Action Buttons */}
          <Link href="/lessons">
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Start Learning</span>
            </Button>
          </Link>

          <Link href="/dashboard#ai-peers">
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-medium">Ask AI Peer</span>
            </Button>
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full"
                >
                  {unreadCount}
                </motion.span>
              )}
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <Link
                          key={notification.id}
                          href={notification.href || '#'}
                          onClick={() => {
                            markAsRead(notification.id)
                            setShowNotifications(false)
                          }}
                        >
                          <motion.div
                            whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                            className={cn(
                              'p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors',
                              !notification.read && 'bg-blue-50/50 dark:bg-blue-900/10'
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                {notification.icon || getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                    {notification.title}
                                  </h4>
                                  {!notification.read && (
                                    <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1" />
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  {notification.description}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  {notification.timestamp}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        </Link>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                      <Link href="/dashboard#notifications">
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          View all notifications
                        </button>
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-9 h-9 ring-2 ring-gray-200 dark:ring-gray-700'
                  }
                }}
                afterSignOutUrl="/"
              />
              <div className="hidden xl:block">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.firstName || 'User'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Level 1
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  )
}

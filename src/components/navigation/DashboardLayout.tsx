'use client'

/**
 * Dashboard Layout Component
 * Combines sidebar and top navigation with responsive behavior
 * Features: mobile hamburger menu, navigation state management, responsive layout
 */

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { SidebarNavigation } from './SidebarNavigation'
import { TopNavigationBar } from './TopNavigationBar'
import { MobileNavigation } from './MobileNavigation'

interface DashboardLayoutProps {
  children: React.ReactNode
  className?: string
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    if (!isMobile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMobileMenuOpen(false)
    }
  }, [isMobile])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <SidebarNavigation
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
      </div>

      {/* Mobile Navigation with Swipe Gestures */}
      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          'transition-all duration-300',
          !isMobile && (sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-60')
        )}
      >
        {/* Top Navigation */}
        <TopNavigationBar
          onMenuClick={() => setMobileMenuOpen(true)}
          showMenuButton={isMobile}
        />

        {/* Page Content */}
        <main className={cn('min-h-[calc(100vh-4rem)]', className)}>
          {children}
        </main>
      </div>
    </div>
  )
}

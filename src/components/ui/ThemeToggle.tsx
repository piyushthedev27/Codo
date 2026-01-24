'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Handle mounting state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 w-9 h-9 animate-pulse" />
    )
  }

  const toggleTheme = () => {
    if (theme === 'system') {
      // If system theme, check current system preference and toggle opposite
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      setTheme(systemTheme === 'dark' ? 'light' : 'dark')
    } else {
      // Toggle between light and dark
      setTheme(theme === 'light' ? 'dark' : 'light')
    }
  }

  // Determine current effective theme for display
  const effectiveTheme = theme === 'system' 
    ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 overflow-hidden"
      aria-label={`Switch to ${effectiveTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Sun Icon */}
      <motion.div
        initial={false}
        animate={{
          scale: effectiveTheme === 'light' ? 1 : 0,
          opacity: effectiveTheme === 'light' ? 1 : 0,
          rotate: effectiveTheme === 'light' ? 0 : 180,
        }}
        transition={{ 
          duration: 0.3,
          ease: "easeInOut"
        }}
        className="absolute inset-2 flex items-center justify-center"
      >
        <Sun className="w-5 h-5 text-yellow-500" />
      </motion.div>
      
      {/* Moon Icon */}
      <motion.div
        initial={false}
        animate={{
          scale: effectiveTheme === 'dark' ? 1 : 0,
          opacity: effectiveTheme === 'dark' ? 1 : 0,
          rotate: effectiveTheme === 'dark' ? 0 : -180,
        }}
        transition={{ 
          duration: 0.3,
          ease: "easeInOut"
        }}
        className="absolute inset-2 flex items-center justify-center"
      >
        <Moon className="w-5 h-5 text-blue-400" />
      </motion.div>
      
      {/* Invisible placeholder to maintain button size */}
      <div className="w-5 h-5 opacity-0">
        <Sun className="w-5 h-5" />
      </div>
    </motion.button>
  )
}
'use client'

import { Moon } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Handle mounting state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="p-2 rounded-lg bg-gray-800 w-9 h-9 animate-pulse" />
    )
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-200 overflow-hidden cursor-default"
      aria-label="Dark mode (always active)"
    >
      {/* Moon Icon - Always visible since we're always in dark mode */}
      <motion.div
        initial={false}
        animate={{
          scale: 1,
          opacity: 1,
          rotate: 0,
        }}
        transition={{ 
          duration: 0.3,
          ease: "easeInOut"
        }}
        className="flex items-center justify-center"
      >
        <Moon className="w-5 h-5 text-blue-400" />
      </motion.div>
    </motion.div>
  )
}
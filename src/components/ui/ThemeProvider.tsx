'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  _theme: Theme
  setTheme: (_theme: Theme) => void
}

const initialState: ThemeProviderState = {
  _theme: 'dark',
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _defaultTheme = 'dark',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _storageKey = 'codo-ui-theme',
  ...props
}: ThemeProviderProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [theme] = useState<Theme>('dark') // Always dark
  const [mounted, setMounted] = useState(false)

  // Handle mounting state to prevent hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement
    
    // Always apply dark theme
    root.classList.remove('light')
    root.classList.add('dark')
    root.setAttribute('data-theme', 'dark')
    root.style.colorScheme = 'dark'
    
    // Force dark background
    document.body.style.background = 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e1b4b 100%)'
    document.body.style.backgroundAttachment = 'fixed'
    document.body.style.color = 'hsl(210 40% 98%)'
    document.body.style.minHeight = '100vh'
    
  }, [mounted])

  const value = {
    _theme: 'dark' as Theme,
    setTheme: () => {
      // Do nothing - theme is always dark
    },
  }

  // Prevent flash of unstyled content during hydration
  if (!mounted) {
    return (
      <div className="min-h-screen" style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e1b4b 100%)',
        color: 'hsl(210 40% 98%)'
      }}>
        <div style={{ visibility: 'hidden' }}>{children}</div>
      </div>
    )
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
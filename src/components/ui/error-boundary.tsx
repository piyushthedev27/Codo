/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Error Boundary Component
 * Catches React errors and displays user-friendly error messages
 */

'use client'

import React, { Component, ReactNode } from 'react'
import { ErrorDisplay } from './error-display'
import { createErrorBoundary } from '@/lib/api/error-handler'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: any
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: any) => void
  feature?: string
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error Boundary caught an error:', error, errorInfo)
    
    this.setState({
      errorInfo
    })

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log to error reporting service if available
    if (typeof window !== 'undefined' && (window as any).reportError) {
      (window as any).reportError(error)
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Generate user-friendly error message
      const userError = createErrorBoundary(this.state.error, this.state.errorInfo)

      return (
        <div className="min-h-[200px] flex items-center justify-center p-4">
          <ErrorDisplay
            error={userError}
            onAction={(action) => {
              if (action === 'retry') {
                this.handleRetry()
              }
            }}
          />
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Hook for error boundary context
export function useErrorHandler() {
  const reportError = (error: Error, context?: string) => {
    console.error(`Error in ${context || 'component'}:`, error)
    
    // Report to error boundary if available
    if (typeof window !== 'undefined' && (window as any).reportError) {
      (window as any).reportError(error)
    }
  }

  return { reportError }
}

// Specialized error boundaries for different features
export function DashboardErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      feature="dashboard"
      onError={(error, errorInfo) => {
        console.error('Dashboard error:', error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export function LessonErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      feature="lessons"
      onError={(error, errorInfo) => {
        console.error('Lesson error:', error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export function VoiceErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      feature="voice-coaching"
      onError={(error, errorInfo) => {
        console.error('Voice coaching error:', error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export function CollaborativeErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      feature="collaborative-coding"
      onError={(error, errorInfo) => {
        console.error('Collaborative coding error:', error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
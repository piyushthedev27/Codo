/**
 * Error Display Component
 * Shows user-friendly error messages with appropriate actions
 */

import React from 'react'
import { AlertCircle, Wifi, WifiOff, RefreshCw, Home, LogIn } from 'lucide-react'
import { Button } from './button'
import { Card } from './card'
import type { UserFriendlyError } from '@/lib/api/error-handler'

interface ErrorDisplayProps {
  error: UserFriendlyError
  onAction?: (action: string) => void
  className?: string
  compact?: boolean
}

const getErrorIcon = (code?: string, severity?: string) => {
  switch (code) {
    case 'OFFLINE':
    case 'NETWORK_ERROR':
      return <WifiOff className="h-8 w-8 text-orange-500" />
    case 'OFFLINE_MODE':
      return <Wifi className="h-8 w-8 text-blue-500" />
    default:
      switch (severity) {
        case 'info':
          return <AlertCircle className="h-8 w-8 text-blue-500" />
        case 'warning':
          return <AlertCircle className="h-8 w-8 text-orange-500" />
        case 'error':
        default:
          return <AlertCircle className="h-8 w-8 text-red-500" />
      }
  }
}

const getActionIcon = (action?: string) => {
  switch (action) {
    case 'retry':
      return <RefreshCw className="h-4 w-4" />
    case 'home':
      return <Home className="h-4 w-4" />
    case 'signin':
      return <LogIn className="h-4 w-4" />
    default:
      return null
  }
}

const getActionHandler = (action?: string, onAction?: (action: string) => void) => {
  if (!action || !onAction) return undefined

  return () => {
    switch (action) {
      case 'refresh':
        window.location.reload()
        break
      case 'home':
        window.location.href = '/'
        break
      case 'signin':
        window.location.href = '/sign-in'
        break
      default:
        onAction(action)
    }
  }
}

export function ErrorDisplay({ 
  error, 
  onAction, 
  className = '', 
  compact = false 
}: ErrorDisplayProps) {
  const icon = getErrorIcon(error.code, error.severity)
  const actionIcon = getActionIcon(error.action)
  const handleAction = getActionHandler(error.action, onAction)

  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg border ${
        error.severity === 'error' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' :
        error.severity === 'warning' ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950' :
        'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
      } ${className}`}>
        <div className="flex-shrink-0">
          {React.cloneElement(icon, { className: 'h-5 w-5' })}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${
            error.severity === 'error' ? 'text-red-800 dark:text-red-200' :
            error.severity === 'warning' ? 'text-orange-800 dark:text-orange-200' :
            'text-blue-800 dark:text-blue-200'
          }`}>
            {error.title}
          </p>
          <p className={`text-sm ${
            error.severity === 'error' ? 'text-red-600 dark:text-red-300' :
            error.severity === 'warning' ? 'text-orange-600 dark:text-orange-300' :
            'text-blue-600 dark:text-blue-300'
          }`}>
            {error.message}
          </p>
        </div>
        {error.action && error.actionLabel && (
          <Button
            size="sm"
            variant={error.severity === 'error' ? 'destructive' : 'default'}
            onClick={handleAction}
            className="flex-shrink-0"
          >
            {actionIcon}
            {error.actionLabel}
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="flex-shrink-0">
          {icon}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {error.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            {error.message}
          </p>
        </div>

        {error.action && error.actionLabel && (
          <Button
            onClick={handleAction}
            variant={error.severity === 'error' ? 'destructive' : 'default'}
            className="flex items-center gap-2"
          >
            {actionIcon}
            {error.actionLabel}
          </Button>
        )}

        {error.code && (
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Error Code: {error.code}
          </p>
        )}
      </div>
    </Card>
  )
}

// Specialized error displays for common scenarios
export function NetworkErrorDisplay({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorDisplay
      error={{
        title: 'Connection Problem',
        message: 'We\'re having trouble connecting to our servers. Please check your internet connection and try again.',
        action: 'retry',
        actionLabel: 'Try Again',
        severity: 'error',
        code: 'NETWORK_ERROR',
        retryable: true
      }}
      onAction={onRetry ? () => onRetry() : undefined}
    />
  )
}

export function OfflineDisplay({ onContinue }: { onContinue?: () => void }) {
  return (
    <ErrorDisplay
      error={{
        title: 'You\'re Offline',
        message: 'No internet connection detected. You can continue learning with cached content.',
        action: 'continue',
        actionLabel: 'Continue Offline',
        severity: 'info',
        code: 'OFFLINE_MODE',
        retryable: false
      }}
      onAction={onContinue ? () => onContinue() : undefined}
    />
  )
}

export function LoadingErrorDisplay({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorDisplay
      error={{
        title: 'Failed to Load',
        message: 'We couldn\'t load this content. This might be a temporary issue.',
        action: 'retry',
        actionLabel: 'Try Again',
        severity: 'error',
        code: 'LOADING_ERROR',
        retryable: true
      }}
      onAction={onRetry ? () => onRetry() : undefined}
      compact
    />
  )
}

export function MaintenanceDisplay() {
  return (
    <ErrorDisplay
      error={{
        title: 'Scheduled Maintenance',
        message: 'We\'re performing scheduled maintenance to improve your experience. Service will be restored shortly.',
        action: 'wait',
        actionLabel: 'Check Status',
        severity: 'info',
        code: 'MAINTENANCE',
        retryable: true
      }}
    />
  )
}
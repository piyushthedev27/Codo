/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Error Handler
 * Provides user-friendly error messages and error boundary functionality
 */

export interface UserFriendlyError {
  title: string
  message: string
  action?: string
  actionLabel?: string
  severity: 'info' | 'warning' | 'error'
  code?: string
  retryable: boolean
}

export interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  url?: string
  timestamp: string
}

class ErrorHandler {
  private static instance: ErrorHandler

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getNetworkErrorMessage(_error: any): UserFriendlyError {
    if (!navigator.onLine) {
      return {
        title: 'No Internet Connection',
        message: 'You appear to be offline. We\'ll use cached content when possible and sync your progress when you\'re back online.',
        action: 'retry',
        actionLabel: 'Try Again',
        severity: 'warning',
        code: 'OFFLINE',
        retryable: true
      }
    }

    return {
      title: 'Connection Problem',
      message: 'We\'re having trouble connecting to our servers. This might be a temporary issue.',
      action: 'retry',
      actionLabel: 'Retry',
      severity: 'error',
      code: 'NETWORK_ERROR',
      retryable: true
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getHttpErrorMessage(status: number, _statusText: string): UserFriendlyError {
    switch (status) {
      case 400:
        return {
          title: 'Invalid Request',
          message: 'There was a problem with your request. Please check your input and try again.',
          severity: 'error',
          code: 'BAD_REQUEST',
          retryable: false
        }

      case 401:
        return {
          title: 'Authentication Required',
          message: 'You need to sign in to access this feature.',
          action: 'signin',
          actionLabel: 'Sign In',
          severity: 'warning',
          code: 'UNAUTHORIZED',
          retryable: false
        }

      case 403:
        return {
          title: 'Access Denied',
          message: 'You don\'t have permission to access this feature.',
          severity: 'error',
          code: 'FORBIDDEN',
          retryable: false
        }

      case 404:
        return {
          title: 'Not Found',
          message: 'The content you\'re looking for doesn\'t exist or has been moved.',
          action: 'home',
          actionLabel: 'Go Home',
          severity: 'error',
          code: 'NOT_FOUND',
          retryable: false
        }

      case 429:
        return {
          title: 'Too Many Requests',
          message: 'You\'re making requests too quickly. Please wait a moment and try again.',
          action: 'retry',
          actionLabel: 'Try Again',
          severity: 'warning',
          code: 'RATE_LIMITED',
          retryable: true
        }

      case 500:
        return {
          title: 'Server Error',
          message: 'Something went wrong on our end. Our team has been notified and is working on a fix.',
          action: 'retry',
          actionLabel: 'Try Again',
          severity: 'error',
          code: 'SERVER_ERROR',
          retryable: true
        }

      case 502:
      case 503:
      case 504:
        return {
          title: 'Service Temporarily Unavailable',
          message: 'Our servers are temporarily down for maintenance. Please try again in a few minutes.',
          action: 'retry',
          actionLabel: 'Try Again',
          severity: 'warning',
          code: 'SERVICE_UNAVAILABLE',
          retryable: true
        }

      default:
        return {
          title: 'Something Went Wrong',
          message: `We encountered an unexpected error (${status}). Please try again.`,
          action: 'retry',
          actionLabel: 'Try Again',
          severity: 'error',
          code: 'UNKNOWN_HTTP_ERROR',
          retryable: true
        }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getAPIErrorMessage(_error: any): UserFriendlyError {
    // OpenAI API specific errors
    if (_error.message?.includes('OpenAI')) {
      return {
        title: 'AI Service Unavailable',
        message: 'Our AI features are temporarily unavailable. You can still access cached lessons and practice challenges.',
        action: 'continue',
        actionLabel: 'Continue with Cached Content',
        severity: 'warning',
        code: 'AI_SERVICE_ERROR',
        retryable: true
      }
    }

    // Database errors
    if (_error.message?.includes('database') || _error.message?.includes('Supabase')) {
      return {
        title: 'Data Sync Issue',
        message: 'We\'re having trouble syncing your progress. Your local progress is saved and will sync when the connection is restored.',
        action: 'continue',
        actionLabel: 'Continue Learning',
        severity: 'warning',
        code: 'DATABASE_ERROR',
        retryable: true
      }
    }

    // Voice API errors
    if (_error.message?.includes('speech') || _error.message?.includes('voice')) {
      return {
        title: 'Voice Feature Unavailable',
        message: 'Voice coaching is temporarily unavailable. You can continue with text-based learning.',
        action: 'continue',
        actionLabel: 'Continue with Text',
        severity: 'info',
        code: 'VOICE_ERROR',
        retryable: true
      }
    }

    return {
      title: 'Service Error',
      message: 'One of our services is experiencing issues. We\'re working to resolve this quickly.',
      action: 'retry',
      actionLabel: 'Try Again',
      severity: 'error',
      code: 'API_ERROR',
      retryable: true
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public handleError(_error: any, context?: Partial<ErrorContext>): UserFriendlyError {
    const fullContext: ErrorContext = {
      timestamp: new Date().toISOString(),
      ...context
    }

    // Log error for debugging
    console.error('Error handled:', _error, fullContext)

    // Network errors (fetch failures)
    if (_error.name === 'TypeError' && _error.message.includes('fetch')) {
      return this.getNetworkErrorMessage(_error)
    }

    // HTTP errors
    if (_error.status && typeof _error.status === 'number') {
      return this.getHttpErrorMessage(_error.status, _error.statusText || '')
    }

    // API-specific errors
    if (_error.message) {
      return this.getAPIErrorMessage(_error)
    }

    // Generic fallback
    return {
      title: 'Unexpected Error',
      message: 'Something unexpected happened. Please try refreshing the page or contact support if the problem persists.',
      action: 'refresh',
      actionLabel: 'Refresh Page',
      severity: 'error',
      code: 'UNKNOWN_ERROR',
      retryable: true
    }
  }

  public getContextualMessage(_error: any, feature: string): UserFriendlyError {
    const baseError = this.handleError(_error)

    // Customize message based on feature context
    switch (feature) {
      case 'dashboard':
        return {
          ...baseError,
          message: 'We couldn\'t load your dashboard data. ' + (baseError.retryable
            ? 'We\'ll show you cached information while we try to reconnect.'
            : baseError.message)
        }

      case 'lessons':
        return {
          ...baseError,
          message: 'We couldn\'t load this lesson. ' + (baseError.retryable
            ? 'You can try a cached lesson or wait for the connection to restore.'
            : baseError.message)
        }

      case 'voice-coaching':
        return {
          ...baseError,
          title: 'Voice Coaching Unavailable',
          message: 'Voice features aren\'t working right now. You can continue with text-based learning.',
          action: 'continue',
          actionLabel: 'Continue with Text',
          severity: 'info'
        }

      case 'collaborative-coding':
        return {
          ...baseError,
          title: 'Collaboration Unavailable',
          message: 'Real-time collaboration isn\'t available. You can still practice coding challenges solo.',
          action: 'continue',
          actionLabel: 'Practice Solo',
          severity: 'info'
        }

      case 'knowledge-graph':
        return {
          ...baseError,
          message: 'We couldn\'t update your learning progress. ' + (baseError.retryable
            ? 'Your progress is saved locally and will sync when possible.'
            : baseError.message)
        }

      default:
        return baseError
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public createErrorBoundaryMessage(_error: Error, _errorInfo: any): UserFriendlyError {
    return {
      title: 'Something Went Wrong',
      message: 'This part of the app crashed unexpectedly. Don\'t worry - your progress is saved. Try refreshing the page.',
      action: 'refresh',
      actionLabel: 'Refresh Page',
      severity: 'error',
      code: 'COMPONENT_CRASH',
      retryable: true
    }
  }

  public getOfflineMessage(): UserFriendlyError {
    return {
      title: 'You\'re Offline',
      message: 'No internet connection detected. You can continue learning with cached content, and your progress will sync when you\'re back online.',
      action: 'continue',
      actionLabel: 'Continue Offline',
      severity: 'info',
      code: 'OFFLINE_MODE',
      retryable: false
    }
  }

  public getMaintenanceMessage(): UserFriendlyError {
    return {
      title: 'Scheduled Maintenance',
      message: 'We\'re performing scheduled maintenance to improve your experience. Service will be restored shortly.',
      action: 'wait',
      actionLabel: 'Check Status',
      severity: 'info',
      code: 'MAINTENANCE',
      retryable: true
    }
  }
}

export const errorHandler = ErrorHandler.getInstance()

// Utility functions for common error scenarios
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handleNetworkError = (_error: any, context?: Partial<ErrorContext>) =>
  errorHandler.handleError(_error, context)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handleAPIError = (_error: any, feature: string, context?: Partial<ErrorContext>) =>
  errorHandler.getContextualMessage(_error, feature)

export const getOfflineMessage = () => errorHandler.getOfflineMessage()

export const getMaintenanceMessage = () => errorHandler.getMaintenanceMessage()

// Error boundary helper
export const createErrorBoundary = (_error: Error, _errorInfo: any) =>
  errorHandler.createErrorBoundaryMessage(_error, _errorInfo)
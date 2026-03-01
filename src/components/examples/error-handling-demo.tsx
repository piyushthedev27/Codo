/* eslint-disable react/jsx-no-comment-textnodes, react-hooks/static-components */
/**
 * Error Handling Demo Component
 * Demonstrates the new error handling, retry logic, and offline functionality
 */

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ErrorDisplay, NetworkErrorDisplay, OfflineDisplay, LoadingErrorDisplay } from '@/components/ui/error-display'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ErrorBoundary as _ErrorBoundary, DashboardErrorBoundary } from '@/components/ui/error-boundary'
import { ConnectionStatus, ConnectionIndicator, OfflineBanner, ConnectionStatusCard } from '@/components/ui/connection-status'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useDashboard, useInsights as _useInsights, useApiCall } from '@/lib/hooks/useApiState'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { apiClient as _apiClient } from '@/lib/api/api-client'
import { Badge } from '@/components/ui/badge'

export function ErrorHandlingDemo() {
  const [simulateError, setSimulateError] = useState(false)
  
  // Example of using the new API hooks
  const { data: dashboardData, loading, error, fromCache, demo, retry } = useDashboard()
  const { execute: executeApiCall, loading: callLoading, error: callError } = useApiCall()

  // Simulate different error scenarios
  const simulateNetworkError = () => {
    executeApiCall(() => 
      Promise.reject(new Error('TypeError: Failed to fetch'))
    )
  }

  const simulateServerError = () => {
    executeApiCall(() => 
      Promise.reject(Object.assign(new Error('Internal Server Error'), { status: 500 }))
    )
  }

  const simulateRateLimitError = () => {
    executeApiCall(() => 
      Promise.reject(Object.assign(new Error('Too Many Requests'), { status: 429 }))
    )
  }

  const testOfflineMode = () => {
    // This would typically be triggered by going offline
    console.log('Testing offline mode - check network tab')
  }

  // Component that throws an error for testing error boundary
  const ErrorThrowingComponent = () => {
    if (simulateError) {
      throw new Error('Simulated component error for testing')
    }
    return <div>This component is working fine!</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Error Handling Demo</h1>
        <ConnectionStatus showDetails />
      </div>

      <OfflineBanner />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API State Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Dashboard API Demo
              <ConnectionIndicator />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={loading ? 'secondary' : 'default'}>
                {loading ? 'Loading...' : 'Loaded'}
              </Badge>
              {fromCache && <Badge variant="outline">From Cache</Badge>}
              {demo && <Badge variant="outline">Demo Data</Badge>}
            </div>

            {error && (
              <ErrorDisplay
                error={error}
                onAction={(action) => {
                  if (action === 'retry') {
                    retry()
                  }
                }}
                compact
              />
            )}

            {dashboardData && !error && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Dashboard loaded successfully! User: {dashboardData.profile?.first_name}
              </div>
            )}

            <Button onClick={retry} disabled={loading} size="sm">
              Refresh Dashboard
            </Button>
          </CardContent>
        </Card>

        {/* Error Simulation Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Error Simulation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={simulateNetworkError} 
                disabled={callLoading}
                variant="outline"
                size="sm"
              >
                Network Error
              </Button>
              <Button 
                onClick={simulateServerError} 
                disabled={callLoading}
                variant="outline"
                size="sm"
              >
                Server Error
              </Button>
              <Button 
                onClick={simulateRateLimitError} 
                disabled={callLoading}
                variant="outline"
                size="sm"
              >
                Rate Limit
              </Button>
              <Button 
                onClick={testOfflineMode} 
                variant="outline"
                size="sm"
              >
                Test Offline
              </Button>
            </div>

            {callError && (
              <ErrorDisplay
                error={callError}
                onAction={(action) => {
                  if (action === 'retry') {
                    // Retry the last failed call
                    console.log('Retrying...')
                  }
                }}
                compact
              />
            )}

            {callLoading && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Executing API call...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Boundary Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Error Boundary Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setSimulateError(!simulateError)}
              variant={simulateError ? 'destructive' : 'default'}
              size="sm"
            >
              {simulateError ? 'Fix Component' : 'Break Component'}
            </Button>

            <DashboardErrorBoundary>              <div className="p-4 border rounded-lg">
                // eslint-disable-next-line react-hooks/static-components
                <ErrorThrowingComponent />
              </div>
            </DashboardErrorBoundary>
          </CardContent>
        </Card>

        {/* Connection Status Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ConnectionStatusCard />
          </CardContent>
        </Card>
      </div>

      {/* Error Display Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Error Display Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Network Error</h4>
              <NetworkErrorDisplay onRetry={() => console.log('Retrying...')} />
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Offline Mode</h4>
              <OfflineDisplay onContinue={() => console.log('Continuing offline...')} />
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Loading Error (Compact)</h4>
              <LoadingErrorDisplay onRetry={() => console.log('Retrying...')} />
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Custom Error</h4>
              <ErrorDisplay
                error={{
                  title: 'Voice Feature Unavailable',
                  message: 'Voice coaching is temporarily unavailable. You can continue with text-based learning.',
                  action: 'continue',
                  actionLabel: 'Continue with Text',
                  severity: 'info',
                  code: 'VOICE_ERROR',
                  retryable: true
                }}
                onAction={(action) => console.log('Action:', action)}
                compact
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
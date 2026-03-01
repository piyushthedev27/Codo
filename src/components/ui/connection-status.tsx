/**
 * Connection Status Component
 * Shows online/offline status and cached data indicators
 */

'use client'

import React from 'react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Wifi, WifiOff, Database, _AlertCircle } from 'lucide-react'
import { useConnectionStatus } from '@/lib/hooks/useApiState'
import { Badge } from './badge'

interface ConnectionStatusProps {
  showDetails?: boolean
  className?: string
}

export function ConnectionStatus({ showDetails = false, className = '' }: ConnectionStatusProps) {
  const { isOnline, hasOfflineData, connectionStatus } = useConnectionStatus()

  if (showDetails) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-orange-500" />
          )}
          <span className="text-sm font-medium">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {hasOfflineData && (
          <div className="flex items-center gap-1">
            <Database className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Cached data available
            </span>
          </div>
        )}

        {connectionStatus.cacheStats.totalEntries > 0 && (
          <Badge variant="secondary" className="text-xs">
            {connectionStatus.cacheStats.totalEntries} cached items
          </Badge>
        )}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {isOnline ? (
        <div title="Online">
          <Wifi className="h-4 w-4 text-green-500" />
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <div title="Offline">
            <WifiOff className="h-4 w-4 text-orange-500" />
          </div>
          {hasOfflineData && (
            <div title="Cached data available">
              <Database className="h-3 w-3 text-blue-500" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Compact status indicator for headers/navbars
export function ConnectionIndicator({ className = '' }: { className?: string }) {
  const { isOnline, hasOfflineData } = useConnectionStatus()

  return (
    <div className={`flex items-center ${className}`}>
      <div
        className={`w-2 h-2 rounded-full ${
          isOnline 
            ? 'bg-green-500' 
            : hasOfflineData 
              ? 'bg-orange-500' 
              : 'bg-red-500'
        }`}
        title={
          isOnline 
            ? 'Online' 
            : hasOfflineData 
              ? 'Offline - cached data available' 
              : 'Offline - no cached data'
        }
      />
    </div>
  )
}

// Banner for offline mode
export function OfflineBanner() {
  const { isOnline, hasOfflineData } = useConnectionStatus()

  if (isOnline) return null

  return (
    <div className="bg-orange-50 dark:bg-orange-950 border-b border-orange-200 dark:border-orange-800 px-4 py-2">
      <div className="flex items-center justify-center gap-2 text-sm">
        <WifiOff className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        <span className="text-orange-800 dark:text-orange-200">
          You&apos;re offline. 
          {hasOfflineData 
            ? ' Using cached content - your progress will sync when you\'re back online.' 
            : ' Some features may not be available.'
          }
        </span>
        {hasOfflineData && (
          <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        )}
      </div>
    </div>
  )
}

// Status card for settings/debug pages
export function ConnectionStatusCard() {
  const { isOnline, hasOfflineData, connectionStatus } = useConnectionStatus()

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="font-semibold mb-3">Connection Status</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Network Status</span>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Online
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  Offline
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Offline Data</span>
          <div className="flex items-center gap-2">
            <Database className={`h-4 w-4 ${hasOfflineData ? 'text-blue-500' : 'text-gray-400'}`} />
            <span className="text-sm font-medium">
              {hasOfflineData ? 'Available' : 'None'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Cached Items</span>
          <span className="text-sm font-medium">
            {connectionStatus.cacheStats.totalEntries}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Cache Size</span>
          <span className="text-sm font-medium">
            {Math.round(connectionStatus.cacheStats.totalSize / 1024)} KB
          </span>
        </div>
      </div>
    </div>
  )
}
/**
 * API State Hook
 * React hook for managing API call states with error handling
 */

import { useState, useCallback, useEffect } from 'react'
import { apiClient, type APIResponse } from '@/lib/api/api-client'
import { offlineManager } from '@/lib/api/offline-manager'
import type { UserFriendlyError } from '@/lib/api/error-handler'

export interface APIState<T = any> {
  data: T | null
  loading: boolean
  error: UserFriendlyError | null
  fromCache: boolean
  demo: boolean
  retry: () => void
  clear: () => void
}

export function useApiState<T = any>(
  apiCall: () => Promise<APIResponse<T>>,
  dependencies: any[] = []
): APIState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<UserFriendlyError | null>(null)
  const [fromCache, setFromCache] = useState(false)
  const [demo, setDemo] = useState(false)

  const executeCall = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiCall()
      
      if (response.success) {
        setData(response.data || null)
        setFromCache(response.fromCache || false)
        setDemo(response.demo || false)
        setError(response.error || null) // May have warning even on success
      } else {
        setError(response.error || null)
        setData(null)
        setFromCache(false)
        setDemo(false)
      }
    } catch (err) {
      console.error('API call failed:', err)
      setError({
        title: 'Unexpected Error',
        message: 'Something went wrong. Please try again.',
        severity: 'error',
        retryable: true
      })
      setData(null)
      setFromCache(false)
      setDemo(false)
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  const retry = useCallback(() => {
    executeCall()
  }, [executeCall])

  const clear = useCallback(() => {
    setData(null)
    setError(null)
    setFromCache(false)
    setDemo(false)
    setLoading(false)
  }, [])

  // Execute on mount and when dependencies change
  useEffect(() => {
    executeCall()
  }, dependencies)

  return {
    data,
    loading,
    error,
    fromCache,
    demo,
    retry,
    clear
  }
}

// Specialized hooks for common API calls
export function useDashboard() {
  return useApiState(() => apiClient.getDashboard())
}

export function useInsights(params: {
  recommendations?: boolean
  dismissed?: boolean
} = {}) {
  return useApiState(
    () => apiClient.getInsights(params),
    [params.recommendations, params.dismissed]
  )
}

export function useUserProfile() {
  return useApiState(() => apiClient.getUserProfile())
}

export function useLearningPath() {
  return useApiState(() => apiClient.getLearningPath())
}

export function useMistakePatterns() {
  return useApiState(() => apiClient.getMistakePatterns())
}

// Hook for connection status
export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [hasOfflineData, setHasOfflineData] = useState(false)

  useEffect(() => {
    // Initial status
    const status = apiClient.getConnectionStatus()
    setIsOnline(status.isOnline)
    setHasOfflineData(status.hasOfflineData)

    // Listen for connection changes
    const unsubscribe = offlineManager.onConnectionChange((online) => {
      setIsOnline(online)
      const newStatus = apiClient.getConnectionStatus()
      setHasOfflineData(newStatus.hasOfflineData)
    })

    return unsubscribe
  }, [])

  return {
    isOnline,
    hasOfflineData,
    connectionStatus: apiClient.getConnectionStatus()
  }
}

// Hook for manual API calls (e.g., form submissions)
export function useApiCall<T = any>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<UserFriendlyError | null>(null)

  const execute = useCallback(async (
    apiCall: () => Promise<APIResponse<T>>
  ): Promise<T | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiCall()
      
      if (response.success) {
        return response.data || null
      } else {
        setError(response.error || null)
        return null
      }
    } catch (err) {
      console.error('Manual API call failed:', err)
      setError({
        title: 'Request Failed',
        message: 'The request could not be completed. Please try again.',
        severity: 'error',
        retryable: true
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const clear = useCallback(() => {
    setError(null)
    setLoading(false)
  }, [])

  return {
    execute,
    loading,
    error,
    clear
  }
}
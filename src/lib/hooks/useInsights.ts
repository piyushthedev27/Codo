'use client'

import { useState, useEffect, useCallback } from 'react'
import { LearningInsight } from '@/types/database'
import { ProactiveRecommendation } from '@/lib/utils/proactive-recommendations'
import { LearningPattern } from '@/lib/utils/pattern-detection'
import { apiClient } from '@/lib/api/api-client'
import { useApiState, useApiCall } from './useApiState'

export interface InsightsData {
  insights: LearningInsight[]
  recommendations: ProactiveRecommendation[]
  patterns: LearningPattern[]
  meta: {
    totalInsights: number
    activeInsights: number
    dismissedInsights: number
    recommendationsCount: number
    patternsCount: number
  }
}

export interface UseInsightsOptions {
  includeRecommendations?: boolean
  includeDismissed?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useInsights(options: UseInsightsOptions = {}) {
  const {
    includeRecommendations = true,
    includeDismissed = false,
    autoRefresh = false,
    refreshInterval = 30000 // 30 seconds
  } = options

  const [refreshing, setRefreshing] = useState(false)

  // Use the new API state hook with error handling and offline support
  const {
    data: apiData,
    loading,
    error: apiError,
    fromCache,
    demo,
    retry
  } = useApiState(
    () => apiClient.getInsights({
      recommendations: includeRecommendations,
      dismissed: includeDismissed
    }),
    [includeRecommendations, includeDismissed]
  )

  // Hook for manual API calls (dismiss insight)
  const { execute: executeDismiss, loading: dismissLoading } = useApiCall()

  // Transform API data to match expected format
  const data: InsightsData | null = apiData ? {
    insights: apiData.insights || [],
    recommendations: apiData.recommendations || [],
    patterns: apiData.patterns || [],
    meta: apiData.meta || {
      totalInsights: 0,
      activeInsights: 0,
      dismissedInsights: 0,
      recommendationsCount: 0,
      patternsCount: 0
    }
  } : null

  const error = apiError?.message || null

  // Dismiss an insight with new API client
  const dismissInsight = useCallback(async (insightId: string) => {
    const result = await executeDismiss(() => apiClient.dismissInsight(insightId))
    
    if (result) {
      // Refresh insights after successful dismissal
      await retry()
      return result.insight
    }
    
    throw new Error('Failed to dismiss insight')
  }, [executeDismiss, retry])

  // Dismiss multiple insights (fallback to original implementation for now)
  const dismissMultipleInsights = useCallback(async (insightIds: string[]) => {
    try {
      const response = await fetch('/api/insights/dismiss', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ insightIds }),
      })

      if (!response.ok) {
        throw new Error(`Failed to dismiss insights: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to dismiss insights')
      }

      // Refresh after successful dismissal
      await retry()
      return result

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to dismiss insights'
      console.error('Error dismissing multiple insights:', err)
      throw new Error(errorMessage)
    }
  }, [retry])

  // Force refresh insights and generate new ones (fallback to original implementation)
  const regenerateInsights = useCallback(async () => {
    try {
      setRefreshing(true)

      const response = await fetch('/api/insights', {
        method: 'PUT',
      })

      if (!response.ok) {
        throw new Error(`Failed to regenerate insights: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to regenerate insights')
      }

      // Refresh data after regeneration
      await retry()
      return result

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to regenerate insights'
      console.error('Error regenerating insights:', err)
      throw new Error(errorMessage)
    } finally {
      setRefreshing(false)
    }
  }, [retry])

  // Manual refresh
  const refresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await retry()
    } finally {
      setRefreshing(false)
    }
  }, [retry])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return

    const interval = setInterval(() => {
      refresh()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refresh])

  return {
    // Data
    insights: data?.insights || [],
    recommendations: data?.recommendations || [],
    patterns: data?.patterns || [],
    meta: data?.meta || {
      totalInsights: 0,
      activeInsights: 0,
      dismissedInsights: 0,
      recommendationsCount: 0,
      patternsCount: 0
    },

    // State
    loading,
    error,
    refreshing: refreshing || dismissLoading,
    fromCache, // New: indicates if data is from cache
    demo, // New: indicates if using demo data

    // Actions
    dismissInsight,
    dismissMultipleInsights,
    regenerateInsights,
    refresh,

    // Utilities
    hasInsights: (data?.insights.length || 0) > 0,
    hasRecommendations: (data?.recommendations.length || 0) > 0,
    hasActiveInsights: (data?.insights.filter(i => !i.dismissed).length || 0) > 0
  }
}

// Hook for managing insight dismissal with optimistic updates
export function useInsightDismissal() {
  const [dismissing, setDismissing] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<Record<string, string>>({})

  const dismissWithOptimisticUpdate = useCallback(async (
    insightId: string,
    onSuccess?: (insight: LearningInsight) => void,
    onError?: (error: string) => void
  ) => {
    // Add to dismissing set
    setDismissing(prev => new Set([...prev, insightId]))
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[insightId]
      return newErrors
    })

    try {
      const response = await fetch('/api/insights/dismiss', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ insightId }),
      })

      if (!response.ok) {
        throw new Error(`Failed to dismiss insight: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to dismiss insight')
      }

      if (onSuccess) {
        onSuccess(result.insight)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to dismiss insight'
      
      setErrors(prev => ({
        ...prev,
        [insightId]: errorMessage
      }))

      if (onError) {
        onError(errorMessage)
      }
    } finally {
      // Remove from dismissing set
      setDismissing(prev => {
        const newSet = new Set(prev)
        newSet.delete(insightId)
        return newSet
      })
    }
  }, [])

  const clearError = useCallback((insightId: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[insightId]
      return newErrors
    })
  }, [])

  return {
    dismissing,
    errors,
    dismissWithOptimisticUpdate,
    clearError,
    isDismissing: (insightId: string) => dismissing.has(insightId),
    getError: (insightId: string) => errors[insightId]
  }
}
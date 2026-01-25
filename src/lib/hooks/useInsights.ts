'use client'

import { useState, useEffect, useCallback } from 'react'
import { LearningInsight } from '@/types/database'
import { ProactiveRecommendation } from '@/lib/utils/proactive-recommendations'
import { LearningPattern } from '@/lib/utils/pattern-detection'

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

  const [data, setData] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Fetch insights from API
  const fetchInsights = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const params = new URLSearchParams()
      if (includeRecommendations) params.set('recommendations', 'true')
      if (includeDismissed) params.set('dismissed', 'true')

      const response = await fetch(`/api/insights?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch insights: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch insights')
      }

      setData({
        insights: result.insights || [],
        recommendations: result.recommendations || [],
        patterns: result.patterns || [],
        meta: result.meta || {
          totalInsights: 0,
          activeInsights: 0,
          dismissedInsights: 0,
          recommendationsCount: 0,
          patternsCount: 0
        }
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Error fetching insights:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [includeRecommendations, includeDismissed])

  // Dismiss an insight
  const dismissInsight = useCallback(async (insightId: string) => {
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

      // Update local state to remove dismissed insight
      setData(prevData => {
        if (!prevData) return prevData
        
        return {
          ...prevData,
          insights: prevData.insights.map(insight =>
            insight.id === insightId
              ? { ...insight, dismissed: true, dismissed_at: new Date().toISOString() }
              : insight
          ).filter(insight => includeDismissed || !insight.dismissed),
          meta: {
            ...prevData.meta,
            activeInsights: prevData.meta.activeInsights - 1,
            dismissedInsights: prevData.meta.dismissedInsights + 1
          }
        }
      })

      return result.insight

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to dismiss insight'
      console.error('Error dismissing insight:', err)
      throw new Error(errorMessage)
    }
  }, [includeDismissed])

  // Dismiss multiple insights
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

      // Update local state
      setData(prevData => {
        if (!prevData) return prevData
        
        const dismissedSet = new Set(insightIds)
        
        return {
          ...prevData,
          insights: prevData.insights.map(insight =>
            dismissedSet.has(insight.id)
              ? { ...insight, dismissed: true, dismissed_at: new Date().toISOString() }
              : insight
          ).filter(insight => includeDismissed || !insight.dismissed),
          meta: {
            ...prevData.meta,
            activeInsights: prevData.meta.activeInsights - result.dismissedCount,
            dismissedInsights: prevData.meta.dismissedInsights + result.dismissedCount
          }
        }
      })

      return result

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to dismiss insights'
      console.error('Error dismissing multiple insights:', err)
      throw new Error(errorMessage)
    }
  }, [includeDismissed])

  // Force refresh insights and generate new ones
  const regenerateInsights = useCallback(async () => {
    try {
      setRefreshing(true)
      setError(null)

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

      setData({
        insights: result.insights || [],
        recommendations: result.recommendations || [],
        patterns: result.patterns || [],
        meta: {
          totalInsights: result.insights?.length || 0,
          activeInsights: result.insights?.filter((i: LearningInsight) => !i.dismissed).length || 0,
          dismissedInsights: result.insights?.filter((i: LearningInsight) => i.dismissed).length || 0,
          recommendationsCount: result.recommendations?.length || 0,
          patternsCount: result.patterns?.length || 0
        }
      })

      return result

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to regenerate insights'
      setError(errorMessage)
      console.error('Error regenerating insights:', err)
      throw new Error(errorMessage)
    } finally {
      setRefreshing(false)
    }
  }, [])

  // Manual refresh
  const refresh = useCallback(() => {
    fetchInsights(true)
  }, [fetchInsights])

  // Initial fetch
  useEffect(() => {
    fetchInsights()
  }, [fetchInsights])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return

    const interval = setInterval(() => {
      fetchInsights(true)
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchInsights])

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
    refreshing,

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
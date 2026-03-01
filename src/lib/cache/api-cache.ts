/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * API Response Caching System
 * Handles caching of API responses with intelligent invalidation
 */

import { cache, cacheManager, CACHE_CONFIG, withCache } from './cache-manager'

// Re-export CACHE_CONFIG for convenience
export { CACHE_CONFIG } from './cache-manager'

// API cache configuration
export const API_CACHE_CONFIG = {
  // Cache durations for different API endpoints
  ENDPOINTS: {
    '/api/dashboard': CACHE_CONFIG.DURATIONS.MEDIUM,
    '/api/user/profile': CACHE_CONFIG.DURATIONS.LONG,
    '/api/lessons': CACHE_CONFIG.DURATIONS.VERY_LONG,
    '/api/insights': CACHE_CONFIG.DURATIONS.SHORT,
    '/api/knowledge-graph': CACHE_CONFIG.DURATIONS.MEDIUM,
    '/api/ai-peers': CACHE_CONFIG.DURATIONS.LONG,
    '/api/progress': CACHE_CONFIG.DURATIONS.MEDIUM,
  },

  // Cache invalidation patterns
  INVALIDATION: {
    USER_UPDATE: ['/api/user/profile', '/api/dashboard'],
    LESSON_COMPLETE: ['/api/progress', '/api/knowledge-graph', '/api/insights'],
    PEER_INTERACTION: ['/api/ai-peers', '/api/insights'],
    SETTINGS_CHANGE: ['/api/user/profile', '/api/dashboard'],
  }
} as const

// Enhanced fetch with caching
export async function cachedFetch<T>(
  url: string,
  options: RequestInit = {},
  cacheOptions: {
    duration?: number
    storage?: keyof typeof CACHE_CONFIG.STORAGE
    bypassCache?: boolean
    cacheKey?: string
  } = {}
): Promise<T> {
  const {
    duration = API_CACHE_CONFIG.ENDPOINTS[url as keyof typeof API_CACHE_CONFIG.ENDPOINTS] || CACHE_CONFIG.DURATIONS.MEDIUM,
    storage = 'MEMORY',
    bypassCache = false,
    cacheKey = `api_${url}_${JSON.stringify(options)}`
  } = cacheOptions

  // If bypassing cache or using non-GET method, fetch directly
  if (bypassCache || (options.method && options.method !== 'GET')) {
    const response = await fetch(url, options)
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }
    return response.json()
  }

  // Use cached fetch
  return withCache(
    cacheKey,
    async () => {
      const response = await fetch(url, options)
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }
      return response.json()
    },
    duration,
    storage
  )
}

// Invalidate cache based on patterns
export function invalidateCache(pattern: keyof typeof API_CACHE_CONFIG.INVALIDATION) {
  const urlsToInvalidate = API_CACHE_CONFIG.INVALIDATION[pattern]

  urlsToInvalidate.forEach(url => {
    // Clear cache entries by deleting known keys
    if (url === '/api/dashboard') {
      cache.clearUserData()
    } else if (url === '/api/user/profile') {
      cacheManager.delete(CACHE_CONFIG.KEYS.USER_PROFILE, 'LOCAL')
    } else if (url === '/api/progress' || url === '/api/knowledge-graph' || url === '/api/insights') {
      // Clear session data which may contain this info
      cache.clearSessionData()
    } else if (url === '/api/ai-peers') {
      cacheManager.delete(CACHE_CONFIG.KEYS.AI_PEERS, 'LOCAL')
    }
  })
}

// Preload critical data
export async function preloadCriticalData(userId?: string) {
  if (!userId) return

  const preloadPromises = [
    // Preload user profile
    cachedFetch('/api/user/profile', {}, { storage: 'LOCAL' }),

    // Preload dashboard data
    cachedFetch('/api/dashboard', {}, { storage: 'MEMORY' }),

    // Preload AI peers
    cachedFetch('/api/ai-peers', {}, { storage: 'LOCAL' }),
  ]

  try {
    await Promise.allSettled(preloadPromises)
  } catch (error) {
    console.warn('Failed to preload some critical data:', error)
  }
}

// Background refresh for stale data
export function setupBackgroundRefresh() {
  if (typeof window === 'undefined') return

  // Refresh dashboard data every 5 minutes
  setInterval(async () => {
    try {
      await cachedFetch('/api/dashboard', {}, {
        bypassCache: true,
        storage: 'MEMORY'
      })
    } catch (error) {
      console.warn('Background refresh failed for dashboard:', error)
    }
  }, 5 * 60 * 1000)

  // Refresh insights every 2 minutes
  setInterval(async () => {
    try {
      await cachedFetch('/api/insights', {}, {
        bypassCache: true,
        storage: 'MEMORY'
      })
    } catch (error) {
      console.warn('Background refresh failed for insights:', error)
    }
  }, 2 * 60 * 1000)
}

// Cache warming strategies
export class CacheWarmer {
  private static instance: CacheWarmer
  private warmingQueue: Array<() => Promise<void>> = []
  private isWarming = false

  static getInstance(): CacheWarmer {
    if (!CacheWarmer.instance) {
      CacheWarmer.instance = new CacheWarmer()
    }
    return CacheWarmer.instance
  }

  // Add cache warming task
  addWarmingTask(task: () => Promise<void>) {
    this.warmingQueue.push(task)
    this.processQueue()
  }

  // Warm dashboard-related caches
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  warmDashboardCache(_userId: string) {
    this.addWarmingTask(async () => {
      await Promise.allSettled([
        cachedFetch('/api/dashboard'),
        cachedFetch('/api/knowledge-graph'),
        cachedFetch('/api/progress'),
      ])
    })
  }

  // Warm lesson-related caches
  warmLessonCache(lessonIds: string[]) {
    lessonIds.forEach(lessonId => {
      this.addWarmingTask(async () => {
        await cachedFetch(`/api/lessons/${lessonId}`)
      })
    })
  }

  // Process warming queue
  private async processQueue() {
    if (this.isWarming || this.warmingQueue.length === 0) return

    this.isWarming = true

    while (this.warmingQueue.length > 0) {
      const task = this.warmingQueue.shift()
      if (task) {
        try {
          await task()
          // Small delay to prevent overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (error) {
          console.warn('Cache warming task failed:', error)
        }
      }
    }

    this.isWarming = false
  }
}

// Service Worker cache integration (if available)
export function setupServiceWorkerCache() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

  navigator.serviceWorker.ready.then(registration => {
    // Send cache configuration to service worker
    registration.active?.postMessage({
      type: 'CACHE_CONFIG',
      config: API_CACHE_CONFIG
    })
  })
}

// React hooks for cached API calls
export function useCachedAPI<T>(
  url: string,
  options: RequestInit = {},
  cacheOptions: {
    duration?: number
    storage?: keyof typeof CACHE_CONFIG.STORAGE
    enabled?: boolean
  } = {}
) {
  const {
    duration = API_CACHE_CONFIG.ENDPOINTS[url as keyof typeof API_CACHE_CONFIG.ENDPOINTS] || CACHE_CONFIG.DURATIONS.MEDIUM,
    storage = 'MEMORY',
    enabled = true
  } = cacheOptions

  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  const fetchData = React.useCallback(async (bypassCache = false) => {
    if (!enabled) return

    try {
      setLoading(true)
      setError(null)

      const result = await cachedFetch<T>(url, options, {
        duration,
        storage,
        bypassCache
      })

      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, JSON.stringify(options), duration, storage, enabled])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const refresh = React.useCallback(() => {
    return fetchData(true)
  }, [fetchData])

  return { data, loading, error, refresh }
}

// Batch API requests with caching
export async function batchCachedRequests<T extends Record<string, any>>(
  requests: Array<{
    key: keyof T
    url: string
    options?: RequestInit
    cacheOptions?: {
      duration?: number
      storage?: keyof typeof CACHE_CONFIG.STORAGE
    }
  }>
): Promise<T> {
  const results = await Promise.allSettled(
    requests.map(async ({ key, url, options = {}, cacheOptions = {} }) => {
      const data = await cachedFetch(url, options, cacheOptions)
      return { key, data }
    })
  )

  const batchResult = {} as T

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const { key, data } = result.value
        ; (batchResult as any)[key] = data
    } else {
      console.warn(`Batch request failed for ${requests[index].url}:`, result.reason)
        ; (batchResult as any)[requests[index].key] = null
    }
  })

  return batchResult
}

import React from 'react'

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  cachedFetch,
  invalidateCache,
  preloadCriticalData,
  setupBackgroundRefresh,
  CacheWarmer,
  setupServiceWorkerCache,
  useCachedAPI,
  batchCachedRequests
}
/**
 * Enhanced Caching System
 * Provides efficient data caching with background updates and stale-while-revalidate
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  staleWhileRevalidate?: boolean // Return stale data while fetching fresh
  backgroundRefresh?: boolean // Refresh in background before expiry
  storage?: 'memory' | 'session' | 'local'
}

/**
 * Enhanced Cache Manager with multiple storage backends
 */
export class EnhancedCache {
  private memoryCache: Map<string, CacheEntry<any>> = new Map()
  private refreshCallbacks: Map<string, () => Promise<any>> = new Map()
  private refreshTimers: Map<string, NodeJS.Timeout> = new Map()

  /**
   * Get cached data or fetch if not available
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const {
      ttl = 5 * 60 * 1000, // 5 minutes default
      staleWhileRevalidate = true,
      backgroundRefresh = true,
      storage = 'memory'
    } = options

    // Try to get from cache
    const cached = this.getFromStorage<T>(key, storage)

    if (cached) {
      const now = Date.now()
      const isExpired = now > cached.expiresAt
      const isStale = now > cached.expiresAt - (ttl * 0.2) // Stale if within 20% of expiry

      // Return fresh data immediately
      if (!isExpired && !isStale) {
        return cached.data
      }

      // Return stale data while revalidating
      if (staleWhileRevalidate && isExpired) {
        this.revalidate(key, fetcher, options)
        return cached.data
      }

      // Background refresh if approaching expiry
      if (backgroundRefresh && isStale && !isExpired) {
        this.scheduleBackgroundRefresh(key, fetcher, options)
        return cached.data
      }
    }

    // Fetch fresh data
    const data = await fetcher()
    this.set(key, data, options)
    return data
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const {
      ttl = 5 * 60 * 1000,
      storage = 'memory'
    } = options

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    }

    this.setInStorage(key, entry, storage)
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key: string, storage: 'memory' | 'session' | 'local' = 'memory'): void {
    if (storage === 'memory') {
      this.memoryCache.delete(key)
    } else if (typeof window !== 'undefined') {
      const storageObj = storage === 'session' ? sessionStorage : localStorage
      storageObj.removeItem(`cache:${key}`)
    }

    // Clear any scheduled refreshes
    const timer = this.refreshTimers.get(key)
    if (timer) {
      clearTimeout(timer)
      this.refreshTimers.delete(key)
    }
    this.refreshCallbacks.delete(key)
  }

  /**
   * Clear all cache
   */
  clear(storage: 'memory' | 'session' | 'local' | 'all' = 'all'): void {
    if (storage === 'memory' || storage === 'all') {
      this.memoryCache.clear()
      this.refreshTimers.forEach(timer => clearTimeout(timer))
      this.refreshTimers.clear()
      this.refreshCallbacks.clear()
    }

    if (typeof window !== 'undefined' && (storage === 'session' || storage === 'all')) {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('cache:')) {
          sessionStorage.removeItem(key)
        }
      })
    }

    if (typeof window !== 'undefined' && (storage === 'local' || storage === 'all')) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache:')) {
          localStorage.removeItem(key)
        }
      })
    }
  }

  /**
   * Get from storage
   */
  private getFromStorage<T>(
    key: string,
    storage: 'memory' | 'session' | 'local'
  ): CacheEntry<T> | null {
    if (storage === 'memory') {
      return this.memoryCache.get(key) || null
    }

    if (typeof window === 'undefined') return null

    try {
      const storageObj = storage === 'session' ? sessionStorage : localStorage
      const item = storageObj.getItem(`cache:${key}`)
      if (!item) return null

      const entry = JSON.parse(item) as CacheEntry<T>
      
      // Check if expired
      if (Date.now() > entry.expiresAt) {
        storageObj.removeItem(`cache:${key}`)
        return null
      }

      return entry
    } catch (error) {
      console.warn('Cache read error:', error)
      return null
    }
  }

  /**
   * Set in storage
   */
  private setInStorage<T>(
    key: string,
    entry: CacheEntry<T>,
    storage: 'memory' | 'session' | 'local'
  ): void {
    if (storage === 'memory') {
      this.memoryCache.set(key, entry)
      return
    }

    if (typeof window === 'undefined') return

    try {
      const storageObj = storage === 'session' ? sessionStorage : localStorage
      storageObj.setItem(`cache:${key}`, JSON.stringify(entry))
    } catch (error) {
      console.warn('Cache write error:', error)
      // Fallback to memory cache
      this.memoryCache.set(key, entry)
    }
  }

  /**
   * Revalidate cache entry
   */
  private async revalidate<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions
  ): Promise<void> {
    try {
      const data = await fetcher()
      this.set(key, data, options)
    } catch (error) {
      console.warn('Cache revalidation error:', error)
    }
  }

  /**
   * Schedule background refresh
   */
  private scheduleBackgroundRefresh<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions
  ): void {
    // Avoid duplicate refreshes
    if (this.refreshCallbacks.has(key)) return

    this.refreshCallbacks.set(key, fetcher)

    const timer = setTimeout(async () => {
      await this.revalidate(key, fetcher, options)
      this.refreshCallbacks.delete(key)
      this.refreshTimers.delete(key)
    }, 1000) // Refresh after 1 second

    this.refreshTimers.set(key, timer)
  }

  /**
   * Prefetch data into cache
   */
  async prefetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<void> {
    const cached = this.getFromStorage(key, options.storage || 'memory')
    if (!cached || Date.now() > cached.expiresAt) {
      const data = await fetcher()
      this.set(key, data, options)
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    memorySize: number
    sessionSize: number
    localSize: number
  } {
    let sessionSize = 0
    let localSize = 0

    if (typeof window !== 'undefined') {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('cache:')) sessionSize++
      })
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache:')) localSize++
      })
    }

    return {
      memorySize: this.memoryCache.size,
      sessionSize,
      localSize
    }
  }
}

// Global cache instance
export const enhancedCache = new EnhancedCache()

/**
 * React hook for cached data fetching
 */
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    let mounted = true

    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await enhancedCache.get(key, fetcher, options)
        if (mounted) {
          setData(result)
          setError(null)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'))
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [key])

  const invalidate = () => {
    enhancedCache.invalidate(key, options.storage)
    setData(null)
    setLoading(true)
  }

  return { data, loading, error, invalidate }
}

// Import React for the hook
import React from 'react'

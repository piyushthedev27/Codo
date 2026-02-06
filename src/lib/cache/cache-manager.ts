'use client'

/**
 * Comprehensive caching system for Codo platform
 * Handles browser storage, memory cache, and API response caching
 */

// Cache configuration
export const CACHE_CONFIG = {
  // Cache durations in milliseconds
  DURATIONS: {
    SHORT: 5 * 60 * 1000,      // 5 minutes
    MEDIUM: 30 * 60 * 1000,    // 30 minutes  
    LONG: 2 * 60 * 60 * 1000,  // 2 hours
    VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
  },
  
  // Cache keys
  KEYS: {
    USER_PROFILE: 'user_profile',
    DASHBOARD_DATA: 'dashboard_data',
    AI_PEERS: 'ai_peers',
    KNOWLEDGE_GRAPH: 'knowledge_graph',
    LESSONS: 'lessons',
    INSIGHTS: 'insights',
    LESSON_PROGRESS: 'lesson_progress',
    AVATAR_STATES: 'avatar_states',
    VOICE_SETTINGS: 'voice_settings',
    THEME_PREFERENCE: 'theme_preference',
  },
  
  // Storage types
  STORAGE: {
    MEMORY: 'memory',
    SESSION: 'session',
    LOCAL: 'local',
  }
} as const

// Cache entry interface
interface CacheEntry<T = any> {
  data: T
  timestamp: number
  expiry: number
  key: string
  version?: string
}

// Memory cache store
class MemoryCache {
  private cache = new Map<string, CacheEntry>()
  private maxSize = 100 // Maximum number of entries

  set<T>(key: string, data: T, duration: number, version?: string): void {
    // Clean up expired entries if cache is getting full
    if (this.cache.size >= this.maxSize) {
      this.cleanup()
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + duration,
      key,
      version
    }

    this.cache.set(key, entry)
  }

  get<T>(key: string, version?: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key)
      return null
    }
    
    // Check version compatibility
    if (version && entry.version && entry.version !== version) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key)
      }
    }
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }
}

// Browser storage cache
class BrowserCache {
  constructor(private storage: Storage) {}

  set<T>(key: string, data: T, duration: number, version?: string): boolean {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + duration,
        key,
        version
      }
      
      this.storage.setItem(key, JSON.stringify(entry))
      return true
    } catch (error) {
      console.warn('Failed to set cache entry:', error)
      return false
    }
  }

  get<T>(key: string, version?: string): T | null {
    try {
      const item = this.storage.getItem(key)
      if (!item) return null

      const entry: CacheEntry<T> = JSON.parse(item)
      
      // Check if expired
      if (Date.now() > entry.expiry) {
        this.storage.removeItem(key)
        return null
      }
      
      // Check version compatibility
      if (version && entry.version && entry.version !== version) {
        this.storage.removeItem(key)
        return null
      }
      
      return entry.data
    } catch (error) {
      console.warn('Failed to get cache entry:', error)
      return null
    }
  }

  delete(key: string): boolean {
    try {
      this.storage.removeItem(key)
      return true
    } catch (error) {
      console.warn('Failed to delete cache entry:', error)
      return false
    }
  }

  clear(): boolean {
    try {
      this.storage.clear()
      return true
    } catch (error) {
      console.warn('Failed to clear cache:', error)
      return false
    }
  }

  cleanup(): void {
    try {
      const now = Date.now()
      const keysToRemove: string[] = []
      
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i)
        if (!key) continue
        
        try {
          const item = this.storage.getItem(key)
          if (!item) continue
          
          const entry: CacheEntry = JSON.parse(item)
          if (now > entry.expiry) {
            keysToRemove.push(key)
          }
        } catch {
          // Invalid entry, remove it
          keysToRemove.push(key)
        }
      }
      
      keysToRemove.forEach(key => this.storage.removeItem(key))
    } catch (error) {
      console.warn('Failed to cleanup cache:', error)
    }
  }
}

// Main cache manager
class CacheManager {
  private memoryCache = new MemoryCache()
  private sessionCache: BrowserCache | null = null
  private localCache: BrowserCache | null = null

  constructor() {
    // Initialize browser caches if available
    if (typeof window !== 'undefined') {
      try {
        this.sessionCache = new BrowserCache(window.sessionStorage)
        this.localCache = new BrowserCache(window.localStorage)
      } catch (error) {
        console.warn('Browser storage not available:', error)
      }
    }

    // Cleanup expired entries periodically
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.cleanup()
      }, 5 * 60 * 1000) // Every 5 minutes
    }
  }

  // Set cache entry with automatic storage selection
  set<T>(
    key: string, 
    data: T, 
    duration: number = CACHE_CONFIG.DURATIONS.MEDIUM,
    storage: keyof typeof CACHE_CONFIG.STORAGE = 'MEMORY',
    version?: string
  ): boolean {
    try {
      switch (storage) {
        case 'MEMORY':
          this.memoryCache.set(key, data, duration, version)
          return true
        case 'SESSION':
          return this.sessionCache?.set(key, data, duration, version) ?? false
        case 'LOCAL':
          return this.localCache?.set(key, data, duration, version) ?? false
        default:
          this.memoryCache.set(key, data, duration, version)
          return true
      }
    } catch (error) {
      console.warn('Cache set failed:', error)
      return false
    }
  }

  // Get cache entry with fallback to other storage types
  get<T>(
    key: string, 
    storage: keyof typeof CACHE_CONFIG.STORAGE = 'MEMORY',
    version?: string
  ): T | null {
    try {
      let result: T | null = null

      switch (storage) {
        case 'MEMORY':
          result = this.memoryCache.get<T>(key, version)
          break
        case 'SESSION':
          result = this.sessionCache?.get<T>(key, version) ?? null
          break
        case 'LOCAL':
          result = this.localCache?.get<T>(key, version) ?? null
          break
      }

      // If not found in primary storage, try fallback
      if (result === null && storage !== 'MEMORY') {
        result = this.memoryCache.get<T>(key, version)
      }

      return result
    } catch (error) {
      console.warn('Cache get failed:', error)
      return null
    }
  }

  // Delete from specific storage
  delete(key: string, storage: keyof typeof CACHE_CONFIG.STORAGE = 'MEMORY'): boolean {
    try {
      switch (storage) {
        case 'MEMORY':
          return this.memoryCache.delete(key)
        case 'SESSION':
          return this.sessionCache?.delete(key) ?? false
        case 'LOCAL':
          return this.localCache?.delete(key) ?? false
        default:
          return this.memoryCache.delete(key)
      }
    } catch (error) {
      console.warn('Cache delete failed:', error)
      return false
    }
  }

  // Clear all caches
  clear(storage?: keyof typeof CACHE_CONFIG.STORAGE): void {
    try {
      if (!storage) {
        // Clear all storages
        this.memoryCache.clear()
        this.sessionCache?.clear()
        this.localCache?.clear()
      } else {
        switch (storage) {
          case 'MEMORY':
            this.memoryCache.clear()
            break
          case 'SESSION':
            this.sessionCache?.clear()
            break
          case 'LOCAL':
            this.localCache?.clear()
            break
        }
      }
    } catch (error) {
      console.warn('Cache clear failed:', error)
    }
  }

  // Cleanup expired entries
  cleanup(): void {
    try {
      this.memoryCache.cleanup()
      this.sessionCache?.cleanup()
      this.localCache?.cleanup()
    } catch (error) {
      console.warn('Cache cleanup failed:', error)
    }
  }

  // Get cache statistics
  getStats() {
    return {
      memory: {
        size: this.memoryCache.size(),
        keys: this.memoryCache.keys()
      },
      session: {
        available: !!this.sessionCache,
        size: this.sessionCache ? this.getStorageSize('session') : 0
      },
      local: {
        available: !!this.localCache,
        size: this.localCache ? this.getStorageSize('local') : 0
      }
    }
  }

  private getStorageSize(type: 'session' | 'local'): number {
    try {
      const storage = type === 'session' ? window.sessionStorage : window.localStorage
      return storage.length
    } catch {
      return 0
    }
  }
}

// Create singleton instance
export const cacheManager = new CacheManager()

// Convenience functions for common cache operations
export const cache = {
  // User data caching
  setUserProfile: (data: any) => 
    cacheManager.set(CACHE_CONFIG.KEYS.USER_PROFILE, data, CACHE_CONFIG.DURATIONS.LONG, 'LOCAL'),
  
  getUserProfile: () => 
    cacheManager.get(CACHE_CONFIG.KEYS.USER_PROFILE, 'LOCAL'),

  // Dashboard data caching
  setDashboardData: (data: any) => 
    cacheManager.set(CACHE_CONFIG.KEYS.DASHBOARD_DATA, data, CACHE_CONFIG.DURATIONS.MEDIUM, 'MEMORY'),
  
  getDashboardData: () => 
    cacheManager.get(CACHE_CONFIG.KEYS.DASHBOARD_DATA, 'MEMORY'),

  // AI peers caching
  setAIPeers: (data: any) => 
    cacheManager.set(CACHE_CONFIG.KEYS.AI_PEERS, data, CACHE_CONFIG.DURATIONS.LONG, 'LOCAL'),
  
  getAIPeers: () => 
    cacheManager.get(CACHE_CONFIG.KEYS.AI_PEERS, 'LOCAL'),

  // Knowledge graph caching
  setKnowledgeGraph: (data: any) => 
    cacheManager.set(CACHE_CONFIG.KEYS.KNOWLEDGE_GRAPH, data, CACHE_CONFIG.DURATIONS.MEDIUM, 'SESSION'),
  
  getKnowledgeGraph: () => 
    cacheManager.get(CACHE_CONFIG.KEYS.KNOWLEDGE_GRAPH, 'SESSION'),

  // Lessons caching
  setLesson: (lessonId: string, data: any) => 
    cacheManager.set(`${CACHE_CONFIG.KEYS.LESSONS}_${lessonId}`, data, CACHE_CONFIG.DURATIONS.VERY_LONG, 'LOCAL'),
  
  getLesson: (lessonId: string) => 
    cacheManager.get(`${CACHE_CONFIG.KEYS.LESSONS}_${lessonId}`, 'LOCAL'),

  // Insights caching
  setInsights: (data: any) => 
    cacheManager.set(CACHE_CONFIG.KEYS.INSIGHTS, data, CACHE_CONFIG.DURATIONS.SHORT, 'MEMORY'),
  
  getInsights: () => 
    cacheManager.get(CACHE_CONFIG.KEYS.INSIGHTS, 'MEMORY'),

  // Settings caching
  setVoiceSettings: (data: any) => 
    cacheManager.set(CACHE_CONFIG.KEYS.VOICE_SETTINGS, data, CACHE_CONFIG.DURATIONS.VERY_LONG, 'LOCAL'),
  
  getVoiceSettings: () => 
    cacheManager.get(CACHE_CONFIG.KEYS.VOICE_SETTINGS, 'LOCAL'),

  // Theme preference caching
  setThemePreference: (theme: string) => 
    cacheManager.set(CACHE_CONFIG.KEYS.THEME_PREFERENCE, theme, CACHE_CONFIG.DURATIONS.VERY_LONG, 'LOCAL'),
  
  getThemePreference: () => 
    cacheManager.get(CACHE_CONFIG.KEYS.THEME_PREFERENCE, 'LOCAL'),

  // Clear specific cache types
  clearUserData: () => {
    cacheManager.delete(CACHE_CONFIG.KEYS.USER_PROFILE, 'LOCAL')
    cacheManager.delete(CACHE_CONFIG.KEYS.DASHBOARD_DATA, 'MEMORY')
    cacheManager.delete(CACHE_CONFIG.KEYS.AI_PEERS, 'LOCAL')
  },

  clearSessionData: () => {
    cacheManager.clear('SESSION')
  },

  clearAllCache: () => {
    cacheManager.clear()
  }
}

// API response caching wrapper
export function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  duration: number = CACHE_CONFIG.DURATIONS.MEDIUM,
  storage: keyof typeof CACHE_CONFIG.STORAGE = 'MEMORY'
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      // Try to get from cache first
      const cached = cacheManager.get<T>(key, storage)
      if (cached !== null) {
        resolve(cached)
        return
      }

      // Fetch fresh data
      const data = await fetcher()
      
      // Cache the result
      cacheManager.set(key, data, duration, storage)
      
      resolve(data)
    } catch (error) {
      reject(error)
    }
  })
}

// React hook for cached data
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    duration?: number
    storage?: keyof typeof CACHE_CONFIG.STORAGE
    enabled?: boolean
  } = {}
) {
  const {
    duration = CACHE_CONFIG.DURATIONS.MEDIUM,
    storage = 'MEMORY',
    enabled = true
  } = options

  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (!enabled) return

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const result = await withCache(key, fetcher, duration, storage)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [key, enabled])

  const refresh = React.useCallback(async () => {
    // Clear cache and refetch
    cacheManager.delete(key, storage)
    
    try {
      setLoading(true)
      setError(null)
      
      const result = await withCache(key, fetcher, duration, storage)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, duration, storage])

  return { data, loading, error, refresh }
}

// Import React for the hook
import React from 'react'

export default cacheManager
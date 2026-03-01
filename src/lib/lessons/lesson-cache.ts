/**
 * Lesson Cache System
 * Manages caching of lessons for offline demo mode and performance
 */

import type { GeneratedLesson } from '@/lib/ai/lesson-generation'

// Cache configuration
const CACHE_CONFIG = {
  maxSize: 50, // Maximum number of cached lessons
  ttl: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  storageKey: 'codo_lesson_cache',
  demoStorageKey: 'codo_demo_lessons'
} as const

export interface CachedLesson {
  id: string
  lesson: GeneratedLesson
  timestamp: number
  accessCount: number
  lastAccessed: number
}

export interface LessonCacheStats {
  totalLessons: number
  cacheSize: number
  hitRate: number
  oldestLesson: number
  newestLesson: number
}

/**
 * Lesson Cache Manager
 */
export class LessonCache {
  private cache: Map<string, CachedLesson> = new Map()
  private hitCount = 0
  private missCount = 0

  constructor() {
    this.loadFromStorage()
  }

  /**
   * Get a lesson from cache
   */
  get(lessonId: string): GeneratedLesson | null {
    const cached = this.cache.get(lessonId)
    
    if (!cached) {
      this.missCount++
      return null
    }

    // Check if cache entry is expired
    if (Date.now() - cached.timestamp > CACHE_CONFIG.ttl) {
      this.cache.delete(lessonId)
      this.saveToStorage()
      this.missCount++
      return null
    }

    // Update access statistics
    cached.accessCount++
    cached.lastAccessed = Date.now()
    this.hitCount++
    
    return cached.lesson
  }

  /**
   * Store a lesson in cache
   */
  set(lessonId: string, lesson: GeneratedLesson): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= CACHE_CONFIG.maxSize) {
      this.evictOldest()
    }

    const cachedLesson: CachedLesson = {
      id: lessonId,
      lesson,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now()
    }

    this.cache.set(lessonId, cachedLesson)
    this.saveToStorage()
  }

  /**
   * Check if a lesson exists in cache
   */
  has(lessonId: string): boolean {
    const cached = this.cache.get(lessonId)
    if (!cached) return false
    
    // Check expiration
    if (Date.now() - cached.timestamp > CACHE_CONFIG.ttl) {
      this.cache.delete(lessonId)
      this.saveToStorage()
      return false
    }
    
    return true
  }

  /**
   * Remove a lesson from cache
   */
  delete(lessonId: string): boolean {
    const deleted = this.cache.delete(lessonId)
    if (deleted) {
      this.saveToStorage()
    }
    return deleted
  }

  /**
   * Clear all cached lessons
   */
  clear(): void {
    this.cache.clear()
    this.hitCount = 0
    this.missCount = 0
    this.saveToStorage()
  }

  /**
   * Get cache statistics
   */
  getStats(): LessonCacheStats {
    const lessons = Array.from(this.cache.values())
    const totalRequests = this.hitCount + this.missCount
    
    return {
      totalLessons: this.cache.size,
      cacheSize: this.calculateCacheSize(),
      hitRate: totalRequests > 0 ? this.hitCount / totalRequests : 0,
      oldestLesson: lessons.length > 0 ? Math.min(...lessons.map(l => l.timestamp)) : 0,
      newestLesson: lessons.length > 0 ? Math.max(...lessons.map(l => l.timestamp)) : 0
    }
  }

  /**
   * Get all cached lesson IDs
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * Get most accessed lessons
   */
  getMostAccessed(limit: number = 10): CachedLesson[] {
    return Array.from(this.cache.values())
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit)
  }

  /**
   * Evict oldest cache entries
   */
  private evictOldest(): void {
    const entries = Array.from(this.cache.entries())
    entries.sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)
    
    // Remove oldest 20% of entries
    const toRemove = Math.ceil(entries.length * 0.2)
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0])
    }
  }

  /**
   * Calculate cache size in bytes (approximate)
   */
  private calculateCacheSize(): number {
    let size = 0
    for (const cached of this.cache.values()) {
      size += JSON.stringify(cached).length * 2 // Rough estimate
    }
    return size
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    try {
      if (typeof window === 'undefined') return

      const stored = localStorage.getItem(CACHE_CONFIG.storageKey)
      if (stored) {
        const data = JSON.parse(stored)
        this.cache = new Map(data.cache || [])
        this.hitCount = data.hitCount || 0
        this.missCount = data.missCount || 0
      }
    } catch (error) {
      console.warn('Failed to load lesson cache from storage:', error)
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveToStorage(): void {
    try {
      if (typeof window === 'undefined') return

      const data = {
        cache: Array.from(this.cache.entries()),
        hitCount: this.hitCount,
        missCount: this.missCount,
        lastSaved: Date.now()
      }

      localStorage.setItem(CACHE_CONFIG.storageKey, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save lesson cache to storage:', error)
    }
  }
}

// Global cache instance
export const lessonCache = new LessonCache()

/**
 * Demo Lesson Manager
 * Manages pre-generated lessons for offline demo mode
 */
export class DemoLessonManager {
  private demoLessons: Map<string, GeneratedLesson> = new Map()

  constructor() {
    this.loadDemoLessons()
  }

  /**
   * Get a demo lesson by topic
   */
  getDemoLesson(topic: string): GeneratedLesson | null {
    const key = this.normalizeTopicKey(topic)
    return this.demoLessons.get(key) || null
  }

  /**
   * Get all available demo lessons
   */
  getAllDemoLessons(): Array<{ key: string; lesson: GeneratedLesson }> {
    return Array.from(this.demoLessons.entries()).map(([key, lesson]) => ({
      key,
      lesson
    }))
  }

  /**
   * Check if a demo lesson exists for a topic
   */
  hasDemoLesson(topic: string): boolean {
    const key = this.normalizeTopicKey(topic)
    return this.demoLessons.has(key)
  }

  /**
   * Add a demo lesson
   */
  addDemoLesson(topic: string, lesson: GeneratedLesson): void {
    const key = this.normalizeTopicKey(topic)
    this.demoLessons.set(key, lesson)
    this.saveDemoLessons()
  }

  /**
   * Get demo lesson topics
   */
  getDemoTopics(): string[] {
    return Array.from(this.demoLessons.keys())
  }

  /**
   * Normalize topic to cache key
   */
  private normalizeTopicKey(topic: string): string {
    return topic.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  /**
   * Load demo lessons from storage or initialize with defaults
   */
  private loadDemoLessons(): void {
    try {
      if (typeof window === 'undefined') {
        this.initializeDefaultDemoLessons()
        return
      }

      const stored = localStorage.getItem(CACHE_CONFIG.demoStorageKey)
      if (stored) {
        const data = JSON.parse(stored)
        this.demoLessons = new Map(data.lessons || [])
      } else {
        this.initializeDefaultDemoLessons()
      }
    } catch (error) {
      console.warn('Failed to load demo lessons from storage:', error)
      this.initializeDefaultDemoLessons()
    }
  }

  /**
   * Save demo lessons to storage
   */
  private saveDemoLessons(): void {
    try {
      if (typeof window === 'undefined') return

      const data = {
        lessons: Array.from(this.demoLessons.entries()),
        lastUpdated: Date.now()
      }

      localStorage.setItem(CACHE_CONFIG.demoStorageKey, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save demo lessons to storage:', error)
    }
  }

  /**
   * Initialize with default demo lessons
   */
  private initializeDefaultDemoLessons(): void {
    // Import demo lessons from lesson-generation.ts
    import('@/lib/ai/lesson-generation').then(({ getDemoLesson }) => {
      const demoTopics = [
        'react-hooks',
        'react-hooks-intro',
        'javascript-async',
        'typescript-basics',
        'react-state-management',
        'css-grid-flexbox',
        'nodejs-apis'
      ]

      demoTopics.forEach(topic => {
        const lesson = getDemoLesson(topic)
        if (lesson) {
          this.demoLessons.set(topic, lesson)
        }
      })

      this.saveDemoLessons()
    }).catch(error => {
      console.warn('Failed to initialize demo lessons:', error)
    })
  }
}

// Global demo lesson manager
export const demoLessonManager = new DemoLessonManager()

/**
 * Utility functions for lesson caching
 */

/**
 * Generate a cache key for a lesson
 */
export function generateLessonCacheKey(
  topic: string,
  skillLevel: string,
  userDomain: string
): string {
  return `${topic}-${skillLevel}-${userDomain}`.toLowerCase().replace(/\s+/g, '-')
}

/**
 * Check if we're in offline mode
 */
export function isOfflineMode(): boolean {
  if (typeof window === 'undefined') return false
  return !navigator.onLine
}

/**
 * Get cached lesson or fallback to demo
 */
export async function getCachedOrDemoLesson(
  lessonId: string,
  topic: string
): Promise<GeneratedLesson | null> {
  // Try cache first
  const cached = lessonCache.get(lessonId)
  if (cached) {
    return cached
  }

  // Fallback to demo lesson
  const demo = demoLessonManager.getDemoLesson(topic)
  if (demo) {
    // Cache the demo lesson for future use
    lessonCache.set(lessonId, demo)
    return demo
  }

  return null
}

/**
 * Preload popular lessons for offline use
 */
export async function preloadPopularLessons(): Promise<void> {
  const popularTopics = [
    'react-hooks',
    'javascript-async',
    'python-functions',
    'html-css-basics',
    'git-version-control'
  ]

  for (const topic of popularTopics) {
    if (!demoLessonManager.hasDemoLesson(topic)) {
      try {
        // In a real implementation, this would fetch from API
        console.log(`Preloading lesson: ${topic}`)
      } catch (error) {
        console.warn(`Failed to preload lesson: ${topic}`, error)
      }
    }
  }
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): void {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _stats = lessonCache.getStats()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _expiredThreshold = Date.now() - CACHE_CONFIG.ttl
  
  lessonCache.getKeys().forEach(key => {
    const cached = lessonCache.get(key)
    if (!cached) return // Will be removed by get() if expired
  })

  console.log(`Cache cleanup completed. Remaining lessons: ${lessonCache.getStats().totalLessons}`)
}

/**
 * Export cache data for backup
 */
export function exportCacheData(): string {
  const cacheData = {
    lessons: lessonCache.getKeys().map(key => ({
      key,
      lesson: lessonCache.get(key)
    })).filter(item => item.lesson),
    demoLessons: demoLessonManager.getAllDemoLessons(),
    _stats: lessonCache.getStats(),
    exportedAt: Date.now()
  }

  return JSON.stringify(cacheData, null, 2)
}

/**
 * Import cache data from backup
 */
export function importCacheData(data: string): boolean {
  try {
    const parsed = JSON.parse(data)
    
    // Import regular cached lessons
    if (parsed.lessons) {
      parsed.lessons.forEach(({ key, lesson }: { key: string; lesson: GeneratedLesson }) => {
        if (lesson) {
          lessonCache.set(key, lesson)
        }
      })
    }

    // Import demo lessons
    if (parsed.demoLessons) {
      parsed.demoLessons.forEach(({ key, lesson }: { key: string; lesson: GeneratedLesson }) => {
        demoLessonManager.addDemoLesson(key, lesson)
      })
    }

    return true
  } catch (error) {
    console.error('Failed to import cache data:', error)
    return false
  }
}
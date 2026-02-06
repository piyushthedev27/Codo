/**
 * Retry Client
 * Implements exponential backoff retry logic for failed API requests
 */

import { offlineManager } from './offline-manager'

export interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
  retryCondition?: (error: any) => boolean
}

export interface RequestOptions extends RequestInit {
  retryConfig?: Partial<RetryConfig>
  useOfflineCache?: boolean
  cacheKey?: string
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 16000, // 16 seconds
  backoffMultiplier: 2,
  retryCondition: (error) => {
    // Retry on network errors, 5xx errors, and 429 (rate limit)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return true // Network error
    }
    if (error.status >= 500) {
      return true // Server error
    }
    if (error.status === 429) {
      return true // Rate limit
    }
    return false
  }
}

class RetryClient {
  private static instance: RetryClient

  static getInstance(): RetryClient {
    if (!RetryClient.instance) {
      RetryClient.instance = new RetryClient()
    }
    return RetryClient.instance
  }

  private calculateDelay(attempt: number, config: RetryConfig): number {
    const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1)
    return Math.min(delay, config.maxDelay)
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private shouldRetry(error: any, attempt: number, config: RetryConfig): boolean {
    if (attempt >= config.maxRetries) {
      return false
    }
    
    if (config.retryCondition) {
      return config.retryCondition(error)
    }
    
    return DEFAULT_RETRY_CONFIG.retryCondition!(error)
  }

  private async getCachedResponse(cacheKey: string): Promise<Response | null> {
    if (typeof window === 'undefined') return null

    try {
      const cached = localStorage.getItem(`api-cache-${cacheKey}`)
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        const age = Date.now() - timestamp
        
        // Use cache if less than 5 minutes old or if offline
        if (age < 5 * 60 * 1000 || !offlineManager.getConnectionStatus()) {
          console.log(`📦 Using cached response for ${cacheKey}`)
          return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        }
      }
    } catch (error) {
      console.warn('Failed to get cached response:', error)
    }

    return null
  }

  private async setCachedResponse(cacheKey: string, response: Response): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      const data = await response.clone().json()
      const cacheData = {
        data,
        timestamp: Date.now()
      }
      localStorage.setItem(`api-cache-${cacheKey}`, JSON.stringify(cacheData))
      console.log(`💾 Cached response for ${cacheKey}`)
    } catch (error) {
      console.warn('Failed to cache response:', error)
    }
  }

  public async fetch(url: string, options: RequestOptions = {}): Promise<Response> {
    const {
      retryConfig: userRetryConfig = {},
      useOfflineCache = true,
      cacheKey,
      ...fetchOptions
    } = options

    const config = { ...DEFAULT_RETRY_CONFIG, ...userRetryConfig }
    const finalCacheKey = cacheKey || url

    // Check if we're offline and have cached data
    if (!offlineManager.getConnectionStatus() && useOfflineCache) {
      const cachedResponse = await this.getCachedResponse(finalCacheKey)
      if (cachedResponse) {
        return cachedResponse
      }
      
      // If no cache and offline, throw offline error
      throw new Error('No internet connection and no cached data available')
    }

    // Try cached response first if available
    if (useOfflineCache) {
      const cachedResponse = await this.getCachedResponse(finalCacheKey)
      if (cachedResponse) {
        // Still try fresh request in background
        this.fetch(url, { ...options, useOfflineCache: false }).catch(() => {
          // Ignore background fetch errors
        })
        return cachedResponse
      }
    }

    let lastError: any
    let attempt = 0

    while (attempt <= config.maxRetries) {
      attempt++

      try {
        console.log(`🔄 API request attempt ${attempt}/${config.maxRetries + 1}: ${url}`)
        
        const response = await fetch(url, fetchOptions)

        // Check if response is ok
        if (!response.ok) {
          const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
          ;(error as any).status = response.status
          ;(error as any).response = response
          throw error
        }

        // Cache successful response
        if (useOfflineCache && response.ok) {
          await this.setCachedResponse(finalCacheKey, response)
        }

        console.log(`✅ API request successful on attempt ${attempt}: ${url}`)
        return response

      } catch (error) {
        lastError = error
        console.warn(`❌ API request failed on attempt ${attempt}:`, error)

        // Check if we should retry
        if (!this.shouldRetry(error, attempt, config)) {
          break
        }

        // Calculate delay for next attempt
        if (attempt <= config.maxRetries) {
          const delay = this.calculateDelay(attempt, config)
          console.log(`⏳ Retrying in ${delay}ms...`)
          await this.sleep(delay)
        }
      }
    }

    // All retries failed, try to use cached data as last resort
    if (useOfflineCache) {
      const cachedResponse = await this.getCachedResponse(finalCacheKey)
      if (cachedResponse) {
        console.log(`📦 Using stale cached data as fallback for ${url}`)
        return cachedResponse
      }
    }

    // No cache available, throw the last error
    console.error(`💥 All retry attempts failed for ${url}:`, lastError)
    throw lastError
  }

  public async get(url: string, options: RequestOptions = {}): Promise<Response> {
    return this.fetch(url, { ...options, method: 'GET' })
  }

  public async post(url: string, data: any, options: RequestOptions = {}): Promise<Response> {
    return this.fetch(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data)
    })
  }

  public async put(url: string, data: any, options: RequestOptions = {}): Promise<Response> {
    return this.fetch(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data)
    })
  }

  public async delete(url: string, options: RequestOptions = {}): Promise<Response> {
    return this.fetch(url, { ...options, method: 'DELETE' })
  }

  // Utility method for JSON responses
  public async fetchJson<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    const response = await this.fetch(url, options)
    return response.json()
  }

  // Clear all cached responses
  public clearCache(): void {
    if (typeof window === 'undefined') return

    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('api-cache-')) {
          localStorage.removeItem(key)
        }
      })
      console.log('🗑️ Cleared API cache')
    } catch (error) {
      console.warn('Failed to clear API cache:', error)
    }
  }

  // Get cache statistics
  public getCacheStats(): { totalEntries: number; totalSize: number } {
    if (typeof window === 'undefined') return { totalEntries: 0, totalSize: 0 }

    let totalEntries = 0
    let totalSize = 0

    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('api-cache-')) {
          totalEntries++
          totalSize += localStorage.getItem(key)?.length || 0
        }
      })
    } catch (error) {
      console.warn('Failed to get cache stats:', error)
    }

    return { totalEntries, totalSize }
  }
}

export const retryClient = RetryClient.getInstance()

// Convenience functions for common use cases
export const apiGet = (url: string, options?: RequestOptions) => retryClient.get(url, options)
export const apiPost = (url: string, data: any, options?: RequestOptions) => retryClient.post(url, data, options)
export const apiPut = (url: string, data: any, options?: RequestOptions) => retryClient.put(url, data, options)
export const apiDelete = (url: string, options?: RequestOptions) => retryClient.delete(url, options)
export const apiFetchJson = <T = any>(url: string, options?: RequestOptions) => retryClient.fetchJson<T>(url, options)
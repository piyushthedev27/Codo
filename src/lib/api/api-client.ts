/**
 * API Client
 * Unified API client with error handling, retry logic, and offline support
 */

import { retryClient, type RequestOptions } from './retry-client'
import { errorHandler, type UserFriendlyError } from './error-handler'
import { offlineManager } from './offline-manager'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: UserFriendlyError
  fromCache?: boolean
  demo?: boolean
}

export interface APIClientOptions extends RequestOptions {
  feature?: string
  showUserError?: boolean
}

class APIClient {
  private static instance: APIClient

  static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient()
    }
    return APIClient.instance
  }

  private async handleRequest<T>(
    requestFn: () => Promise<Response>,
    options: APIClientOptions = {}
  ): Promise<APIResponse<T>> {
    const { feature = 'api' } = options

    try {
      const response = await requestFn()
      const data = await response.json()

      // Save successful responses to offline cache
      if (response.ok && data) {
        offlineManager.saveOfflineData({
          lastUpdated: new Date().toISOString()
        })
      }

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`)
      }

      return {
        success: true,
        data,
        fromCache: false
      }

    } catch (error) {
      console.error(`API error in ${feature}:`, error)

      // Handle the error and get user-friendly message
      const userError = errorHandler.getContextualMessage(error, feature)

      // Try to get offline/cached data as fallback
      if (userError.retryable) {
        const offlineData = offlineManager.getOfflineData()

        if (offlineData) {
          console.log(`Using offline data for ${feature}`)
          return {
            success: true,
            data: offlineData as T,
            fromCache: true,
            error: userError
          }
        }
      }

      return {
        success: false,
        error: userError
      }
    }
  }

  // Dashboard API
  public async getDashboard(options: APIClientOptions = {}): Promise<APIResponse> {
    return this.handleRequest(
      () => retryClient.get('/api/dashboard', {
        cacheKey: 'dashboard',
        useOfflineCache: true,
        ...options
      }),
      { ...options, feature: 'dashboard' }
    )
  }

  // Insights API
  public async getInsights(params: {
    recommendations?: boolean
    dismissed?: boolean
  } = {}, options: APIClientOptions = {}): Promise<APIResponse> {
    const searchParams = new URLSearchParams()
    if (params.recommendations) searchParams.set('recommendations', 'true')
    if (params.dismissed) searchParams.set('dismissed', 'true')

    return this.handleRequest(
      () => retryClient.get(`/api/insights?${searchParams.toString()}`, {
        cacheKey: 'insights',
        useOfflineCache: true,
        ...options
      }),
      { ...options, feature: 'insights' }
    )
  }

  public async dismissInsight(insightId: string, options: APIClientOptions = {}): Promise<APIResponse> {
    return this.handleRequest(
      () => retryClient.post(`/api/insights/dismiss`, { insightId }, options),
      { ...options, feature: 'insights' }
    )
  }

  // Lessons API
  public async generateLesson(data: {
    topic: string
    duration?: number
    includeVoiceCoaching?: boolean
  }, options: APIClientOptions = {}): Promise<APIResponse> {
    return this.handleRequest(
      () => retryClient.post('/api/lessons/generate', data, {
        cacheKey: `lesson-${data.topic}`,
        useOfflineCache: true,
        retryConfig: {
          maxRetries: 2, // Fewer retries for AI generation
          baseDelay: 2000 // Longer delay for AI services
        },
        ...options
      }),
      { ...options, feature: 'lessons' }
    )
  }

  public async updateLessonProgress(lessonId: string, progress: {
    completed: boolean
    timeSpent: number
    xpEarned: number
  }, options: APIClientOptions = {}): Promise<APIResponse> {
    return this.handleRequest(
      () => retryClient.post(`/api/lessons/${lessonId}/progress`, progress, options),
      { ...options, feature: 'lessons' }
    )
  }

  // User Profile API
  public async getUserProfile(options: APIClientOptions = {}): Promise<APIResponse> {
    return this.handleRequest(
      () => retryClient.get('/api/user/profile', {
        cacheKey: 'user-profile',
        useOfflineCache: true,
        ...options
      }),
      { ...options, feature: 'profile' }
    )
  }

  public async updateUserProfile(data: Record<string, unknown>, options: APIClientOptions = {}): Promise<APIResponse> {
    return this.handleRequest(
      () => retryClient.put('/api/user/profile', data, options),
      { ...options, feature: 'profile' }
    )
  }

  // Onboarding API
  public async completeOnboarding(data: {
    skillLevel: string
    learningGoal: string
    primaryDomain: string
    preferredLearningStyle: string
  }, options: APIClientOptions = {}): Promise<APIResponse> {
    return this.handleRequest(
      () => retryClient.post('/api/onboarding', data, options),
      { ...options, feature: 'onboarding' }
    )
  }

  // Learning Path API
  public async getLearningPath(options: APIClientOptions = {}): Promise<APIResponse> {
    return this.handleRequest(
      () => retryClient.get('/api/learning-path', {
        cacheKey: 'learning-path',
        useOfflineCache: true,
        ...options
      }),
      { ...options, feature: 'knowledge-graph' }
    )
  }

  // Mistakes API
  public async analyzeMistake(data: {
    errorMessage: string
    codeContext: string
    language: string
  }, options: APIClientOptions = {}): Promise<APIResponse> {
    return this.handleRequest(
      () => retryClient.post('/api/mistakes/analyze', data, {
        retryConfig: {
          maxRetries: 1, // Don't retry mistake analysis too much
          baseDelay: 1000
        },
        ...options
      }),
      { ...options, feature: 'mistake-analysis' }
    )
  }

  public async getMistakePatterns(options: APIClientOptions = {}): Promise<APIResponse> {
    return this.handleRequest(
      () => retryClient.get('/api/mistakes/patterns', {
        cacheKey: 'mistake-patterns',
        useOfflineCache: true,
        ...options
      }),
      { ...options, feature: 'mistake-analysis' }
    )
  }

  // Health check
  public async healthCheck(): Promise<boolean> {
    try {
      const response = await retryClient.get('/api/health', {
        retryConfig: { maxRetries: 1, baseDelay: 500 },
        useOfflineCache: false
      })
      return response.ok
    } catch {
      return false
    }
  }

  // Connection status
  public getConnectionStatus(): {
    isOnline: boolean
    hasOfflineData: boolean
    cacheStats: { totalEntries: number; totalSize: number }
  } {
    return {
      isOnline: offlineManager.getConnectionStatus(),
      hasOfflineData: offlineManager.hasOfflineContent(),
      cacheStats: retryClient.getCacheStats()
    }
  }

  // Clear all caches
  public clearAllCaches(): void {
    retryClient.clearCache()
    offlineManager.clearOfflineData()
  }
}

export const apiClient = APIClient.getInstance()

// Convenience hooks for React components
export function useAPIClient() {
  return {
    client: apiClient,
    connectionStatus: apiClient.getConnectionStatus(),
    clearCaches: () => apiClient.clearAllCaches()
  }
}
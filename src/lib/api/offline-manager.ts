/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Offline Manager
 * Handles offline mode with cached content and graceful degradation
 */

import { demoLessonManager } from '@/lib/lessons/lesson-cache'
import type { DashboardData, LearningInsight, UserProfile } from '@/types/database'

export interface OfflineData {
  profile: UserProfile | null
  dashboardData: DashboardData | null
  lessons: any[]
  insights: LearningInsight[]
  lastUpdated: string
  isOffline: boolean
}

class OfflineManager {
  private static instance: OfflineManager
  private offlineData: OfflineData | null = null
  private isOnline: boolean = true
  private listeners: ((isOnline: boolean) => void)[] = []

  private constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine
      this.setupEventListeners()
      this.loadOfflineData()
    }
  }

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager()
    }
    return OfflineManager.instance
  }

  private setupEventListeners() {
    if (typeof window === 'undefined') return

    window.addEventListener('online', () => {
      this.isOnline = true
      this.notifyListeners(true)
      console.log('🟢 Back online - syncing data...')
      this.syncWhenOnline()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.notifyListeners(false)
      console.log('🔴 Gone offline - using cached data')
    })
  }

  private notifyListeners(isOnline: boolean) {
    this.listeners.forEach(listener => listener(isOnline))
  }

  public onConnectionChange(callback: (isOnline: boolean) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  public getConnectionStatus(): boolean {
    return this.isOnline
  }

  private loadOfflineData() {
    if (typeof window === 'undefined') return

    try {
      const cached = localStorage.getItem('codo-offline-data')
      if (cached) {
        this.offlineData = JSON.parse(cached)
        console.log('📦 Loaded offline data from cache')
      }
    } catch (error) {
      console.warn('Failed to load offline data:', error)
      this.offlineData = null
    }
  }

  public saveOfflineData(data: Partial<OfflineData>) {
    if (typeof window === 'undefined') return

    try {
      const currentData = this.offlineData || {
        profile: null,
        dashboardData: null,
        lessons: [],
        insights: [],
        lastUpdated: new Date().toISOString(),
        isOffline: false
      }

      this.offlineData = {
        ...currentData,
        ...data,
        lastUpdated: new Date().toISOString()
      }

      localStorage.setItem('codo-offline-data', JSON.stringify(this.offlineData))
      console.log('💾 Saved data for offline use')
    } catch (error) {
      console.warn('Failed to save offline data:', error)
    }
  }

  public getOfflineData(): OfflineData | null {
    return this.offlineData
  }

  public async syncWhenOnline() {
    if (!this.isOnline) return

    try {
      // Attempt to sync cached data with server
      console.log('🔄 Syncing offline data with server...')
      
      // This would typically involve:
      // 1. Uploading any offline changes
      // 2. Downloading latest data
      // 3. Resolving conflicts
      
      // For now, just refresh the cache
      await this.refreshCache()
    } catch (error) {
      console.warn('Failed to sync offline data:', error)
    }
  }

  private async refreshCache() {
    // This would refresh cached data from the server
    console.log('🔄 Refreshing cache...')
  }

  public clearOfflineData() {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem('codo-offline-data')
      this.offlineData = null
      console.log('🗑️ Cleared offline data')
    } catch (error) {
      console.warn('Failed to clear offline data:', error)
    }
  }

  public getOfflineLessons() {
    return demoLessonManager.getAllDemoLessons()
  }

  public hasOfflineContent(): boolean {
    return this.offlineData !== null || demoLessonManager.getAllDemoLessons().length > 0
  }
}

export const offlineManager = OfflineManager.getInstance()
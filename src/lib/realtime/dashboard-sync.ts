/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Real-time Dashboard Data Synchronization
 * Implements efficient data refresh and real-time updates for dashboard
 * Requirement 23.8
 */

import { supabase } from '../database/supabase-client'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ============================================================================
// Types
// ============================================================================

export interface DashboardSyncConfig {
  userId: string
  onStatsUpdate?: (stats: any) => void
  onPeerStatusUpdate?: (peerId: string, status: any) => void
  onNewMessage?: (message: any) => void
  onProgressUpdate?: (progress: any) => void
  onActivityUpdate?: (activity: any) => void
  pollingInterval?: number // milliseconds, default 30000 (30 seconds)
}

export interface SyncStatus {
  isConnected: boolean
  lastSync: Date | null
  syncMethod: 'realtime' | 'polling' | 'none'
  error: string | null
}

// ============================================================================
// Dashboard Sync Manager
// ============================================================================

export class DashboardSyncManager {
  private config: DashboardSyncConfig
  private channels: RealtimeChannel[] = []
  private pollingInterval: NodeJS.Timeout | null = null
  private status: SyncStatus = {
    isConnected: false,
    lastSync: null,
    syncMethod: 'none',
    error: null
  }

  constructor(config: DashboardSyncConfig) {
    this.config = {
      ...config,
      pollingInterval: config.pollingInterval || 30000 // Default 30 seconds
    }
  }

  /**
   * Start real-time synchronization
   * Attempts WebSocket connection first, falls back to polling
   */
  async start(): Promise<void> {
    try {
      // Try to establish real-time connection
      const realtimeSuccess = await this.setupRealtimeSubscriptions()
      
      if (realtimeSuccess) {
        this.status.syncMethod = 'realtime'
        this.status.isConnected = true
        this.status.error = null
        console.log('[DashboardSync] Real-time connection established')
      } else {
        // Fallback to polling
        this.setupPolling()
        this.status.syncMethod = 'polling'
        this.status.isConnected = true
        this.status.error = null
        console.log('[DashboardSync] Using polling fallback')
      }
      
      this.status.lastSync = new Date()
    } catch (error) {
      this.status.error = error instanceof Error ? error.message : 'Unknown error'
      console.error('[DashboardSync] Failed to start sync:', error)
      
      // Still try polling as last resort
      this.setupPolling()
      this.status.syncMethod = 'polling'
      this.status.isConnected = true
    }
  }

  /**
   * Stop all synchronization
   */
  async stop(): Promise<void> {
    // Unsubscribe from all real-time channels
    for (const channel of this.channels) {
      await supabase.removeChannel(channel)
    }
    this.channels = []

    // Clear polling interval
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }

    this.status.isConnected = false
    this.status.syncMethod = 'none'
    console.log('[DashboardSync] Sync stopped')
  }

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return { ...this.status }
  }

  /**
   * Manually trigger a sync
   */
  async triggerSync(): Promise<void> {
    await this.pollDashboardData()
    this.status.lastSync = new Date()
  }

  // ============================================================================
  // Private Methods - Real-time Subscriptions
  // ============================================================================

  private async setupRealtimeSubscriptions(): Promise<boolean> {
    try {
      // Subscribe to user learning stats changes
      const statsChannel = supabase
        .channel(`user_stats:${this.config.userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_learning_stats',
            filter: `user_id=eq.${this.config.userId}`
          },
          (payload) => {
            console.log('[DashboardSync] Stats updated:', payload)
            if (this.config.onStatsUpdate) {
              this.config.onStatsUpdate(payload.new)
            }
            this.status.lastSync = new Date()
          }
        )
        .subscribe()

      this.channels.push(statsChannel)

      // Subscribe to peer status changes
      const peerStatusChannel = supabase
        .channel(`peer_status:${this.config.userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_ai_peers',
            filter: `user_id=eq.${this.config.userId}`
          },
          (payload) => {
            console.log('[DashboardSync] Peer status updated:', payload)
            if (this.config.onPeerStatusUpdate && payload.new && 'peer_id' in payload.new) {
              this.config.onPeerStatusUpdate((payload.new as any).peer_id, payload.new)
            }
            this.status.lastSync = new Date()
          }
        )
        .subscribe()

      this.channels.push(peerStatusChannel)

      // Subscribe to new peer messages
      const messagesChannel = supabase
        .channel(`peer_messages:${this.config.userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'peer_messages',
            filter: `user_id=eq.${this.config.userId}`
          },
          (payload) => {
            console.log('[DashboardSync] New message:', payload)
            if (this.config.onNewMessage) {
              this.config.onNewMessage(payload.new)
            }
            this.status.lastSync = new Date()
          }
        )
        .subscribe()

      this.channels.push(messagesChannel)

      // Subscribe to track progress changes
      const progressChannel = supabase
        .channel(`track_progress:${this.config.userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_track_progress',
            filter: `user_id=eq.${this.config.userId}`
          },
          (payload) => {
            console.log('[DashboardSync] Progress updated:', payload)
            if (this.config.onProgressUpdate) {
              this.config.onProgressUpdate(payload.new)
            }
            this.status.lastSync = new Date()
          }
        )
        .subscribe()

      this.channels.push(progressChannel)

      // Subscribe to new activities
      const activitiesChannel = supabase
        .channel(`activities:${this.config.userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'enhanced_activities',
            filter: `user_id=eq.${this.config.userId}`
          },
          (payload) => {
            console.log('[DashboardSync] New activity:', payload)
            if (this.config.onActivityUpdate) {
              this.config.onActivityUpdate(payload.new)
            }
            this.status.lastSync = new Date()
          }
        )
        .subscribe()

      this.channels.push(activitiesChannel)

      return true
    } catch (error) {
      console.error('[DashboardSync] Failed to setup real-time subscriptions:', error)
      return false
    }
  }

  // ============================================================================
  // Private Methods - Polling Fallback
  // ============================================================================

  private setupPolling(): void {
    // Clear any existing interval
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
    }

    // Set up new polling interval
    this.pollingInterval = setInterval(async () => {
      await this.pollDashboardData()
    }, this.config.pollingInterval)

    // Do initial poll
    this.pollDashboardData()
  }

  private async pollDashboardData(): Promise<void> {
    try {
      // Poll for stats updates
      if (this.config.onStatsUpdate) {
        const { data: stats } = await supabase
          .from('user_learning_stats')
          .select('*')
          .eq('user_id', this.config.userId)
          .single()
        
        if (stats) {
          this.config.onStatsUpdate(stats)
        }
      }

      // Poll for peer status updates
      if (this.config.onPeerStatusUpdate) {
        const { data: peers } = await supabase
          .from('user_ai_peers')
          .select('*')
          .eq('user_id', this.config.userId)
        
        if (peers) {
          peers.forEach(peer => {
            this.config.onPeerStatusUpdate!(peer.peer_id, peer)
          })
        }
      }

      // Poll for new messages
      if (this.config.onNewMessage) {
        const { data: messages } = await supabase
          .from('peer_messages')
          .select('*')
          .eq('user_id', this.config.userId)
          .eq('is_read', false)
          .order('created_at', { ascending: false })
          .limit(5)
        
        if (messages) {
          messages.forEach(message => {
            this.config.onNewMessage!(message)
          })
        }
      }

      // Poll for progress updates
      if (this.config.onProgressUpdate) {
        const { data: progress } = await supabase
          .from('user_track_progress')
          .select('*')
          .eq('user_id', this.config.userId)
          .eq('status', 'in_progress')
          .order('last_activity_at', { ascending: false })
          .limit(1)
          .single()
        
        if (progress) {
          this.config.onProgressUpdate(progress)
        }
      }

      // Poll for recent activities
      if (this.config.onActivityUpdate) {
        const { data: activities } = await supabase
          .from('enhanced_activities')
          .select('*')
          .eq('user_id', this.config.userId)
          .order('activity_timestamp', { ascending: false })
          .limit(1)
          .single()
        
        if (activities) {
          this.config.onActivityUpdate(activities)
        }
      }

      this.status.lastSync = new Date()
      this.status.error = null
    } catch (error) {
      console.error('[DashboardSync] Polling error:', error)
      this.status.error = error instanceof Error ? error.message : 'Polling failed'
    }
  }
}

// ============================================================================
// React Hook for Dashboard Sync
// ============================================================================

export interface UseDashboardSyncOptions {
  enabled?: boolean
  pollingInterval?: number
  onStatsUpdate?: (stats: any) => void
  onPeerStatusUpdate?: (peerId: string, status: any) => void
  onNewMessage?: (message: any) => void
  onProgressUpdate?: (progress: any) => void
  onActivityUpdate?: (activity: any) => void
}

/**
 * React hook for dashboard synchronization
 * Usage:
 * 
 * const { status, triggerSync } = useDashboardSync(userId, {
 *   onStatsUpdate: (stats) => setStats(stats),
 *   onNewMessage: (message) => addMessage(message)
 * })
 */
export function createDashboardSyncHook() {
  return function useDashboardSync(
    userId: string | null,
    options: UseDashboardSyncOptions = {}
  ) {
    const {
      enabled = true,
      pollingInterval = 30000,
      onStatsUpdate,
      onPeerStatusUpdate,
      onNewMessage,
      onProgressUpdate,
      onActivityUpdate
    } = options

    // This would be implemented in a React component
    // For now, we provide the factory function
    return {
      start: async () => {
        if (!userId || !enabled) return

        const manager = new DashboardSyncManager({
          userId,
          pollingInterval,
          onStatsUpdate,
          onPeerStatusUpdate,
          onNewMessage,
          onProgressUpdate,
          onActivityUpdate
        })

        await manager.start()
        return manager
      }
    }
  }
}

// ============================================================================
// Optimistic Updates Helper
// ============================================================================

export class OptimisticUpdateManager {
  private pendingUpdates: Map<string, any> = new Map()
  private rollbackCallbacks: Map<string, () => void> = new Map()

  /**
   * Apply an optimistic update
   * @param key Unique identifier for this update
   * @param optimisticData Data to apply immediately
   * @param rollback Function to call if update fails
   */
  apply(key: string, optimisticData: any, rollback: () => void): void {
    this.pendingUpdates.set(key, optimisticData)
    this.rollbackCallbacks.set(key, rollback)
  }

  /**
   * Confirm an optimistic update succeeded
   */
  confirm(key: string): void {
    this.pendingUpdates.delete(key)
    this.rollbackCallbacks.delete(key)
  }

  /**
   * Rollback an optimistic update
   */
  rollback(key: string): void {
    const rollbackFn = this.rollbackCallbacks.get(key)
    if (rollbackFn) {
      rollbackFn()
    }
    this.pendingUpdates.delete(key)
    this.rollbackCallbacks.delete(key)
  }

  /**
   * Check if an update is pending
   */
  isPending(key: string): boolean {
    return this.pendingUpdates.has(key)
  }

  /**
   * Get all pending updates
   */
  getPending(): Map<string, any> {
    return new Map(this.pendingUpdates)
  }

  /**
   * Clear all pending updates
   */
  clear(): void {
    this.pendingUpdates.clear()
    this.rollbackCallbacks.clear()
  }
}

// ============================================================================
// Data Caching Helper
// ============================================================================

export class DashboardCache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()
  private defaultTTL: number = 60000 // 1 minute default

  constructor(defaultTTL?: number) {
    if (defaultTTL) {
      this.defaultTTL = defaultTTL
    }
  }

  /**
   * Set cached data
   */
  set(key: string, data: any, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    })
  }

  /**
   * Get cached data if not expired
   */
  get(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const age = Date.now() - cached.timestamp
    if (age > cached.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Invalidate cached data
   */
  invalidate(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// ============================================================================
// Background Sync Helper
// ============================================================================

export class BackgroundSyncManager {
  private syncQueue: Array<{ key: string; fn: () => Promise<void>; priority: number }> = []
  private isProcessing: boolean = false
  private maxRetries: number = 3
  private retryDelay: number = 1000 // 1 second

  /**
   * Add a sync operation to the queue
   */
  enqueue(key: string, fn: () => Promise<void>, priority: number = 0): void {
    this.syncQueue.push({ key, fn, priority })
    this.syncQueue.sort((a, b) => b.priority - a.priority)
    
    if (!this.isProcessing) {
      this.processQueue()
    }
  }

  /**
   * Process the sync queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.syncQueue.length === 0) {
      return
    }

    this.isProcessing = true

    while (this.syncQueue.length > 0) {
      const item = this.syncQueue.shift()
      if (!item) continue

      let retries = 0
      let success = false

      while (retries < this.maxRetries && !success) {
        try {
          await item.fn()
          success = true
          console.log(`[BackgroundSync] Synced: ${item.key}`)
        } catch (error) {
          retries++
          console.error(`[BackgroundSync] Failed (attempt ${retries}/${this.maxRetries}):`, error)
          
          if (retries < this.maxRetries) {
            await new Promise(resolve => setTimeout(resolve, this.retryDelay * retries))
          }
        }
      }

      if (!success) {
        console.error(`[BackgroundSync] Gave up on: ${item.key}`)
      }
    }

    this.isProcessing = false
  }

  /**
   * Get queue status
   */
  getStatus(): { queueLength: number; isProcessing: boolean } {
    return {
      queueLength: this.syncQueue.length,
      isProcessing: this.isProcessing
    }
  }

  /**
   * Clear the queue
   */
  clear(): void {
    this.syncQueue = []
  }
}

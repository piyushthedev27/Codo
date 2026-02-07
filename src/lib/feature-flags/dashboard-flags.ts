/**
 * Feature Flags for Dashboard Rollout
 * 
 * Enables gradual rollout of dashboard features with A/B testing support
 */

export interface FeatureFlag {
  name: string
  enabled: boolean
  rolloutPercentage: number // 0-100
  variants?: {
    name: string
    percentage: number
  }[]
  userOverrides?: string[] // User IDs to force enable/disable
}

export interface DashboardFeatureFlags {
  modernizedDashboard: FeatureFlag
  enhancedStats: FeatureFlag
  aiPeerCards: FeatureFlag
  learningPath: FeatureFlag
  recommendedLessons: FeatureFlag
  enhancedActivityFeed: FeatureFlag
  realTimeUpdates: FeatureFlag
  analytics: FeatureFlag
}

/**
 * Default feature flags configuration
 */
export const DEFAULT_FEATURE_FLAGS: DashboardFeatureFlags = {
  modernizedDashboard: {
    name: 'modernized_dashboard',
    enabled: true,
    rolloutPercentage: 100,
    variants: [
      { name: 'control', percentage: 0 },
      { name: 'modernized', percentage: 100 }
    ]
  },
  enhancedStats: {
    name: 'enhanced_stats',
    enabled: true,
    rolloutPercentage: 100
  },
  aiPeerCards: {
    name: 'ai_peer_cards',
    enabled: true,
    rolloutPercentage: 100
  },
  learningPath: {
    name: 'learning_path',
    enabled: true,
    rolloutPercentage: 100
  },
  recommendedLessons: {
    name: 'recommended_lessons',
    enabled: true,
    rolloutPercentage: 100
  },
  enhancedActivityFeed: {
    name: 'enhanced_activity_feed',
    enabled: true,
    rolloutPercentage: 100
  },
  realTimeUpdates: {
    name: 'real_time_updates',
    enabled: true,
    rolloutPercentage: 100
  },
  analytics: {
    name: 'analytics',
    enabled: true,
    rolloutPercentage: 100
  }
}

/**
 * Feature flag manager
 */
export class FeatureFlagManager {
  private flags: DashboardFeatureFlags
  
  constructor(flags: DashboardFeatureFlags = DEFAULT_FEATURE_FLAGS) {
    this.flags = flags
  }
  
  /**
   * Check if a feature is enabled for a user
   */
  isEnabled(featureName: keyof DashboardFeatureFlags, userId: string): boolean {
    const flag = this.flags[featureName]
    
    if (!flag.enabled) {
      return false
    }
    
    // Check user overrides
    if (flag.userOverrides?.includes(userId)) {
      return true
    }
    
    // Check rollout percentage
    const userHash = this.hashUserId(userId)
    const userPercentage = userHash % 100
    
    return userPercentage < flag.rolloutPercentage
  }
  
  /**
   * Get variant for A/B testing
   */
  getVariant(featureName: keyof DashboardFeatureFlags, userId: string): string | null {
    const flag = this.flags[featureName]
    
    if (!flag.enabled || !flag.variants) {
      return null
    }
    
    const userHash = this.hashUserId(userId)
    const userPercentage = userHash % 100
    
    let cumulativePercentage = 0
    for (const variant of flag.variants) {
      cumulativePercentage += variant.percentage
      if (userPercentage < cumulativePercentage) {
        return variant.name
      }
    }
    
    return flag.variants[0]?.name || null
  }
  
  /**
   * Hash user ID to get consistent percentage
   */
  private hashUserId(userId: string): number {
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }
  
  /**
   * Update feature flag
   */
  updateFlag(featureName: keyof DashboardFeatureFlags, updates: Partial<FeatureFlag>) {
    this.flags[featureName] = {
      ...this.flags[featureName],
      ...updates
    }
  }
  
  /**
   * Get all flags
   */
  getAllFlags(): DashboardFeatureFlags {
    return this.flags
  }
}

// Singleton instance
let featureFlagManager: FeatureFlagManager | null = null

/**
 * Get feature flag manager instance
 */
export function getFeatureFlagManager(): FeatureFlagManager {
  if (!featureFlagManager) {
    featureFlagManager = new FeatureFlagManager()
  }
  return featureFlagManager
}

/**
 * Initialize feature flags from remote config
 */
export async function initializeFeatureFlags(): Promise<FeatureFlagManager> {
  try {
    const response = await fetch('/api/feature-flags')
    const flags = await response.json()
    featureFlagManager = new FeatureFlagManager(flags)
    return featureFlagManager
  } catch (error) {
    console.error('Failed to load feature flags, using defaults:', error)
    featureFlagManager = new FeatureFlagManager()
    return featureFlagManager
  }
}

/**
 * React hook for feature flags
 */
export function useFeatureFlag(featureName: keyof DashboardFeatureFlags, userId: string): boolean {
  const manager = getFeatureFlagManager()
  return manager.isEnabled(featureName, userId)
}

/**
 * React hook for A/B testing variants
 */
export function useFeatureVariant(featureName: keyof DashboardFeatureFlags, userId: string): string | null {
  const manager = getFeatureFlagManager()
  return manager.getVariant(featureName, userId)
}

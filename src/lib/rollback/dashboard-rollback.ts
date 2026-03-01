/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Dashboard Rollback System
 * 
 * Provides rollback procedures and monitoring alerts for dashboard issues
 */

export interface RollbackConfig {
  feature: string
  enabled: boolean
  threshold: {
    errorRate: number // Percentage
    performanceDegradation: number // Percentage
    userComplaints: number // Count
  }
  actions: {
    disableFeature: boolean
    notifyAdmins: boolean
    rollbackToVersion?: string
  }
}

export interface HealthCheck {
  feature: string
  status: 'healthy' | 'degraded' | 'critical'
  metrics: {
    errorRate: number
    avgLoadTime: number
    userSatisfaction: number
  }
  timestamp: Date
}

/**
 * Rollback manager class
 */
export class RollbackManager {
  private configs: Map<string, RollbackConfig> = new Map()
  
  /**
   * Register rollback configuration for a feature
   */
  registerConfig(config: RollbackConfig) {
    this.configs.set(config.feature, config)
  }
  
  /**
   * Check health and trigger rollback if needed
   */
  async checkHealth(feature: string): Promise<HealthCheck> {
    const config = this.configs.get(feature)
    
    if (!config || !config.enabled) {
      return {
        feature,
        status: 'healthy',
        metrics: {
          errorRate: 0,
          avgLoadTime: 0,
          userSatisfaction: 5
        },
        timestamp: new Date()
      }
    }
    
    // Fetch metrics from analytics
    const metrics = await this.fetchMetrics(feature)
    
    // Determine health status
    const status = this.determineStatus(metrics, config.threshold)
    
    // Trigger rollback if critical
    if (status === 'critical') {
      await this.triggerRollback(feature, config)
    }
    
    return {
      feature,
      status,
      metrics,
      timestamp: new Date()
    }
  }
  
  /**
   * Fetch metrics for a feature
   */
  private async fetchMetrics(feature: string) {
    try {
      const response = await fetch(`/api/monitoring/metrics?feature=${feature}`)
      if (!response.ok) {
        throw new Error('Failed to fetch metrics')
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
      return {
        errorRate: 0,
        avgLoadTime: 0,
        userSatisfaction: 5
      }
    }
  }
  
  /**
   * Determine health status based on metrics
   */
  private determineStatus(
    metrics: any,
    threshold: RollbackConfig['threshold']
  ): HealthCheck['status'] {
    if (
      metrics.errorRate > threshold.errorRate ||
      metrics.avgLoadTime > threshold.performanceDegradation ||
      metrics.userComplaints > threshold.userComplaints
    ) {
      return 'critical'
    }
    
    if (
      metrics.errorRate > threshold.errorRate * 0.5 ||
      metrics.avgLoadTime > threshold.performanceDegradation * 0.5
    ) {
      return 'degraded'
    }
    
    return 'healthy'
  }
  
  /**
   * Trigger rollback procedures
   */
  private async triggerRollback(feature: string, config: RollbackConfig) {
    console.warn(`Triggering rollback for feature: ${feature}`)
    
    if (config.actions.disableFeature) {
      await this.disableFeature(feature)
    }
    
    if (config.actions.notifyAdmins) {
      await this.notifyAdmins(feature, config)
    }
    
    if (config.actions.rollbackToVersion) {
      await this.rollbackToVersion(feature, config.actions.rollbackToVersion)
    }
  }
  
  /**
   * Disable a feature
   */
  private async disableFeature(feature: string) {
    try {
      await fetch('/api/feature-flags/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature })
      })
      console.log(`Feature disabled: ${feature}`)
    } catch (error) {
      console.error(`Failed to disable feature ${feature}:`, error)
    }
  }
  
  /**
   * Notify administrators
   */
  private async notifyAdmins(feature: string, config: RollbackConfig) {
    try {
      await fetch('/api/monitoring/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature,
          severity: 'critical',
          message: `Feature ${feature} has exceeded health thresholds and has been rolled back`,
          config
        })
      })
      console.log(`Admins notified about ${feature} rollback`)
    } catch (error) {
      console.error(`Failed to notify admins about ${feature}:`, error)
    }
  }
  
  /**
   * Rollback to a specific version
   */
  private async rollbackToVersion(feature: string, version: string) {
    console.log(`Rolling back ${feature} to version ${version}`)
    // Implementation depends on deployment strategy
    // This could trigger a redeployment or feature flag update
  }
}

/**
 * Default rollback configurations
 */
export const DEFAULT_ROLLBACK_CONFIGS: RollbackConfig[] = [
  {
    feature: 'modernized_dashboard',
    enabled: true,
    threshold: {
      errorRate: 5, // 5% error rate
      performanceDegradation: 3000, // 3 seconds load time
      userComplaints: 10 // 10 complaints
    },
    actions: {
      disableFeature: true,
      notifyAdmins: true
    }
  },
  {
    feature: 'enhanced_stats',
    enabled: true,
    threshold: {
      errorRate: 10,
      performanceDegradation: 2000,
      userComplaints: 5
    },
    actions: {
      disableFeature: true,
      notifyAdmins: true
    }
  },
  {
    feature: 'real_time_updates',
    enabled: true,
    threshold: {
      errorRate: 15,
      performanceDegradation: 5000,
      userComplaints: 15
    },
    actions: {
      disableFeature: true,
      notifyAdmins: true
    }
  }
]

// Singleton instance
let rollbackManager: RollbackManager | null = null

/**
 * Get rollback manager instance
 */
export function getRollbackManager(): RollbackManager {
  if (!rollbackManager) {
    rollbackManager = new RollbackManager()
    // Register default configs
    DEFAULT_ROLLBACK_CONFIGS.forEach(config => {
      rollbackManager!.registerConfig(config)
    })
  }
  return rollbackManager
}

/**
 * Initialize monitoring with automatic health checks
 */
export function initializeMonitoring(intervalMs: number = 60000) {
  const manager = getRollbackManager()
  
  setInterval(async () => {
    const features = ['modernized_dashboard', 'enhanced_stats', 'real_time_updates']
    
    for (const feature of features) {
      const health = await manager.checkHealth(feature)
      
      if (health.status !== 'healthy') {
        console.warn(`Feature ${feature} health status: ${health.status}`, health.metrics)
      }
    }
  }, intervalMs)
}

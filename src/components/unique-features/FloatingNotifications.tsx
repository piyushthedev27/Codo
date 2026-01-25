'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, TrendingUp, AlertTriangle, Target, Lightbulb, Trophy } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LearningInsight } from '@/types/database'
import { ProactiveRecommendation } from '@/lib/utils/proactive-recommendations'

export interface FloatingNotification {
  id: string
  type: 'insight' | 'recommendation' | 'achievement' | 'reminder'
  title: string
  message: string
  action?: string
  priority: 'low' | 'medium' | 'high'
  icon?: React.ReactNode
  color?: string
  duration?: number // Auto-dismiss after this many milliseconds
  persistent?: boolean // Don't auto-dismiss
  onClick?: () => void
  onDismiss?: () => void
  metadata?: any
}

interface FloatingNotificationsProps {
  insights?: LearningInsight[]
  recommendations?: ProactiveRecommendation[]
  achievements?: any[]
  onInsightDismiss?: (insightId: string) => void
  onRecommendationAction?: (recommendationId: string) => void
  className?: string
}

export function FloatingNotifications({
  insights = [],
  recommendations = [],
  achievements = [],
  onInsightDismiss,
  onRecommendationAction,
  className = ''
}: FloatingNotificationsProps) {
  const [notifications, setNotifications] = useState<FloatingNotification[]>([])
  const [isVisible, setIsVisible] = useState(true)

  // Convert insights and recommendations to notifications
  useEffect(() => {
    const newNotifications: FloatingNotification[] = []

    // Convert insights to notifications
    insights
      .filter(insight => !insight.dismissed)
      .slice(0, 3) // Limit to 3 most important
      .forEach(insight => {
        newNotifications.push({
          id: `insight-${insight.id}`,
          type: 'insight',
          title: insight.title,
          message: insight.message,
          action: insight.action_recommended || undefined,
          priority: insight.priority,
          icon: getInsightIcon(insight.insight_type),
          color: getInsightColor(insight.insight_type),
          duration: insight.priority === 'high' ? undefined : 10000, // High priority stays until dismissed
          persistent: insight.priority === 'high',
          onClick: () => {
            if (insight.action_recommended) {
              // Handle insight action
              console.log('Insight action:', insight.action_recommended)
            }
          },
          onDismiss: () => {
            if (onInsightDismiss) {
              onInsightDismiss(insight.id)
            }
          },
          metadata: { insightId: insight.id, insightType: insight.insight_type }
        })
      })

    // Convert recommendations to notifications
    recommendations
      .slice(0, 2) // Limit to 2 most important
      .forEach(recommendation => {
        newNotifications.push({
          id: `recommendation-${recommendation.id}`,
          type: 'recommendation',
          title: recommendation.title,
          message: recommendation.description,
          action: recommendation.action,
          priority: recommendation.priority,
          icon: getRecommendationIcon(recommendation.type),
          color: getRecommendationColor(recommendation.type),
          duration: 15000,
          onClick: () => {
            if (onRecommendationAction) {
              onRecommendationAction(recommendation.id)
            }
          },
          metadata: { recommendationId: recommendation.id, recommendationType: recommendation.type }
        })
      })

    // Convert achievements to notifications
    achievements.forEach(achievement => {
      newNotifications.push({
        id: `achievement-${achievement.id}`,
        type: 'achievement',
        title: '🎉 Achievement Unlocked!',
        message: achievement.description,
        priority: 'medium',
        icon: <Trophy className="w-5 h-5" />,
        color: 'from-yellow-400 to-orange-500',
        duration: 8000,
        metadata: { achievementId: achievement.id }
      })
    })

    setNotifications(newNotifications)
  }, [insights, recommendations, achievements, onInsightDismiss, onRecommendationAction])

  // Auto-dismiss notifications
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    notifications.forEach(notification => {
      if (notification.duration && !notification.persistent) {
        const timer = setTimeout(() => {
          dismissNotification(notification.id)
        }, notification.duration)
        timers.push(timer)
      }
    })

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [notifications])

  const dismissNotification = useCallback((notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId)
    
    if (notification?.onDismiss) {
      notification.onDismiss()
    }

    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }, [notifications])

  const handleNotificationClick = useCallback((notification: FloatingNotification) => {
    if (notification.onClick) {
      notification.onClick()
    }
    
    // Dismiss after action unless persistent
    if (!notification.persistent) {
      dismissNotification(notification.id)
    }
  }, [dismissNotification])

  if (!isVisible || notifications.length === 0) {
    return null
  }

  return (
    <div className={`fixed top-4 right-4 z-50 space-y-3 max-w-sm ${className}`}>
      <AnimatePresence mode="popLayout">
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              x: 0, 
              scale: 1,
              transition: { 
                delay: index * 0.1,
                type: "spring",
                stiffness: 300,
                damping: 30
              }
            }}
            exit={{ 
              opacity: 0, 
              x: 300, 
              scale: 0.8,
              transition: { duration: 0.2 }
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <NotificationCard
              notification={notification}
              onClick={() => handleNotificationClick(notification)}
              onDismiss={() => dismissNotification(notification.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Toggle visibility button */}
      {notifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-end"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(!isVisible)}
            className="text-xs opacity-60 hover:opacity-100"
          >
            <Bell className="w-3 h-3 mr-1" />
            {isVisible ? 'Hide' : 'Show'} ({notifications.length})
          </Button>
        </motion.div>
      )}
    </div>
  )
}

interface NotificationCardProps {
  notification: FloatingNotification
  onClick: () => void
  onDismiss: () => void
}

function NotificationCard({ notification, onClick, onDismiss }: NotificationCardProps) {
  const priorityStyles = {
    low: 'border-blue-200 dark:border-blue-800',
    medium: 'border-yellow-200 dark:border-yellow-800',
    high: 'border-red-200 dark:border-red-800 shadow-lg'
  }

  const backgroundGradient = notification.color || 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20'

  return (
    <Card className={`
      relative overflow-hidden cursor-pointer transition-all duration-200
      ${priorityStyles[notification.priority]}
      hover:shadow-lg hover:scale-[1.02]
      bg-gradient-to-r ${backgroundGradient}
    `}>
      {/* Priority indicator */}
      {notification.priority === 'high' && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-orange-400" />
      )}

      <div className="p-4" onClick={onClick}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {notification.icon || <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                {notification.title}
              </h4>
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                {notification.message}
              </p>
              
              {notification.action && (
                <div className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                  → {notification.action}
                </div>
              )}
            </div>
          </div>

          {/* Dismiss button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDismiss()
            }}
            className="flex-shrink-0 w-6 h-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Progress bar for timed notifications */}
      {notification.duration && !notification.persistent && (
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: notification.duration / 1000, ease: 'linear' }}
        />
      )}
    </Card>
  )
}

// Helper functions for icons and colors
function getInsightIcon(insightType: string): React.ReactNode {
  switch (insightType) {
    case 'velocity_change':
      return <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
    case 'retention_risk':
      return <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
    case 'strength_identified':
      return <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
    case 'pattern_detected':
      return <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
    default:
      return <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
  }
}

function getInsightColor(insightType: string): string {
  switch (insightType) {
    case 'velocity_change':
      return 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20'
    case 'retention_risk':
      return 'from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20'
    case 'strength_identified':
      return 'from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20'
    case 'pattern_detected':
      return 'from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20'
    default:
      return 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20'
  }
}

function getRecommendationIcon(recommendationType: string): React.ReactNode {
  switch (recommendationType) {
    case 'next_topic':
      return <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
    case 'review_needed':
      return <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
    case 'skill_gap':
      return <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400" />
    case 'optimization':
      return <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400" />
    case 'motivation':
      return <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
    default:
      return <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
  }
}

function getRecommendationColor(recommendationType: string): string {
  switch (recommendationType) {
    case 'next_topic':
      return 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20'
    case 'review_needed':
      return 'from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20'
    case 'skill_gap':
      return 'from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20'
    case 'optimization':
      return 'from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20'
    case 'motivation':
      return 'from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20'
    default:
      return 'from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20'
  }
}

// Hook for managing notifications
export function useFloatingNotifications() {
  const [notifications, setNotifications] = useState<FloatingNotification[]>([])

  const addNotification = useCallback((notification: Omit<FloatingNotification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setNotifications(prev => [...prev, { ...notification, id }])
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications
  }
}
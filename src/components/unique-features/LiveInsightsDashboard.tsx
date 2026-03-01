'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  AlertTriangle,
  Target,
  Lightbulb,
  Trophy,
  RefreshCw,
  Filter,
  Eye,
  EyeOff,
  Trash2,
  Sparkles,
  BarChart3,
  Clock,
  Zap
} from 'lucide-react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Card, CardContent, CardHeader as _CardHeader, CardTitle as _CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useInsights, useInsightDismissal } from '@/lib/hooks/useInsights'
import { FloatingNotifications } from './FloatingNotifications'
import { LearningInsight } from '@/types/database'
import { ProactiveRecommendation } from '@/lib/utils/proactive-recommendations'

interface LiveInsightsDashboardProps {
  className?: string
  showFloatingNotifications?: boolean
  compact?: boolean
}

export function LiveInsightsDashboard({
  className = '',
  showFloatingNotifications = true,
  compact = false
}: LiveInsightsDashboardProps) {
  const [showDismissed, setShowDismissed] = useState(false)
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [selectedType, setSelectedType] = useState<'all' | 'insights' | 'recommendations'>('all')

  const {
    insights,
    recommendations,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    patterns: _patterns,
    meta,
    loading,
    error,
    refreshing,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    dismissInsight: _dismissInsight,
    regenerateInsights,
    refresh,
    hasActiveInsights
  } = useInsights({
    includeRecommendations: true,
    includeDismissed: showDismissed,
    autoRefresh: true,
    refreshInterval: 60000 // 1 minute
  })

  const { dismissWithOptimisticUpdate, isDismissing } = useInsightDismissal()

  // Filter insights and recommendations
  const filteredInsights = insights.filter(insight => {
    if (selectedPriority !== 'all' && insight.priority !== selectedPriority) return false
    if (!showDismissed && insight.dismissed) return false
    return true
  })

  const filteredRecommendations = recommendations.filter(rec => {
    if (selectedPriority !== 'all' && rec.priority !== selectedPriority) return false
    return true
  })

  const handleDismissInsight = async (insightId: string) => {
    try {
      await dismissWithOptimisticUpdate(insightId)
    } catch (error) {
      console.error('Failed to dismiss insight:', error)
    }
  }

  const handleRegenerateInsights = async () => {
    try {
      await regenerateInsights()
    } catch (error) {
      console.error('Failed to regenerate insights:', error)
    }
  }

  if (loading && !refreshing) {
    return (
      <div className={`space-y-6 ${className}`}>
        <InsightsDashboardSkeleton compact={compact} />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">Failed to Load Insights</h3>
                <p className="text-sm text-red-500 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
            <Button
              onClick={refresh}
              variant="outline"
              size="sm"
              className="mt-4"
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Floating Notifications */}
      {showFloatingNotifications && (
        <FloatingNotifications
          insights={insights.filter(i => !i.dismissed).slice(0, 3)}
          recommendations={recommendations.slice(0, 2)}
          onInsightDismiss={handleDismissInsight}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Live Learning Insights
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Real-time pattern recognition and personalized recommendations
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 w-fit px-2 py-1 rounded-md border border-blue-100 dark:border-blue-800/50">
            <Clock className="w-3.5 h-3.5" />
            <span>Data as of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleRegenerateInsights}
            variant="outline"
            size="sm"
            disabled={refreshing}
          >
            <Sparkles className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Generate New
          </Button>

          <Button
            onClick={refresh}
            variant="ghost"
            size="sm"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {!compact && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="Active Insights"
            value={meta.activeInsights}
            icon={<Lightbulb className="w-4 h-4" />}
            color="text-blue-600 dark:text-blue-400"
          />
          <StatsCard
            title="Recommendations"
            value={meta.recommendationsCount}
            icon={<Target className="w-4 h-4" />}
            color="text-green-600 dark:text-green-400"
          />
          <StatsCard
            title="Patterns Detected"
            value={meta.patternsCount}
            icon={<BarChart3 className="w-4 h-4" />}
            color="text-purple-600 dark:text-purple-400"
          />
          <StatsCard
            title="Total Insights"
            value={meta.totalInsights}
            icon={<Trophy className="w-4 h-4" />}
            color="text-orange-600 dark:text-orange-400"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Filter:</span>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1">
          {(['all', 'insights', 'recommendations'] as const).map(type => (
            <Button
              key={type}
              variant={selectedType === type ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedType(type)}
              className="h-7 px-2 text-xs"
            >
              {type === 'all' ? 'All' : type === 'insights' ? 'Insights' : 'Recommendations'}
            </Button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1">
          {(['all', 'high', 'medium', 'low'] as const).map(priority => (
            <Button
              key={priority}
              variant={selectedPriority === priority ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedPriority(priority)}
              className="h-7 px-2 text-xs"
            >
              {priority === 'all' ? 'All Priority' : priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Button>
          ))}
        </div>

        {/* Show Dismissed Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDismissed(!showDismissed)}
          className="h-7 px-2 text-xs"
        >
          {showDismissed ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
          {showDismissed ? 'Hide Dismissed' : 'Show Dismissed'}
        </Button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Insights Section */}
        {(selectedType === 'all' || selectedType === 'insights') && (
          <InsightsSection
            insights={filteredInsights}
            onDismiss={handleDismissInsight}
            isDismissing={isDismissing}
            compact={compact}
          />
        )}

        {/* Recommendations Section */}
        {(selectedType === 'all' || selectedType === 'recommendations') && (
          <RecommendationsSection
            recommendations={filteredRecommendations}
            compact={compact}
          />
        )}

        {/* Empty State */}
        {filteredInsights.length === 0 && filteredRecommendations.length === 0 && (
          <EmptyState
            hasData={hasActiveInsights}
            onGenerate={handleRegenerateInsights}
            generating={refreshing}
          />
        )}
      </div>
    </div>
  )
}

// Insights Section Component
function InsightsSection({
  insights,
  onDismiss,
  isDismissing,
  compact
}: {
  insights: LearningInsight[]
  onDismiss: (id: string) => void
  isDismissing: (id: string) => boolean
  compact: boolean
}) {
  if (insights.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        Learning Insights ({insights.length})
      </h3>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {insights.map((insight) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.2 }}
            >
              <InsightCard
                insight={insight}
                onDismiss={onDismiss}
                isDismissing={isDismissing(insight.id)}
                compact={compact}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Recommendations Section Component
function RecommendationsSection({
  recommendations,
  compact
}: {
  recommendations: ProactiveRecommendation[]
  compact: boolean
}) {
  if (recommendations.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
        Proactive Recommendations ({recommendations.length})
      </h3>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {recommendations.map((recommendation) => (
            <motion.div
              key={recommendation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.2 }}
            >
              <RecommendationCard
                recommendation={recommendation}
                compact={compact}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Individual Insight Card
function InsightCard({
  insight,
  onDismiss,
  isDismissing,
  compact
}: {
  insight: LearningInsight
  onDismiss: (id: string) => void
  isDismissing: boolean
  compact: boolean
}) {
  const priorityColors = {
    low: 'border-blue-200 dark:border-blue-800',
    medium: 'border-yellow-200 dark:border-yellow-800',
    high: 'border-red-200 dark:border-red-800'
  }

  const priorityBadgeColors = {
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  return (
    <Card className={`${priorityColors[insight.priority]} ${insight.dismissed ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-shrink-0 mt-0.5">
              {getInsightIcon(insight.insight_type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  {insight.title}
                </h4>
                <Badge className={priorityBadgeColors[insight.priority]}>
                  {insight.priority}
                </Badge>
                {insight.dismissed && (
                  <Badge variant="secondary">Dismissed</Badge>
                )}
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                {insight.message}
              </p>

              {insight.action_recommended && (
                <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                  💡 {insight.action_recommended}
                </div>
              )}

              {!compact && (
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(insight.created_at).toLocaleDateString()}
                  </span>
                  {insight.expires_at && (
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Expires {new Date(insight.expires_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {!insight.dismissed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(insight.id)}
              disabled={isDismissing}
              className="flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Individual Recommendation Card
function RecommendationCard({
  recommendation,
  compact
}: {
  recommendation: ProactiveRecommendation
  compact: boolean
}) {
  const priorityColors = {
    low: 'border-green-200 dark:border-green-800',
    medium: 'border-yellow-200 dark:border-yellow-800',
    high: 'border-red-200 dark:border-red-800'
  }

  const priorityBadgeColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  return (
    <Card className={priorityColors[recommendation.priority]}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getRecommendationIcon(recommendation.type)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                {recommendation.title}
              </h4>
              <Badge className={priorityBadgeColors[recommendation.priority]}>
                {recommendation.priority}
              </Badge>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              {recommendation.description}
            </p>

            <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
              🎯 {recommendation.action}
            </div>

            {!compact && (
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  {Math.round(recommendation.confidence * 100)}% confidence
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Expires {new Date(recommendation.expires_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Stats Card Component
function StatsCard({
  title,
  value,
  icon,
  color
}: {
  title: string
  value: number
  icon: React.ReactNode
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          </div>
          <div className={color}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Empty State Component
function EmptyState({
  hasData,
  onGenerate,
  generating
}: {
  hasData: boolean
  onGenerate: () => void
  generating: boolean
}) {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {hasData ? 'No Insights Match Your Filters' : 'No Insights Yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {hasData
              ? 'Try adjusting your filters to see more insights and recommendations.'
              : 'Start learning to generate personalized insights and recommendations based on your progress.'
            }
          </p>
          <Button onClick={onGenerate} disabled={generating}>
            <Sparkles className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Generating...' : 'Generate Insights'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Loading Skeleton
function InsightsDashboardSkeleton({ compact }: { compact: boolean }) {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>

      {/* Stats Skeleton */}
      {!compact && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                    <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                  <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Content Skeleton */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="flex-1">
                  <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Helper functions for icons
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
      return <Lightbulb className="w-5 h-5 text-gray-600 dark:text-gray-400" />
  }
}
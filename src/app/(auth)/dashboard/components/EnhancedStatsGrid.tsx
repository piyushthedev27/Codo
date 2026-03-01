'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Star,
  Clock,
  Target,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Award as _Award,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  BookOpen as _BookOpen,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Code as _Code
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { animationClasses } from '@/lib/animations/animation-optimizer'
import type { EnhancedStats } from '@/lib/utils/stats-calculations'
import { getTrendIndicator, formatDuration } from '@/lib/utils/stats-calculations'

interface EnhancedStatsGridProps {
  stats: EnhancedStats
  className?: string
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  trend: 'up' | 'down' | 'stable'
  trendValue?: string | number
  icon: React.ReactNode
  gradient: string
  className?: string
}

function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  gradient,
  className
}: StatCardProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _trendIndicator = getTrendIndicator(trend)

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <Card className={cn(
      "relative overflow-hidden border-0 transition-optimized hover-lift group",
      // Touch-friendly minimum height
      "min-h-[160px] sm:min-h-[180px]",
      // Ensure proper touch target size
      "touch-manipulation",
      gradient,
      className
    )}>
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-fast" />

      <CardHeader className="pb-2 sm:pb-3 relative z-10 p-4 sm:p-6">
        <CardTitle className={cn(
          "text-base sm:text-lg flex items-center gap-2 text-white",
          // Ensure text is readable on mobile
          "leading-tight",
          animationClasses.fadeInUp
        )}>
          {icon}
          <span className="truncate">{title}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-10 p-4 sm:p-6 pt-0">
        {/* Main Value */}
        <div className={cn(
          "text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2",
          // Ensure value is prominent
          "leading-tight",
          animationClasses.scaleIn
        )}>
          {value}
        </div>

        {/* Subtitle */}
        <div className={cn(
          "text-xs sm:text-sm text-white/90 mb-2 sm:mb-3",
          // Ensure subtitle wraps properly on small screens
          "line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]",
          animationClasses.fadeInUp
        )}>
          {subtitle}
        </div>

        {/* Trend Indicator */}
        {trendValue && (
          <div className={cn("flex items-center gap-1 text-xs sm:text-sm", animationClasses.slideInRight)}>
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full transition-optimized",
              "bg-white/20 text-white hover-scale",
              // Touch-friendly size
              "min-h-[28px] sm:min-h-[32px]"
            )}>
              <TrendIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">
                {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}{trendValue}
                {trend !== 'stable' && (
                  <span className="ml-1 text-xs opacity-75 hidden sm:inline">
                    {title.includes('Progress') ? '% this week' :
                      title.includes('Streak') ? ' days' :
                        title.includes('Skills') ? ' this month' :
                          title.includes('Time') ? 'h vs last week' : ''}
                  </span>
                )}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function EnhancedStatsGrid({ stats, className }: EnhancedStatsGridProps) {
  return (
    <div className={cn(
      // Responsive grid: 1 column mobile, 2 columns tablet, 4 columns desktop
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6",
      // Ensure proper spacing and alignment
      "w-full",
      className
    )}>
      {/* Learning Progress Card */}
      <StatCard
        title="Learning Progress"
        value={`${stats.learningProgress.percentage}%`}
        subtitle={`${stats.learningProgress.lessonsCompleted} of ${stats.learningProgress.totalLessons} lessons completed`}
        trend={stats.learningProgress.trend}
        trendValue={stats.learningProgress.weeklyChange}
        icon={<Target className="w-5 h-5 sm:w-6 sm:h-6" />}
        gradient="bg-gradient-to-br from-blue-500 to-blue-600"
      />

      {/* Current Streak Card */}
      <StatCard
        title="Current Streak"
        value={`${stats.currentStreak.days} Days`}
        subtitle={stats.currentStreak.message}
        trend={stats.currentStreak.trend}
        trendValue={stats.currentStreak.days > 0 ? `Best: ${stats.currentStreak.bestStreak}` : undefined}
        icon={<Zap className="w-5 h-5 sm:w-6 sm:h-6" />}
        gradient="bg-gradient-to-br from-orange-500 to-red-500"
      />

      {/* Skills Mastered Card */}
      <StatCard
        title="Skills Mastered"
        value={`${stats.skillsMastered.count} Skills`}
        subtitle={stats.skillsMastered.recentSkills.length > 0
          ? stats.skillsMastered.recentSkills.join(', ')
          : 'Keep learning to unlock skills!'
        }
        trend={stats.skillsMastered.trend}
        trendValue={stats.skillsMastered.monthlyProgress}
        icon={<Star className="w-5 h-5 sm:w-6 sm:h-6" />}
        gradient="bg-gradient-to-br from-green-500 to-green-600"
      />

      {/* Coding Time Card */}
      <StatCard
        title="Time This Week"
        value={formatDuration(stats.codingTime.weeklyHours)}
        subtitle={`Daily avg: ${formatDuration(stats.codingTime.dailyAverage)}`}
        trend={stats.codingTime.trend}
        trendValue={formatDuration(stats.codingTime.weeklyChange)}
        icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6" />}
        gradient="bg-gradient-to-br from-purple-500 to-purple-600"
      />
    </div>
  )
}

// Alternative compact version for smaller screens
export function CompactStatsGrid({ stats, className }: EnhancedStatsGridProps) {
  return (
    <div className={cn(
      // 2 columns on all screen sizes for compact view
      "grid grid-cols-2 gap-3 sm:gap-4",
      className
    )}>
      {/* Learning Progress */}
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 touch-manipulation">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium truncate">Progress</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold leading-tight">{stats.learningProgress.percentage}%</div>
          <div className="text-[10px] sm:text-xs opacity-90 mt-0.5 sm:mt-1 line-clamp-1">
            {stats.learningProgress.lessonsCompleted}/{stats.learningProgress.totalLessons} lessons
          </div>
        </CardContent>
      </Card>

      {/* Current Streak */}
      <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 touch-manipulation">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium truncate">Streak</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold leading-tight">{stats.currentStreak.days} Days</div>
          <div className="text-[10px] sm:text-xs opacity-90 mt-0.5 sm:mt-1 line-clamp-1">
            Best: {stats.currentStreak.bestStreak} days
          </div>
        </CardContent>
      </Card>

      {/* Skills Mastered */}
      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 touch-manipulation">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium truncate">Skills</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold leading-tight">{stats.skillsMastered.count}</div>
          <div className="text-[10px] sm:text-xs opacity-90 mt-0.5 sm:mt-1 line-clamp-1">
            +{stats.skillsMastered.monthlyProgress} this month
          </div>
        </CardContent>
      </Card>

      {/* Coding Time */}
      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 touch-manipulation">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium truncate">Time</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold leading-tight">{formatDuration(stats.codingTime.weeklyHours)}</div>
          <div className="text-[10px] sm:text-xs opacity-90 mt-0.5 sm:mt-1 line-clamp-1">
            {formatDuration(stats.codingTime.dailyAverage)}/day avg
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Loading skeleton for stats grid
export function EnhancedStatsGridSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      // Match the responsive grid layout
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6",
      className
    )}>
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="animate-pulse min-h-[160px] sm:min-h-[180px]">
          <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0" />
              <div className="h-4 sm:h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 sm:w-32" />
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="h-7 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 sm:w-20 mb-1 sm:mb-2" />
            <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2 sm:mb-3" />
            <div className="h-6 sm:h-7 bg-gray-200 dark:bg-gray-700 rounded w-20 sm:w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default EnhancedStatsGrid
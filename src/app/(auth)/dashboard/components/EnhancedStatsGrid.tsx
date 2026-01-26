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
  Award,
  BookOpen,
  Code
} from 'lucide-react'
import { cn } from '@/lib/utils'
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
  const trendIndicator = getTrendIndicator(trend)
  
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  
  return (
    <Card className={cn(
      "relative overflow-hidden border-0 hover:shadow-lg transition-all duration-300 hover:scale-105 group",
      gradient,
      className
    )}>
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="pb-3 relative z-10">
        <CardTitle className="text-lg flex items-center gap-2 text-white">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative z-10">
        {/* Main Value */}
        <div className="text-3xl font-bold text-white mb-2">
          {value}
        </div>
        
        {/* Subtitle */}
        <div className="text-sm text-white/90 mb-3">
          {subtitle}
        </div>
        
        {/* Trend Indicator */}
        {trendValue && (
          <div className="flex items-center gap-1 text-sm">
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full",
              "bg-white/20 text-white"
            )}>
              <TrendIcon className="w-3 h-3" />
              <span>
                {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}{trendValue}
                {trend !== 'stable' && (
                  <span className="ml-1 text-xs opacity-75">
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
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
      className
    )}>
      {/* Learning Progress Card */}
      <StatCard
        title="Learning Progress"
        value={`${stats.learningProgress.percentage}%`}
        subtitle={`${stats.learningProgress.lessonsCompleted} of ${stats.learningProgress.totalLessons} lessons completed`}
        trend={stats.learningProgress.trend}
        trendValue={stats.learningProgress.weeklyChange}
        icon={<Target className="w-6 h-6" />}
        gradient="bg-gradient-to-br from-blue-500 to-blue-600"
      />
      
      {/* Current Streak Card */}
      <StatCard
        title="Current Streak"
        value={`${stats.currentStreak.days} Days`}
        subtitle={stats.currentStreak.message}
        trend={stats.currentStreak.trend}
        trendValue={stats.currentStreak.days > 0 ? `Best: ${stats.currentStreak.bestStreak}` : undefined}
        icon={<Zap className="w-6 h-6" />}
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
        icon={<Star className="w-6 h-6" />}
        gradient="bg-gradient-to-br from-green-500 to-green-600"
      />
      
      {/* Coding Time Card */}
      <StatCard
        title="Time This Week"
        value={formatDuration(stats.codingTime.weeklyHours)}
        subtitle={`Daily avg: ${formatDuration(stats.codingTime.dailyAverage)}`}
        trend={stats.codingTime.trend}
        trendValue={formatDuration(stats.codingTime.weeklyChange)}
        icon={<Clock className="w-6 h-6" />}
        gradient="bg-gradient-to-br from-purple-500 to-purple-600"
      />
    </div>
  )
}

// Alternative compact version for smaller screens
export function CompactStatsGrid({ stats, className }: EnhancedStatsGridProps) {
  return (
    <div className={cn(
      "grid grid-cols-2 gap-4",
      className
    )}>
      {/* Learning Progress */}
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4" />
            <span className="text-sm font-medium">Progress</span>
          </div>
          <div className="text-2xl font-bold">{stats.learningProgress.percentage}%</div>
          <div className="text-xs opacity-90">
            {stats.learningProgress.lessonsCompleted}/{stats.learningProgress.totalLessons} lessons
          </div>
        </CardContent>
      </Card>
      
      {/* Current Streak */}
      <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Streak</span>
          </div>
          <div className="text-2xl font-bold">{stats.currentStreak.days} Days</div>
          <div className="text-xs opacity-90">
            Best: {stats.currentStreak.bestStreak} days
          </div>
        </CardContent>
      </Card>
      
      {/* Skills Mastered */}
      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4" />
            <span className="text-sm font-medium">Skills</span>
          </div>
          <div className="text-2xl font-bold">{stats.skillsMastered.count}</div>
          <div className="text-xs opacity-90">
            +{stats.skillsMastered.monthlyProgress} this month
          </div>
        </CardContent>
      </Card>
      
      {/* Coding Time */}
      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Time</span>
          </div>
          <div className="text-2xl font-bold">{formatDuration(stats.codingTime.weeklyHours)}</div>
          <div className="text-xs opacity-90">
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
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
      className
    )}>
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-3" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default EnhancedStatsGrid
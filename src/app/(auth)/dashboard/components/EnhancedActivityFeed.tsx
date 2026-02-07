/**
 * Enhanced Activity Feed Component
 * 
 * Displays recent learning activities with categorization, styling, and AI peer involvement
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Sparkles } from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'
import { getActivityStyle } from '@/lib/activities/activity-types'
import type { EnhancedActivity } from '@/lib/activities/activity-tracker'
import { motion, AnimatePresence } from 'framer-motion'

interface EnhancedActivityFeedProps {
  activities: EnhancedActivity[]
  maxDisplay?: number
  showCelebrations?: boolean
}

export function EnhancedActivityFeed({ 
  activities, 
  maxDisplay = 5,
  showCelebrations = true 
}: EnhancedActivityFeedProps) {
  const [celebratedActivities, setCelebratedActivities] = useState<Set<string>>(new Set())
  
  const displayActivities = activities.slice(0, maxDisplay)
  
  const handleCelebration = (activityId: string) => {
    setCelebratedActivities(prev => new Set(prev).add(activityId))
  }
  
  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 card-hover-effect">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            Recent Activity
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
            View All
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
          </Button>
        </div>
        <CardDescription className="text-sm">
          Your learning journey with AI peers
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="space-y-3 sm:space-y-4">
          <AnimatePresence mode="popLayout">
            {displayActivities.map((activity, index) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                index={index}
                showCelebration={
                  showCelebrations && 
                  activity.type === 'achievement' && 
                  !celebratedActivities.has(activity.id)
                }
                onCelebrate={() => handleCelebration(activity.id)}
              />
            ))}
          </AnimatePresence>
          
          {activities.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-sm">No recent activities yet.</p>
              <p className="text-xs mt-1">Start learning to see your progress here!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface ActivityCardProps {
  activity: EnhancedActivity
  index: number
  showCelebration: boolean
  onCelebrate: () => void
}

function ActivityCard({ activity, index, showCelebration, onCelebrate }: ActivityCardProps) {
  const style = getActivityStyle(activity.type)
  const Icon = style.icon
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05 }}
      className={`
        relative flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg 
        border ${style.borderColor} ${style.bgColor}
        smooth-transition card-hover-effect
        ${showCelebration ? 'ring-2 ring-yellow-400 animate-pulse' : ''}
      `}
    >
      {/* Activity Icon */}
      <div className="flex-shrink-0 mt-0.5">
        <div className={`p-2 rounded-lg ${style.iconColor} bg-white dark:bg-gray-800`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
      
      {/* Activity Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-sm sm:text-base">
          {activity.title}
        </h4>
        
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
          {activity.description}
        </p>
        
        {/* Activity Metadata */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">{activity.timestamp}</span>
          
          {activity.duration && (
            <Badge variant="outline" className="text-xs">
              {activity.duration}m
            </Badge>
          )}
          
          {activity.metadata?.difficulty && (
            <Badge variant="outline" className="text-xs capitalize">
              {activity.metadata.difficulty}
            </Badge>
          )}
          
          {activity.xpEarned > 0 && (
            <Badge className={`text-xs ${style.badgeColor} border-0`}>
              +{activity.xpEarned} XP
            </Badge>
          )}
        </div>
        
        {/* Collaboration Info */}
        {activity.metadata?.collaborators && activity.metadata.collaborators.length > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <span>with</span>
            <span className="font-medium">{activity.metadata.collaborators.join(', ')}</span>
          </div>
        )}
      </div>
      
      {/* AI Peer Avatar */}
      {activity.peerInvolved && activity.peerInvolved.length > 0 && (
        <div className="flex-shrink-0">
          {activity.peerInvolved.length === 1 ? (
            <Avatar peerId={activity.peerInvolved[0]} size="sm" />
          ) : (
            <div className="flex -space-x-2">
              {activity.peerInvolved.slice(0, 3).map((peerId, i) => (
                <Avatar 
                  key={peerId} 
                  peerId={peerId} 
                  size="sm"
                  className={`border-2 border-white dark:border-gray-800 z-${10 - i}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Celebration Effect */}
      {showCelebration && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="absolute -top-2 -right-2"
          onAnimationComplete={onCelebrate}
        >
          <div className="bg-yellow-400 text-white rounded-full p-2 shadow-lg">
            <Sparkles className="w-4 h-4" />
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

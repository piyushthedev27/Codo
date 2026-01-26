/**
 * Recommended Lessons Component
 * Displays AI-recommended lessons with peer recommendations
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/shared/Avatar'
import { BookOpen, Clock, Star, ExternalLink, Play } from 'lucide-react'

interface RecommendedLesson {
  id: string
  title: string
  duration: string
  difficulty: string
  description: string
  recommendedBy: string
  thumbnail: string
}

interface RecommendedLessonsProps {
  lessons: RecommendedLesson[]
}

export function RecommendedLessons({ lessons }: RecommendedLessonsProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
      case 'advanced': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getDifficultyStars = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 1
      case 'intermediate': return 2
      case 'advanced': return 3
      default: return 1
    }
  }

  const getPeerAccentColor = (peerName: string) => {
    switch (peerName.toLowerCase()) {
      case 'sarah': return 'border-l-pink-400'
      case 'alex': return 'border-l-blue-400'
      case 'jordan': return 'border-l-purple-400'
      default: return 'border-l-gray-400'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Recommended for You
          </CardTitle>
          <Button variant="ghost" size="sm">
            <ExternalLink className="w-4 h-4 mr-1" />
            Explore More
          </Button>
        </div>
        <CardDescription>
          Personalized recommendations from your AI study buddies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <div 
              key={lesson.id}
              className={`group relative bg-white dark:bg-gray-800 rounded-lg border-l-4 ${getPeerAccentColor(lesson.recommendedBy)} border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-200`}
            >
              {/* Lesson Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {lesson.title}
                  </h3>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      {lesson.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(3)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${
                            i < getDifficultyStars(lesson.difficulty) 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-300 dark:text-gray-600'
                          }`} 
                        />
                      ))}
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-1 capitalize">
                        {lesson.difficulty}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {lesson.description}
                  </p>
                </div>
              </div>

              {/* Recommended By */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar peerId={lesson.recommendedBy} size="sm" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Recommended by <span className="font-medium capitalize">{lesson.recommendedBy}</span>
                  </span>
                </div>
                <Badge className={getDifficultyColor(lesson.difficulty)}>
                  {lesson.difficulty}
                </Badge>
              </div>

              {/* Start Button */}
              <Button 
                className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white group-hover:shadow-md transition-all duration-200"
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Lesson
              </Button>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" className="w-full">
            View All Recommendations
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
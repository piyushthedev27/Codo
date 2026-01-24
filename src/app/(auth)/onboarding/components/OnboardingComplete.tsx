'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Sparkles, Users, Mic, Brain, ArrowRight } from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'
import type { OnboardingData } from '@/types/database'

interface OnboardingCompleteProps {
  onboardingData: OnboardingData
  onComplete: () => void
}

export function OnboardingComplete({ onboardingData, onComplete }: OnboardingCompleteProps) {
  const [isNavigating, setIsNavigating] = useState(false)

  const handleGetStarted = async () => {
    setIsNavigating(true)
    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500))
    onComplete()
  }

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'intermediate': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'advanced': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getGoalIcon = (goal: string) => {
    switch (goal) {
      case 'learning': return '🎓'
      case 'projects': return '🚀'
      case 'placement': return '💼'
      case 'productivity': return '⚡'
      default: return '🎯'
    }
  }

  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case 'javascript': return '⚛️'
      case 'python': return '🐍'
      case 'java': return '☕'
      case 'mobile': return '📱'
      case 'devops': return '☁️'
      default: return '💻'
    }
  }

  return (
    <div className="max-w-3xl mx-auto text-center">
      {/* Success Animation */}
      <div className="mb-8">
        <div className="mx-auto mb-6 p-4 bg-green-100 dark:bg-green-900/20 rounded-full w-fit animate-bounce">
          <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          🎉 Your Learning Profile is Ready!
        </h2>
        <p className="text-lg text-muted-foreground">
          We've personalized your experience based on your preferences
        </p>
      </div>

      {/* Profile Summary */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Learning Profile */}
        <Card className="text-left">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Your Learning Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Skill Level</span>
              <Badge className={getSkillLevelColor(onboardingData.skillLevel)}>
                {onboardingData.skillLevel.charAt(0).toUpperCase() + onboardingData.skillLevel.slice(1)}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Primary Goal</span>
              <div className="flex items-center gap-2">
                <span>{getGoalIcon(onboardingData.learningGoal)}</span>
                <span className="text-sm capitalize">
                  {onboardingData.learningGoal.replace('_', ' ')}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Focus Area</span>
              <div className="flex items-center gap-2">
                <span>{getDomainIcon(onboardingData.primaryDomain)}</span>
                <span className="text-sm capitalize">
                  {onboardingData.primaryDomain.replace('_', ' ')}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Learning Style</span>
              <span className="text-sm capitalize">
                {onboardingData.preferredLearningStyle.replace('_', ' ')}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Voice Coaching</span>
              <div className="flex items-center gap-2">
                <Mic className={`w-4 h-4 ${onboardingData.voiceCoachingEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="text-sm">
                  {onboardingData.voiceCoachingEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Peers Preview */}
        <Card className="text-left">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Your AI Study Buddies
            </CardTitle>
            <CardDescription>
              Meet your personalized learning companions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-pink-50 dark:bg-pink-900/10 rounded-lg">
                <Avatar peerId="sarah" size="sm" showRing={true} />
                <div>
                  <p className="font-medium text-sm">Sarah</p>
                  <p className="text-xs text-muted-foreground">Curious • Asks great questions</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                <Avatar peerId="alex" size="sm" showRing={true} />
                <div>
                  <p className="font-medium text-sm">Alex</p>
                  <p className="text-xs text-muted-foreground">Analytical • Loves problem-solving</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                <Avatar peerId="jordan" size="sm" showRing={true} />
                <div>
                  <p className="font-medium text-sm">Jordan</p>
                  <p className="text-xs text-muted-foreground">Supportive • Great mentor</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Preview */}
      <Card className="mb-8 text-left">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            What's Next?
          </CardTitle>
          <CardDescription>
            Here's what you can expect in your personalized learning journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 rounded-lg">
              <div className="text-2xl mb-2">🧠</div>
              <h4 className="font-medium mb-1">Interactive Knowledge Graph</h4>
              <p className="text-sm text-muted-foreground">
                Visualize your learning path and unlock new concepts
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 rounded-lg">
              <div className="text-2xl mb-2">🎤</div>
              <h4 className="font-medium mb-1">AI Voice Coaching</h4>
              <p className="text-sm text-muted-foreground">
                Get real-time spoken guidance while coding
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10 rounded-lg">
              <div className="text-2xl mb-2">🤝</div>
              <h4 className="font-medium mb-1">Collaborative Learning</h4>
              <p className="text-sm text-muted-foreground">
                Code together with AI peers in real-time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="space-y-4">
        <Button 
          size="lg" 
          onClick={handleGetStarted}
          disabled={isNavigating}
          className="px-8 py-3 text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isNavigating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Setting up your dashboard...
            </>
          ) : (
            <>
              Start Learning with AI Peers
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
        
        <p className="text-sm text-muted-foreground">
          You can always update your preferences in settings later
        </p>
      </div>
    </div>
  )
}
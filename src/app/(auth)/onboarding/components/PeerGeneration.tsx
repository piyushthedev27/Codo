'use client'
/* eslint-disable react/jsx-no-comment-textnodes, @typescript-eslint/no-unused-vars */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Users, ArrowRight } from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'
import { getAllPeers } from '@/lib/avatars'
import type { OnboardingData } from '@/types/database'

interface PeerGenerationProps {
  onboardingData: OnboardingData
  onComplete: () => void
}

export function PeerGeneration({ onboardingData, onComplete }: PeerGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
   
  const [_isComplete, setIsComplete] = useState(false)

  const allPeers = getAllPeers()
  
  const steps = [
    'Analyzing your learning preferences...',
    'Selecting compatible AI personalities...',
    'Customizing peer interactions...',
    'Finalizing your study group...'
  ]

  useEffect(() => {
    // Simulate AI peer generation process
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1
        } else {
          setIsGenerating(false)
          setIsComplete(true)
          clearInterval(timer)
          return prev
        }
      })
    }, 1500)

    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleContinue = () => {
    onComplete()
  }

  if (isGenerating) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="mx-auto mb-6 p-4 bg-purple-100 dark:bg-purple-900/20 rounded-full w-fit animate-pulse">
            <Sparkles className="w-12 h-12 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">
            Generating Your AI Study Buddies
          </h2>
          <p className="text-muted-foreground mb-8">
            We&apos;re creating personalized AI peers based on your learning preferences
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-6">
              {steps.map((step, _index) => (
                <div 
                  key={_index}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-500 ${
                    index <= currentStep 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100' 
                      : 'bg-gray-50 dark:bg-gray-800/50 text-gray-500'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index < currentStep 
                      ? 'bg-green-500 text-white' 
                      : _index === currentStep 
                      ? 'bg-blue-500 text-white animate-pulse' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {index < currentStep ? '✓' : index + 1}
                  </div>
                  <span className="font-medium">{step}</span>
                  {_index === currentStep && (
                    <div className="ml-auto">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Preview of AI Peers being generated */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-center mb-4 text-muted-foreground">
                Preparing your AI study buddies...
              </h4>              <div className="flex justify-center gap-4">
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                {allPeers.map((peer, _index) => (
                  <div 
                    key={peer.id}
                    className={`transition-all duration-1000 ${
                      currentStep > index ? 'opacity-100 scale-100' : 'opacity-30 scale-75'
                    }`}
                  >
                    <div className="text-center">
                      <Avatar 
                        peerId={peer.id} 
                        size="md" 
                        showRing={true}
                        animated={true}
                        className={currentStep > index ? 'animate-pulse' : ''}
                      />
                      <p className="text-xs mt-2 font-medium">{peer.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{peer.personality}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground">
          This process is tailored to your {onboardingData.skillLevel} level and {onboardingData.primaryDomain} focus
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto text-center">
      <div className="mb-8">
        <div className="mx-auto mb-6 p-4 bg-green-100 dark:bg-green-900/20 rounded-full w-fit animate-bounce">
          <Users className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Meet Your AI Study Buddies! 🎉
        </h2>
        <p className="text-lg text-muted-foreground">
          Your personalized learning companions are ready to help you succeed
        </p>
      </div>      <div className="grid md:grid-cols-3 gap-6 mb-8">
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        {allPeers.map((peer, _index) => (
          <Card key={peer.id} className="text-left transform hover:scale-105 transition-transform duration-300 border-2 hover:border-opacity-50" style={{
            borderColor: peer.personality === 'curious' ? '#f472b6' : 
                        peer.personality === 'analytical' ? '#60a5fa' : 
                        peer.personality === 'supportive' ? '#4ade80' : '#6b7280'
          }}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 relative">
                <Avatar 
                  peerId={peer.id} 
                  size="xl" 
                  showRing={true}
                  animated={true}
                  priority={true}
                  interactive={true}
                  showPersonalityBadge={true}
                />
                {/* Personality glow effect */}
                <div className={`absolute inset-0 rounded-full opacity-20 animate-pulse ${
                  peer.personality === 'curious' ? 'bg-pink-400' :
                  peer.personality === 'analytical' ? 'bg-blue-400' :
                  peer.personality === 'supportive' ? 'bg-green-400' : 'bg-gray-400'
                }`} />
              </div>
              <CardTitle className="text-xl flex items-center justify-center gap-2">
                {peer.name}
                <span className="text-lg">
                  {peer.personality === 'curious' ? '🤔' :
                   peer.personality === 'analytical' ? '🧠' :
                   peer.personality === 'supportive' ? '🤝' : '🤖'}
                </span>
              </CardTitle>
              <CardDescription className="capitalize font-medium">
                {peer.personality} • {peer.skill_level} level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${
                  peer.personality === 'curious' ? 'bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800' :
                  peer.personality === 'analytical' ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' :
                  peer.personality === 'supportive' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
                  'bg-gray-50 dark:bg-gray-800/50'
                }`}>
                  <h4 className="font-medium text-sm mb-1 flex items-center gap-2">
                    <span className="text-lg">
                      {peer.personality === 'curious' ? '💭' :
                       peer.personality === 'analytical' ? '🔍' :
                       peer.personality === 'supportive' ? '💪' : '🎯'}
                    </span>
                    Personality
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {peer.interaction_style}
                  </p>
                </div>
                
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <h4 className="font-medium text-sm mb-1 flex items-center gap-2">
                    <span className="text-lg">⚠️</span>
                    Common Learning Areas
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {peer.common_mistakes.slice(0, 2).map((mistake, idx) => (
                      <span 
                        key={idx}
                        className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded-full border border-red-200 dark:border-red-700"
                      >
                        {mistake}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className={`p-3 rounded-lg ${
                  peer.personality === 'curious' ? 'bg-pink-100 dark:bg-pink-900/30 border border-pink-300 dark:border-pink-700' :
                  peer.personality === 'analytical' ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700' :
                  peer.personality === 'supportive' ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700' :
                  'bg-blue-50 dark:bg-blue-900/20'
                }`}>
                  <h4 className="font-medium text-sm mb-1 flex items-center gap-2">
                    <span className="text-lg">✨</span>
                    About {peer.name}
                  </h4>
                  <p className={`text-xs ${
                    peer.personality === 'curious' ? 'text-pink-700 dark:text-pink-300' :
                    peer.personality === 'analytical' ? 'text-blue-700 dark:text-blue-300' :
                    peer.personality === 'supportive' ? 'text-green-700 dark:text-green-300' :
                    'text-blue-700 dark:text-blue-300'
                  }`}>
                    {peer.backstory}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-8 text-left">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            How Your AI Peers Will Help
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 rounded-lg">
              <h4 className="font-medium mb-2">🤔 Ask Questions</h4>
              <p className="text-sm text-muted-foreground">
                Your peers will ask thoughtful questions during lessons to help reinforce learning
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 rounded-lg">
              <h4 className="font-medium mb-2">🎯 Make Mistakes</h4>
              <p className="text-sm text-muted-foreground">
                They&apos;ll make common errors for you to spot and correct, earning bonus XP
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10 rounded-lg">
              <h4 className="font-medium mb-2">🤝 Collaborate</h4>
              <p className="text-sm text-muted-foreground">
                Code together in real-time and compare different approaches to problems
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/10 rounded-lg">
              <h4 className="font-medium mb-2">🏆 Compete</h4>
              <p className="text-sm text-muted-foreground">
                Challenge you in coding duels and celebrate your achievements
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button 
        size="lg" 
        onClick={handleContinue}
        className="px-8 py-3 text-lg font-medium bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
      >
        Start Learning with My AI Peers
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  )
}
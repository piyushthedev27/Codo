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
    <div className="max-w-4xl mx-auto text-center py-4">
      {/* Success Hero */}
      <div className="mb-12">
        <div className="mx-auto mb-8 p-6 bg-gradient-to-b from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 rounded-3xl w-fit shadow-2xl shadow-emerald-500/10 animate-bounce">
          <CheckCircle className="w-12 h-12 text-emerald-400" />
        </div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
          Learning Profile Ready!
        </h2>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto leading-relaxed">
          We've calibrated your experience for peak performance. Your personalized journey begins now.
        </p>
      </div>

      {/* Profile & Peers Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Modern Learning Profile Card */}
        <div className="text-left p-8 rounded-[2.5rem] border border-white/5 bg-zinc-900/40 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Brain className="w-24 h-24 text-blue-500" />
          </div>

          <div className="relative z-10">
            <h3 className="flex items-center gap-3 text-xl font-bold text-white mb-8">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <Brain className="w-5 h-5 text-blue-400" />
              </div>
              Your Profile
            </h3>

            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Skill Level</span>
                <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getSkillLevelColor(onboardingData.skillLevel)}`}>
                  {onboardingData.skillLevel}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Primary Goal</span>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getGoalIcon(onboardingData.learningGoal)}</span>
                  <span className="text-sm font-bold text-zinc-200 capitalize">
                    {onboardingData.learningGoal.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Focus Area</span>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getDomainIcon(onboardingData.primaryDomain)}</span>
                  <span className="text-sm font-bold text-zinc-200 capitalize">
                    {onboardingData.primaryDomain.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Voice Coaching</span>
                <div className="flex items-center gap-3">
                  <Mic className={`w-4 h-4 ${onboardingData.voiceCoachingEnabled ? 'text-emerald-400' : 'text-zinc-600'}`} />
                  <span className={`text-sm font-bold ${onboardingData.voiceCoachingEnabled ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {onboardingData.voiceCoachingEnabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern AI Peers Card */}
        <div className="text-left p-8 rounded-[2.5rem] border border-white/5 bg-zinc-900/40 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-24 h-24 text-emerald-500" />
          </div>

          <div className="relative z-10">
            <h3 className="flex items-center gap-3 text-xl font-bold text-white mb-2">
              <div className="p-2 bg-emerald-500/20 rounded-xl">
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              Your AI Peers
            </h3>
            <p className="text-sm text-zinc-500 mb-8 ml-10">Synced and ready for collaboration</p>

            <div className="space-y-4">
              {[
                { id: 'sarah', name: 'Sarah', trait: 'Curious • Inquiry Engine', color: 'bg-rose-500/10', ring: 'ring-rose-500/30' },
                { id: 'alex', name: 'Alex', trait: 'Analytical • Logic Check', color: 'bg-blue-500/10', ring: 'ring-blue-500/30' },
                { id: 'jordan', name: 'Jordan', trait: 'Supportive • Mentorship', color: 'bg-emerald-500/10', ring: 'ring-emerald-500/30' }
              ].map((peer) => (
                <div key={peer.id} className={`flex items-center gap-4 p-4 rounded-2xl border border-white/5 transition-all hover:bg-white/5 ${peer.color}`}>
                  <div className="relative">
                    <Avatar peerId={peer.id} size="sm" showRing={false} className={`ring-2 ${peer.ring}`} />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-zinc-900 rounded-full" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-200">{peer.name}</p>
                    <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-tighter">{peer.trait}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-16 text-left">
        <h3 className="flex items-center gap-3 text-xl font-bold text-white mb-8 ml-2">
          <div className="p-2 bg-amber-500/20 rounded-xl">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          System Roadmap
        </h3>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '🧠', title: 'Knowledge Graph', desc: 'Interactive visualization of your learning path and progress.' },
            { icon: '🎤', title: 'Voice Coaching', desc: 'Real-time spoken guidance as you navigate complex code.' },
            { icon: '🤝', title: 'Cooperative Dev', desc: 'Live collaboration with peers on modular challenges.' }
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
              <div className="text-3xl mb-4 grayscale group-hover:grayscale-0 transition-all">{item.icon}</div>
              <h4 className="font-bold text-white mb-2 tracking-tight">{item.title}</h4>
              <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="space-y-8 py-8 flex flex-col items-center">
        <button
          onClick={handleGetStarted}
          disabled={isNavigating}
          className="group relative h-16 px-16 bg-white text-black font-bold text-lg rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-blue-500/10 disabled:opacity-50"
        >
          <span className="relative z-10 flex items-center gap-4">
            {isNavigating ? (
              <>
                <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
                Initializing Interface
              </>
            ) : (
              <>
                Start Your Journey
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </>
            )}
          </span>
          <div className="absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent group-hover:left-full transition-all duration-1000 ease-in-out" />
        </button>

        <div className="flex items-center gap-2 group cursor-default">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.3em]">
            Protocols Calibrated • Ready for Deployment
          </p>
        </div>
      </div>
    </div>
  )
}
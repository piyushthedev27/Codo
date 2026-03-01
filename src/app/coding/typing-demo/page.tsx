/**
 * AI Peer Typing Animation Demo Page
 * Showcases realistic typing patterns for different AI peer personalities
 */

'use client'

import { useState } from 'react'
import { AIPeerTypingAnimation, TYPING_CODE_SNIPPETS } from '@/components/coding/AIPeerTypingAnimation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Play, Users } from 'lucide-react'

export default function TypingDemoPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [completedPeers, setCompletedPeers] = useState<string[]>([])
  const [key, setKey] = useState(0) // Force re-render

  const startDemo = () => {
    setIsRunning(true)
    setCompletedPeers([])
    setKey(prev => prev + 1)
  }

  const resetDemo = () => {
    setIsRunning(false)
    setCompletedPeers([])
    setKey(prev => prev + 1)
  }

  const handleTypingComplete = (peerId: string, code: string) => {
    setCompletedPeers(prev => [...prev, peerId])
    console.log(`${peerId} completed typing:`, code)
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          AI Peer Typing Animation
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Watch AI peers type code with realistic patterns based on their personalities.
          Each peer has unique typing speed, pause patterns, and mistake behaviors.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            Personality-Based Typing
          </Badge>
          <Badge variant="secondary">Realistic Mistakes</Badge>
          <Badge variant="secondary">Dynamic Pauses</Badge>
        </div>
      </div>

      {/* Controls */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Typing Demo Controls</h2>
            <p className="text-muted-foreground">
              Start the demo to see Sarah, Alex, and Jordan type their solutions simultaneously.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={startDemo}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {isRunning ? 'Running...' : 'Start Demo'}
            </Button>
            <Button
              variant="outline"
              onClick={resetDemo}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </div>

        {/* Progress Summary */}
        {isRunning && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress:</span>
              <span className="text-sm text-muted-foreground">
                {completedPeers.length} / 3 peers completed
              </span>
            </div>
            <div className="mt-2 flex gap-2">
              {['sarah', 'alex', 'jordan'].map(peerId => (
                <Badge
                  key={peerId}
                  variant={completedPeers.includes(peerId) ? 'default' : 'outline'}
                  className="capitalize"
                >
                  {peerId} {completedPeers.includes(peerId) ? '✓' : '...'}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Typing Animation */}
      {isRunning && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Live Typing Session</h2>
          <AIPeerTypingAnimation
            key={key}
            peers={['sarah', 'alex', 'jordan']}
            codeSnippets={TYPING_CODE_SNIPPETS}
            onTypingComplete={handleTypingComplete}
          />
        </Card>
      )}

      {/* Personality Explanations */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
            <h3 className="text-lg font-semibold">Sarah - Curious</h3>
          </div>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Fast typing speed (80ms per character)</li>
            <li>• Makes more mistakes (3% chance)</li>
            <li>• Short thinking pauses (8% chance)</li>
            <li>• Uses modern array methods</li>
            <li>• Explores different approaches</li>
          </ul>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <h3 className="text-lg font-semibold">Alex - Analytical</h3>
          </div>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Methodical typing (150ms per character)</li>
            <li>• Fewer mistakes (1% chance)</li>
            <li>• Longer thinking pauses (15% chance)</li>
            <li>• Focuses on error handling</li>
            <li>• Comprehensive validation</li>
          </ul>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <h3 className="text-lg font-semibold">Jordan - Supportive</h3>
          </div>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Steady typing speed (120ms per character)</li>
            <li>• Careful with mistakes (1.5% chance)</li>
            <li>• Regular pauses (12% chance)</li>
            <li>• Clear, commented code</li>
            <li>• Helper functions for clarity</li>
          </ul>
        </Card>
      </div>

      {/* Technical Details */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Technical Implementation</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Realistic Typing Simulation</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Variable typing speeds based on personality</li>
              <li>• Random pauses for thinking/planning</li>
              <li>• Simulated typos with auto-correction</li>
              <li>• Progress tracking and completion events</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Visual Feedback</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Animated cursors with personality colors</li>
              <li>• Real-time progress bars</li>
              <li>• Status indicators (typing/thinking/completed)</li>
              <li>• Smooth character-by-character animation</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
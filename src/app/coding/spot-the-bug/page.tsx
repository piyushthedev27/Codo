/**
 * Spot the Bug Game Page
 * Interactive game where users identify bugs in AI peer code
 */

'use client'

import { SpotTheBugGame } from '@/components/coding/SpotTheBugGame'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bug, Target, Trophy, Lightbulb, Users } from 'lucide-react'

export default function SpotTheBugPage() {
  const handleChallengeComplete = (challengeId: string, timeSpent: number, hintsUsed: number) => {
    console.log(`Challenge ${challengeId} completed:`, {
      timeSpent: `${(timeSpent / 1000).toFixed(1)}s`,
      hintsUsed,
      score: Math.max(0, 100 - (hintsUsed * 10))
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
          Spot the Bug Challenge
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your AI peers have made some mistakes in their code. Can you spot the bugs and help them fix their errors? 
          Test your debugging skills and learn from common programming mistakes.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Bug className="w-3 h-3" />
            Interactive Debugging
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            Click to Find Bugs
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            Earn XP Rewards
          </Badge>
        </div>
      </div>

      {/* How to Play */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-blue-500" />
          How to Play
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="font-medium mb-2">Read the Challenge</h3>
            <p className="text-sm text-muted-foreground">
              Each AI peer has written code with a specific bug. Read the description to understand what they were trying to do.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-purple-600">2</span>
            </div>
            <h3 className="font-medium mb-2">Click the Bug</h3>
            <p className="text-sm text-muted-foreground">
              Click on the line of code that contains the bug. Use hints if you get stuck, but they&apos;ll reduce your score.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-green-600">3</span>
            </div>
            <h3 className="font-medium mb-2">Learn & Earn</h3>
            <p className="text-sm text-muted-foreground">
              See the explanation and fixed code. Earn XP based on your speed and accuracy, then move to the next challenge.
            </p>
          </div>
        </div>
      </Card>

      {/* Game */}
      <SpotTheBugGame onChallengeComplete={handleChallengeComplete} />

      {/* Learning Tips */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-green-500" />
          Common Bug Types You&apos;ll Encounter
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-3 text-red-600 dark:text-red-400">Logic Errors</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Using wrong array methods (.map() instead of .reduce())</li>
              <li>• Mixing async/await with .then() promises</li>
              <li>• Variable scope issues with var vs let</li>
              <li>• Off-by-one errors in loops</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-3 text-orange-600 dark:text-orange-400">Common Mistakes</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Forgetting to return values from functions</li>
              <li>• Incorrect comparison operators (= vs ==)</li>
              <li>• Missing error handling in async functions</li>
              <li>• Closure problems in event handlers</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Scoring System */}
      <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Scoring System
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">50-100 XP</div>
            <div className="font-medium mb-1">Base Reward</div>
            <div className="text-sm text-muted-foreground">
              Varies by difficulty: Easy (50), Medium (75), Hard (100)
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2">-10 XP</div>
            <div className="font-medium mb-1">Per Hint Used</div>
            <div className="text-sm text-muted-foreground">
              Hints help you learn but reduce your final score
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">Streak Bonus</div>
            <div className="font-medium mb-1">Consecutive Finds</div>
            <div className="text-sm text-muted-foreground">
              Build streaks by finding bugs without using hints
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}